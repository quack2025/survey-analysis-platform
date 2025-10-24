'use client';

import Link from 'next/link';
import { FileText, Upload, CheckCircle, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-end mb-8">
          <LanguageToggle />
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.home.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.home.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StepCard
            icon={<FileText className="w-8 h-8" />}
            title={t.home.steps.step1Title}
            description={t.home.steps.step1Desc}
            href="/setup"
            color="blue"
          />
          <StepCard
            icon={<Upload className="w-8 h-8" />}
            title={t.home.steps.step2Title}
            description={t.home.steps.step2Desc}
            color="green"
            disabled
          />
          <StepCard
            icon={<CheckCircle className="w-8 h-8" />}
            title={t.home.steps.step3Title}
            description={t.home.steps.step3Desc}
            color="yellow"
            disabled
          />
          <StepCard
            icon={<BarChart3 className="w-8 h-8" />}
            title={t.home.steps.step4Title}
            description={t.home.steps.step4Desc}
            color="purple"
            disabled
          />
        </div>

        <div className="text-center">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t.home.getStarted}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t.home.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title={t.home.features.contextual}
              description={t.home.features.contextualDesc}
            />
            <FeatureCard
              title={t.home.features.classification}
              description={t.home.features.classificationDesc}
            />
            <FeatureCard
              title={t.home.features.coding}
              description={t.home.features.codingDesc}
            />
            <FeatureCard
              title={t.home.features.sentiment}
              description={t.home.features.sentimentDesc}
            />
            <FeatureCard
              title={t.home.features.export}
              description={t.home.features.exportDesc}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  disabled?: boolean;
}

function StepCard({ icon, title, description, href, color, disabled }: StepCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  };

  const content = (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      }`}
    >
      <div className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        {description}
      </p>
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
