import { EXAM_CATEGORIES, ExamCategory, QuestionItem } from "@/types/exam";

export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
  imageDataUrl?: string; // populated if scanned page (low text length)
}

/**
 * Reads a PDF file in the browser using pdfjs-dist and extracts text per page.
 * If a page appears to be a scanned image (< 30 characters of text), renders it to a JPEG data URL.
 */
export async function extractPdfPagesClient(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPdfPage[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const numPages = pdf.numPages;
  const pages: ExtractedPdfPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Reconstruct lines based on Y coordinates
    let lastY: number | null = null;
    let pageText = "";
    for (const item of textContent.items as Array<{
      str?: string;
      transform?: number[];
    }>) {
      if (typeof item.str !== "string") continue;
      const y = item.transform ? Math.round(item.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
        pageText += "\n";
      } else if (pageText.length > 0 && !pageText.endsWith("\n")) {
        pageText += " ";
      }
      pageText += item.str;
      lastY = y;
    }

    const cleanText = pageText.replace(/[ \t]+/g, " ").trim();
    let imageDataUrl: string | undefined = undefined;

    // If page has very little text, render as image for OCR/Vision
    if (cleanText.length < 40 && typeof document !== "undefined") {
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          imageDataUrl = canvas.toDataURL("image/jpeg", 0.72);
        }
      } catch (err) {
        console.warn("Canvas render fallback skipped:", err);
      }
    }

    pages.push({
      pageNumber: i,
      text: cleanText,
      imageDataUrl,
    });
  }

  return pages;
}

/**
 * Automatically guesses the exam category based on Thai keywords in the question.
 */
export function guessCategoryFromText(text: string): {
  category: ExamCategory;
  categoryName: string;
} {
  const t = text.toLowerCase();
  if (
    /พ\.ร\.บ\.การศึกษา|คุรุสภา|ใบอนุญาตประกอบวิชาชีพ|การศึกษาภาคบังคับ|คุ้มครองเด็ก|คนพิการ|ก\.ค\.ศ\.|วิทยฐานะ/.test(
      t
    )
  ) {
    return { category: "law", categoryName: "กฎหมายการศึกษา" };
  }
  if (
    /บริหารราชการแผ่นดิน|บ้านเมืองที่ดี|ธรรมาภิบาล|วินัย|ภาคทัณฑ์|ปลดออก|ไล่ออก|ปกครอง|จริยธรรม|ส่วนภูมิภาค|ส่วนท้องถิ่น/.test(
      t
    )
  ) {
    return { category: "gov", categoryName: "ข้าราชการที่ดี & วินัย" };
  }
  if (
    /หลักสูตร|ผู้เรียน|เพียเจต์|piaget|bloom|พุทธิพิสัย|การวัดผล|ประเมินผล|วิจัยในชั้นเรียน|จิตวิทยา|แนะแนว|สื่อการสอน|active learning|plc|paor|ความยาก|อำนาจจำแนก/.test(
      t
    )
  ) {
    return { category: "pedagogy", categoryName: "วิชาชีพครู & การสอน" };
  }
  if (/[a-z]{4,}\s+[a-z]{4,}/i.test(t) && !/[ก-ฮ]/.test(t.slice(0, 30))) {
    return { category: "english", categoryName: "ภาษาอังกฤษเพื่อการสื่อสาร" };
  }
  if (
    /อนุกรม|ร้อยละ|เปอร์เซ็นต์|ตรรกศาสตร์|อุปมาอุปไมย|สะกดคำ|ราชาศัพท์|สำนวน|ใจความสำคัญ/.test(
      t
    )
  ) {
    return { category: "general", categoryName: "คิดวิเคราะห์ (คณิต & ไทย)" };
  }

  const found = EXAM_CATEGORIES[0];
  return { category: found.id, categoryName: found.shortName };
}

/**
 * Smart Heuristic / Regex Parser (Works 100% offline & free without an API Key).
 * Extracts multiple-choice questions (ก, ข, ค, ง) and answers/explanations from Thai exam text.
 */
