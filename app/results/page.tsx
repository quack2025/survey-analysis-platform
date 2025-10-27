'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import ExportMenu from '@/components/export/ExportMenu';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

interface AnalysisResults {
  projectConfig: any;
  respondentIds?: string[];
  questions: Array<{
    text: string;
    type: 'REFERENCE' | 'OPINION';
    nets?: any[];
    classifiedAnswers?: any[];
    answers?: string[];
    respondentIds?: string[];
  }>;
}

export default function ResultsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  useEffect(() => {
    // Load results from localStorage
    const savedResults = localStorage.getItem('analysisResults');
    if (!savedResults) {
      router.push('/');
      return;
    }
    setResults(JSON.parse(savedResults));
  }, [router]);

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'Positive')
      return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (sentiment === 'Negative')
      return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'Positive') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (sentiment === 'Negative') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentQuestion = results.questions[selectedQuestion];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ChevronLeft className="w-4 h-4" />
            {t.nav.startNewAnalysis}
          </Link>
          <div className="flex items-center gap-4">
            <ExportMenu
              classifiedAnswers={currentQuestion.classifiedAnswers || []}
              nets={currentQuestion.nets || []}
              questionText={currentQuestion.text}
              respondentIds={currentQuestion.respondentIds || []}
            />
            <LanguageToggle />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.results.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t.results.project}: {results.projectConfig.name}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t.results.questions}</h3>
              <div className="space-y-2">
                {results.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuestion(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedQuestion === idx
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 uppercase">
                      {q.type}
                    </div>
                    <div className="text-sm line-clamp-2">{q.text}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {currentQuestion.type}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentQuestion.text}
                </h2>
              </div>

              {currentQuestion.type === 'REFERENCE' ? (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {t.results.allResponses} ({currentQuestion.answers?.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentQuestion.answers?.map((answer, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Nets Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {t.results.thematicNets}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentQuestion.nets?.map((net, idx) => {
                        if (net.net === 'Uncategorized' && net.codes.length === 1) return null;

                        const positiveCount = net.codes.filter(
                          (c: any) => c.sentiment === 'Positive'
                        ).length;
                        const negativeCount = net.codes.filter(
                          (c: any) => c.sentiment === 'Negative'
                        ).length;
                        const neutralCount = net.codes.filter(
                          (c: any) => c.sentiment === 'Neutral'
                        ).length;

                        return (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {net.net}
                            </h4>
                            <div className="flex gap-4 text-sm mb-3">
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <TrendingUp className="w-3 h-3" /> {positiveCount}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Minus className="w-3 h-3" /> {neutralCount}
                              </span>
                              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <TrendingDown className="w-3 h-3" /> {negativeCount}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {net.codes.map((code: any, cIdx: number) => (
                                <span
                                  key={cIdx}
                                  className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(
                                    code.sentiment
                                  )}`}
                                >
                                  {code.code}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sample Classified Answers */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {t.results.sampleResponses} ({currentQuestion.classifiedAnswers?.length} {t.results.total})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {currentQuestion.classifiedAnswers?.slice(0, 10).map((ca, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <p className="text-gray-900 dark:text-white mb-2">{ca.answer}</p>
                          <div className="flex flex-wrap gap-2">
                            {ca.nets.map((net: any, nIdx: number) =>
                              net.codes.map((code: any, cIdx: number) => (
                                <span
                                  key={`${nIdx}-${cIdx}`}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getSentimentColor(
                                    code.sentiment
                                  )}`}
                                >
                                  {getSentimentIcon(code.sentiment)}
                                  {net.net}: {code.code}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
