'use client';

import { useState } from 'react';
import { useCurrentUser, useUpdatePassword, useUpdateProfile, useUpdateBackupPin } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChevronLeft, Lock, ShieldCheck, Loader2, AlertCircle, CheckCircle2, User, Mail, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppToast } from '@/hooks/useAppToast';
import ThemeToggle from '@/components/ThemeToggle';

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const ts = useTranslations('SubmitPage');
  const { success, error: toastError } = useAppToast();
  const { data: user, isLoading: authLoading } = useCurrentUser();
  const updatePasswordMutation = useUpdatePassword();
  const updateProfileMutation = useUpdateProfile();
  const updateBackupPinMutation = useUpdateBackupPin();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [backupPin, setBackupPin] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updatingPin, setUpdatingPin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfileMutation.mutateAsync({ name, email });
      success('profileUpdated');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error updating profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('passwordsDoNotMatch');
      return;
    }
    if (newPassword.length < 4) {
      toastError('passwordTooShort');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updatePasswordMutation.mutateAsync(newPassword);
      success('passwordUpdated');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'errorUpdatingPassword');
    } finally {
      setUpdatingPassword(false);
    }
  };
 
  const handleUpdateBackupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (backupPin.length !== 6 || !/^\d+$/.test(backupPin)) {
      toastError('pinTooShort');
      return;
    }
 
    setUpdatingPin(true);
    try {
      await updateBackupPinMutation.mutateAsync(backupPin);
      success('pinUpdated');
      setBackupPin('');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'errorUpdatingPin');
    } finally {
      setUpdatingPin(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-500">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <h1 className="font-bold text-lg">{t('security')}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Info Summary */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
              {(name || user.name)?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{name || user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <ShieldCheck className={user.hasPassword ? "text-green-500" : "text-yellow-500"} size={20} />
                <span className="text-sm font-medium">{t('passwordProtect')}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.hasPassword ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {user.hasPassword ? t('passwordEnabled') : t('passwordDisabled')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className={user.hasBackupPin ? "text-green-500" : "text-red-500"} size={20} />
                <span className="text-sm font-medium">{t('backupPin')}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.hasBackupPin ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {user.hasBackupPin ? t('pinSet') : t('pinNotSet')}
              </span>
            </div>
          </div>
        </section>

        {/* Update Profile Details */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User size={18} className="text-green-600" />
            {t('editProfile')}
          </h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{ts('fullName')}</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t('emailLabel')}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingProfile ? <Loader2 className="animate-spin" size={20} /> : t('saveProfile')}
            </button>
          </form>
        </section>

        {/* Backup PIN Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-green-600" />
            {user.hasBackupPin ? t('updatePin') : t('setBackupPin')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('pinHint')}
          </p>
          
          <form onSubmit={handleUpdateBackupPin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t('backupPinLabel')}</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={backupPin}
                onChange={(e) => setBackupPin(e.target.value)}
                placeholder="123456"
                className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all tracking-widest text-center text-xl font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updatingPin}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingPin ? <Loader2 className="animate-spin" size={20} /> : (user.hasBackupPin ? t('updatePin') : t('setBackupPin'))}
            </button>
          </form>
        </section>

        {/* Set/Update Password Form */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lock size={18} className="text-green-600" />
            {user.hasPassword ? t('updatePassword') : t('setPassword')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('passwordHint')}
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t('passwordLabel')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                required
                minLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t('passwordConfirm')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                required
                minLength={4}
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingPassword ? <Loader2 className="animate-spin" size={20} /> : (user.hasPassword ? t('updatePassword') : t('setPassword'))}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
