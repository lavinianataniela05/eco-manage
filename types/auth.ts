// types/auth.ts
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  points: number;
  totalRecycled: number; // Fixed: tambahkan property ini
}