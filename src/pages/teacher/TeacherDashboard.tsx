import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AIAssistant from "@/components/AIAssistant";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  subjects, chapters, studyMaterials, chapterStatuses, chapterQuizzes,
  classes, classStatus, leaveApplications, schools,
  coCurricularActivities, topics, students, studentAttendance, liveSessions,
  studentQuizResults, studentUsageLogs, coCurricularRegistrations,
  type Topic, type LiveSession
} from "@/data/demo-data";
import {
  BookOpen, Bot, Play, QrCode, CheckCircle2, XCircle, Lightbulb,
  Video, VideoOff, CalendarOff, CalendarCheck, FileText, Upload,
  Clock, ArrowLeft, ChevronRight, Trophy, Presentation, Image,
  PlayCircle, Film, FileDown, ChevronDown, Users, Radio,
  Microscope, Globe, Sparkles, Brain, BarChart3, MonitorPlay
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const statusColors = {
  completed: { bg: "bg-success-light", text: "text-success", label: "Completed", color: "hsl(var(--success))" },
  in_progress: { bg: "bg-amber-light", text: "text-amber", label: "In Progress", color: "hsl(var(--amber))" },
  not_started: { bg: "bg-secondary", text: "text-muted-foreground", label: "Not Started", color: "hsl(var(--border))" },
};

const materialTypeIcons: Record<string, typeof FileText> = {
  ppt: Presentation, pdf: FileText, video: PlayCircle, image: Image,
  ai_video: Film, recording: Video, doc: FileText, notes: FileText,
  simulation: Microscope, vr: Globe,
};

const TeacherDashboard = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Class & Subject selection - get from URL params
  const [selectedClass, setSelectedClass] = useState<string>(searchParams.get("class") || "c1");
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get("subject") || "sub1");

  // Chapter & topic management
  const [chapterStatusState, setChapterStatusState] = useState<Record<string, string>>({ ...chapterStatuses });
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [topicStatusState, setTopicStatusState] = useState<Record<string, string>>(
    Object.fromEntries(topics.map(t => [t.id, t.status]))
  );

  // Live session
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionAttendance, setSessionAttendance] = useState<Record<string, boolean>>({});
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [sessionQuizDone, setSessionQuizDone] = useState(false);

  // Leave
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaves, setLeaves] = useState(leaveApplications.filter(l => l.teacherId === "t1"));

  // Class status
  const [classStatusState, setClassStatusState] = useState<Array<{ id: string; date: string; classId: string; status: "conducted" | "cancelled"; teacherId: string; reason?: string }>>(classStatus.filter(cs => cs.classId === selectedClass));

  // maintain local copy of activities so registrations can change
  const [activities, setActivities] = useState(coCurricularActivities);
  const [registrations, setRegistrations] = useState(coCurricularRegistrations);

  // state for inline registration form
  const [registeringActivity, setRegisteringActivity] = useState<string | null>(null);
  const [registerStudentId, setRegisterStudentId] = useState("");
  const [viewingActivityRegistrations, setViewingActivityRegistrations] = useState<string | null>(null);

  const beginRegister = (activityId: string) => {
    setRegisteringActivity(activityId);
    setRegisterStudentId("");
  };

  const confirmRegister = () => {
    if (!registeringActivity || !registerStudentId) {
      setRegisteringActivity(null);
      return;
    }
    // increment count on activity
    setActivities(prev =>
      prev.map(a =>
        a.id === registeringActivity
          ? { ...a, registrations: a.registrations + 1 }
          : a
      )
    );
    // record registration details
    setRegistrations(prev => [
      ...prev,
      { activityId: registeringActivity, studentId: registerStudentId, status: "registered" as const },
    ]);
    setRegisteringActivity(null);
    setRegisterStudentId("");
  };

  const currentClass = classes.find(c => c.id === selectedClass);
  const grade = currentClass?.grade || 8;
  const currentSubject = subjects.find(s => s.id === selectedSubject);

  // student list is kept in local state so we can modify class assignments
  const [localStudents, setLocalStudents] = useState(students);
  const classStudents = localStudents.filter(s => s.classId === selectedClass);

  const downloadClassCsv = useCallback(() => {
    if (!classStudents.length || !currentClass) return;
    const rows: string[] = [];
    const header = ["Student ID", "Name", "Roll No", "Class", "School", "Quiz %", "Attendance %", "Avg Usage (min)", "Password"];
    const escape = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    rows.push(header.join(","));

    classStudents.forEach((s) => {
      const studentResults = studentQuizResults.filter(r => r.studentId === s.id);
      const totalScore = studentResults.reduce((a, r) => a + r.score, 0);
      const totalPossible = studentResults.reduce((a, r) => a + r.total, 0);
      const quizPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      const att = studentAttendance.find(a => a.studentId === s.id);
      const attPct = att ? att.percentage : "";
      const usageLogs = studentUsageLogs.filter(u => u.studentId === s.id);
      const avgUsage = usageLogs.length ? Math.round(usageLogs.reduce((a, u) => a + u.minutes, 0) / usageLogs.length) : 0;

      const line = [
        escape(s.id),
        escape(s.name),
        escape(s.rollNo),
        escape(currentClass.name),
        escape(schools.find(sc => sc.id === currentClass.schoolId)?.name || ""),
        escape(quizPct),
        escape(attPct),
        escape(avgUsage),
        escape(s.password),
      ];
      rows.push(line.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = `${currentClass.name.replace(/\s+/g, "_")}_students_${new Date().toISOString().slice(0,10)}.csv`;
    a.href = url;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [classStudents, currentClass]);

  // registration form state
  const [newStudent, setNewStudent] = useState<Record<string, string>>({
    firstName: "", lastName: "", dob: "", gender: "", village: "", mandal: "", district: "", address: "", classId: selectedClass
  });

  const handleStudentChange = (field: string, value: string) => {
    setNewStudent(prev => ({ ...prev, [field]: value }));
  };

  const handleStudentSubmit = () => {
    const id = `st${Date.now()}`;
    setLocalStudents(prev => [...prev, { id, name: `${newStudent.firstName} ${newStudent.lastName}`, rollNo: prev.length + 1, classId: newStudent.classId, schoolId: currentClass?.schoolId || "", score: 0, password: "demo123" }]);
    setNewStudent({ firstName: "", lastName: "", dob: "", gender: "", village: "", mandal: "", district: "", address: "", classId: selectedClass });
  };

  // track pass/fail results for the current class
  const [studentResults, setStudentResults] = useState<Record<string, "pass" | "fail" | "">>({});

  const getNextClassId = (currentClassId: string) => {
    const cur = classes.find(c => c.id === currentClassId);
    if (!cur) return currentClassId;
    const next = classes.find(c => c.grade === cur.grade + 1 && c.schoolId === cur.schoolId);
    return next?.id || currentClassId;
  };

  const handleResultChange = (studentId: string, result: "pass" | "fail" | "") => {
    setStudentResults(prev => ({ ...prev, [studentId]: result }));
    if (result === "pass") {
      // upgrade the student to the next grade/class
      setLocalStudents(prev =>
        prev.map(st =>
          st.id === studentId
            ? { ...st, classId: getNextClassId(st.classId) }
            : st
        )
      );
    }
  };

  // used when clicking "view" on a student row
  const [viewingStudent, setViewingStudent] = useState<string | null>(null);

  const detailedStudent = viewingStudent ? students.find(s => s.id === viewingStudent) : null;
  const detailedResults = viewingStudent ? studentQuizResults.filter(r => r.studentId === viewingStudent) : [];
  const detailedUsage = viewingStudent ? studentUsageLogs.filter(u => u.studentId === viewingStudent) : [];
  const detailedRegistrations = viewingStudent ? registrations.filter(r => r.studentId === viewingStudent) : [];

  const detailedSubjectPerf = (() => {
    if (!viewingStudent) return [];
    const gradeVal = currentClass?.grade || 0;
    const gradeSubs = subjects.filter(s => s.grades.includes(gradeVal));
    return gradeSubs.map(sub => {
      const subChaps = chapters.filter(ch => ch.subjectId === sub.id && ch.grade === gradeVal);
      const subRes = detailedResults.filter(r => subChaps.some(ch => ch.id === r.chapterId));
      const score = subRes.reduce((a, r) => a + r.score, 0);
      const total = subRes.reduce((a, r) => a + r.total, 0);
      return { name: sub.name, score: total > 0 ? Math.round((score / total) * 100) : 0 };
    });
  })();

  const detailedWeak = detailedSubjectPerf.filter(s => s.score > 0 && s.score < 60).sort((a, b) => a.score - b.score);

  // whenever teacher switches class view, clear previously selected results

  // whenever teacher switches class view, clear previously selected results
  useEffect(() => {
    setStudentResults({});
  }, [selectedClass]);

  const filteredChapters = chapters.filter(
    ch => ch.subjectId === selectedSubject && ch.grade === grade
  );

  const filteredChapterIds = filteredChapters.map(ch => ch.id);
  const completedChapterCount = filteredChapters.filter(
    ch => (chapterStatusState[ch.id] || "not_started") === "completed"
  ).length;
  const syllabusProgress = filteredChapters.length > 0
    ? Math.round((completedChapterCount / filteredChapters.length) * 100)
    : 0;
  const totalQuizChapterIds = Array.from(
    new Set(chapterQuizzes.filter(q => filteredChapterIds.includes(q.chapterId)).map(q => q.chapterId))
  );
  const completedQuizChapterIds = Array.from(
    new Set(
      studentQuizResults
        .filter(r => classStudents.some(student => student.id === r.studentId) && filteredChapterIds.includes(r.chapterId))
        .map(r => r.chapterId)
    )
  );
  const totalQuizCount = totalQuizChapterIds.length;
  const completedQuizCount = completedQuizChapterIds.length;
  const conductedSessions = classStatusState.filter(cs => cs.status === "conducted").length;
  const scheduledSessions = classStatusState.length;

  const rankedStudentsByMarks = classStudents
    .map(student => {
      const results = studentQuizResults.filter(
        r => r.studentId === student.id && filteredChapterIds.includes(r.chapterId)
      );
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const totalPossible = results.reduce((sum, r) => sum + r.total, 0);
      const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      return { student, percentage, totalPossible, totalScore };
    })
    .sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return b.totalScore - a.totalScore;
    });

  const selectedChapterObj = chapters.find(c => c.id === selectedChapter);

  // Session timer
  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Chapter progress based on topics
  const getChapterProgress = (chapterId: string) => {
    const chTopics = topics.filter(t => t.chapterId === chapterId);
    if (chTopics.length === 0) return 0;
    const completed = chTopics.filter(t => (topicStatusState[t.id] || t.status) === "completed").length;
    return Math.round((completed / chTopics.length) * 100);
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Start live session on a topic
  const handleStartSession = (topic: Topic) => {
    const session: LiveSession = {
      id: `ls_${Date.now()}`,
      teacherId: "t1",
      classId: selectedClass,
      subjectId: selectedSubject,
      chapterId: topic.chapterId,
      topicId: topic.id,
      topicName: topic.name,
      teacherName: "Rajesh Kumar",
      className: currentClass?.name || "",
      subjectName: currentSubject?.name || "",
      startTime: new Date().toISOString(),
      status: "active",
      attendanceMarked: false,
      quizSubmitted: false,
    };
    setActiveSession(session);
    setSessionTime(0);
    setSessionAttendance(Object.fromEntries(classStudents.map(s => [s.id, false])));
    setAttendanceMarked(false);
    setSessionQuizDone(false);
    liveSessions.push(session);
  };

  const handleEndSession = () => {
    if (!activeSession) return;
    // Update topic to completed
    setTopicStatusState(prev => ({ ...prev, [activeSession.topicId]: "completed" }));
    // Remove from live sessions
    const idx = liveSessions.findIndex(s => s.id === activeSession.id);
    if (idx >= 0) liveSessions.splice(idx, 1);
    // Add class status
    const today = new Date().toISOString().split("T")[0];
    setClassStatusState(prev => [
      { id: `cs_${Date.now()}`, date: today, classId: selectedClass, status: "conducted" as const, teacherId: "t1" },
      ...prev,
    ]);
    setActiveSession(null);
    setSessionTime(0);
  };

  const handleMarkAttendance = () => {
    setAttendanceMarked(true);
    if (activeSession) {
      activeSession.attendanceMarked = true;
    }
  };

  const handleApplyLeave = () => {
    if (!leaveDate || !leaveReason) return;
    setLeaves(prev => [
      ...prev,
      { id: `lv_${Date.now()}`, teacherId: "t1", date: leaveDate, reason: leaveReason, status: "pending" as const, appliedOn: new Date().toISOString().split("T")[0] },
    ]);
    setLeaveDate("");
    setLeaveReason("");
  };

  const handleChapterStatusChange = (chId: string, newStatus: string) => {
    setChapterStatusState(prev => ({ ...prev, [chId]: newStatus }));
  };

  // Active session workspace view
  if (activeSession) {
    const sessionTopic = topics.find(t => t.id === activeSession.topicId);
    const sessionChapter = chapters.find(c => c.id === activeSession.chapterId);
    const canEnd = attendanceMarked && sessionQuizDone;

    return (
      <DashboardLayout title="Live Teaching Session">
        {/* LIVE indicator */}
        <div className="fixed top-3 right-20 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-sm font-bold animate-pulse">
          <Radio className="w-4 h-4" /> LIVE • {formatTime(sessionTime)}
        </div>

        <div className="mb-4">
          <Button variant="ghost" onClick={() => {
            if (canEnd) handleEndSession();
            else if (confirm("End session without completing requirements?")) handleEndSession();
          }} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> End & Return
          </Button>
        </div>

        {/* Session Info Bar */}
        <div className="bg-teal-light rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{activeSession.subjectName} → {sessionChapter?.name}</p>
              <h2 className="font-display text-lg font-bold text-foreground">{activeSession.topicName}</h2>
              <p className="text-xs text-muted-foreground">{activeSession.className} • Started {new Date(activeSession.startTime).toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={attendanceMarked ? "bg-success-light text-success" : "bg-amber-light text-amber"}>
                {attendanceMarked ? "✅ Attendance Done" : "⏳ Attendance Pending"}
              </Badge>
              <Badge className={sessionQuizDone ? "bg-success-light text-success" : "bg-amber-light text-amber"}>
                {sessionQuizDone ? "✅ Quiz Done" : "⏳ Quiz Pending"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main workspace - PPT/Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Camera Preview */}
            <Card className="shadow-card border-border">
              <CardContent className="p-4">
                <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center border-2 border-dashed border-border relative">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-destructive" />
                    </div>
                    <p className="text-foreground font-display font-bold">📹 Recording in Progress</p>
                    <p className="text-2xl font-mono text-primary font-bold mt-1">{formatTime(sessionTime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topic Materials */}
            <Card className="shadow-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm">Topic Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionTopic && sessionTopic.materials.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sessionTopic.materials.map(mat => {
                      const Icon = materialTypeIcons[mat.type] || FileText;
                      return (
                        <div key={mat.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{mat.title}</p>
                            <Badge variant="outline" className="text-xs uppercase mt-0.5">{mat.type}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No materials for this topic.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Tools & Attendance */}
          <div className="space-y-4">
            {/* Teaching Tools */}
            <Card className="shadow-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> AI Teaching Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Presentation, label: "AI PPT Generator", desc: "Generate slides from topic" },
                  { icon: Film, label: "AI Video Generator", desc: "Create narrated video" },
                  { icon: Brain, label: "AI Chatbot", desc: "Ask AI anything" },
                  { icon: PlayCircle, label: "YouTube Recommendations", desc: "Find related videos" },
                  { icon: Microscope, label: "Simulation Viewer", desc: "Interactive experiments" },
                  { icon: Globe, label: "VR/360° Viewer", desc: "Immersive content" },
                  { icon: QrCode, label: "Launch Quiz", desc: "QR-based quiz" },
                  { icon: FileText, label: "Lesson Plan Generator", desc: "AI lesson plans" },
                ].map((tool, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => {
                      if (tool.label === "AI Chatbot") setAiOpen(true);
                      if (tool.label === "Launch Quiz") {
                        setSessionQuizDone(true);
                        navigate("/teacher/quiz");
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center">
                      <tool.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Attendance */}
            <Card className="shadow-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-info" /> Attendance ({Object.values(sessionAttendance).filter(Boolean).length}/{classStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {classStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary cursor-pointer">
                      <Checkbox
                        checked={sessionAttendance[s.id] || false}
                        onCheckedChange={(checked) => {
                          setSessionAttendance(prev => ({ ...prev, [s.id]: !!checked }));
                        }}
                        disabled={attendanceMarked}
                      />
                      <span className="text-xs text-foreground">{s.rollNo}. {s.name}</span>
                    </label>
                  ))}
                </div>
                {!attendanceMarked && (
                  <Button size="sm" className="w-full mt-3" onClick={handleMarkAttendance}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Submit Attendance
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* End Session */}
            <Button
              size="lg"
              variant="destructive"
              className="w-full gap-2"
              onClick={handleEndSession}
              disabled={!canEnd}
            >
              <VideoOff className="w-5 h-5" /> End Session
            </Button>
            {!canEnd && (
              <p className="text-xs text-muted-foreground text-center">
                Complete attendance & quiz before ending session
              </p>
            )}
          </div>
        </div>

        <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      </DashboardLayout>
    );
  }

  // Normal dashboard
  return (
    <DashboardLayout title="Teacher Dashboard">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex gap-8">
          {/* Fixed Sidebar */}
          <aside className="w-[200px] flex-shrink-0">
            <TabsList className="flex-col h-auto gap-2 w-full bg-transparent p-0">
              <TabsTrigger value="overview" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Overview</TabsTrigger>
              <TabsTrigger value="chapters" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Chapters & Topics</TabsTrigger>
              <TabsTrigger value="students" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Students</TabsTrigger>
              <TabsTrigger value="classstatus" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Class Status</TabsTrigger>
              <TabsTrigger value="leave" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Leave</TabsTrigger>
              <TabsTrigger value="cocurricular" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Co-Curricular</TabsTrigger>
          <TabsTrigger value="register" className="justify-start w-full data-[state=active]:bg-secondary data-[state=active]:text-primary hover:bg-secondary/50 rounded-lg px-4 py-2 transition-colors">Student Registration</TabsTrigger>
            </TabsList>
          </aside>
          {/* Content Area */}
          <div className="flex-1 min-w-0">
        <TabsContent value="overview" className="space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Overview — {currentSubject?.name} • {currentClass?.name}
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="font-display text-2xl font-bold text-foreground">{syllabusProgress}%</p>
                <p className="text-xs text-muted-foreground">Syllabus Progress</p>
                <p className="text-[10px] text-muted-foreground mt-1">{completedChapterCount}/{filteredChapters.length} chapters</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="font-display text-2xl font-bold text-foreground">{completedQuizCount}/{totalQuizCount}</p>
                <p className="text-xs text-muted-foreground">Quizzes</p>
                <p className="text-[10px] text-muted-foreground mt-1">Completed / Total</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="font-display text-2xl font-bold text-foreground">{conductedSessions}/{scheduledSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
                <p className="text-[10px] text-muted-foreground mt-1">Conducted/Scheduled</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="font-display text-2xl font-bold text-foreground">{rankedStudentsByMarks.length}</p>
                <p className="text-xs text-muted-foreground">Students Ranked</p>
                <p className="text-[10px] text-muted-foreground mt-1">Based on marks</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" /> Students by Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rankedStudentsByMarks.length > 0 ? (
                rankedStudentsByMarks.map((item, index) => (
                  <div key={item.student.id} className="p-3 bg-secondary rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.student.name}</p>
                      <p className="text-xs text-muted-foreground">Roll No: {item.student.rollNo}</p>
                    </div>
                    <Badge className="bg-success-light text-success">{item.percentage}%</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No students found for this class.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            {currentSubject?.icon} {currentSubject?.name} — {currentClass?.name}
          </h3>
          <div className="space-y-3">
            {filteredChapters.map(ch => {
              const status = chapterStatusState[ch.id] || "not_started";
              const sc = statusColors[status as keyof typeof statusColors];
              const chTopics = topics.filter(t => t.chapterId === ch.id);
              const progress = getChapterProgress(ch.id);
              const isExpanded = selectedChapter === ch.id;

              return (
                <Card key={ch.id} className="shadow-card border-border overflow-hidden">
                  {/* Chapter Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setSelectedChapter(isExpanded ? null : ch.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-10 rounded-full" style={{ backgroundColor: sc.color }} />
                      <div>
                        <h4 className="font-display font-semibold text-foreground text-sm">{ch.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className={`${sc.bg} ${sc.text} text-xs`}>{sc.label}</Badge>
                          <span className="text-xs text-muted-foreground">{chTopics.length} topics</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 flex items-center gap-2">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Topics Dropdown */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/30 p-4 space-y-2">
                      {chTopics.length > 0 ? chTopics.map(topic => {
                        const tStatus = topicStatusState[topic.id] || topic.status;
                        const tsc = statusColors[tStatus as keyof typeof statusColors];
                        const isTopicExpanded = expandedTopics[topic.id];

                        return (
                          <div key={topic.id} className="bg-card rounded-xl border border-border overflow-hidden">
                            <div
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                              onClick={() => toggleTopic(topic.id)}
                            >
                              <div className="flex items-center gap-2">
                                {tStatus === "completed" ? (
                                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                ) : tStatus === "in_progress" ? (
                                  <Clock className="w-4 h-4 text-amber flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium text-foreground">{topic.name}</span>
                                <Badge variant="outline" className="text-[10px]">{topic.materials.length} materials</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartSession(topic);
                                  }}
                                >
                                  <Play className="w-3 h-3" /> Start Session
                                </Button>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isTopicExpanded ? "rotate-180" : ""}`} />
                              </div>
                            </div>

                            {isTopicExpanded && (
                              <div className="px-3 pb-3 space-y-2">
                                {topic.materials.map(mat => {
                                  const Icon = materialTypeIcons[mat.type] || FileText;
                                  return (
                                    <div key={mat.id} className="flex items-center gap-3 p-2 bg-secondary rounded-lg">
                                      <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">{mat.title}</p>
                                        <Badge variant="outline" className="text-[10px] uppercase">{mat.type}</Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }) : (
                        <p className="text-sm text-muted-foreground p-2">No topics defined for this chapter yet.</p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
            {filteredChapters.length === 0 && (
              <Card className="shadow-card border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No chapters available for this subject and class combination.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* STUDENTS TAB */}
        <TabsContent value="students" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> {currentClass?.name} — Students ({classStudents.length})
                </CardTitle>
                <div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadClassCsv()}>
                    <FileDown className="w-4 h-4" /> Download Students CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="text-left p-3 font-medium text-muted-foreground">Roll</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Attendance</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Performance</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map(s => {
                      const att = studentAttendance.find(a => a.studentId === s.id);
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0">
                          <td className="p-3 text-foreground">{s.rollNo}</td>
                          <td className="p-3 text-foreground font-medium">{s.name}</td>
                          <td className="p-3">
                            {att ? (
                              <div className="flex items-center gap-2">
                                <Progress value={att.percentage} className="h-2 w-20" />
                                <span className="text-xs text-muted-foreground">{att.percentage}%</span>
                              </div>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className="text-xs cursor-pointer"
                              onClick={() => setViewingStudent(s.id)}
                            >
                              View
                            </Badge>
                          </td>
                          <td className="p-3">
                            <select
                              className="text-xs p-1 rounded border"
                              value={studentResults[s.id] || ""}
                              onChange={e => handleResultChange(s.id, e.target.value as "pass" | "fail" | "")}
                            >
                              <option value="">--</option>
                              <option value="pass">Pass</option>
                              <option value="fail">Fail</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLASS STATUS TAB */}
        <TabsContent value="classstatus" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" /> Class Status — {currentClass?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStatusState.map(cs => (
                      <tr key={cs.id} className="border-b border-border last:border-0">
                        <td className="p-3 text-foreground">{cs.date}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            cs.status === "conducted" ? "bg-success-light text-success" : "bg-destructive/10 text-destructive"
                          }`}>
                            {cs.status === "conducted"
                              ? <><CheckCircle2 className="w-3 h-3" /> Conducted</>
                              : <><XCircle className="w-3 h-3" /> Cancelled</>
                            }
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{cs.reason || "—"}</td>
                        <td className="p-3">
                          <Select
                            value={cs.status}
                            onValueChange={(val) => {
                              setClassStatusState(prev => prev.map(c =>
                                c.id === cs.id ? { ...c, status: val as "conducted" | "cancelled" } : c
                              ));
                            }}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conducted">Conducted</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEAVE TAB */}
        <TabsContent value="leave" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CalendarOff className="w-5 h-5 text-primary" /> Apply for Leave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Enter reason for leave..." className="mt-1" />
                </div>
                <Button onClick={handleApplyLeave} disabled={!leaveDate || !leaveReason} className="w-full">
                  Submit Leave Application
                </Button>
                <p className="text-xs text-muted-foreground">
                  ⚠️ While on leave, your classes will be marked as cancelled and students will be notified.
                </p>
              </CardContent>
            </Card>

          </div>
        </TabsContent>


        {/* CO-CURRICULAR TAB */}
        <TabsContent value="cocurricular" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" /> Co-Curricular Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {activities.map(act => (
                  <div key={act.id} className="p-4 bg-secondary rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{act.icon}</span>
                      <div>
                        <h4 className="font-display font-semibold text-foreground text-sm">{act.title}</h4>
                        <Badge className={`text-xs ${
                          act.status === "upcoming" ? "bg-info-light text-info" :
                          act.status === "ongoing" ? "bg-success-light text-success" :
                          "bg-secondary text-muted-foreground"
                        }`}>{act.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{act.description}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{act.date} • {act.registrations} registered</span>
                      </div>
                      {act.status !== "completed" && (
                        <div>
                          <div className="flex gap-2 mb-2">
                            <Button variant="outline" size="sm" className="text-xs flex-1"
                              onClick={() => beginRegister(act.id)}
                            >
                              Register Student
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs flex-1"
                              onClick={() => setViewingActivityRegistrations(act.id)}
                            >
                              Registered Students ({registrations.filter(r => r.activityId === act.id).length})
                            </Button>
                          </div>
                          {registeringActivity === act.id && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="text"
                                placeholder="Student ID"
                                value={registerStudentId}
                                onChange={e => setRegisterStudentId(e.target.value)}
                                className="text-xs w-24"
                              />
                              <Button size="sm" onClick={confirmRegister} className="text-xs">
                                OK
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* STUDENT REGISTRATION TAB */}
        <TabsContent value="register" className="space-y-4 flex justify-center items-center w-full h-full">
          <Card className="shadow-card border-border max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="font-display text-lg">Register Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { label: "First Name", field: "firstName" },
                { label: "Last Name", field: "lastName" },
                { label: "Date of Birth", field: "dob", type: "date" },
                { label: "Gender", field: "gender", type: "select", options: ["Male","Female","Other"] as Array<string | {value:string;label:string}> },
                { label: "Village", field: "village" },
                { label: "Mandal", field: "mandal" },
                { label: "District", field: "district" },
                { label: "Address", field: "address", component: "textarea" },
                { label: "Class", field: "classId", type: "select", options: classes.map(c => ({ value: c.id, label: c.name })) as Array<string | {value:string;label:string}> }
              ] as Array<{label:string;field:string;type?:string;options?:Array<string|{value:string;label:string}>;component?:string}>).map(({ label, field, type, options, component }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  {component === "textarea" ? (
                    <Textarea
                      value={newStudent[field]}
                      onChange={e => handleStudentChange(field, e.target.value)}
                      className="mt-1"
                    />
                  ) : type === "select" ? (
                    <Select value={newStudent[field]} onValueChange={v => handleStudentChange(field, v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={label} />
                      </SelectTrigger>
                      <SelectContent>
                        {options!.map(opt => {
                          const value = typeof opt === "string" ? opt : opt.value || "";
                          const labelText = typeof opt === "string" ? opt : opt.label || "";
                          return (
                            <SelectItem key={value} value={value}>
                              {labelText}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={type || "text"}
                      value={newStudent[field]}
                      onChange={e => handleStudentChange(field, e.target.value)}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
              <Button onClick={handleStudentSubmit} className="w-full">Submit</Button>
            </CardContent>
          </Card>
        </TabsContent>
          </div> {/* end flex-1 wrapper */}
        </div> {/* end flex wrapper */}
      </Tabs>

      {/* Floating AI Button */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-hover flex items-center justify-center z-30 hover:scale-105 transition-transform"
      >
        <Bot className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Registered Students modal */}
      <Dialog open={!!viewingActivityRegistrations} onOpenChange={open => { if (!open) setViewingActivityRegistrations(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registered Students</DialogTitle>
            <DialogDescription>
              {activities.find(a => a.id === viewingActivityRegistrations)?.title || ""}
            </DialogDescription>
          </DialogHeader>
          {viewingActivityRegistrations && (
            <div>
              {registrations.filter(r => r.activityId === viewingActivityRegistrations).length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="grid gap-2">
                    {registrations.filter(r => r.activityId === viewingActivityRegistrations).map(reg => {
                      const student = localStudents.find(s => s.id === reg.studentId);
                      return (
                        <div key={`${reg.activityId}-${reg.studentId}`} className="p-3 bg-secondary rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{student?.name || reg.studentId}</p>
                            <p className="text-xs text-muted-foreground">Roll No: {student?.rollNo || "—"}</p>
                          </div>
                          <Badge className="bg-success-light text-success text-xs">{reg.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No students registered yet.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student performance/details modal */}
      <Dialog open={!!viewingStudent} onOpenChange={open => { if (!open) setViewingStudent(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              {detailedStudent ? `${detailedStudent.name} (${detailedStudent.rollNo})` : ""}
            </DialogDescription>
          </DialogHeader>
          {detailedStudent && (
            <div className="space-y-4">
              {/* Performance graph */}
              <div>
                <p className="text-sm font-medium">Subject-wise Scores</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={detailedSubjectPerf}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,20%,90%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(174,62%,38%)" radius={[4,4,0,0]} name="Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Strong/weak areas */}
              {detailedWeak.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-destructive">Weak Areas</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detailedWeak.map(a => (
                      <Badge key={a.name} className="bg-destructive/10 text-destructive text-xs">
                        {a.name} ({a.score}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Time spent chart */}
              {detailedUsage.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Time Spent (min)</p>
                  <p className="text-xs text-muted-foreground">
                    Total: {detailedUsage.reduce((a, u) => a + u.minutes, 0)} minutes
                  </p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={detailedUsage} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="minutes" fill="hsl(220, 60%, 60%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {/* Co-curricular list */}
              {detailedRegistrations.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Co‑curricular Activities</p>
                  <ul className="list-disc list-inside text-xs mt-1">
                    {detailedRegistrations.map(r => {
                      const act = coCurricularActivities.find(a => a.id === r.activityId);
                      return (
                        <li key={r.activityId}>
                          {act?.title} ({r.status})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </DashboardLayout>
  );
};

export default TeacherDashboard;
