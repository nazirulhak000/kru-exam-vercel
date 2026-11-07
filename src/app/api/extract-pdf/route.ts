import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface PageInput {
  pageNumber: number;
  text: string;
  imageDataUrl?: string;
}

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
            "ไม่พบ Gemini API Key กรุณากรอก API Key ในช่องตั้งค่า หรือเลือกใช้ 'โหมดสกัดอัตโนมัติ (ฟรี ไม่ใช้ Key)'",
        },
        { status: 400 }
      );
    }

    const combinedText = pages
      .map((p) => `--- หน้า ${p.pageNumber} ---\n${p.text || "(หน้าสแกนรูปภาพ)"}`)
      .join("\n\n");

    const systemInstruction =
      mode === "extract"
        ? `คุณคือผู้เชี่ยวชาญการออกข้อสอบและติวเตอร์สอบบรรจุข้าราชการครู (ครูผู้ช่วย สพฐ. ภาค ก และ ภาค ข)
หน้าที่ของคุณคือ:
1. สกัดข้อสอบปรนัย 4 ตัวเลือก (ก, ข, ค, ง) ทุกข้อที่ปรากฏในข้อความหรือรูปภาพหน้าเอกสาร PDF ที่ส่งให้
2. หากในเอกสารมีเฉลยอยู่แล้ว ให้ยึดตามเฉลยที่ถูกต้อง แต่หากไม่มีเฉลยหรือเฉลยผิดตามหลักกฎหมายปัจจุบัน ให้คุณวิเคราะห์และเลือกคำตอบที่ถูกต้องที่สุด (index 0, 1, 2 หรือ 3)
3. เขียนคำอธิบายเฉลยแบบละเอียดที่สุด (explanation) อ้างอิงมาตรากฎหมายหรือทฤษฎีการศึกษา (lawReference)
4. วิเคราะห์ตัวเลือกทั้ง 4 ข้อทีละตัวเลือกใน optionAnalysis ว่าทำไมถึงถูกหรือผิด (เพื่อดักจุดหลอก)
5. สรุปเทคนิคจำสั้นๆ เข้าห้องสอบใน keyTakeaway`
        : `คุณคือคณะกรรมการออกข้อสอบบรรจุข้าราชการครู (ครูผู้ช่วย สพฐ. มาตรฐาน ก.ค.ศ.)
หน้าที่ของคุณคือ:
1. อ่านเนื้อหาสรุปหรือตัวบทกฎหมายจากหน้าเอกสาร PDF ที่ส่งให้ แล้วสร้างข้อสอบปรนัย 4 ตัวเลือก (ก, ข, ค, ง) จำนวนประมาณ ${targetCount} ข้อ ที่มีความสมจริงระดับข้อสอบจริง (มีตัวลวงที่แนบเนียน วัดทั้งความจำแม่นยำและการคิดวิเคราะห์)
2. ระบุคำตอบที่ถูกต้อง (answer เป็นตัวเลข 0, 1, 2 หรือ 3)
3. เขียนคำอธิบายเฉลยแบบละเอียด (explanation) พร้อมระบุมาตราหรือทฤษฎีที่อ้างอิง (lawReference)
4. วิเคราะห์ตัวเลือกทั้ง 4 ข้อทีละข้อใน optionAnalysis ว่าทำไมแต่ละข้อถึงถูกหรือผิด
5. สรุปเทคนิคจำสั้นๆ เข้าห้องสอบใน keyTakeaway`;

    const parts: Array<
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    > = [
      {
        text: `${systemInstruction}

หมวดหมู่ที่เป็นไปได้ (category):
- "law" (กฎหมายการศึกษา)
- "gov" (ข้าราชการที่ดี & วินัย)
- "pedagogy" (วิชาชีพครู & การสอน)
- "general" (คิดวิเคราะห์ คณิต & ไทย)
- "english" (ภาษาอังกฤษเพื่อการสื่อสาร)
- "major" (วิชาเอกเฉพาะ)
(หากไม่แน่ใจให้ใช้ "${defaultCategory}")

ให้ส่งผลลัพธ์กลับมาเป็น JSON Array ตามโครงสร้างนี้เท่านั้น:
[
  {
    "category": "law",
    "categoryName": "กฎหมายการศึกษา",
    "question": "ข้อความโจทย์คำถาม...",
    "options": ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const response = await fetch(geminiUrl, {
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

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          error: `การเชื่อมต่อ Gemini API ขัดข้อง (${response.status}): กรุณาตรวจสอบ API Key ของคุณ`,
          details: errText,
        },
        { status: response.status }
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
      .map((q, idx) => ({
        id: `ai-pdf-${Date.now()}-${idx + 1}`,
        category: q.category || defaultCategory,
        categoryName: q.categoryName || "ข้อสอบจาก PDF",
        sourcePdf,
        question: q.question.trim(),
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
      }));

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
