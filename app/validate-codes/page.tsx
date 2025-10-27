'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { detectLanguage } from '@/lib/utils/language';

interface SurveyData {
  projectConfig: any;
  respondentIdColumn: number;
  questions: Array<{
    columnIndex: number;
    text: string;
    answers: Array<{ respondentId: string; text: string }>;
  }>;
}

interface NetOption {
  id: string;
  name: string;
  description: string;
  netCount: number;
  nets: Array<{
    net: string;
    description: string;
    codes: string[];
  }>;
}

interface GroupingOptions {
  options: NetOption[];
}

export default function ValidateCodesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [extractedCodes, setExtractedCodes] = useState<any[]>([]);
  const [groupingOptions, setGroupingOptions] = useState<GroupingOptions | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [validatedQuestions, setValidatedQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load survey data from localStorage
    const saved = localStorage.getItem('surveyData');
    if (!saved) {
      router.push('/upload');
      return;
    }
    const data = JSON.parse(saved);
    setSurveyData(data);

    // Start processing first question
    processCurrentQuestion(data, 0);
  }, [router]);

  const processCurrentQuestion = async (data: SurveyData, questionIndex: number) => {
    const question = data.questions[questionIndex];
    setIsExtracting(true);
    setError(null);

    try {
      // Step 1: Extract codes
      const answerTexts = question.answers.map(a => a.text);
      const detectedLanguage = detectLanguage(answerTexts.join(' '));

      const extractRes = await fetch('/api/extract-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answerTexts,
          questionTitle: question.text,
          projectLanguage: detectedLanguage,
          projectContext: data.projectConfig.projectContext,
        }),
      });

      if (!extractRes.ok) throw new Error('Failed to extract codes');
      const extractData = await extractRes.json();
      setExtractedCodes(extractData.codes);
      setIsExtracting(false);

      // Step 2: Generate multiple grouping options
      setIsGeneratingOptions(true);
      const optionsRes = await fetch('/api/generate-net-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codes: extractData.codes,
          questionTitle: question.text,
          projectContext: data.projectConfig.projectContext,
          language: detectedLanguage,
        }),
      });

      if (!optionsRes.ok) throw new Error('Failed to generate options');
      const optionsData = await optionsRes.json();
      setGroupingOptions(optionsData);
      setIsGeneratingOptions(false);
    } catch (error) {
      console.error('Error processing question:', error);
      setError('Error al procesar la pregunta. Por favor intenta de nuevo.');
      setIsExtracting(false);
      setIsGeneratingOptions(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (!selectedOption || !surveyData || !groupingOptions) return;

    const option = groupingOptions.options.find(o => o.id === selectedOption);
    if (!option) return;

    // Save the validated question with selected grouping
    const question = surveyData.questions[currentQuestionIndex];
    const validatedQuestion = {
      text: question.text,
      type: 'OPINION',
      codes: extractedCodes,
      nets: option.nets,
      respondentIds: question.answers.map(a => a.respondentId),
    };

    const updatedValidated = [...validatedQuestions, validatedQuestion];
    setValidatedQuestions(updatedValidated);

    // Check if there are more questions
    if (currentQuestionIndex < surveyData.questions.length - 1) {
      // Process next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setGroupingOptions(null);
      setExtractedCodes([]);
      processCurrentQuestion(surveyData, currentQuestionIndex + 1);
    } else {
      // All questions validated, save and continue to Review for classification
      localStorage.setItem('validatedQuestions', JSON.stringify(updatedValidated));
      router.push('/review');
    }
  };

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentQuestion = surveyData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / surveyData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.validate.backToUpload}
          </Link>
          <LanguageToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.validate.title}
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t.validate.question} {currentQuestionIndex + 1} / {surveyData.questions.length}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t.validate.subtitle}
          </p>

          {/* Current Question */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>{t.validate.question}:</strong> {currentQuestion.text}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
              {currentQuestion.answers.length} {t.upload.responsesLoaded}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Loading States */}
          {isExtracting && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t.review.extractingCodes}...
              </p>
            </div>
          )}

          {isGeneratingOptions && !isExtracting && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t.review.generatingNets}...
              </p>
            </div>
          )}

          {/* Grouping Options */}
          {groupingOptions && !isExtracting && !isGeneratingOptions && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Selecciona una opción de agrupación:
              </h3>

              <div className="grid lg:grid-cols-3 gap-6">
                {groupingOptions.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all hover:shadow-lg ${
                      selectedOption === option.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                          {option.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                      {selectedOption === option.id && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      {option.nets.map((net, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                            {net.net}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {net.description}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-500">
                            {net.codes.length} {net.codes.length === 1 ? 'código' : 'códigos'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/upload"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.common.back}
                </Link>
                <button
                  onClick={handleContinue}
                  disabled={!selectedOption}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestionIndex < surveyData.questions.length - 1
                    ? `Continuar con pregunta ${currentQuestionIndex + 2} →`
                    : `${t.validate.continueAnalysis} →`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
