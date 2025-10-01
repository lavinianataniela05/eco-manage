'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, LeafyGreen, User } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { auth } from '@/firebase/config';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!email || !password || !fullName) {
      setError('Semua field harus diisi.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile dengan nama lengkap
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Redirect to dashboard
      router.push('/dashboard');
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
      default: return firebaseError.message || 'Registrasi gagal. Silakan coba lagi.';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100/50">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-teal-400/20"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-emerald-400/20"></div>
            
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
            <h2 className="text-3xl font-bold text-white mt-6 relative z-10">
              ECO-MANAGE
            </h2>
            <p className="text-emerald-100 mt-2 relative z-10">
              Bergabung dalam perjalanan keberlanjutan
            </p>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-start"
              >
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p>{error}</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-1">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-gray-700 placeholder-gray-400"
                  required
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>

            <motion.button
              type="submit"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
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
                  'Daftar'
                )}
              </span>
            </motion.button>
          </form>

          <div className="px-8 pb-8 text-center bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center"
              >
                Login di sini
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}