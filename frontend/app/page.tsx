'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ThemeToggle from '@/components/ThemeToggle';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/useLocale';
import { useAppToast } from '@/hooks/useAppToast';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Languages } from 'lucide-react';

const NigeriaMap = dynamic(() => import('@/components/NigeriaMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />,
});

export default function Home() {
  const { data: user } = useCurrentUser();
  const t = useTranslations('HomePage');
  const { locale, setLocale } = useLocale();
  const { info } = useAppToast();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleLocaleChange = (newLocale: any) => {
    setLocale(newLocale);
    setIsLangOpen(false);
    const labels: Record<string, string> = {
      en: 'English',
      pcm: 'Nigerian Pidgin',
      ha: 'Harshen Hausa',
      yo: 'Èdè Yorùbá',
      ig: 'Asụsụ Igbo'
    };
    info(labels[newLocale] || newLocale);
  };

  const languages = [
    { code: 'en',  label: 'English' },
    { code: 'pcm', label: 'Nigerian Pidgin' },
    { code: 'ha',  label: 'Harshen Hausa' },
    { code: 'yo',  label: 'Èdè Yorùbá' },
    { code: 'ig',  label: 'Asụsụ Igbo' },
  ] as const;

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden">

      {/* ── Header ── */}
      <header className="absolute top-14 right-6 flex items-center space-x-3 z-20">
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-transparent hover:border-green-500/30 transition-all font-semibold text-sm"
          >
            <Languages size={18} className="text-green-600 dark:text-green-400" />
            <span>{currentLang.label}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full z-50 mt-1 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLocaleChange(lang.code)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        locale === lang.code
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Body: Hero + Map ── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-screen">

        {/* Left: Hero copy */}
        <div className="flex flex-col justify-center items-center lg:items-start px-8 sm:px-16 pt-24 md:pb-12 lg:py-0 lg:w-[44%] lg:min-h-screen text-center lg:text-left">
         
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 md:mb-10 mb-4">
            &ldquo;{t('tagline')}&rdquo;
          </p>

          <div className="flex flex-col space-y-4 w-full sm:w-auto items-center lg:items-start">
            <Link
              href="/submit"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-10 rounded-full md:text-lg text-sm transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl active:scale-95 text-center"
            >
              {t('cta')}
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="text-green-600 dark:text-green-400 font-bold hover:underline py-2 decoration-2 underline-offset-4 text-center"
              >
                &rarr; View my submitted needs
              </Link>
            )}
          </div>

          <p className="md:mt-12 mt-4 text-sm text-gray-400 italic font-medium">
            {t('mission')}
          </p>
        </div>

        {/* Right: Nigeria Map */}
        <div className="flex-1 lg:min-h-screen h-[480px] lg:h-auto bg-gray-50 dark:bg-gray-800/50 relative ">
          <div className="absolute inset-0 m-4 lg:m-6 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 ">
            <NigeriaMap />
          </div>
        </div>
      </div>
    </div>
  );
}