export function parseThaiExamTextHeuristic(
  fullText: string,
  sourcePdfName: string,
  defaultCategory?: ExamCategory
): QuestionItem[] {
  const normalized = fullText
    .replace(/\r\n/g, "\n")
    .replace(/([กขคง])\s*\)/g, "$1.")
    .replace(/([1-4])\s*\)/g, "$1.");

  // 1. Check if there is an answer key block at the end like "1. ก 2. ข 3. ค"
  const answerKeyMap: Record<number, number> = {};
  const choiceCharToIdx: Record<string, number> = {
    ก: 0,
    ข: 1,
    ค: 2,
    ง: 3,
    a: 0,
    b: 1,
    c: 2,
    d: 3,
  };

  const keyBlockRegex =
    /(?:เฉลย|คำตอบ)[\s\S]{0,200}?((?:\d+\s*[.:=-]?\s*[กขคงABCDabcd]\s*){3,})/gi;
  let keyMatch: RegExpExecArray | null;
  while ((keyMatch = keyBlockRegex.exec(normalized)) !== null) {
    const pairRegex = /(\d+)\s*[.:=-]?\s*([กขคงABCDabcd])/g;
    let pm: RegExpExecArray | null;
    while ((pm = pairRegex.exec(keyMatch[1])) !== null) {
      const qNum = parseInt(pm[1], 10);
      const ansChar = pm[2].toLowerCase();
      if (choiceCharToIdx[ansChar] !== undefined) {
        answerKeyMap[qNum] = choiceCharToIdx[ansChar];
      }
    }
  }

  // 2. Split text into question blocks by numbered patterns: "ข้อ 1.", "ข้อที่ 1", "1.", etc.
  const questionBlocks = normalized.split(
    /(?=(?:^|\n)\s*(?:ข้อ(?:ที่)?\s*)?\d{1,3}\s*[.)]\s+)/g
  );

  const results: QuestionItem[] = [];

  for (const rawBlock of questionBlocks) {
    const block = rawBlock.trim();
    if (block.length < 20) continue;

    const numMatch = block.match(/^(?:ข้อ(?:ที่)?\s*)?(\d{1,3})\s*[.)]\s+([\s\S]*)$/);
    if (!numMatch) continue;

    const qNum = parseInt(numMatch[1], 10);
    const body = numMatch[2].trim();

    // Try matching Thai choices ก. ข. ค. ง.
    const thaiChoiceMatch = body.match(
      /([\s\S]+?)\s*(?:^|\s)ก\.\s*([\s\S]+?)\s*(?:^|\s)ข\.\s*([\s\S]+?)\s*(?:^|\s)ค\.\s*([\s\S]+?)\s*(?:^|\s)ง\.\s*([\s\S]+)$/
    );

    // Or English choices A. B. C. D.
    const engChoiceMatch =
      !thaiChoiceMatch &&
      body.match(
        /([\s\S]+?)\s*(?:^|\s)[Aa][.)]\s*([\s\S]+?)\s*(?:^|\s)[Bb][.)]\s*([\s\S]+?)\s*(?:^|\s)[Cc][.)]\s*([\s\S]+?)\s*(?:^|\s)[Dd][.)]\s*([\s\S]+)$/
      );

    const match = thaiChoiceMatch || engChoiceMatch;
    if (!match) continue;

    const questionStem = match[1].replace(/\s+/g, " ").trim();
    const opt0 = match[2].replace(/\s+/g, " ").trim();
    const opt1 = match[3].replace(/\s+/g, " ").trim();
    const opt2 = match[4].replace(/\s+/g, " ").trim();
    let opt3AndRest = match[5].trim();

    // Check if inline answer / explanation exists inside opt3AndRest
    let answerIdx = answerKeyMap[qNum] !== undefined ? answerKeyMap[qNum] : 0;
    let explanation = "";

    const inlineAnsRegex =
      /(?:^|\n|\s)(?:เฉลย|ตอบ|คำตอบ)\s*[:：.]?\s*(?:ข้อ\s*)?([กขคงABCDabcd1-4])(?:\s*[.)]|\s+|$)([\s\S]*)/i;
    const ansMatch = opt3AndRest.match(inlineAnsRegex);

    if (ansMatch && ansMatch.index !== undefined) {
      const opt3Clean = opt3AndRest.slice(0, ansMatch.index).replace(/\s+/g, " ").trim();
      const rawAnsChar = ansMatch[1].toLowerCase();
      const expRest = ansMatch[2]
        .replace(/^(?:เพราะ|คำอธิบาย|เหตุผล)\s*[:：]?\s*/i, "")
        .replace(/\s+/g, " ")
        .trim();

      if (choiceCharToIdx[rawAnsChar] !== undefined) {
        answerIdx = choiceCharToIdx[rawAnsChar];
      } else if (["1", "2", "3", "4"].includes(rawAnsChar)) {
        answerIdx = parseInt(rawAnsChar, 10) - 1;
      }

      opt3AndRest = opt3Clean;
      explanation = expRest;
    } else {
      opt3AndRest = opt3AndRest.split(/\n{2,}/)[0].replace(/\s+/g, " ").trim();
    }

    const options: [string, string, string, string] = [
      opt0,
      opt1,
      opt2,
      opt3AndRest,
    ];

    const guessed = defaultCategory
      ? {
          category: defaultCategory,
          categoryName:
            EXAM_CATEGORIES.find((c) => c.id === defaultCategory)?.shortName ||
            "ทั่วไป",
        }
      : guessCategoryFromText(questionStem + " " + options.join(" "));

    const letters = ["ก", "ข", "ค", "ง"];
    const finalExplanation =
      explanation ||
      `คำตอบที่ถูกต้องคือข้อ ${letters[answerIdx]}. (${options[answerIdx]}) แนะนำให้ตรวจสอบบริบทตามหลักเกณฑ์ของ ${guessed.categoryName}`;

    results.push({
      id: `pdf-${Date.now()}-${results.length + 1}`,
      category: guessed.category,
      categoryName: guessed.categoryName,
      sourcePdf: sourcePdfName,
      question: questionStem,
      options,
      answer: answerIdx,
      explanation: finalExplanation,
      optionAnalysis: [
        `ก. ${answerIdx === 0 ? "ถูกต้องตามหลักเกณฑ์ที่โจทย์ถาม" : "ตัวเลือกหลอก ไม่ตรงกับเงื่อนไขหลักของโจทย์"}`,
        `ข. ${answerIdx === 1 ? "ถูกต้องตามหลักเกณฑ์ที่โจทย์ถาม" : "ตัวเลือกหลอก ไม่ตรงกับเงื่อนไขหลักของโจทย์"}`,
        `ค. ${answerIdx === 2 ? "ถูกต้องตามหลักเกณฑ์ที่โจทย์ถาม" : "ตัวเลือกหลอก ไม่ตรงกับเงื่อนไขหลักของโจทย์"}`,
        `ง. ${answerIdx === 3 ? "ถูกต้องตามหลักเกณฑ์ที่โจทย์ถาม" : "ตัวเลือกหลอก ไม่ตรงกับเงื่อนไขหลักของโจทย์"}`,
      ],
      lawReference: `สกัดจากไฟล์: ${sourcePdfName}`,
      keyTakeaway: `จำคำสำคัญ: "${questionStem.slice(0, 45)}..." -> ตอบ ${options[answerIdx]}`,
      createdAt: new Date().toISOString(),
    });
  }

  return results;
}
