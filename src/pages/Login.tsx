import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { students } from "@/data/demo-data";

const Login = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as "teacher" | "admin" | "student" | null;
  const role: "teacher" | "admin" | "student" = roleParam === "student" ? "student" : roleParam === "teacher" ? "teacher" : "admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const navigate = useNavigate();
  const { login } = useAuth();

  // set initial credentials once on mount
  useEffect(() => {
    let def = "";
    if (role === "admin") def = "admin@demo.com";
    else if (role === "student") def = "st1";
    else if (role === "teacher") def = "rajesh@demo.com";
    setEmail(def);
    setPassword("demo123");
  }, [role]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "student") {
      const student = students.find(s => s.id === email);
      login("student", student?.name || "Student", email);
      navigate("/student");
    } else if (role === "admin") {
      login("admin", "Administrator");
      navigate("/admin");
    } else if (role === "teacher") {
      login("teacher", "Rajesh Kumar");
      navigate("/teacher/setup");
    }
  };

  const roleLabels = { teacher: "Teacher", admin: "Admin", student: "Student" };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-light via-background to-amber-light p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="bg-card rounded-2xl shadow-hover border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {roleLabels[role]} Login
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {role === "student" ? "Enter your Student ID to continue" : "Enter demo credentials to continue"}
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <Label htmlFor="email">{role === "student" ? "Student ID" : "Email"}</Label>
              <Input
                id="email"
                type={role === "student" ? "text" : "email"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1"
                placeholder={role === "student" ? "e.g. st1" : ""}
              />
              {role === "student" && (
                <p className="text-xs text-muted-foreground mt-1">Demo IDs: st1 to st10 (Class 8-A), st11 to st20 (Class 9-B)</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In as {roleLabels[role]}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Demo credentials are pre-filled. Just click Sign In.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
