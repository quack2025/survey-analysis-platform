'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ProjectConfig } from '@/types';

interface ParsedData {
  headers: string[];
  rows: any[][];
}

export default function UploadPage() {
  const router = useRouter();
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [respondentIdColumn, setRespondentIdColumn] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load project config from localStorage
    const savedConfig = localStorage.getItem('projectConfig');
    if (!savedConfig) {
      router.push('/setup');
      return;
    }
    setConfig(JSON.parse(savedConfig));
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);

    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      parseCSV(uploadedFile);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(uploadedFile);
    } else {
      setError('Unsupported file type. Please upload CSV or Excel files.');
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const rows = results.data.slice(1) as any[][];
          setParsedData({ headers, rows });
          // Auto-select all columns except the first (assumed to be ID)
          setSelectedQuestions(headers.slice(1).map((_, i) => i + 1));
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          setParsedData({ headers, rows });
          // Auto-select all columns except the first (assumed to be ID)
          setSelectedQuestions(headers.slice(1).map((_, i) => i + 1));
        }
      } catch (error) {
        setError('Error parsing Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const toggleQuestionSelection = (index: number) => {
    if (selectedQuestions.includes(index)) {
      setSelectedQuestions(selectedQuestions.filter((i) => i !== index));
    } else {
      setSelectedQuestions([...selectedQuestions, index]);
    }
  };

  const handleProcess = async () => {
    if (!parsedData || selectedQuestions.length === 0 || !config) {
      setError('Please select at least one question column');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare data structure for analysis
      const surveyData = {
        projectConfig: config,
        respondentIdColumn,
        questions: selectedQuestions.map((colIndex) => ({
          columnIndex: colIndex,
          text: parsedData.headers[colIndex],
          answers: parsedData.rows
            .map((row, rowIndex) => ({
              respondentId: row[respondentIdColumn] || `resp_${rowIndex}`,
              text: row[colIndex] || '',
            }))
            .filter((a) => a.text.trim() !== ''),
        })),
      };

      // Save to localStorage for next step
      localStorage.setItem('surveyData', JSON.stringify(surveyData));

      // Navigate to processing/review page
      router.push('/review');
    } catch (error) {
      console.error('Error processing data:', error);
      setError('Failed to process survey data');
      setIsProcessing(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/setup"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Setup
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upload Survey Data
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your survey responses in CSV or Excel format
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Project:</strong> {config.name} | <strong>Study Type:</strong>{' '}
                {config.projectContext.studyType.replace('_', ' ')}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {!parsedData ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold">
                    Click to upload
                  </span>
                  <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  CSV or Excel files only
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 dark:text-green-300">
                    {file?.name}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {parsedData.rows.length} responses loaded
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData(null);
                    setSelectedQuestions([]);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Respondent ID Column
                </label>
                <select
                  value={respondentIdColumn}
                  onChange={(e) => setRespondentIdColumn(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {parsedData.headers.map((header, index) => (
                    <option key={index} value={index}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Select Question Columns to Analyze
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {parsedData.headers.map((header, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedQuestions.includes(index)
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(index)}
                        onChange={() => toggleQuestionSelection(index)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {header}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        Column {index + 1}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/setup"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </Link>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || selectedQuestions.length === 0}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Continue to Analysis →</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
