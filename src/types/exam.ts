export type ExamCategory =
  | "law"
  | "gov"
  | "pedagogy"
  | "general"
  | "english"
  | "major";

export interface CategoryMeta {
  id: ExamCategory;
  name: string;
  shortName: string;
  part: "ภาค ก" | "ภาค ข";
  description: string;
  color: string;
}

export const EXAM_CATEGORIES: CategoryMeta[] = [
  {
    id: "general",
    name: "ความสามารถในการคิดวิเคราะห์ (คณิต & ภาษาไทย)",
    shortName: "คิดวิเคราะห์ (ก.)",
    part: "ภาค ก",
    description:
      "อนุกรม, ตรรกศาสตร์, อุปมาอุปไมย, คณิตศาสตร์ทั่วไป, การสะกดคำและสรุปความภาษาไทย",
    color: "amber",
  },
  {
    id: "english",
    name: "ทักษะภาษาอังกฤษเพื่อการสื่อสาร",
    shortName: "ภาษาอังกฤษ (ก.)",
    part: "ภาค ก",
    description:
      "บทสนทนาในชั้นเรียนและที่ทำงาน, ไวยากรณ์ (Grammar), คำศัพท์ และการอ่านจับใจความ",
    color: "purple",
  },
  {
    id: "gov",
    name: "ความรู้และลักษณะการเป็นข้าราชการที่ดี",
    shortName: "ข้าราชการที่ดี & วินัย",
    part: "ภาค ก",
    description:
      "ระเบียบบริหารราชการแผ่นดิน, บริหารกิจการบ้านเมืองที่ดี, วินัยข้าราชการ, ธรรมาภิบาล",
    color: "indigo",
  },
  {
    id: "pedagogy",
    name: "มาตรฐานความรู้และประสบการณ์วิชาชีพครู",
    shortName: "วิชาชีพครู & การสอน",
    part: "ภาค ข",
    description:
      "หลักสูตรแกนกลาง, การจัดการเรียนรู้เชิงรุก, จิตวิทยาการศึกษา, วัดผลและวิจัยในชั้นเรียน",
    color: "emerald",
  },
  {
    id: "law",
    name: "กฎหมายการศึกษา & พ.ร.บ. สำคัญ",
    shortName: "กฎหมายการศึกษา",
    part: "ภาค ข",
    description:
      "พ.ร.บ.การศึกษาแห่งชาติ, พ.ร.บ.ครูฯ 2547, สภาครู, การศึกษาภาคบังคับ, คุ้มครองเด็ก",
    color: "blue",
  },
  {
    id: "major",
    name: "วิชาเอกเฉพาะตำแหน่ง (เพิ่มเติมจาก PDF)",
    shortName: "วิชาเอกเฉพาะ",
    part: "ภาค ข",
    description: "ข้อสอบเฉพาะสาขาวิชาเอกที่สกัดหรือสร้างจากไฟล์ PDF ของคุณ",
    color: "rose",
  },
];

export const UNSPECIFIED_MAJOR = "วิชาเอกทั่วไป (ไม่ระบุสาขา)";

export const MAJOR_SUBJECTS: string[] = [
  "การศึกษาปฐมวัย / อนุบาล",
  "ประถมศึกษา",
  "ภาษาไทย",
  "คณิตศาสตร์",
  "วิทยาศาสตร์ทั่วไป",
  "ฟิสิกส์ / เคมี / ชีววิทยา",
  "ภาษาอังกฤษ",
  "สังคมศึกษา",
  "คอมพิวเตอร์ / เทคโนโลยี",
  "พลศึกษา / สุขศึกษา",
  "ศิลปะ / ดนตรี / นาฏศิลป์",
  "เกษตร / คหกรรม / อุตสาหกรรม",
  "แนะแนว / การศึกษาพิเศษ",
  UNSPECIFIED_MAJOR,
];

