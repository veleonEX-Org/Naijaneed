'use client';

import { useState, useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyNeeds } from '@/hooks/useNeeds';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import NeedDetailPanel from '@/components/NeedDetailPanel';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/useLocale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Inbox, Languages, Filter, X, Settings, LogOut, Shield } from 'lucide-react';
import { getCategoryIcon, getStatusConfig } from '@/lib/needsUtils';

const LANGUAGES = [
  { code: 'en',  label: 'English' },
  { code: 'pcm', label: 'Nigerian Pidgin' },
  { code: 'ha',  label: 'Harshen Hausa' },
  { code: 'yo',  label: 'Èdè Yorùbá' },
  { code: 'ig',  label: 'Asụsụ Igbo' },
] as const;

const ALL_STATUSES = ['Submitted', 'In Review', 'In Progress', 'Resolved'] as const;
type StatusKey = typeof ALL_STATUSES[number] | 'All';

export default function Dashboard() {
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const ts = useTranslations('SubmitPage');
  const { locale, setLocale } = useLocale();

  const { data: user, isLoading: authLoading } = useCurrentUser();
  const { data: needs, isLoading: needsLoading } = useMyNeeds();

  const [selectedNeed, setSelectedNeed] = useState<any | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusKey>('All');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSignOut = () => {
    document.cookie = 'nn_device=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
  };

  // Count needs per status
  const statusCounts = useMemo(() => {
    if (!needs) return {} as Record<string, number>;
    return needs.reduce((acc: Record<string, number>, need: any) => {
      const s = need.status || 'Submitted';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [needs]);

  // Filtered list
  const filteredNeeds = useMemo(() => {
    if (!needs) return [];
    if (activeFilter === 'All') return needs;
    return needs.filter((n: any) => (n.status || 'Submitted') === activeFilter);
  }, [needs, activeFilter]);

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  if (authLoading || needsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.name ? user.name.split(' ')[0] : t('citizen');

  // Status indicator config (colours without needing t() since these are just dots)
  const STATUS_DOT_MAP: Record<string, { dot: string; text: string; bg: string }> = {
    'Submitted':   { dot: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
    'In Review':   { dot: 'bg-blue-400',   text: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-900/30' },
    'In Progress': { dot: 'bg-orange-400', text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    'Resolved':    { dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-300',   bg: 'bg-green-50 dark:bg-green-900/30' },
  };

  const filterOptions: StatusKey[] = ['All', ...ALL_STATUSES];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-500">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">

          {/* Left: back + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              title={t('backToHome')}
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/images/logo.png" 
                alt="NaijaNeed" 
                width={120} 
                height={40} 
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right: lang dropdown + theme + greeting */}
          <div className="flex items-center gap-3">

            {/* Language switcher dropdown (same style as homepage) */}
            <div className="relative">
              <button
                onClick={() => { setIsLangOpen(!isLangOpen); setIsFilterOpen(false); }}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl shadow-sm border border-transparent hover:border-green-500/30 transition-all font-semibold text-sm"
              >
                <Languages size={16} className="text-green-600 dark:text-green-400" />
                <span className="hidden sm:inline">{currentLang.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
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
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setLocale(lang.code); setIsLangOpen(false); }}
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

            {/* Greeting avatar / Profile link */}
            <div className="flex items-center gap-2 pl-2 border-l dark:border-gray-700">
              <button
                onClick={() => router.push('/profile')}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0 hover:ring-2 ring-green-500/50 transition-all"
                title={t('security')}
              >
                {firstName.charAt(0).toUpperCase()}
              </button>
              <div className="hidden sm:block">
                <button 
                  onClick={() => router.push('/profile')}
                  className="text-sm font-semibold leading-tight hover:text-green-600 dark:hover:text-green-400 transition-colors block text-left"
                >
                  {t('hello')} {firstName} 👋
                </button>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-400">{user.phone}</p>
                  <button 
                    onClick={handleSignOut}
                    className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 pb-32 space-y-6">

        {/* Mobile greeting */}
        <div className="sm:hidden">
          <h1 className="text-2xl font-bold">
            {t('hello')} {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{user.phone}</p>
        </div>

        {/* ── Title row: heading + filter ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('title')}</h2>

          {needs && (
            <div className="flex items-center gap-2 flex-wrap">

              {/* Status indicator pills — always show all four */}
              {ALL_STATUSES.map((status) => {
                const count = statusCounts[status] || 0;
                const cfg = STATUS_DOT_MAP[status];
                const isActive = activeFilter === status;
                const dimmed = count === 0;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      setActiveFilter(activeFilter === status ? 'All' : status);
                      setIsFilterOpen(false);
                    }}
                    title={`Filter by: ${status}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ring-2 ring-transparent hover:ring-offset-1 ${dimmed ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100' : ''} ${cfg.bg} ${cfg.text} ${
                      isActive ? 'ring-current opacity-100 grayscale-0' : ''
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <span>{status}</span>
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                        isActive ? 'bg-current text-white dark:text-gray-900' : 'bg-white/50 dark:bg-black/20'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Filter dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => { setIsFilterOpen(!isFilterOpen); setIsLangOpen(false); }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    activeFilter !== 'All'
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-green-400'
                  }`}
                >
                  {activeFilter !== 'All' ? (
                    <>
                      <Filter size={11} />
                      {activeFilter}
                      <X
                        size={11}
                        onClick={(e) => { e.stopPropagation(); setActiveFilter('All'); }}
                        className="ml-0.5 hover:opacity-70"
                      />
                    </>
                  ) : (
                    <>
                      <Filter size={11} />
                      <span>Filter</span>
                      <ChevronDown size={11} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-full z-50 mt-1 w-44 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-1.5 overflow-hidden"
                      >
                        {filterOptions.map((opt) => {
                          const cfg = opt !== 'All' ? STATUS_DOT_MAP[opt] : null;
                          const count = opt === 'All' ? (needs?.length ?? 0) : (statusCounts[opt] || 0);
                          return (
                            <button
                              key={opt}
                              onClick={() => { setActiveFilter(opt); setIsFilterOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                activeFilter === opt
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {cfg && <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />}
                                {opt === 'All' ? 'All needs' : opt}
                              </span>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                activeFilter === opt ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* ── Need Cards ── */}
        {filteredNeeds.length > 0 ? (
          <ul className="space-y-3">
            {filteredNeeds.map((need: any) => {
              const icon = getCategoryIcon(need.category_id);
              const { label: statusLabel, dot, bg, text } = getStatusConfig(need.status, t);
              const categoryLabel = need.category_id
                ? ts(`categories.${need.category_id}`)
                : need.categories?.name ?? 'Need';

              return (
                <li key={need.id}>
                  <button
                    onClick={() => setSelectedNeed(need)}
                    className="w-full text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Category icon circle */}
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl shadow-inner">
                        {icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                            {categoryLabel}
                          </span>
                          <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">
                            {new Date(need.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-3">
                          {need.description}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${bg} ${text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                            {statusLabel}
                          </span>

                          <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : needs && needs.length > 0 ? (
          /* No results for active filter */
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <Filter size={36} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 font-medium">No needs with status "{activeFilter}"</p>
            <button
              onClick={() => setActiveFilter('All')}
              className="mt-3 text-sm text-green-600 dark:text-green-400 font-semibold hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <Inbox size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 font-medium">{t('noNeeds')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('noNeedsHint')}</p>
          </div>
        )}
      </main>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-950 via-white/80 dark:via-gray-950/80 to-transparent pointer-events-none z-40">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <button
            onClick={() => router.push('/submit')}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] text-sm tracking-wide flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            {t('submitAnother')}
          </button>
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {selectedNeed && (
        <NeedDetailPanel
          need={selectedNeed}
          onClose={() => setSelectedNeed(null)}
        />
      )}
    </div>
  );
}
