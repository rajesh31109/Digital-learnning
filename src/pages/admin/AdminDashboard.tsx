import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentQRCard from "@/components/StudentQRCard";
import {
  schools, classes, teachers, students, impactMetrics, activityLogs,
  curriculum, subjects, chapters, studyMaterials, classStatus, chapterQuizzes,
  leaveApplications, classRecordings, teacherEffectiveness, weakTopicHeatmap,
  engagementMetrics, homework, studentAttendance, liveSessions, studentQuizResults,
  topics
} from "@/data/demo-data";
import {
  School, Users, GraduationCap, CalendarCheck, BookOpen, ClipboardList,
  ChevronRight, MapPin, Clock, QrCode, FileDown, FileText, CheckCircle2,
  XCircle, Video, TrendingUp, AlertTriangle, BarChart3, Activity, Star,
  Radio, Eye, MonitorPlay, ArrowLeft, Target, Trophy
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { StudentForm, TeacherForm } from "./RegistrationForms";

const chartData = [
  { name: "GHS Adilabad", sessions: 24, quizzes: 120 },
  { name: "TWS Utnoor", sessions: 18, quizzes: 90 },
];

const pieData = [
  { name: "Completed", value: 42, color: "hsl(174, 62%, 38%)" },
  { name: "In Progress", value: 8, color: "hsl(38, 92%, 55%)" },
  { name: "Upcoming", value: 15, color: "hsl(200, 20%, 90%)" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showQRCards, setShowQRCards] = useState(false);
  const [watchingLive, setWatchingLive] = useState<string | null>(null);
  const [teacherSchoolFilter, setTeacherSchoolFilter] = useState("all");
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState("all");
  const [teacherNameFilter, setTeacherNameFilter] = useState("all");
  const [showTeachersMenu, setShowTeachersMenu] = useState(false);
  const [manageTeachersView, setManageTeachersView] = useState(false);
  const menuHideTimeout = useRef<number | null>(null);
  const [showRegistrationMenu, setShowRegistrationMenu] = useState(false);
  const registrationRef = useRef<HTMLDivElement | null>(null);
  const [registrationModalType, setRegistrationModalType] = useState<"student" | "teacher" | null>(null);
  useEffect(() => {
    return () => {
      if (menuHideTimeout.current) {
        clearTimeout(menuHideTimeout.current);
        menuHideTimeout.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!registrationRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!registrationRef.current.contains(e.target)) {
        setShowRegistrationMenu(false);
      }
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);
  const [manageNameFilter, setManageNameFilter] = useState("");
  const [manageIdFilter, setManageIdFilter] = useState("");
  const [classStatusSchoolFilter, setClassStatusSchoolFilter] = useState("all");
  const [classStatusClassFilter, setClassStatusClassFilter] = useState("all");
  const [leaveSchoolFilter, setLeaveSchoolFilter] = useState("all");
  const [leaveTeacherFilter, setLeaveTeacherFilter] = useState("all");
  const [leaveTeacherIdFilter, setLeaveTeacherIdFilter] = useState("");
  const [logSchoolFilter, setLogSchoolFilter] = useState("all");
  const [logTeacherFilter, setLogTeacherFilter] = useState("all");
  const [logTeacherIdFilter, setLogTeacherIdFilter] = useState("");
  const navigate = useNavigate();

  // Local editable copies for materials management (mirror demo-data arrays)
  const [localChapters, setLocalChapters] = useState(() => {
    try { return JSON.parse(localStorage.getItem("local_chapters") || "null") || chapters; } catch { return chapters; }
  });
  const [localTopics, setLocalTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem("local_topics") || "null") || topics; } catch { return topics; }
  });
  const [localMaterials, setLocalMaterials] = useState(() => {
    try { return JSON.parse(localStorage.getItem("local_materials") || "null") || studyMaterials; } catch { return studyMaterials; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("local_chapters", JSON.stringify(localChapters));
      localStorage.setItem("local_topics", JSON.stringify(localTopics));
      localStorage.setItem("local_materials", JSON.stringify(localMaterials));
    } catch (e) {
      // ignore
    }
  }, [localChapters, localTopics, localMaterials]);

  // Add Materials flow state
  const [showAddMaterials, setShowAddMaterials] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [materialClass, setMaterialClass] = useState<string | null>(null);
  const [materialSubject, setMaterialSubject] = useState<string | null>(null);
  const [chapterCount, setChapterCount] = useState<string>("");
  const [tempChapterNames, setTempChapterNames] = useState<string[]>([]);

  // Topic creation flow (multi-step)
  const [topicAddOpen, setTopicAddOpen] = useState(false);
  const [topicAddStep, setTopicAddStep] = useState(1);
  const [topicTargetChapter, setTopicTargetChapter] = useState<string | null>(null);
  const [topicCount, setTopicCount] = useState<string>("");
  const [tempTopicNames, setTempTopicNames] = useState<string[]>([]);

  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [uploadTopicId, setUploadTopicId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const resetAddFlow = () => {
    setAddStep(1);
    setMaterialClass(null);
    setMaterialSubject(null);
    setChapterCount("");
    setTempChapterNames([]);
    setShowAddMaterials(false);
  };

  const handleCreateChapters = () => {
    const base = Date.now();
    const created: typeof chapters = [];
    const n = Math.max(0, parseInt(chapterCount || "0", 10));
    for (let i = 0; i < n; i++) {
      const name = (tempChapterNames[i] && tempChapterNames[i].trim()) || `Chapter ${i + 1}`;
      const id = `ch_custom_${base}_${i}`;
      const grade = classes.find(c => c.id === materialClass)?.grade || 8;
      const subjectId = materialSubject || subjects[0].id;
      const ch = { id, subjectId, name, grade, order: localChapters.filter(ch => ch.subjectId === subjectId).length + 1 };
      // mutate demo-data array as well for cross-page visibility
      chapters.push(ch);
      created.push(ch);
    }
    setLocalChapters([...localChapters, ...created]);
    resetAddFlow();
  };

  const openAddTopic = (chapterId: string) => {
    setTopicTargetChapter(chapterId);
    setTopicCount("");
    setTempTopicNames([]);
    setTopicAddStep(1);
    setTopicAddOpen(true);
  };

  const handleCreateTopics = () => {
    const n = parseInt(topicCount || "0", 10);
    if (!topicTargetChapter || isNaN(n) || n < 1) return;
    const created = [] as typeof topics;
    for (let i = 0; i < n; i++) {
      const name = (tempTopicNames[i] && tempTopicNames[i].trim()) || `Topic ${i + 1}`;
      const id = `tp_custom_${Date.now()}_${i}`;
      const tp = { id, chapterId: topicTargetChapter, name, order: localTopics.filter(t => t.chapterId === topicTargetChapter).length + created.length + 1, status: 'not_started', materials: [] };
      topics.push(tp);
      created.push(tp);
    }
    setLocalTopics([...localTopics, ...created]);
    setTopicAddOpen(false);
    setExpandedChapter(topicTargetChapter);
    setTopicTargetChapter(null);
  };

  const handleAddMaterialToTopic = (topicId: string, file: File | null, title: string) => {
    if (!topicId || !file) return;
    const id = `m_custom_${Date.now()}`;
    const topic = localTopics.find(t => t.id === topicId) || topics.find(t => t.id === topicId);
    const chapterId = topic?.chapterId || "";
    const url = URL.createObjectURL(file);
    const mat = { id, chapterId, type: 'pdf', title: title || file.name, url, topicId };
    studyMaterials.push(mat);
    setLocalMaterials([...localMaterials, mat]);
    // attach to topic materials
    const tgt = topics.find(t => t.id === topicId);
    if (tgt) tgt.materials.push({ id, type: 'pdf', title: mat.title, url });
    setUploadTopicId(null);
    setUploadFile(null);
  };


  const overviewCards = [
    { icon: School, label: "Schools", value: schools.length, bg: "bg-teal-light", color: "text-primary" },
    { icon: Users, label: "Teachers", value: teachers.length, bg: "bg-info-light", color: "text-info" },
    { icon: GraduationCap, label: "Students", value: students.length, bg: "bg-amber-light", color: "text-amber" },
  ];

  const school = selectedSchool ? schools.find(s => s.id === selectedSchool) : null;
  const classDetail = selectedClass ? classes.find(c => c.id === selectedClass) : null;
  const classStudents = useMemo(
    () => (selectedClass ? students.filter(s => s.classId === selectedClass) : []),
    [selectedClass]
  );

  const classSubjectPerformance = useMemo(() => {
    if (!classDetail || !selectedClass) return [];
    return subjects
      .filter(s => s.grades.includes(classDetail.grade))
      .map((sub) => {
        const subChapterIds = chapters.filter(ch => ch.subjectId === sub.id && ch.grade === classDetail.grade).map(ch => ch.id);
        const results = studentQuizResults.filter(r => classStudents.some(cs => cs.id === r.studentId) && subChapterIds.includes(r.chapterId));
        const totalScore = results.reduce((a, r) => a + r.score, 0);
        const totalPossible = results.reduce((a, r) => a + r.total, 0);
        const percent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        return { name: sub.name, percent };
      });
  }, [classDetail, selectedClass, classStudents]);

  const schoolFilteredTeachers = useMemo(
    () => teachers.filter(t => teacherSchoolFilter === "all" || t.schoolId === teacherSchoolFilter),
    [teacherSchoolFilter]
  );

  const teacherSubjectOptions = useMemo(
    () => Array.from(new Set(schoolFilteredTeachers.flatMap(t => t.subjects))).sort(),
    [schoolFilteredTeachers]
  );

  const filteredTeacherEffectiveness = useMemo(() => {
    return teacherEffectiveness
      .map(te => {
        const teacher = teachers.find(t => t.id === te.teacherId);
        if (!teacher) return null;
        return { ...te, teacher };
      })
      .filter((entry): entry is NonNullable<typeof entry> => !!entry)
      .filter(({ teacher }) => {
        if (teacherSchoolFilter !== "all" && teacher.schoolId !== teacherSchoolFilter) return false;
        if (teacherSubjectFilter !== "all" && !teacher.subjects.includes(teacherSubjectFilter)) return false;
        if (teacherNameFilter !== "all" && teacher.id !== teacherNameFilter) return false;
        return true;
      });
  }, [teacherSchoolFilter, teacherSubjectFilter, teacherNameFilter]);

  // Check for active live sessions
  const activeSessions = liveSessions.filter(s => s.status === "active");

  const downloadAllQRCards = useCallback(() => {
    if (!classStudents.length || !school || !classDetail) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const renderCard = (s: typeof classStudents[0]): Promise<string> => {
      return new Promise((resolve) => {
        const qrValue = JSON.stringify({ student_id: s.id, name: s.name, roll: s.rollNo, class: classDetail!.name });
        const canvas = document.createElement("canvas");
        const scale = 3;
        canvas.width = 320 * scale;
        canvas.height = 420 * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(""); return; }
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.roundRect(0, 0, 320, 420, 16); ctx.fill();
        ctx.fillStyle = "#1a9988";
        ctx.beginPath(); ctx.roundRect(0, 0, 320, 70, [16, 16, 0, 0]); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ITDA AI Classroom", 160, 30);
        ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Student Identity Card", 160, 50);
        const tempDiv = document.createElement("div");
        container.appendChild(tempDiv);
        import("react-dom/client").then(({ createRoot }) => {
          import("react").then((React) => {
            const root = createRoot(tempDiv);
            root.render(React.createElement(QRCodeSVG, { value: qrValue, size: 160, level: "M", bgColor: "#ffffff", fgColor: "#1a2b3c" }));
            setTimeout(() => {
              const svg = tempDiv.querySelector("svg");
              if (!svg) { root.unmount(); resolve(""); return; }
              const svgData = new XMLSerializer().serializeToString(svg);
              const img = new window.Image();
              const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              img.onload = () => {
                ctx.drawImage(img, 80, 90, 160, 160);
                ctx.fillStyle = "#1a2b3c";
                ctx.font = "bold 18px 'Space Grotesk', sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(s.name, 160, 295);
                ctx.fillStyle = "#6b7280";
                ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
                ctx.fillText(`Roll No: ${s.rollNo}`, 160, 318);
                ctx.fillText(classDetail!.name, 160, 338);
                ctx.fillText(school!.name, 160, 358);
                ctx.fillStyle = "#1a9988";
                ctx.font = "bold 11px monospace";
                ctx.fillText(`ID: ${s.id}`, 160, 394);
                URL.revokeObjectURL(url);
                root.unmount();
                resolve(canvas.toDataURL("image/png"));
              };
              img.src = url;
            }, 100);
          });
        });
      });
    };

    Promise.all(classStudents.map(renderCard)).then((images) => {
      document.body.removeChild(container);
      const html = `<!DOCTYPE html><html><head><title>QR Cards - ${classDetail!.name}</title>
<style>@page{size:A4;margin:10mm}body{margin:0;font-family:sans-serif}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:16px}.grid img{width:100%;max-width:280px;margin:0 auto;display:block;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.header{text-align:center;padding:16px;border-bottom:2px solid #1a9988;margin-bottom:8px}.header h1{font-size:18px;color:#1a9988;margin:0}.header p{font-size:12px;color:#666;margin:4px 0 0}@media print{.no-print{display:none}}</style></head><body>
<div class="header"><h1>${classDetail!.name} — Student QR Cards</h1><p>${school!.name} • ${classStudents.length} students</p></div>
<button class="no-print" onclick="window.print()" style="display:block;margin:12px auto;padding:10px 24px;background:#1a9988;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px">🖨️ Print All Cards</button>
<div class="grid">${images.filter(Boolean).map(src => `<img src="${src}"/>`).join("")}</div></body></html>`;
      printWindow.document.write(html);
      printWindow.document.close();
    });
  }, [classStudents, school, classDetail]);

  const downloadClassCsv = useCallback(() => {
    if (!classStudents.length || !school || !classDetail) return;
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
      // quiz percent
      const studentResults = studentQuizResults.filter(r => r.studentId === s.id);
      const totalScore = studentResults.reduce((a, r) => a + r.score, 0);
      const totalPossible = studentResults.reduce((a, r) => a + r.total, 0);
      const quizPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      // attendance
      const att = studentAttendance.find(a => a.studentId === s.id);
      const attPct = att ? att.percentage : "";
      // avg usage
      const usageLogs = studentUsageLogs.filter(u => u.studentId === s.id);
      const avgUsage = usageLogs.length ? Math.round(usageLogs.reduce((a, u) => a + u.minutes, 0) / usageLogs.length) : 0;

      const line = [
        escape(s.id),
        escape(s.name),
        escape(s.rollNo),
        escape(classDetail.name),
        escape(school.name),
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
    const fileName = `${classDetail.name.replace(/\s+/g, "_")}_students_${new Date().toISOString().slice(0,10)}.csv`;
    a.href = url;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [classStudents, school, classDetail]);

  // Student profile popup
  const studentProfile = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  const studentProfileResults = selectedStudent ? studentQuizResults.filter(r => r.studentId === selectedStudent) : [];
  const studentProfileAtt = selectedStudent ? studentAttendance.find(a => a.studentId === selectedStudent) : null;

  // Live Watch View
  if (watchingLive) {
    const session = liveSessions.find(s => s.id === watchingLive);
    if (!session) {
      setWatchingLive(null);
    } else {
      return (
        <DashboardLayout title="Live Class Monitoring">
          <Button variant="ghost" onClick={() => setWatchingLive(null)} className="mb-4 gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <div className="fixed top-3 right-20 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-sm font-bold animate-pulse">
            <Radio className="w-4 h-4" /> WATCHING LIVE
          </div>
          <Card className="shadow-card border-border mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">{session.topicName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {session.teacherName} • {session.className} • {session.subjectName}
                  </p>
                </div>
                <Badge className="bg-destructive/10 text-destructive animate-pulse gap-1">
                  <Radio className="w-3 h-3" /> LIVE
                </Badge>
              </div>
              <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <MonitorPlay className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-display font-bold">Live Classroom Stream</p>
                  <p className="text-sm text-muted-foreground mt-1">Passive monitoring mode — Audio & Video</p>
                  <p className="text-xs text-muted-foreground mt-2">Started: {new Date(session.startTime).toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardLayout>
      );
    }
  }

  // Student Profile Modal
  if (selectedStudent && studentProfile) {
    const totalScore = studentProfileResults.reduce((a, r) => a + r.score, 0);
    const totalQ = studentProfileResults.reduce((a, r) => a + r.total, 0);
    const pct = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
    const studentClass = classes.find(c => c.id === studentProfile.classId);
    const studentSchool = schools.find(s => s.id === studentProfile.schoolId);

    return (
      <DashboardLayout title="Student Profile">
        <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="mb-4 gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl">
                  {studentProfile.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{studentProfile.name}</h2>
                  <p className="text-sm text-muted-foreground">Roll No: {studentProfile.rollNo} • {studentClass?.name} • {studentSchool?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="font-display text-2xl font-bold text-foreground">{pct}%</p>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="font-display text-2xl font-bold text-foreground">{studentProfileAtt?.percentage || 0}%</p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="font-display text-2xl font-bold text-foreground">{studentProfileResults.length}</p>
                  <p className="text-xs text-muted-foreground">Quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardHeader><CardTitle className="font-display text-sm">Quiz History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {studentProfileResults.length > 0 ? studentProfileResults.map((r, i) => {
                const ch = chapters.find(c => c.id === r.chapterId);
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-sm text-foreground">{ch?.name || r.chapterId}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.score}/{r.total}</Badge>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">No quiz data.</p>}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <div
            className="relative inline-block"
            onMouseOver={() => {
              if (menuHideTimeout.current) {
                clearTimeout(menuHideTimeout.current as number);
                menuHideTimeout.current = null;
              }
              setShowTeachersMenu(true);
            }}
            onMouseOut={() => {
              // short delay to avoid flicker when moving between trigger and menu
              menuHideTimeout.current = window.setTimeout(() => setShowTeachersMenu(false), 150);
            }}
          >
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            {showTeachersMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-popover border border-border rounded-md shadow-lg z-50">
                <button
                  onClick={() => { setManageTeachersView(true); setActiveTab("teachers"); setShowTeachersMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-secondary"
                >Manage Teachers</button>
                <button
                  onClick={() => { setManageTeachersView(false); setActiveTab("teachers"); setShowTeachersMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-secondary"
                >Teacher Effectiveness</button>
              </div>
            )}
          </div>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="classstatus">Class Status</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
            <div className="relative inline-block" ref={registrationRef}>
              <Button variant="ghost" onClick={() => setShowRegistrationMenu(v => !v)} className="h-9">Registration</Button>
              {showRegistrationMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                  <button
                    onClick={() => { setShowRegistrationMenu(false); setRegistrationModalType("student"); }}
                    className="w-full text-left px-3 py-2 hover:bg-secondary"
                  >Student Registration</button>
                  <button
                    onClick={() => { setShowRegistrationMenu(false); setRegistrationModalType("teacher"); }}
                    className="w-full text-left px-3 py-2 hover:bg-secondary"
                  >Teacher Registration</button>
                </div>
              )}
            </div>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {/* Detailed Analytics */}
          <h3 className="font-display text-lg font-bold text-foreground mt-8">Detailed Analytics</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {overviewCards.map(c => (
              <Card
                key={c.label}
                className={`shadow-card border-border ${(c.label === "Schools" || c.label === "Teachers" || c.label === "Students") ? "cursor-pointer card-hover" : ""}`}
                onClick={
                  c.label === "Schools"
                    ? () => navigate("/admin/schools-analytics")
                    : c.label === "Teachers"
                      ? () => setActiveTab("teachers")
                      : c.label === "Students"
                        ? () => navigate("/admin/students-filter")
                      : undefined
                }
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground">{c.value}</p>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="shadow-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{engagementMetrics.quizCompletionRate}%</p>
                  <p className="text-xs text-muted-foreground">Quiz Completion Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-light flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{activeSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Live Sessions Now</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="font-display text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Daily Active Students</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={engagementMetrics.dailyActiveStudents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(174, 62%, 38%)" strokeWidth={2} dot={{ fill: "hsl(174, 62%, 38%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> Weak Chapter Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weakTopicHeatmap.sort((a, b) => a.avgScore - b.avgScore).map((topic, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{topic.chapter}</p>
                          <Badge variant="outline" className="text-xs">{topic.subject}</Badge>
                        </div>
                        <Progress value={topic.avgScore} className="h-2" />
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${topic.avgScore < 50 ? "text-destructive" : "text-amber"}`}>{topic.avgScore}%</p>
                        <p className="text-xs text-muted-foreground">{topic.weakStudents} weak</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* SCHOOLS - Multi-level drill-down */}
        <TabsContent value="schools" className="space-y-4">
          {!selectedSchool ? (
            /* Level 1: School Cards */
            <div>
              <div className="flex gap-3 mb-6">
                <Button className="gap-2">
                  <School className="w-4 h-4" /> Add School
                </Button>
                <Button variant="outline" className="gap-2">
                  <ClipboardList className="w-4 h-4" /> Manage Schools
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
              {schools.map(s => {
                const schoolSessions = activeSessions.filter(ls =>
                  classes.filter(c => c.schoolId === s.id).some(c => c.id === ls.classId)
                );
                return (
                  <Card key={s.id} className="shadow-card border-border card-hover cursor-pointer relative" onClick={() => setSelectedSchool(s.id)}>
                    {schoolSessions.length > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold animate-pulse">
                        <Radio className="w-3 h-3" /> {schoolSessions.length} LIVE
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-semibold text-foreground">{s.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{s.code} • {s.district}</p>
                          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            <span>{s.teachers} teacher(s)</span>
                            <span>{s.students} students</span>
                            <span>{s.sessionsCompleted} sessions</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-secondary rounded-lg p-2 text-center">
                              <p className="font-display text-sm font-bold text-foreground">85%</p>
                              <p className="text-[10px] text-muted-foreground">Engagement</p>
                            </div>
                            <div className="bg-secondary rounded-lg p-2 text-center">
                              <p className="font-display text-sm font-bold text-foreground">72%</p>
                              <p className="text-[10px] text-muted-foreground">Completion</p>
                            </div>
                            <div className="bg-secondary rounded-lg p-2 text-center">
                              <p className="font-display text-sm font-bold text-foreground">78%</p>
                              <p className="text-[10px] text-muted-foreground">Performance</p>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>
          ) : !selectedClass ? (
            /* Level 2: Classes in School */
            <div>
              <Button variant="ghost" onClick={() => setSelectedSchool(null)} className="mb-4">← Back to Schools</Button>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">{school?.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{school?.district} • {school?.teachers} teachers • {school?.students} students</p>

              <div className="grid md:grid-cols-2 gap-4">
                {classes.filter(c => c.schoolId === selectedSchool).map(c => {
                  const classLive = activeSessions.filter(ls => ls.classId === c.id);
                  return (
                    <Card key={c.id} className="shadow-card border-border card-hover cursor-pointer relative" onClick={() => setSelectedClass(c.id)}>
                      {classLive.length > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold animate-pulse">
                          <Radio className="w-3 h-3" /> LIVE
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Grade {c.grade} • {c.studentCount} students</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                        {classLive.length > 0 && (
                          <div className="mt-3 p-2 bg-destructive/5 rounded-lg">
                            <p className="text-xs text-foreground font-medium">Active: {classLive[0].topicName}</p>
                            <p className="text-[10px] text-muted-foreground">{classLive[0].teacherName} • {classLive[0].subjectName}</p>
                            <Button size="sm" variant="destructive" className="mt-2 h-6 text-xs gap-1" onClick={(e) => {
                              e.stopPropagation();
                              setWatchingLive(classLive[0].id);
                            }}>
                              <Eye className="w-3 h-3" /> Watch Live
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : !selectedSubject ? (
            /* Level 3: Class details — Students + Subjects */
            <div className="pb-8">
              <Button variant="ghost" onClick={() => setSelectedClass(null)} className="mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Classes
              </Button>
              
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="font-display text-2xl font-bold text-foreground">{classDetail?.name}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadAllQRCards}>
                    <FileDown className="w-4 h-4" /> Download All QR Cards
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadClassCsv()}>
                    <FileDown className="w-4 h-4" /> Download Students CSV
                  </Button>
                  <Button variant={showQRCards ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => setShowQRCards(!showQRCards)}>
                    <QrCode className="w-4 h-4" /> {showQRCards ? "Show Table" : "Show QR Cards"}
                  </Button>
                </div>
              </div>

              {/* Subjects for this grade */}
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Subjects</h3>

              {/* Class performance bar chart */}
              <Card className="shadow-card border-border mb-4">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Overall Class Performance</h4>
                  <div style={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={classSubjectPerformance} margin={{ left: 0, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percent" fill="hsl(174, 62%, 38%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 mb-8">
                {subjects.filter(s => s.grades.includes(classDetail?.grade || 0)).map(sub => (
                  <Card key={sub.id} className="shadow-card border-border card-hover cursor-pointer min-w-[180px] flex-shrink-0" onClick={() => setSelectedSubject(sub.id)}>
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl">{sub.icon}</span>
                      <p className="text-sm font-medium text-foreground mt-2">{sub.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Students */}
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Students</h3>
              {showQRCards ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                  {classStudents.map(s => (
                    <StudentQRCard key={s.id} student={s} schoolName={school?.name || ""} className={classDetail?.name || ""} />
                  ))}
                </div>
              ) : (
                <Card className="shadow-card border-border">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-secondary">
                          <th className="text-left p-3 font-medium text-muted-foreground">Roll</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Attendance</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                        </tr></thead>
                        <tbody>
                          {classStudents.map(s => {
                            const att = studentAttendance.find(a => a.studentId === s.id);
                            return (
                              <tr key={s.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedStudent(s.id)}>
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
                                  <Button variant="outline" size="sm" className="text-xs h-7">View Profile</Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Level 4: Subject detail — Topics, quizzes, recordings */
            <div className="pb-6">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => setSelectedSubject(null)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to {classDetail?.name}
                </Button>
              </div>
              
              <div className="mb-6 p-6 bg-gradient-to-r from-teal-light/10 to-info-light/10 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    {subjects.find(s => s.id === selectedSubject)?.icon} {subjects.find(s => s.id === selectedSubject)?.name}
                  </h2>
                </div>
                
                {/* Teacher Info */}
                <div className="bg-card border border-border rounded-lg p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Teaching by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold">
                      RK
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">Rajesh Kumar</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: T001</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2 flex-1 sm:flex-none">
                    <FileText className="w-4 h-4" /> Syllabus
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                    <Video className="w-4 h-4" /> Sessions
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                    <Trophy className="w-4 h-4" /> Quizzes
                  </Button>
                </div>
              </div>

              {/* Top Performers Section */}
              {(() => {
                const subjectChapters = chapters.filter(ch => ch.subjectId === selectedSubject && ch.grade === (classDetail?.grade || 0));
                const subjectChapterIds = subjectChapters.map(ch => ch.id);
                
                // Calculate scores for each student in this subject
                const studentScores = classStudents.map(student => {
                  const studentResults = studentQuizResults.filter(r => 
                    r.studentId === student.id && 
                    subjectChapterIds.some(chId => {
                      const ch = chapters.find(c => c.id === chId);
                      return ch && r.chapterId === ch.id;
                    })
                  );
                  
                  const totalScore = studentResults.reduce((sum, r) => sum + r.score, 0);
                  const totalPossible = studentResults.reduce((sum, r) => sum + r.total, 0);
                  const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
                  
                  return { student, percentage, totalScore, totalPossible };
                });

                // Sort by percentage and get top 5
                const topPerformers = studentScores.sort((a, b) => b.percentage - a.percentage).slice(0, 5);

                return (
                  <div className="mb-6">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-accent" /> Top Performers
                    </h3>
                    {topPerformers.filter(p => p.totalPossible > 0).length > 0 ? (
                      <div className="grid gap-3">
                        {topPerformers.filter(p => p.totalPossible > 0).map((performer, index) => (
                          <div key={performer.student.id} className="p-4 bg-card border border-border rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-display font-semibold text-foreground">{performer.student.name}</p>
                                <Badge className="bg-success-light text-success text-sm">{performer.percentage}%</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Roll No: {performer.student.rollNo}</p>
                              <Progress value={performer.percentage} className="h-2 mt-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="shadow-card border-border">
                        <CardContent className="p-6 text-center text-muted-foreground">
                          No quiz results available for this subject yet.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}

            </div>
          )}
        </TabsContent>

        {/* TEACHERS */}
        <TabsContent value="teachers" className="space-y-4">
          {manageTeachersView ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-bold text-foreground">Manage Teachers</h3>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Teacher name"
                    value={manageNameFilter}
                    onChange={(e) => setManageNameFilter(e.target.value)}
                    className="input h-9 px-3 border border-border rounded-md"
                  />
                  <input
                    placeholder="Teacher ID"
                    value={manageIdFilter}
                    onChange={(e) => setManageIdFilter(e.target.value)}
                    className="input h-9 px-3 border border-border rounded-md"
                  />
                  <Button onClick={() => { /* filters applied via local state */ }} className="h-9">Filter</Button>
                </div>
              </div>
              <Card className="shadow-card border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary">
                          <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">School</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Subjects</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers
                          .filter(t => (manageNameFilter ? t.name.toLowerCase().includes(manageNameFilter.toLowerCase()) : true))
                          .filter(t => (manageIdFilter ? t.id.includes(manageIdFilter) : true))
                          .map(t => (
                            <tr key={t.id} className="border-b border-border last:border-0">
                              <td className="p-3 text-foreground font-medium">{t.id}</td>
                              <td className="p-3 text-foreground">{t.name}</td>
                              <td className="p-3 text-muted-foreground">{schools.find(s => s.id === t.schoolId)?.name}</td>
                              <td className="p-3 text-muted-foreground">{t.subjects.join(", ")}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" /> Teacher Effectiveness
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto lg:min-w-[620px]">
                  <Select value={teacherSchoolFilter} onValueChange={setTeacherSchoolFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="School" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {schools.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={teacherSubjectFilter} onValueChange={setTeacherSubjectFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {teacherSubjectOptions.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={teacherNameFilter} onValueChange={setTeacherNameFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Teacher (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teachers</SelectItem>
                      {schoolFilteredTeachers
                        .filter(t => teacherSubjectFilter === "all" || t.subjects.includes(teacherSubjectFilter))
                        .map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                {filteredTeacherEffectiveness.length > 0 ? (
                  filteredTeacherEffectiveness.map(({ teacher, ...te }) => {
                    const schoolName = schools.find(s => s.id === teacher.schoolId)?.name;
                    const performanceSeries = [
                      { metric: "Quiz", value: te.quizAvgScore },
                      { metric: "Engage", value: te.studentEngagement },
                      { metric: "Complete", value: te.lessonCompletionRate },
                    ];

                    return (
                      <Card key={te.teacherId} className="shadow-card border-border">
                        <CardContent className="p-5">
                          <div className="grid lg:grid-cols-[1fr_180px] gap-4 items-center">
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                                  {te.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-display font-semibold text-foreground">{te.name}</h4>
                                  <p className="text-xs text-muted-foreground">{schoolName} • {teacher.subjects.join(", ")}</p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(te.rating) ? "text-accent fill-accent" : "text-border"}`} />
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-1">{te.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-secondary rounded-lg p-3 text-center">
                                  <p className="font-display text-xl font-bold text-foreground">{te.classesCompleted}/{te.totalScheduled}</p>
                                  <p className="text-xs text-muted-foreground">Classes</p>
                                </div>
                                <div className="bg-secondary rounded-lg p-3 text-center">
                                  <p className="font-display text-xl font-bold text-foreground">{te.quizAvgScore}%</p>
                                  <p className="text-xs text-muted-foreground">Quiz Avg</p>
                                </div>
                                <div className="bg-secondary rounded-lg p-3 text-center">
                                  <p className="font-display text-xl font-bold text-foreground">{te.studentEngagement}%</p>
                                  <p className="text-xs text-muted-foreground">Engagement</p>
                                </div>
                                <div className="bg-secondary rounded-lg p-3 text-center">
                                  <p className="font-display text-xl font-bold text-foreground">{te.lessonCompletionRate}%</p>
                                  <p className="text-xs text-muted-foreground">Completion</p>
                                </div>
                              </div>
                            </div>
                            <div className="h-40 bg-secondary/40 rounded-xl p-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceSeries}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
                                  <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                                  <Bar dataKey="value" fill="hsl(174, 62%, 38%)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="shadow-card border-border lg:col-span-2">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No teachers match the selected filters.
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* LEAVE MANAGEMENT */}
        <TabsContent value="leave" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">Leave Applications</CardTitle>
              <div className="ml-auto flex items-center gap-2">
                <Select value={leaveSchoolFilter} onValueChange={setLeaveSchoolFilter}>
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={leaveTeacherFilter} onValueChange={setLeaveTeacherFilter}>
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue placeholder="Teacher (Name)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <input
                  placeholder="Teacher ID"
                  value={leaveTeacherIdFilter}
                  onChange={(e) => setLeaveTeacherIdFilter(e.target.value)}
                  className="input h-9 px-3 border border-border rounded-md w-36"
                />

                <Button onClick={() => { /* filters are reactive via state */ }} className="h-9">Filter</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary">
                    <th className="text-left p-3 font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Leave Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Applied On</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr></thead>
                  <tbody>
                    {(
                      // apply filters to leaveApplications
                      leaveApplications
                        .filter(lv => {
                          const teacher = teachers.find(t => t.id === lv.teacherId);
                          if (!teacher) return false;
                          if (leaveSchoolFilter !== "all" && teacher.schoolId !== leaveSchoolFilter) return false;
                          if (leaveTeacherFilter !== "all" && lv.teacherId !== leaveTeacherFilter) return false;
                          if (leaveTeacherIdFilter && !lv.teacherId.includes(leaveTeacherIdFilter)) return false;
                          return true;
                        })
                        .map(lv => {
                      const teacher = teachers.find(t => t.id === lv.teacherId);
                      return (
                        <tr key={lv.id} className="border-b border-border last:border-0">
                          <td className="p-3 text-foreground font-medium">{teacher?.name}</td>
                          <td className="p-3 text-foreground">{lv.date}</td>
                          <td className="p-3 text-muted-foreground">{lv.reason}</td>
                          <td className="p-3 text-muted-foreground">{lv.appliedOn}</td>
                          <td className="p-3">
                            <Badge className={`text-xs ${
                              lv.status === "approved" ? "bg-success-light text-success" :
                              lv.status === "pending" ? "bg-amber-light text-amber" :
                              "bg-destructive/10 text-destructive"
                            }`}>{lv.status}</Badge>
                          </td>
                          <td className="p-3">
                            {lv.status === "pending" && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="text-xs h-7">Approve</Button>
                                <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive">Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MATERIALS */}
        <TabsContent value="materials" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Study Materials Management
              </CardTitle>
              <div className="ml-auto">
                <Button onClick={() => setShowAddMaterials(true)}>+ Add Materials</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Past Materials</h4>
                </div>

                <div className="space-y-2">
                  {localMaterials.map(m => {
                    const ch = localChapters.find(c => c.id === m.chapterId) || chapters.find(c => c.id === m.chapterId);
                    const topicName = (m as any).topicId ? (localTopics.find(t => t.id === (m as any).topicId)?.name || "") : "";
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{ch?.name || '—'} {topicName ? `• ${topicName}` : ''}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            const newTitle = window.prompt('Edit material title', m.title);
                            if (newTitle) {
                              const idx = localMaterials.findIndex(x => x.id === m.id);
                              if (idx >= 0) {
                                const copy = [...localMaterials];
                                copy[idx] = { ...copy[idx], title: newTitle };
                                setLocalMaterials(copy);
                                const dmIdx = studyMaterials.findIndex(x => x.id === m.id);
                                if (dmIdx >= 0) studyMaterials[dmIdx].title = newTitle;
                              }
                            }
                          }}>Edit</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr />

                <div className="space-y-3">
                  {subjects.map(sub => {
                    const subChapters = localChapters.filter(ch => ch.subjectId === sub.id);
                    return (
                      <div key={sub.id} className="border border-border rounded-xl p-4">
                        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                          <span className="text-xl">{sub.icon}</span> {sub.name}
                          <Badge variant="outline" className="ml-auto">{subChapters.length} chapters</Badge>
                        </h3>
                        <div className="space-y-2">
                          {subChapters.map(ch => {
                            const mats = localMaterials.filter(m => m.chapterId === ch.id);
                            return (
                              <div key={ch.id} className="p-3 bg-secondary rounded-lg">
                                <div className="flex items-center justify-between">
                                          <div className="cursor-pointer" onClick={() => openAddTopic(ch.id)}>
                                            <p className="text-sm font-medium text-foreground">{ch.name}</p>
                                            <p className="text-xs text-muted-foreground">Grade {ch.grade} • {mats.length} materials</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setExpandedChapter(expandedChapter === ch.id ? null : ch.id); }}>{expandedChapter === ch.id ? 'Hide' : 'View'}</Button>
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openAddTopic(ch.id); }}>Add Topics</Button>
                                          </div>
                                </div>

                                {expandedChapter === ch.id && (
                                  <div className="mt-3 space-y-2">
                                    <div className="space-y-2">
                                      {(localTopics.filter(t => t.chapterId === ch.id)).map(tp => (
                                        <div key={tp.id} className="flex items-center justify-between p-2 bg-white/5 rounded-md">
                                          <div>
                                            <p className="text-sm font-medium">{tp.name}</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" onClick={() => { setUploadTopicId(tp.id); }}>Add Material</Button>
                                          </div>
                                        </div>
                                      ))}
                                      {localTopics.filter(t => t.chapterId === ch.id).length === 0 && (
                                        <p className="text-xs text-muted-foreground">No topics yet. Use Topics to add.</p>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Materials for chapter</p>
                                      {mats.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                                          <div className="text-sm">{m.title}</div>
                                          <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-primary">Open</a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Materials multi-step dialog */}
          {showAddMaterials && (
            <Dialog open={showAddMaterials} onOpenChange={setShowAddMaterials}>
              <DialogContent>
                  <DialogHeader className="items-start">
                    <DialogTitle>Add Materials — Step {addStep}</DialogTitle>
                    <div className="ml-auto">
                      <Button variant="ghost" size="sm" onClick={() => { resetAddFlow(); }} className="h-8 w-8 p-0">✕</Button>
                    </div>
                  </DialogHeader>
                  <div className="p-4">
                    {addStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="text-sm mb-1">Class</label>
                          <Select onValueChange={(v) => setMaterialClass(v)} value={materialClass || undefined}>
                            <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select class" /></SelectTrigger>
                            <SelectContent>
                              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} (Grade {c.grade})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm mb-1">Subject</label>
                          <Select onValueChange={(v) => setMaterialSubject(v)} value={materialSubject || undefined}>
                            <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>
                              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="sm:col-span-2 flex flex-col">
                          <label className="text-sm mb-1">How many chapters?</label>
                          <input type="number" min={1} step={1} placeholder="" value={chapterCount} onChange={(e) => setChapterCount(e.target.value)} className="input h-10 w-40 border border-border focus:border-primary" />
                          <p className="text-xs text-muted-foreground mt-1">Enter the number of chapters to create — you'll name them next.</p>
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                          <Button onClick={() => {
                            const n = parseInt(chapterCount || "0", 10);
                            if (!materialClass || !materialSubject || isNaN(n) || n < 1) return;
                            setAddStep(2);
                          }} disabled={!materialClass || !materialSubject || !(parseInt(chapterCount || "0", 10) > 0)}>Next</Button>
                          <Button variant="ghost" onClick={() => { setShowAddMaterials(false); resetAddFlow(); }}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {addStep === 2 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Enter chapter names</p>
                        <div className="space-y-2">
                          {Array.from({ length: Math.max(0, parseInt(chapterCount || "0", 10)) }).map((_, i) => (
                            <div key={i} className="flex flex-col">
                              <label className="text-xs mb-1">Chapter {i + 1}</label>
                              <input placeholder={`Chapter ${i + 1}`} value={tempChapterNames[i] || ''} onChange={(e) => {
                                const arr = [...tempChapterNames]; arr[i] = e.target.value; setTempChapterNames(arr);
                              }} className="input h-10 w-full border border-border" />
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleCreateChapters()}>Submit</Button>
                          <Button variant="ghost" onClick={() => { setAddStep(1); }}>Back</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
            </Dialog>
          )}

          {/* Add Topic dialog */}
          {/* Topic creation multi-step dialog */}
          {topicAddOpen && (
            <Dialog open={topicAddOpen} onOpenChange={setTopicAddOpen}>
              <DialogContent>
                <DialogHeader className="items-start">
                  <DialogTitle>Add Topics</DialogTitle>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={() => { setTopicAddOpen(false); setTopicTargetChapter(null); }} className="h-8 w-8 p-0">✕</Button>
                  </div>
                </DialogHeader>
                <div className="p-4">
                  {topicAddStep === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm">How many topics?</p>
                      <input type="number" min={1} step={1} placeholder="" value={topicCount} onChange={(e) => setTopicCount(e.target.value)} className="input h-10 w-40 border border-border focus:border-primary" />
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => { const n = parseInt(topicCount || "0", 10); if (n > 0) setTopicAddStep(2); }} disabled={!(parseInt(topicCount || "0", 10) > 0)}>Next</Button>
                        <Button variant="ghost" onClick={() => { setTopicAddOpen(false); setTopicTargetChapter(null); }}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {topicAddStep === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm">Enter topic names</p>
                      <div className="space-y-2">
                        {Array.from({ length: Math.max(0, parseInt(topicCount || "0", 10)) }).map((_, i) => (
                          <div key={i} className="flex flex-col">
                            <label className="text-xs mb-1">Topic {i + 1}</label>
                            <input placeholder={`Topic ${i + 1}`} value={tempTopicNames[i] || ''} onChange={(e) => { const arr = [...tempTopicNames]; arr[i] = e.target.value; setTempTopicNames(arr); }} className="input h-10 w-full border border-border" />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleCreateTopics()}>Submit</Button>
                        <Button variant="ghost" onClick={() => setTopicAddStep(1)}>Back</Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Upload material dialog */}
          {uploadTopicId && (
            <Dialog open={!!uploadTopicId} onOpenChange={() => setUploadTopicId(null)}>
              <DialogContent>
                <DialogHeader className="items-start">
                  <DialogTitle>Upload PDF</DialogTitle>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm" onClick={() => setUploadTopicId(null)} className="h-8 w-8 p-0">✕</Button>
                  </div>
                </DialogHeader>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input id="fileUpload" type="file" accept="application/pdf" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                    {uploadFile && (
                      <div className="text-sm text-muted-foreground">{uploadFile.name}</div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={() => { handleAddMaterialToTopic(uploadTopicId, uploadFile, undefined); }} disabled={!uploadFile}>Submit</Button>
                    <Button variant="ghost" onClick={() => setUploadTopicId(null)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

        </TabsContent>

        {/* CLASS STATUS */}
        <TabsContent value="classstatus" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" /> Class Status Management
              </CardTitle>
              <div className="ml-auto flex items-center gap-2">
                <Select value={classStatusSchoolFilter} onValueChange={(v) => { setClassStatusSchoolFilter(v); setClassStatusClassFilter("all"); }}>
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={classStatusClassFilter} onValueChange={setClassStatusClassFilter}>
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes
                      .filter(c => classStatusSchoolFilter === "all" ? true : c.schoolId === classStatusSchoolFilter)
                      .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary">
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Class</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                  </tr></thead>
                  <tbody>
                    {classStatus
                      .filter(cs => {
                        if (classStatusSchoolFilter !== "all") {
                          const cls = classes.find(c => c.id === cs.classId);
                          if (!cls || cls.schoolId !== classStatusSchoolFilter) return false;
                        }
                        if (classStatusClassFilter !== "all" && cs.classId !== classStatusClassFilter) return false;
                        return true;
                      })
                      .map(cs => {
                        const cls = classes.find(c => c.id === cs.classId);
                        const teacher = teachers.find(t => t.id === cs.teacherId);
                        return (
                          <tr key={cs.id} className="border-b border-border last:border-0">
                            <td className="p-3 text-muted-foreground">{cs.date}</td>
                            <td className="p-3 text-foreground font-medium">{cls?.name}</td>
                            <td className="p-3 text-foreground">{teacher?.name}</td>
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
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Activity Audit Log</CardTitle>
              <div className="ml-auto flex items-center gap-2">
                <Select value={logSchoolFilter} onValueChange={setLogSchoolFilter}>
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={logTeacherFilter} onValueChange={setLogTeacherFilter}>
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue placeholder="Teacher (Name)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <input
                  placeholder="Teacher ID"
                  value={logTeacherIdFilter}
                  onChange={(e) => setLogTeacherIdFilter(e.target.value)}
                  className="input h-9 px-3 border border-border rounded-md w-36"
                />

                <Button onClick={() => { /* reactive filters */ }} className="h-9">Filter</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary">
                    <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">School/Class</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">GPS</th>
                  </tr></thead>
                  <tbody>
                    {activityLogs
                      .filter(log => {
                        // school filter: compare by school id -> name
                        if (logSchoolFilter !== "all") {
                          const expectedName = schools.find(s => s.id === logSchoolFilter)?.name;
                          if (expectedName && log.school !== expectedName) return false;
                        }
                        // teacher select filter (by id)
                        if (logTeacherFilter !== "all") {
                          const t = teachers.find(t => t.id === logTeacherFilter);
                          if (!t || log.user !== t.name) return false;
                        }
                        // teacher id typed filter: map log.user -> teacher id and match substring
                        if (logTeacherIdFilter) {
                          const t = teachers.find(t => t.name === log.user);
                          if (!t || !t.id.includes(logTeacherIdFilter)) return false;
                        }
                        return true;
                      })
                      .map(log => (
                        <tr key={log.id} className="border-b border-border last:border-0">
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.timestamp}</div>
                          </td>
                          <td className="p-3 text-foreground font-medium">{log.user}</td>
                          <td className="p-3"><Badge variant="outline" className="text-xs">{log.role}</Badge></td>
                          <td className="p-3 text-foreground">{log.action}</td>
                          <td className="p-3 text-muted-foreground">{log.school} / {log.class}</td>
                          <td className="p-3 text-muted-foreground text-xs">{log.gps}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!registrationModalType} onOpenChange={(open) => { if (!open) setRegistrationModalType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{registrationModalType === "student" ? "Student Registration" : "Teacher Registration"}</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            {registrationModalType === "student" ? (
              <StudentForm onClose={() => setRegistrationModalType(null)} />
            ) : registrationModalType === "teacher" ? (
              <TeacherForm onClose={() => setRegistrationModalType(null)} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDashboard;
