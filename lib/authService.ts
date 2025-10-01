// lib/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthResult, UserData } from '../types/auth';

export class AuthService {
  // Register dengan email dan password
  static async register(
    email: string, 
    password: string, 
    fullName: string
  ): Promise<AuthResult> {
    try {
      // 1. Create user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile dengan display name
      await updateProfile(user, {
        displayName: fullName
      });

      // 3. Simpan data tambahan ke Firestore untuk ECO-MANAGE
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        fullName: fullName,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        points: 100, // Bonus points untuk pendaftaran baru
        totalRecycled: 0 // Fixed: property sudah didefinisikan di type
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return { 
        success: true, 
        user: this.formatUser(user) 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error) 
      };
    }
  }

  // Login dengan email dan password
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login di Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date()
      });

      return { 
        success: true, 
        user: this.formatUser(user) 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error) 
      };
    }
  }

  // Logout
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  // Reset password
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error) 
      };
    }
  }

  // Helper: Format Firebase User ke User kita
  private static formatUser(user: FirebaseUser) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  }

  // Helper: Error message handling
  private static getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email sudah digunakan di ECO-MANAGE';
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/weak-password':
        return 'Password terlalu lemah (minimal 6 karakter)';
      case 'auth/user-not-found':
        return 'Akun tidak ditemukan di ECO-MANAGE';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan gagal, coba lagi nanti';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah';
      default:
        return error.message || 'Terjadi kesalahan sistem';
    }
  }
}