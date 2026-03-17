import React, { createContext, useContext, useState, ReactNode } from "react";

type Role = "teacher" | "admin" | "student" | null;

interface AuthContextType {
  role: Role;
  userName: string;
  studentId: string | null;
  login: (role: Role, name?: string, studentId?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userName: "",
  studentId: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);

  const login = (r: Role, name = "", sId?: string) => {
    setRole(r);
    setUserName(name || (r === "admin" ? "Administrator" : r === "student" ? "Student" : "Rajesh Kumar"));
    setStudentId(sId || null);
  };

  const logout = () => {
    setRole(null);
    setUserName("");
    setStudentId(null);
  };

  return (
    <AuthContext.Provider value={{ role, userName, studentId, login, logout, isAuthenticated: !!role }}>
      {children}
    </AuthContext.Provider>
  );
};
