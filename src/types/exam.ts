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