// ชื่อเรียกอื่นของวิชาเอกเดียวกัน (เช่น "ปฐมวัย" กับ "การศึกษาปฐมวัย / อนุบาล")
// ยุบให้เหลือชื่อมาตรฐานชื่อเดียว เพื่อไม่ให้ตัวเลือกซ้ำและข้อสอบไม่ถูกแยกหมวด
const MAJOR_ALIASES: Array<{ canonical: string; pattern: RegExp }> = [
  { canonical: "การศึกษาปฐมวัย / อนุบาล", pattern: /ปฐมวัย|อนุบาล/ },
];

export function normalizeMajorSubject(raw?: string | null): string {
  const cleaned = (raw || "").replace(/^วิชาเอก\s*:?\s*/, "").trim();
  if (!cleaned) return UNSPECIFIED_MAJOR;
  const alias = MAJOR_ALIASES.find((a) => a.pattern.test(cleaned));
  return alias ? alias.canonical : cleaned;
}

// เดาสาขาวิชาเอกจากชื่อชุดเอกสาร เช่น "ชุดที่ 7: วิชาเอกการศึกษาปฐมวัย (ข้อ 601-700)"
// ใช้เมื่อข้อสอบไม่มี majorSubject (เช่น สกัดจาก PDF ใหม่แล้วป้ายหาย) คืนค่าว่างถ้าเดาไม่ได้
export function inferMajorFromSource(source?: string | null): string {
  const match = (source || "").match(/วิชาเอก\s*([^()\d:]+?)\s*(?:\(|$)/);
  if (!match) return "";
  const guess = normalizeMajorSubject(match[1]);
  return guess === UNSPECIFIED_MAJOR ? "" : guess;
}

// หัวข้อกล่องเฉลยตามลักษณะของหมวดวิชา (แทนการเขียนว่า "เหตุผลทางกฎหมาย" ตายตัวทุกข้อ)
export function getExplanationLabel(category: ExamCategory): string {
  switch (category) {
    case "general":
      return "วิธีคิดและขั้นตอนการหาคำตอบ";
    case "english":
      return "คำอธิบายไวยากรณ์และคำศัพท์";
    case "law":
    case "gov":
      return "คำอธิบายและอ้างอิงข้อกฎหมาย";
    case "pedagogy":
    case "major":
    default:
      return "หลักวิชาการและคำอธิบายประกอบ";
  }
}

export interface QuestionComment {
  id: string;
  questionId: string;
  authorKey: string;
  isAdminAuthor?: boolean;
  type: "report_wrong" | "comment";
  suggestedAnswer?: number | null; // 0 = ก, 1 = ข, 2 = ค, 3 = ง
  message: string;
  status?: "pending" | "resolved";
  resolvedNote?: string;
  createdAt: string;
  displayDate: string;
}

export interface QuestionItem {
  id: string;
  category: ExamCategory;
  categoryName: string;
  majorSubject?: string;
  sourcePdf?: string;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0 = ก, 1 = ข, 2 = ค, 3 = ง
  explanation: string;
  optionAnalysis?: string[];
  lawReference?: string;
  keyTakeaway?: string;
  verified?: boolean;
  confidenceScore?: number;
  createdAt?: string;
}

export interface ExamAttemptAnswer {
  questionId: string;
  questionText: string;
  category: ExamCategory;
  categoryName: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  optionAnalysis?: string[];
  lawReference?: string;
  keyTakeaway?: string;
}

export interface PartBreakdownItem {
  part: "ภาค ก" | "ภาค ข";
  total: number;
  correct: number;
  scorePercent: number;
  passed: boolean;
}

export interface ExamAttempt {
  id: string;
  title: string;
  date: string;
  displayDate: string;
  mode: "practice" | "exam" | "mistake_review" | "retry";
  feedbackMode?: "instant" | "after_submit";
  isBlueprint?: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercent: number;
  passed: boolean;
  durationSeconds: number;
  avgSecondsPerQuestion?: number;
  partBreakdown?: Record<string, PartBreakdownItem>;
  categoryBreakdown: Record<
    string,
    { total: number; correct: number; name: string }
  >;
  answers: ExamAttemptAnswer[];
  isTimeout?: boolean;
  passReason?: string;
  isEvaluated?: boolean;
}

export interface ExamPartStructure {
  part: "ภาค ก" | "ภาค ข";
  name: string;
  fullScore: number;
  description: string;
  categories: ExamCategory[];
}

export const OFFICIAL_EXAM_STRUCTURE: Record<
  "ภาค ก" | "ภาค ข",
  ExamPartStructure
> = {
  "ภาค ก": {
    part: "ภาค ก",
    name: "ความรู้และความสามารถทั่วไป",
    fullScore: 200,
    description: "คิดวิเคราะห์ (คณิต & ไทย), ภาษาอังกฤษ, ข้าราชการที่ดีและวินัย",
    categories: ["general", "english", "gov"],
  },
  "ภาค ข": {
    part: "ภาค ข",
    name: "มาตรฐานความรู้และประสบการณ์วิชาชีพ",
    fullScore: 200,
    description: "วิชาชีพครูและการจัดการเรียนรู้, กฎหมายการศึกษา, วิชาเอกเฉพาะตำแหน่ง",
    categories: ["pedagogy", "law", "major"],
  },
};

export interface EvaluatePassResult {
  passed: boolean;
  isEvaluated: boolean;
  scorePercent: number;
  reason: string;
  partBreakdown: Record<
    "ภาค ก" | "ภาค ข",
    {
      part: "ภาค ก" | "ภาค ข";
      total: number;
      correct: number;
      scorePercent: number;
      passed: boolean;
    }
  >;
}

export function evaluatePass(attempt: {
  totalQuestions?: number;
  correctCount?: number;
  scorePercent?: number;
  isBlueprint?: boolean;
  categoryBreakdown?: Record<
    string,
    { total: number; correct: number; name?: string }
  >;
  partBreakdown?: Record<
    string,
    { total: number; correct: number; passed?: boolean; scorePercent?: number }
  >;
  passed?: boolean;
}): EvaluatePassResult {
  const total = attempt.totalQuestions || 0;
  const correct = attempt.correctCount || 0;
  const overallScorePercent =
    total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;

  const partTallies: Record<
    "ภาค ก" | "ภาค ข",
    { total: number; correct: number }
  > = {
    "ภาค ก": { total: 0, correct: 0 },
    "ภาค ข": { total: 0, correct: 0 },
  };

  if (
    attempt.categoryBreakdown &&
    Object.keys(attempt.categoryBreakdown).length > 0
  ) {
    const partAMap = new Set(["general", "english", "gov"]);
    for (const [catId, stats] of Object.entries(attempt.categoryBreakdown)) {
      const part = partAMap.has(catId) ? "ภาค ก" : "ภาค ข";
      partTallies[part].total += stats.total || 0;
      partTallies[part].correct += stats.correct || 0;
    }
  } else if (attempt.partBreakdown) {
    if (attempt.partBreakdown["ภาค ก"]) {
      partTallies["ภาค ก"].total = attempt.partBreakdown["ภาค ก"].total || 0;
      partTallies["ภาค ก"].correct =
        attempt.partBreakdown["ภาค ก"].correct || 0;
    }
    if (attempt.partBreakdown["ภาค ข"]) {
      partTallies["ภาค ข"].total = attempt.partBreakdown["ภาค ข"].total || 0;
      partTallies["ภาค ข"].correct =
        attempt.partBreakdown["ภาค ข"].correct || 0;
    }
  }

  const partA = partTallies["ภาค ก"];
  const partB = partTallies["ภาค ข"];
  const passA =
    partA.total > 0 ? partA.correct * 100 >= 60 * partA.total : false;
  const passB =
    partB.total > 0 ? partB.correct * 100 >= 60 * partB.total : false;

  const scoreA =
    partA.total > 0 ? Math.round((partA.correct / partA.total) * 1000) / 10 : 0;
  const scoreB =
    partB.total > 0 ? Math.round((partB.correct / partB.total) * 1000) / 10 : 0;

  const computedPartBreakdown = {
    "ภาค ก": {
      part: "ภาค ก" as const,
      total: partA.total,
      correct: partA.correct,
      scorePercent: scoreA,
      passed: passA,
    },
    "ภาค ข": {
      part: "ภาค ข" as const,
      total: partB.total,
      correct: partB.correct,
      scorePercent: scoreB,
      passed: passB,
    },
  };

  // กรณีมีทั้ง ภาค ก และ ภาค ข ในชุดข้อสอบ
  if (partA.total > 0 && partB.total > 0) {
    // กฎ 3.2: ประเมินแยกภาคเฉพาะ blueprint หรือเมื่อทั้งสองภาคมีอย่างน้อย 10 ข้อ
    const isQualifyingMultiPart =
      Boolean(attempt.isBlueprint) || (partA.total >= 10 && partB.total >= 10);
    if (isQualifyingMultiPart) {
      const passed = passA && passB;
      let reason = "ผ่านเกณฑ์มาตรฐาน ก.ค.ศ. (≥60% ทั้ง ภาค ก และ ภาค ข)";
      if (!passed) {
        if (!passA && !passB) {
          reason = "ไม่ผ่านเกณฑ์ — ทั้งภาค ก และ ภาค ข ต่ำกว่า 60%";
        } else if (!passA) {
          reason = `ไม่ผ่านเกณฑ์ — ภาค ก ต่ำกว่า 60% (${scoreA}%)`;
        } else {
          reason = `ไม่ผ่านเกณฑ์ — ภาค ข ต่ำกว่า 60% (${scoreB}%)`;
        }
      }
      return {
        passed,
        isEvaluated: true,
        scorePercent: overallScorePercent,
        reason,
        partBreakdown: computedPartBreakdown,
      };
    } else {
      // ชุดสุ่มผสมขนาดสั้นที่มีบางภาค < 10 ข้อ: ไม่ตัดสินแพ้ชนะแยกภาคแบบไม่เป็นธรรม
      return {
        passed: false,
        isEvaluated: false,
        scorePercent: overallScorePercent,
        reason: "ชุดฝึกซ้อม ไม่ประเมินผ่าน/ไม่ผ่าน (จำนวนข้อสอบไม่ครบสัดส่วนภาค)",
        partBreakdown: computedPartBreakdown,
      };
    }
  }

  // กรณีสอบเฉพาะภาคใดภาคหนึ่ง
  if (partA.total > 0 && partB.total === 0) {
    const passed = passA;
    return {
      passed,
      isEvaluated: true,
      scorePercent: overallScorePercent,
      reason: passed
        ? "ผ่านเกณฑ์ภาค ก (≥60%)"
        : `ไม่ผ่านเกณฑ์ — ภาค ก ต่ำกว่า 60% (${scoreA}%)`,
      partBreakdown: computedPartBreakdown,
    };
  }

  if (partB.total > 0 && partA.total === 0) {
    const passed = passB;
    return {
      passed,
      isEvaluated: true,
      scorePercent: overallScorePercent,
      reason: passed
        ? "ผ่านเกณฑ์ภาค ข (≥60%)"
        : `ไม่ผ่านเกณฑ์ — ภาค ข ต่ำกว่า 60% (${scoreB}%)`,
      partBreakdown: computedPartBreakdown,
    };
  }

  // Fallback สำหรับชุดที่ไม่มีข้อมูล breakdown
  const passed =
    total > 0 ? correct * 100 >= 60 * total : Boolean(attempt.passed);
  return {
    passed,
    isEvaluated: true,
    scorePercent: overallScorePercent,
    reason: passed ? "ได้คะแนนรวม ≥ 60%" : "ได้คะแนนรวมต่ำกว่า 60%",
    partBreakdown: computedPartBreakdown,
  };
}

export interface MistakeRecord {
  questionId: string;
  wrongCount: number;
  consecutiveCorrect: number;
  mastered: boolean;
  lastAttemptAt: string;
  bookmarked: boolean;
}

export interface ActiveExamSession {
  id: string;
  title: string;
  mode: "practice" | "exam" | "mistake_review" | "retry";
  feedbackMode?: "instant" | "after_submit";
  isBlueprint?: boolean;
  questions: QuestionItem[];
  currentIndex: number;
  userAnswers: Record<number, number>;
  flaggedIndices: number[];
  strikethroughMap: Record<number, number[]>;
  secondsElapsed: number;
  examTimeLimit: number;
  startedAt: string;
  deadlineAt?: string;
  lastActiveAt?: string;
  isPaused?: boolean;
}
