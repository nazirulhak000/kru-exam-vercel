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
    id: "law",
    name: "กฎหมายการศึกษา & พ.ร.บ. สำคัญ",
    shortName: "กฎหมายการศึกษา",
    part: "ภาค ข",
    description: "พ.ร.บ.การศึกษาแห่งชาติ, พ.ร.บ.ครูฯ 2547, สภาครู, การศึกษาภาคบังคับ, คุ้มครองเด็ก",
    color: "blue",
  },
  {
    id: "gov",
    name: "ความรู้และลักษณะการเป็นข้าราชการที่ดี",
    shortName: "ข้าราชการที่ดี & วินัย",
    part: "ภาค ก",
    description: "ระเบียบบริหารราชการแผ่นดิน, บริหารกิจการบ้านเมืองที่ดี, วินัยข้าราชการ, ธรรมาภิบาล",
    color: "indigo",
  },
  {
    id: "pedagogy",
    name: "มาตรฐานความรู้และประสบการณ์วิชาชีพครู",
    shortName: "วิชาชีพครู & การสอน",
    part: "ภาค ข",
    description: "หลักสูตรแกนกลาง, การจัดการเรียนรู้เชิงรุก, จิตวิทยาการศึกษา, วัดผลและวิจัยในชั้นเรียน",
    color: "emerald",
  },
  {
    id: "general",
    name: "ความสามารถในการคิดวิเคราะห์ (คณิต & ภาษาไทย)",
    shortName: "คิดวิเคราะห์ (ก.)",
    part: "ภาค ก",
    description: "อนุกรม, ตรรกศาสตร์, อุปมาอุปไมย, คณิตศาสตร์ทั่วไป, การสะกดคำและสรุปความภาษาไทย",
    color: "amber",
  },
  {
    id: "english",
    name: "ทักษะภาษาอังกฤษเพื่อการสื่อสาร",
    shortName: "ภาษาอังกฤษ (ก.)",
    part: "ภาค ก",
    description: "บทสนทนาในชั้นเรียนและที่ทำงาน, ไวยากรณ์ (Grammar), คำศัพท์ และการอ่านจับใจความ",
    color: "purple",
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

export interface QuestionItem {
  id: string;
  category: ExamCategory;
  categoryName: string;
  sourcePdf?: string;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0 = ก, 1 = ข, 2 = ค, 3 = ง
  explanation: string;
  optionAnalysis?: string[];
  lawReference?: string;
  keyTakeaway?: string;
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

export interface ExamAttempt {
  id: string;
  title: string;
  date: string;
  displayDate: string;
  mode: "practice" | "exam" | "mistake_review";
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercent: number;
  passed: boolean;
  durationSeconds: number;
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
  mode: "practice" | "exam" | "mistake_review";
  questions: QuestionItem[];
  currentIndex: number;
  userAnswers: Record<number, number>;
  flaggedIndices: number[];
  strikethroughMap: Record<number, number[]>;
  secondsElapsed: number;
  examTimeLimit: number;
  startedAt: string;
}
