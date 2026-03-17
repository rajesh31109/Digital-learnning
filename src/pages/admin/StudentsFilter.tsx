import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classes, schools } from "@/data/demo-data";
import { ArrowLeft } from "lucide-react";

const StudentsFilter = () => {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");

  const selectedSchool = useMemo(() => schools.find((item) => item.id === schoolId), [schoolId]);
  const schoolClasses = useMemo(() => classes.filter((item) => item.schoolId === schoolId), [schoolId]);

  useEffect(() => {
    setClassId("");
  }, [schoolId]);

  useEffect(() => {
    if (selectedSchool) {
      setVillage(selectedSchool.district);
    }
  }, [selectedSchool]);

  const canSubmit = schoolId && classId && mandal.trim() && village.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const query = new URLSearchParams({
      schoolId,
      classId,
      mandal: mandal.trim(),
      village: village.trim(),
    }).toString();

    navigate(`/admin/students-analytics?${query}`);
  };

  return (
    <DashboardLayout title="Student Analytics Filter">
      <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </Button>

      <Card className="shadow-card border-border max-w-3xl">
        <CardContent className="p-6 space-y-5">
          <h3 className="font-display text-lg font-bold text-foreground">Enter School and Class Details</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">School Name</p>
              <Select value={schoolId} onValueChange={setSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Class</p>
              <Select value={classId} onValueChange={setClassId} disabled={!schoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {schoolClasses.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Mandal</p>
              <Input value={mandal} onChange={(event) => setMandal(event.target.value)} placeholder="Enter mandal" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Village</p>
              <Input value={village} onChange={(event) => setVillage(event.target.value)} placeholder="Enter village" />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Open Student Analytics
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentsFilter;
