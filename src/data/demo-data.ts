// demo-data.ts — mock/demo data removed
// This file provides empty stubs so frontend imports do not break.
// TODO: Replace these stubs with real API calls or a proper data layer.

export interface TopicMaterial { id: string; type: string; title: string; url: string }
export interface Topic { id: string; chapterId: string; name: string; order: number; status: string; materials: TopicMaterial[] }
export interface LiveSession { id: string; teacherId: string; classId: string; subjectId: string; chapterId: string; topicId: string; topicName: string; teacherName: string; className: string; subjectName: string; startTime: string; status: string; attendanceMarked: boolean; quizSubmitted: boolean }
export interface StudentBadge { id: string; studentId: string; title: string; icon: string; description: string; earnedDate: string }
export interface StudentCertificate { id: string; studentId: string; title: string; issuer: string; date: string; type: string }

export const schools: any[] = [];
export const classes: any[] = [];
export const teachers: any[] = [];
export const students: any[] = [];

export const curriculum = { subject: "", chapter: "", topic: "", date: "", classId: "" };
export const lessonContent = { topic: "", summary: "", keyPoints: [] as string[], slideOutline: [] as string[], activities: [] as string[] };
export const quizQuestions: any[] = [];
export const impactMetrics = { schoolsOnboarded: 0, teachersActive: 0, studentsReached: 0, sessionsCompleted: 0, quizParticipation: 0 };
export const activityLogs: any[] = [];

export const subjects: any[] = [];
export const chapters: any[] = [];
export const topics: Topic[] = [];

export const liveSessions: LiveSession[] = [];

export const studentBadges: StudentBadge[] = [];
export const studentCertificates: StudentCertificate[] = [];

export const chapterStatuses: Record<string, "completed" | "in_progress" | "not_started"> = {};

export const studyMaterials: any[] = [];
export const chapterQuizzes: any[] = [];
export const studentQuizResults: any[] = [];
export const studentUsageLogs: any[] = [];
export const coCurricularRegistrations: any[] = [];
export const classStatus: any[] = [];
export const coCurricularActivities: any[] = [];
export const dailyUpdates: any[] = [];
export const leaveApplications: any[] = [];
export const classRecordings: any[] = [];
export const homework: any[] = [];
export const studentAttendance: any[] = [];

export const teacherEffectiveness: any[] = [];
export const weakTopicHeatmap: any[] = [];
export const engagementMetrics = { dailyActiveStudents: [] as any[], materialViews: {}, quizCompletionRate: 0, avgSessionDuration: 0 };

export default {};
