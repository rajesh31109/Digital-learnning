import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type FormProps = { onClose?: () => void };

export const StudentForm: React.FC<FormProps> = ({ onClose }) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [village, setVillage] = React.useState("");
  const [mandal, setMandal] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [schoolName, setSchoolName] = React.useState("");
  const [schoolVillage, setSchoolVillage] = React.useState("");
  const [schoolMandal, setSchoolMandal] = React.useState("");
  const [schoolDistrict, setSchoolDistrict] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      firstName,
      lastName,
      dob,
      gender,
      village,
      mandal,
      district,
      address,
      classId,
      schoolName,
      schoolAddress: { village: schoolVillage, mandal: schoolMandal, district: schoolDistrict },
    };
    console.log("Register student", payload);
    alert("Student registered (demo)");
    onClose?.();
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
          <Input type="date" placeholder="Date of birth" value={dob} onChange={e => setDob(e.target.value)} />
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Village" value={village} onChange={e => setVillage(e.target.value)} />
          <Input placeholder="Mandal" value={mandal} onChange={e => setMandal(e.target.value)} />
          <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} />
          <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />

          <Input placeholder="Class" value={classId} onChange={e => setClassId(e.target.value)} />
          <Input placeholder="School name" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          <Input placeholder="School village" value={schoolVillage} onChange={e => setSchoolVillage(e.target.value)} />
          <Input placeholder="School mandal" value={schoolMandal} onChange={e => setSchoolMandal(e.target.value)} />
          <Input placeholder="School district" value={schoolDistrict} onChange={e => setSchoolDistrict(e.target.value)} />

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Register Student</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const TeacherForm: React.FC<FormProps> = ({ onClose }) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [village, setVillage] = React.useState("");
  const [mandal, setMandal] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [schoolName, setSchoolName] = React.useState("");
  const [schoolVillage, setSchoolVillage] = React.useState("");
  const [schoolMandal, setSchoolMandal] = React.useState("");
  const [schoolDistrict, setSchoolDistrict] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      firstName,
      lastName,
      dob,
      gender,
      village,
      mandal,
      district,
      address,
      classId,
      schoolName,
      schoolAddress: { village: schoolVillage, mandal: schoolMandal, district: schoolDistrict },
    };
    console.log("Register teacher", payload);
    alert("Teacher registered (demo)");
    onClose?.();
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
          <Input type="date" placeholder="Date of birth" value={dob} onChange={e => setDob(e.target.value)} />
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Village" value={village} onChange={e => setVillage(e.target.value)} />
          <Input placeholder="Mandal" value={mandal} onChange={e => setMandal(e.target.value)} />
          <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} />
          <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />

          <Input placeholder="Class" value={classId} onChange={e => setClassId(e.target.value)} />
          <Input placeholder="School name" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          <Input placeholder="School village" value={schoolVillage} onChange={e => setSchoolVillage(e.target.value)} />
          <Input placeholder="School mandal" value={schoolMandal} onChange={e => setSchoolMandal(e.target.value)} />
          <Input placeholder="School district" value={schoolDistrict} onChange={e => setSchoolDistrict(e.target.value)} />

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Register Teacher</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default {} as any;
