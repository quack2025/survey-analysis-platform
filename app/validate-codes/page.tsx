'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, Plus, Merge, Split, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Code as CodeType, Net } from '@/types';

interface ExtractedCodes {
  questionText: string;
  codes: CodeType[];
  language: string;
}

export default function ValidateCodesPage() {
  const router = useRouter();
  const [extractedCodes, setExtractedCodes] = useState<ExtractedCodes | null>(null);
  const [codes, setCodes] = useState<CodeType[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load extracted codes from localStorage
    const saved = localStorage.getItem('extractedCodes');
    if (!saved) {
      router.push('/upload');
      return;
    }
    const data = JSON.parse(saved);
    setExtractedCodes(data);
    setCodes(data.codes);
  }, [router]);

  const toggleSelection = (codeId: string) => {
    const newSelection = new Set(selectedCodes);
    if (newSelection.has(codeId)) {
      newSelection.delete(codeId);
    } else {
      newSelection.add(codeId);
    }
    setSelectedCodes(newSelection);
  };

  const deleteCode = (codeId: string) => {
    setCodes(codes.filter(c => c.id !== codeId));
  };

  const startEditing = (code: CodeType) => {
    setEditingCode(code.id);
    setEditValue(code.name);
  };

  const saveEdit = () => {
    if (!editingCode) return;
    setCodes(codes.map(c =>
      c.id === editingCode ? { ...c, name: editValue } : c
    ));
    setEditingCode(null);
    setEditValue('');
  };

  const mergeCodes = () => {
    if (selectedCodes.size < 2) {
      setError('Selecciona al menos 2 códigos para fusionar');
      return;
    }

    const selectedCodesList = codes.filter(c => selectedCodes.has(c.id));
    const mergedName = selectedCodesList.map(c => c.name).join(' / ');

    // Keep the first code and update its name
    const firstCode = selectedCodesList[0];
    const newCodes = codes.filter(c => !selectedCodes.has(c.id) || c.id === firstCode.id);
    const updatedCodes = newCodes.map(c =>
      c.id === firstCode.id ? { ...c, name: mergedName } : c
    );

    setCodes(updatedCodes);
    setSelectedCodes(new Set());
    setError(null);
  };

  const splitCode = (codeId: string) => {
    const code = codes.find(c => c.id === codeId);
    if (!code) return;

    const parts = code.name.split(' / ');
    if (parts.length === 1) {
      setError('Este código no se puede dividir (no contiene "/")');
      return;
    }

    // Create new codes from parts
    const newCodes = codes.filter(c => c.id !== codeId);
    parts.forEach((part, idx) => {
      newCodes.push({
        id: `${codeId}_split_${idx}`,
        name: part.trim(),
        sentiment: code.sentiment,
        questionId: code.questionId,
      });
    });

    setCodes(newCodes);
    setError(null);
  };

  const addNewCode = () => {
    const newCode: CodeType = {
      id: `manual_${Date.now()}`,
      name: 'Nuevo código',
      sentiment: 'Neutral',
      questionId: extractedCodes?.questionText || '',
    };
    setCodes([...codes, newCode]);
  };

  const changeSentiment = (codeId: string, sentiment: 'Positive' | 'Neutral' | 'Negative') => {
    setCodes(codes.map(c =>
      c.id === codeId ? { ...c, sentiment } : c
    ));
  };

  const handleContinue = () => {
    if (codes.length === 0) {
      setError('Debes tener al menos un código para continuar');
      return;
    }

    // Save validated codes back to localStorage
    const data = { ...extractedCodes, codes };
    localStorage.setItem('validatedCodes', JSON.stringify(data));

    // Continue to next step (generate nets)
    router.push('/review');
  };

  if (!extractedCodes) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'Positive') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300';
    if (sentiment === 'Negative') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Subir Datos
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Validar Códigos Extraídos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Revisa y ajusta los códigos que la IA extrajo de las respuestas. Puedes editar, fusionar, dividir o eliminar códigos.
          </p>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Pregunta:</strong> {extractedCodes.questionText}
            </p>
            <p className="text-sm text-blue-900 dark:text-blue-300 mt-2">
              <strong>Idioma detectado:</strong> {extractedCodes.language === 'es' ? 'Español' : 'Inglés'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="mb-6 flex gap-3 flex-wrap">
            <button
              onClick={addNewCode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Código
            </button>
            <button
              onClick={mergeCodes}
              disabled={selectedCodes.size < 2}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Merge className="w-4 h-4" />
              Fusionar Seleccionados ({selectedCodes.size})
            </button>
          </div>

          {/* Codes List */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Códigos ({codes.length})
            </h3>
            {codes.map((code) => (
              <div
                key={code.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedCodes.has(code.id)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedCodes.has(code.id)}
                    onChange={() => toggleSelection(code.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  {/* Code Name */}
                  {editingCode === code.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      autoFocus
                      className="flex-1 px-3 py-1 border border-blue-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <span
                      onClick={() => startEditing(code)}
                      className="flex-1 font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600"
                    >
                      {code.name}
                    </span>
                  )}

                  {/* Sentiment Selector */}
                  <select
                    value={code.sentiment}
                    onChange={(e) => changeSentiment(code.id, e.target.value as any)}
                    className={`px-3 py-1 rounded-lg border-2 font-medium text-sm ${getSentimentColor(code.sentiment)}`}
                  >
                    <option value="Positive">Positivo</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negativo</option>
                  </select>

                  {/* Actions */}
                  <button
                    onClick={() => splitCode(code.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Dividir código"
                  >
                    <Split className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCode(code.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Eliminar código"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
              Atrás
            </Link>
            <button
              onClick={handleContinue}
              disabled={codes.length === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar con Análisis →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
