'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, LeafyGreen, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) score++;
    if (pass.match(/\d/)) score++;
    if (pass.match(/[^a-zA-Z\d]/)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all ${
              index <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength === 0 ? 'text-red-600' :
        strength === 1 ? 'text-orange-600' :
        strength === 2 ? 'text-yellow-600' :
        strength === 3 ? 'text-blue-600' : 'text-green-600'
      }`}>
        Kekuatan password: {strengthLabels[strength]}
      </p>
    </div>
  );
};

// Password requirements checklist
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { text: 'Minimal 8 karakter', met: password.length >= 8 },
    { text: 'Mengandung huruf kecil dan besar', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { text: 'Mengandung angka', met: /\d/.test(password) },
    { text: 'Mengandung simbol', met: /[^a-zA-Z\d]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center space-x-2">
          {req.met ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-gray-300" />
          )}
          <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Check for any redirect messages
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'login_required') {
      setError('Silakan buat akun untuk melanjutkan.');
    }
  }, [searchParams]);

  // Clear messages when form data changes
  useEffect(() => {
    if (error) setError('');
    if (success) setSuccess('');
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Semua field harus diisi.';
    }

    if (formData.fullName.length < 2) {
      return 'Nama lengkap minimal 2 karakter.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Format email tidak valid.';
    }

    if (formData.password.length < 6) {
      return 'Password minimal 6 karakter.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Password dan konfirmasi password tidak cocok.';
    }

    return null;
  };

  const createUserDocument = async (user: any) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: formData.fullName,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'id',
        },
        stats: {
          projects: 0,
          tasks: 0,
          completed: 0,
        }
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update profile dengan nama lengkap
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });

      // Create user document in Firestore
      await createUserDocument(userCredential.user);

      // Send email verification
      await sendEmailVerification(userCredential.user);

      setSuccess('Akun berhasil dibuat! Silakan verifikasi email Anda sebelum login.');
      
      // Redirect to login after delay
      setTimeout(() => {
        router.push('/login?message=registered');
      }, 3000);

    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  function getFirebaseErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return 'Terjadi kesalahan yang tidak diketahui';
    }
    
    const firebaseError = error as { code?: string; message?: string };
    
    switch (firebaseError.code) {
      case 'auth/invalid-email': return 'Alamat email tidak valid.';
      case 'auth/email-already-in-use': return 'Email sudah digunakan. Silakan gunakan email lain.';
      case 'auth/weak-password': return 'Password terlalu lemah. Gunakan password yang lebih kuat.';
      case 'auth/operation-not-allowed': return 'Operasi tidak diizinkan.';
      case 'auth/network-request-failed': return 'Kesalahan jaringan. Periksa koneksi internet Anda.';
      case 'auth/too-many-requests': return 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
      default: return firebaseError.message || 'Registrasi gagal. Silakan coba lagi.';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100/50 backdrop-blur-sm bg-white/95">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-8 text-center relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-teal-400/20"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-emerald-400/20"></div>
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-cyan-400/20"></div>
            
            <motion.div
              animate={{ 
                rotate: [-5, 5, -5],
                y: [0, -5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
              className="inline-block relative z-10"
            >
              <LeafyGreen className="w-14 h-14 text-white mx-auto" strokeWidth={1.5} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mt-6 relative z-10"
            >
              EcoManage
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-emerald-100 mt-2 relative z-10"
            >
              Bergabung dalam perjalanan keberlanjutan
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="p-8 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-start"
                >
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="font-medium">Registrasi Gagal</p>
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100 flex items-start"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="font-medium">Registrasi Berhasil!</p>
                    <p>{success}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400 bg-white"
                  required
                  minLength={2}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400 bg-white"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400 bg-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <PasswordStrength password={formData.password} />
                  {(passwordFocused || formData.password) && (
                    <PasswordRequirements password={formData.password} />
                  )}
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder-gray-400 bg-white ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 focus:border-emerald-500'
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-600 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Password cocok
                </motion.p>
              )}
            </div>

            {/* Register Button */}
            <motion.button
              type="submit"
              whileHover={{ 
                scale: isSubmitting ? 1 : 1.02,
                boxShadow: isSubmitting ? "none" : "0 4px 12px rgba(16, 185, 129, 0.2)"
              }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              } shadow-md relative overflow-hidden`}
            >
              {isSubmitting && (
                <motion.span
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 h-full w-1/2 bg-emerald-500/30 skew-x-[-20deg]"
                />
              )}
              <span className="relative flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      <Leaf className="w-4 h-4" />
                    </motion.span>
                    Mendaftarkan...
                  </>
                ) : (
                  'Buat Akun'
                )}
              </span>
            </motion.button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Sudah punya akun?{' '}
              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
              >
                Login di sini
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </p>
            
            {/* Security Notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600">
                <strong>Keamanan:</strong> Kami peduli dengan keamanan data Anda. Semua informasi dienkripsi dan disimpan dengan aman.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500">
            Butuh bantuan?{' '}
            <button className="text-emerald-600 hover:text-emerald-800 font-medium">
              Hubungi support
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}