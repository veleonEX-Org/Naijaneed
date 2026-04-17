'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { useSubmitNeed } from '../hooks/useNeeds';
import { useCurrentUser, useLogin, useResetPasswordWithPin } from '../hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Location from 'nigeria-geo';
import { useTranslations } from 'next-intl';
import { useAppToast } from '../hooks/useAppToast';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SubmitNeedForm() {
  const router = useRouter();
  const t = useTranslations('SubmitPage');
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    lga: '',
    area: '',
    category_id: '',
    description: ''
  });
  const [media, setMedia] = useState<File | null>(null);
  const { success, error: toastError } = useAppToast();
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const loginMutation = useLogin();
  const resetWithPinMutation = useResetPasswordWithPin();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        state: user.state_id || '',
        lga: user.lga_id || '',
        area: user.area || ''
      }));
    }
  }, [user]);

  const allStates = Location.states();
  const selectedStateData = formData.state ? Location.all().find((s: any) => s.state === formData.state) : null;
  const lgas = selectedStateData ? selectedStateData.lgas : [];

  const submitNeedMutation = useSubmitNeed();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate locally for essential fields if not logged in
      if (!user && (!formData.phone || !formData.name || !formData.state || !formData.lga)) {
        throw new Error('Please fill all required fields.');
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      if (media) {
        formDataToSend.append('media', media);
      }

      await submitNeedMutation.mutateAsync(formDataToSend);

      success('submissionSuccess');
      router.push('/dashboard');
    } catch (err: any) {
      toastError(err.response?.data?.message || err.message || 'submissionError');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!formData.phone) return;
    setLoading(true);
    try {
      await loginMutation.mutateAsync({ phone: formData.phone, password });
      success('loginSuccess');
      setIsLoginMode(false);
      setShowPasswordField(false);
      setPassword('');
    } catch (err: any) {
      if (err.response?.data?.requiresPassword) {
        setShowPasswordField(true);
        toastError('passwordRequired');
      } else {
        toastError(err.response?.data?.error || 'loginError');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPin || resetPin.length < 6 || !resetNewPassword) return;
    setLoading(true);
    try {
      await resetWithPinMutation.mutateAsync({ 
        phone: formData.phone, 
        pin: resetPin, 
        newPassword: resetNewPassword 
      });
      success('passwordResetSuccess');
      setIsResetMode(false);
      setIsLoginMode(false);
      setResetPin('');
      setResetNewPassword('');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'resetError');
    } finally {
      setLoading(false);
    }
  };

  const categoryKeys = [
    'edu', 'water', 'health', 'power', 'roads', 'security', 
    'waste', 'transport', 'jobs', 'markets', 'housing', 
    'agri', 'youth', 'env', 'others'
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 relative">
      <button 
        type="button" 
        onClick={() => router.push('/')}
        className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
        {t('title')}
      </h2>

      <div className="animate-in fade-in slide-in-from-top-4 duration-500 text-gray-800 dark:text-gray-200">
        {!user && !loadingUser && (
          <div className="mb-6">
            {isLoginMode ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('signInWithPhone')}
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    name="phone"
                    value={formData.phone}
                    placeholder="080 1234 5678"
                    className="flex-1 p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    onChange={handleChange}
                    required
                  />
                  {showPasswordField && (
                    <input
                      type="password"
                      value={password}
                      placeholder={t('password')}
                      className="flex-1 p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="px-6 py-2.5 md:py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : t('signIn')}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setIsLoginMode(false);
                      }}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(false)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    {t('registerInstead')}
                  </button>
                </div>
              ) : isResetMode ? (
                <div className="space-y-4">
                <h3 className="text-lg font-bold">{t('resetPasswordTitle')}</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{t('enterPinToReset')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      name="phone"
                      value={formData.phone}
                      placeholder="Phone Number"
                      className="p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="password"
                      value={resetPin}
                      onChange={(e) => setResetPin(e.target.value)}
                      placeholder={t('backupPinLabel')}
                      maxLength={6}
                      className="p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder={t('newPasswordPlaceholder')}
                    className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : t('resetAndLogin')}
                  </button>
                </div>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    {t('backToSignIn')}
                  </button>
                </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold">{t('fullName')}</label>
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(true)}
                    className="text-xs text-green-600 hover:underline"
                  >
                    {t('returningUser')}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 transition-all">
                  <div>
                    <input
                      name="name"
                      value={formData.name}
                      placeholder="Ada Obi"
                      className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <input
                      name="phone"
                      value={formData.phone}
                      placeholder="080 1234 5678"
                      className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('state')}</label>
            <select 
              name="state" 
              value={formData.state}
              className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              onChange={(e) => {
                setFormData({ ...formData, state: e.target.value, lga: '' });
              }}
              required
            >
              <option value="">{t('selectState')}</option>
              {allStates.map((state: string) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('lga')}</label>
            <select 
              name="lga" 
              value={formData.lga}
              className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all disabled:opacity-50" 
              onChange={handleChange}
              disabled={!formData.state}
              required
            >
              <option value="">{t('selectLga')}</option>
              {lgas.map((lga: string) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3 md:mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('area')}</label>
          <input
            name="area"
            value={formData.area}
            placeholder="e.g. Yaba, Lekki Phase 1"
            className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            onChange={handleChange}
          />
        </div>
      </div>

      {user && !loadingUser && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('confirmDetails')}</p>
          </div>
        </div>
      )}

      <div className="mb-3 md:mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('category')}</label>
        <select 
          name="category_id" 
          value={formData.category_id}
          className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
          onChange={handleChange}
          required
        >
          <option value="">{t('selectCategory')}</option>
          {categoryKeys.map((key) => (
            <option key={key} value={key}>
              {t(`categories.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 md:mb-6">
        <label className="block text-sm font-semibold mb-1">{t('needLiteral')}</label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          placeholder="Be clear and concise..."
          className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          onChange={handleChange}
          required
        ></textarea>
      </div>

      <div className="mb-4 md:mb-6">
        <label className="block text-sm font-semibold mb-1">Upload Image or Video (Optional)</label>
        <input
          type="file"
          accept="image/*,video/*"
          className="w-full p-2.5 md:p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
               setMedia(e.target.files[0]);
            }
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 md:py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>

      <p className="mt-6 text-center text-xs text-gray-500">
        {t('disclaimer')}
      </p>
    </form>
  );
}
