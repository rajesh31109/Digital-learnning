import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { classes, subjects } from "@/data/demo-data";

const TeacherSetup = () => {
  const navigate = useNavigate();
  const { userName } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>("c1");
  const [selectedSubject, setSelectedSubject] = useState<string>("sub1");

  const currentClass = classes.find(c => c.id === selectedClass);
  const grade = currentClass?.grade || 8;

  const handleContinue = () => {
    navigate(`/teacher?class=${selectedClass}&subject=${selectedSubject}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-hover border border-border">
        <h2 className="font-display text-xl font-bold mb-4">Welcome {userName || "Teacher"}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Please select your class and subject to continue.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {classes.filter(c => c.schoolId === "s1").map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.filter(s => s.grades.includes(grade)).map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSetup;
