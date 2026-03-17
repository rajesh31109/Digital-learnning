import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "./RegistrationForms";

const StudentRegistration: React.FC = () => {
  return (
    <DashboardLayout title="Student Registration">
      <Card>
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
        </CardHeader>
        <div className="p-4"> 
          <StudentForm />
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default StudentRegistration;
