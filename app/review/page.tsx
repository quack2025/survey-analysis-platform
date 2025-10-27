'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { detectLanguage } from '@/lib/utils/language';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

interface Question {
  columnIndex: number;
  text: string;
  answers: Array<{ respondentId: string; text: string }>;
}

interface SurveyData {
  projectConfig: any;
  respondentIdColumn: number;
  questions: Question[];
}

interface ProcessingStatus {
  currentStep: string;
  currentQuestion?: string;
  progress: number;
  total: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>({
    currentStep: t.common.loading,
    progress: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load survey data from localStorage
    const savedData = localStorage.getItem('surveyData');
    if (!savedData) {
      router.push('/upload');
      return;
    }
    setSurveyData(JSON.parse(savedData));
  }, [router]);

  const processAllQuestions = async () => {
    if (!surveyData) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Extract all unique respondent IDs
      const respondentIds: string[] = [];
      surveyData.questions.forEach(q => {
        q.answers.forEach(a => {
          if (!respondentIds.includes(a.respondentId)) {
            respondentIds.push(a.respondentId);
          }
        });
      });

      const results: any = {
        projectConfig: surveyData.projectConfig,
        respondentIds,
        questions: [],
      };

      const totalSteps = surveyData.questions.length * 5; // 5 steps per question
      let currentProgress = 0;

      for (const question of surveyData.questions) {
        setStatus({
          currentStep: t.review.classifying,
          currentQuestion: question.text,
          progress: currentProgress++,
          total: totalSteps,
        });

        // Step 1: Classify question type
        const classifyRes = await fetch('/api/classify-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: [question.text],
            projectContext: surveyData.projectConfig.projectContext,
          }),
        });
        const classifyData = await classifyRes.json();
        const questionType = classifyData.results[0].type;

        const answerTexts = question.answers.map((a) => a.text);

        // Detect language from answers
        const detectedLanguage = detectLanguage(answerTexts.join(' '));

        if (questionType === 'OPINION') {
          // Process as opinion question
          setStatus({
            currentStep: t.review.extractingCodes,
            currentQuestion: question.text,
            progress: currentProgress++,
            total: totalSteps,
          });

          // Step 2: Extract codes
          const extractRes = await fetch('/api/extract-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: answerTexts,
              questionTitle: question.text,
              projectLanguage: detectedLanguage,
              projectContext: surveyData.projectConfig.projectContext,
            }),
          });
          const extractData = await extractRes.json();

          setStatus({
            currentStep: t.review.normalizingCodes,
            currentQuestion: question.text,
            progress: currentProgress++,
            total: totalSteps,
          });

          // Step 3: Normalize codes
          const normalizeRes = await fetch('/api/normalize-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              codes: extractData.codes,
              questionTitle: question.text,
            }),
          });
          const normalizeData = await normalizeRes.json();

          setStatus({
            currentStep: t.review.generatingNets,
            currentQuestion: question.text,
            progress: currentProgress++,
            total: totalSteps,
          });

          // Step 4: Generate nets
          const netsRes = await fetch('/api/generate-nets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              codes: normalizeData.codes,
              questionTitle: question.text,
              projectLanguage: detectedLanguage,
              projectContext: surveyData.projectConfig.projectContext,
            }),
          });
          const netsData = await netsRes.json();

          setStatus({
            currentStep: t.review.classifyingAnswers,
            currentQuestion: question.text,
            progress: currentProgress++,
            total: totalSteps,
          });

          // Step 5: Classify answers
          const classifyAnswersRes = await fetch('/api/classify-answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: answerTexts,
              nets: netsData.nets,
              questionTitle: question.text,
            }),
          });
          const classifyAnswersData = await classifyAnswersRes.json();

          results.questions.push({
            text: question.text,
            type: questionType,
            nets: netsData.nets,
            classifiedAnswers: classifyAnswersData.classifiedAnswers,
            respondentIds: question.answers.map(a => a.respondentId),
          });
        } else {
          // REFERENCE question - simplified processing
          currentProgress += 4; // Skip the other steps
          results.questions.push({
            text: question.text,
            type: questionType,
            answers: answerTexts,
            respondentIds: question.answers.map(a => a.respondentId),
          });
        }
      }

      // Save results
      localStorage.setItem('analysisResults', JSON.stringify(results));

      // Navigate to results
      router.push('/results');
    } catch (error) {
      console.error('Error processing questions:', error);
      setError('Failed to process survey data. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!isProcessing && (
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.nav.upload}
            </Link>
            <LanguageToggle />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.review.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {surveyData.questions.length} {t.review.subtitle}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {!isProcessing ? (
            <>
              <div className="space-y-3 mb-8">
                {surveyData.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{q.text}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {q.answers.length} {t.upload.responsesLoaded}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  {t.review.whatWillHappen}
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t.review.step1}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t.review.step2}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t.review.step3}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t.review.step4}
                  </li>
                </ul>
              </div>

              <button
                onClick={processAllQuestions}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                {t.review.startAnalysis}
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {status.currentStep}
                </h3>
                {status.currentQuestion && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{status.currentQuestion}</p>
                )}
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${status.total > 0 ? (status.progress / status.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {status.progress} / {status.total}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  {t.review.pleaseWait}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
