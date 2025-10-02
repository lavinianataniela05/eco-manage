'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, LeafyGreen, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { auth } from '@/firebase/config';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for registration success message
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'registered') {
      setSuccess('Akun berhasil dibuat! Silakan login dengan email dan password Anda.');
    }

    // Check for stored credentials
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [searchParams]);

  // Clear messages when form data changes
  useEffect(() => {
    if (error) setError('');
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return 'Email dan password harus diisi.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Format email tidak valid.';
    }

    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
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

    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Show success message before redirect
      setSuccess('Login berhasil! Mengarahkan ke dashboard...');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Silakan masukkan email Anda untuk reset password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccess(`Email reset password telah dikirim ke ${formData.email}. Silakan periksa inbox Anda.`);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  function getFirebaseErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return 'Terjadi kesalahan yang tidak diketahui';
    }
    
    const firebaseError = error as { code?: string; message?: string };
    
    switch (firebaseError.code) {
      case 'auth/invalid-email': return 'Alamat email tidak valid.';
      case 'auth/user-disabled': return 'Akun ini telah dinonaktifkan.';
      case 'auth/user-not-found': return 'Tidak ada akun dengan email ini.';
      case 'auth/wrong-password': return 'Password salah. Silakan coba lagi.';
      case 'auth/network-request-failed': return 'Kesalahan jaringan. Periksa koneksi internet Anda.';
      case 'auth/too-many-requests': return 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
      case 'auth/invalid-credential': return 'Email atau password salah.';
      case 'auth/user-mismatch': return 'Kredensial tidak cocok dengan pengguna.';
      case 'auth/requires-recent-login': return 'Sesi login telah kedaluwarsa. Silakan login ulang.';
      default: return firebaseError.message || 'Login gagal. Silakan coba lagi.';
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
              Selamat datang kembali
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
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
                    <p className="font-medium">Login Gagal</p>
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
                    <p className="font-medium">Berhasil!</p>
                    <p>{success}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleForgotPassword}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
              >
                Lupa password?
              </motion.button>
            </div>

            {/* Login Button */}
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
                    Login...
                  </>
                ) : (
                  'Login'
                )}
              </span>
            </motion.button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Belum punya akun?{' '}
              <motion.button
                onClick={() => router.push('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
              >
                Daftar di sini
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