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
        Exportar Resultados
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
                Selecciona Formato de Exportación
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Diferentes formatos según tu necesidad de análisis
              </p>
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
                    Detallado por Respondente
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Una fila por cada código asignado. Ideal para análisis cualitativo profundo.
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono">
                    RespondentID | Question | Answer | Net | Code | Sentiment
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
                    Formato Pivot (SPSS/R/Python)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Una fila por respondente, columnas con 0/1 por código. Perfecto para análisis estadístico.
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-mono">
                    RespondentID | Answer | Codigo1 | Codigo2 | ...
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
                    Resumen Agregado
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Una fila por respondente con conteo de sentimientos. Ideal para reportes.
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono">
                    RespondentID | Nets | Codes | Positive | Neutral | Negative
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
                    Sintaxis SPSS (.sps)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Genera sintaxis SPSS con labels y value labels. Combina con formato Pivot.
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-mono">
                    VARIABLE LABELS / VALUE LABELS / FREQUENCIES
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
                    Simple (Básico)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Formato básico compatible con Excel. Una fila por respuesta.
                  </div>
                </div>
              </button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
              <p className="text-xs text-blue-900 dark:text-blue-300">
                💡 <strong>Tip:</strong> Usa "Pivot" + "SPSS Syntax" para análisis estadístico completo
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
