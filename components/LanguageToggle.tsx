'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label={t.common.language}
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {locale === 'en' ? t.common.spanish : t.common.english}
      </span>
      <span className="sm:hidden">
        {locale === 'en' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}
