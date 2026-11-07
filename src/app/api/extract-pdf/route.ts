import { NextRequest, NextResponse } from "next/server";
import { EXAM_CATEGORIES, ExamCategory } from "@/types/exam";

export const maxDuration = 60;

interface PageInput {
  pageNumber: number;
  text: string;
  imageDataUrl?: string;
}

const VALID_CATEGORIES = new Set<string>(EXAM_CATEGORIES.map((c) => c.id));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = "extract",
      pages = [],
      sourcePdf = "เอกสาร PDF",
      targetCount = 10,
      defaultCategory = "law",
      apiKey: clientApiKey,
    } = body as {
      mode: "extract" | "generate";
      pages: PageInput[];
      sourcePdf: string;
      targetCount?: number;
      defaultCategory?: string;
      apiKey?: string;
    };

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ไม่พบ Gemini API Key กรุณากรอก API Key ในช่องตั้งค่า หรือเลือกใช้ 'โหมดแยกโครงสร้างโจทย์อัตโนมัติ (ไม่ใช้คีย์)'",
        },
        { status: 400 }
      );
    }

    const combinedText = pages
      .map((p) => `--- หน้า ${p.pageNumber} ---\n${p.text || "(หน้าสแกนรูปภาพ)"}`)
      .join("\n\n");

    const systemInstruction =
      mode === "extract"
        ? `คุณคือคณะกรรมการออกข้อสอบและผู้เชี่ยวชาญหลักสูตรสอบบรรจุครูผู้ช่วย สพฐ. ตามมาตรฐาน ก.ค.ศ.
หน้าที่ของคุณคือ:
1. สกัดข้อสอบปรนัย 4 ตัวเลือก (ก, ข, ค, ง) ทุกข้อที่ปรากฏในข้อความหรือรูปภาพหน้าเอกสาร PDF ที่ส่งให้
2. ⚠️ กฎสำคัญที่สุด: "ห้ามเดาหรือกำหนดหมวดหมู่จากชื่อไฟล์ PDF หรือชื่อเอกสารเด็ดขาด" เพราะเอกสาร 1 ไฟล์อาจมีข้อสอบหลายวิชาปะปนกัน ให้คุณอ่านเนื้อหาของโจทย์คำถามและตัวเลือกในข้อนั้นๆ เป็นรายข้อ แล้วตัดสินหมวดหมู่และวิชาเอกให้ถูกต้องตามความเป็นจริง 100%
3. หากในเอกสารมีเฉลยอยู่แล้ว ให้ยึดตามเฉลยที่ถูกต้อง แต่หากไม่มีเฉลยหรือเฉลยผิดตามหลักกฎหมายปัจจุบัน ให้คุณวิเคราะห์และเลือกคำตอบที่ถูกต้องที่สุด (index 0, 1, 2 หรือ 3)
4. เขียนคำอธิบายเฉลยแบบละเอียดที่สุด (explanation) โดยระบุเนื้อหาของคำตอบที่ถูกให้ชัดเจน (หลีกเลี่ยงการเขียนแค่ว่า "ตอบ ก." เพราะระบบมีโหมดสลับตำแหน่งตัวเลือก) พร้อมอ้างอิงมาตรากฎหมายหรือทฤษฎีการศึกษาใน lawReference
5. วิเคราะห์ตัวเลือกทั้ง 4 ข้อทีละตัวเลือกใน optionAnalysis ว่าทำไมตัวเลือกนั้นถึงถูกหรือผิด (เพื่อดักจุดหลอก)
6. สรุปเทคนิคจำสั้นๆ เข้าห้องสอบใน keyTakeaway`
        : `คุณคือคณะกรรมการออกข้อสอบแข่งขันเพื่อบรรจุและแต่งตั้งบุคคลเข้ารับราชการครู ตำแหน่ง "ครูผู้ช่วย" (มาตรฐาน ก.ค.ศ.)
หน้าที่ของคุณคือ:
1. อ่านเนื้อหาสรุปหรือตัวบทกฎหมายจากหน้าเอกสาร PDF ที่ส่งให้ แล้วสร้างข้อสอบปรนัย 4 ตัวเลือก (ก, ข, ค, ง) จำนวนประมาณ ${targetCount} ข้อ ที่มีความสมจริงระดับข้อสอบจริง:
   - ผสมผสานทั้งข้อสอบวัดความจำแม่นยำ (ตัวเลข/อายุ/วันเวลา/องค์ประกอบคณะกรรมการ/อัตราโทษ) และข้อสอบเชิงวิเคราะห์สถานการณ์ในโรงเรียน (Scenario-based)
   - สร้างตัวลวง (Distractors) ที่แนบเนียน ดักจุดที่ผู้เข้าสอบมักจำสับสน (เช่น สลับคำว่า "อายุย่างเข้า" กับ "อายุบริบูรณ์", สลับอำนาจ "คุรุสภา" กับ "ก.ค.ศ.")
2. ระบุคำตอบที่ถูกต้อง (answer เป็นตัวเลข 0, 1, 2 หรือ 3)
3. เขียนคำอธิบายเฉลยแบบละเอียด (explanation) โดยอธิบายเนื้อหาคำตอบที่ถูกตรงๆ พร้อมระบุมาตราหรือทฤษฎีที่อ้างอิงใน lawReference
4. วิเคราะห์ตัวเลือกทั้ง 4 ข้อทีละข้อใน optionAnalysis ว่าทำไมแต่ละข้อถึงถูกหรือเป็นตัวลวง
5. สรุปเทคนิคจำสั้นๆ เข้าห้องสอบใน keyTakeaway`;

    const parts: Array<
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    > = [
      {
        text: `${systemInstruction}

เกณฑ์การตัดสินหมวดหมู่วิชารายข้อ (วิเคราะห์จากเนื้อหาโจทย์เป็นหลัก ห้ามอิงชื่อไฟล์):
- "general": ภาค ก คิดวิเคราะห์ (อนุกรม, คณิตศาสตร์ทั่วไป, ตรรกศาสตร์, อุปมาอุปไมย, ภาษาไทย)
- "english": ภาค ก ภาษาอังกฤษเพื่อการสื่อสาร (Grammar, Vocab, Reading, Conversation)
- "gov": ภาค ก ข้าราชการที่ดี & วินัย (พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน, บริหารกิจการบ้านเมืองที่ดี, จริยธรรม, วินัย)
- "law": ภาค ข กฎหมายการศึกษา (พ.ร.บ.การศึกษาแห่งชาติ, พ.ร.บ.ครูฯ 2547, คุรุสภา, การศึกษาภาคบังคับ, คุ้มครองเด็ก)
- "pedagogy": ภาค ข วิชาชีพครู & การจัดการเรียนรู้ (หลักสูตร, Active Learning, จิตวิทยา, วัดประเมินผล, วิจัยในชั้นเรียน)
- "major": ภาค ข วิชาเอกเฉพาะตำแหน่ง (ข้อสอบเฉพาะสาขาวิชาเอก โดยต้องระบุ majorSubject เช่น "การศึกษาปฐมวัย", "ภาษาไทย", "คณิตศาสตร์", "ภาษาอังกฤษ", "วิทยาศาสตร์", "สังคมศึกษา", "คอมพิวเตอร์" ฯลฯ)

ให้ส่งผลลัพธ์กลับมาเป็น JSON Array ตามโครงสร้างนี้เท่านั้น:
[
  {
    "category": "major",
    "categoryName": "วิชาเอกเฉพาะตำแหน่ง",
    "majorSubject": "การศึกษาปฐมวัย",
    "question": "ข้อความโจทย์คำถาม...",
    "options": ["ตัวเลือกที่ 1", "ตัวเลือกที่ 2", "ตัวเลือกที่ 3", "ตัวเลือกที่ 4"],
    "answer": 0,
    "lawReference": "พ.ร.บ. ... มาตรา ...",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด...",
    "optionAnalysis": [
      "ก. ถูกต้อง: เพราะ...",
      "ข. ผิด: เพราะ...",
      "ค. ผิด: เพราะ...",
      "ง. ผิด: เพราะ..."
    ],
    "keyTakeaway": "เทคนิคจำสั้นๆ..."
  }
]

เนื้อหาจากไฟล์ PDF (${sourcePdf}):
${combinedText}`,
      },
    ];

    // Attach any scanned page images (up to 4 per batch to keep payload fast)
    for (const p of pages.slice(0, 4)) {
      if (p.imageDataUrl && p.imageDataUrl.startsWith("data:image/")) {
        const base64Data = p.imageDataUrl.split(",")[1];
        if (base64Data) {
          parts.push({
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data,
            },
          });
        }
      }
    }

    const candidateModels = [
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ];

    let response: Response | null = null;
    let lastErrorText = "";

    for (const modelName of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
          },
        }),
      });

      if (res.ok) {
        response = res;
        break;
      }

      lastErrorText = await res.text();
      // If unauthorized / invalid API key (400/403), don't retry other models
      if (res.status === 400 || res.status === 403) {
        response = res;
        break;
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        {
          error: `การเชื่อมต่อ Gemini API ขัดข้อง (${
            response?.status || 500
          }): กรุณาตรวจสอบ API Key ของคุณ`,
          details: lastErrorText,
        },
        { status: response?.status || 500 }
      );
    }

    const data = await response.json();
    const rawJsonText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(rawJsonText);
    } catch {
      const match = rawJsonText.match(/\[[\s\S]*\]/);
      parsedQuestions = match ? JSON.parse(match[0]) : [];
    }

    const formatted = (Array.isArray(parsedQuestions) ? parsedQuestions : [])
      .filter(
        (q) =>
          q &&
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length >= 4
      )
      .map((q, idx) => {
        const catId: ExamCategory = VALID_CATEGORIES.has(q.category)
          ? (q.category as ExamCategory)
          : (defaultCategory as ExamCategory) || "law";
        const catMeta = EXAM_CATEGORIES.find((c) => c.id === catId);

        return {
          id: `ai-pdf-${Date.now()}-${idx + 1}`,
          category: catId,
          categoryName: catMeta?.shortName || q.categoryName || "ข้อสอบจาก PDF",
          majorSubject: q.category === "major" ? (q.majorSubject || "วิชาเอกทั่วไป (ไม่ระบุสาขา)") : undefined,
          sourcePdf,
          question: q.question.replace(/^(?:ข้อ(?:ที่)?\s*)?\d+\s*[.)]\s*/, "").trim(),
          options: [
            String(q.options[0]).replace(/^[กขคงABCD1-4][.)]\s*/, "").trim(),
            String(q.options[1]).replace(/^[กขคงABCD1-4][.)]\s*/, "").trim(),
            String(q.options[2]).replace(/^[กขคงABCD1-4][.)]\s*/, "").trim(),
            String(q.options[3]).replace(/^[กขคงABCD1-4][.)]\s*/, "").trim(),
          ],
          answer:
            typeof q.answer === "number" && q.answer >= 0 && q.answer <= 3
              ? q.answer
              : 0,
          lawReference: q.lawReference || `อ้างอิงจาก ${sourcePdf}`,
          explanation: q.explanation || "",
          optionAnalysis: Array.isArray(q.optionAnalysis)
            ? q.optionAnalysis.slice(0, 4)
            : undefined,
          keyTakeaway: q.keyTakeaway || "",
          createdAt: new Date().toISOString(),
        };
      });

    return NextResponse.json({ questions: formatted });
  } catch (error: unknown) {
    console.error("Extract PDF API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF",
      },
      { status: 500 }
    );
  }
}
