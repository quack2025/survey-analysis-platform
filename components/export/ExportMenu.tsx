'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileCode, FileText, ChevronDown } from 'lucide-react';
import {
  exportDetailedCSV,
  exportPivotCSV,
  exportNetSummaryCSV,
  generateSPSSSyntax,
  sanitizeFilename,
  downloadFile,
} from '@/lib/utils/export';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ExportMenuProps {
  classifiedAnswers: any[];
  nets: any[];
  questionText: string;
  respondentIds?: string[];
}

export default function ExportMenu({
  classifiedAnswers,
  nets,
  questionText,
  respondentIds = [],
}: ExportMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Extract all unique codes
  const allCodes = Array.from(
    new Set(
      nets.flatMap(net =>
        (net.codes || []).map((c: any) => c.code)
      )
    )
  );

  // Ensure we have respondent IDs
  const ids = respondentIds.length > 0
    ? respondentIds
    : classifiedAnswers.map((_, idx) => `resp_${idx + 1}`);

  const handleExport = (format: string) => {
    const baseFilename = sanitizeFilename(questionText);

    switch (format) {
      case 'detailed':
        const detailedCSV = exportDetailedCSV(classifiedAnswers, questionText, ids);
        downloadFile(detailedCSV, `${baseFilename}_detailed.csv`);
        break;

      case 'pivot':
        const pivotCSV = exportPivotCSV(classifiedAnswers, allCodes, ids);
        downloadFile(pivotCSV, `${baseFilename}_pivot.csv`);
        break;

      case 'summary':
        const summaryCSV = exportNetSummaryCSV(classifiedAnswers, ids);
        downloadFile(summaryCSV, `${baseFilename}_summary.csv`);
        break;

      case 'spss':
        const spssSyntax = generateSPSSSyntax(allCodes, questionText);
        downloadFile(spssSyntax, `${baseFilename}_spss.sps`, 'text/plain');
        break;

      default:
        // Simple export (backward compatible)
        const rows = [
          ['Answer', 'Nets', 'Codes', 'Sentiments'].join(','),
          ...classifiedAnswers.map((ca) => {
            const netsStr = ca.nets?.map((n: any) => n.net).join(' | ') || '';
            const codesStr = ca.nets?.flatMap((n: any) => n.codes?.map((c: any) => c.code) || []).join(' | ') || '';
            const sentimentsStr = ca.nets?.flatMap((n: any) => n.codes?.map((c: any) => c.sentiment) || []).join(' | ') || '';
            return [`"${ca.answer.replace(/"/g, '""')}"`, `"${netsStr}"`, `"${codesStr}"`, `"${sentimentsStr}"`].join(',');
          }),
        ];
        const csv = rows.join('\n');
        downloadFile(csv, `${baseFilename}_simple.csv`);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        {t.results.exportResults}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t.results.exportResults}
              </h3>
            </div>

            <div className="p-2">
              {/* Formato 1: Detallado */}
              <button
                onClick={() => handleExport('detailed')}
                className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {t.results.exportFormats.detailed}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.results.exportFormats.detailedDesc}
                  </div>
                </div>
              </button>

              {/* Formato 2: Pivot */}
              <button
                onClick={() => handleExport('pivot')}
                className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {t.results.exportFormats.pivot}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.results.exportFormats.pivotDesc}
                  </div>
                </div>
              </button>

              {/* Formato 3: Resumen */}
              <button
                onClick={() => handleExport('summary')}
                className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {t.results.exportFormats.summary}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.results.exportFormats.summaryDesc}
                  </div>
                </div>
              </button>

              {/* Formato 4: SPSS Syntax */}
              <button
                onClick={() => handleExport('spss')}
                className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <FileCode className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {t.results.exportFormats.spss}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.results.exportFormats.spssDesc}
                  </div>
                </div>
              </button>

              {/* Formato 5: Simple (legacy) */}
              <button
                onClick={() => handleExport('simple')}
                className="w-full flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {t.results.exportFormats.simple}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.results.exportFormats.simpleDesc}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
