'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { ProjectConfig, StudyType, StudyPhase, AnalysisType, BrandCategory, Country } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BRAND_CATEGORIES, COUNTRIES } from '@/lib/constants/categories';
import LanguageToggle from '@/components/LanguageToggle';

export default function SetupPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [brandInput, setBrandInput] = useState('');
  const [config, setConfig] = useState<Partial<ProjectConfig>>({
    name: '',
    projectContext: {
      studyType: 'commercial_evaluation',
      studyPhase: 'exploratory',
      analysisType: 'theme_analysis',
      brand: '',
      objective: '',
      targetAudience: '',
      competitiveSet: [],
      brandCoding: {
        enabled: false,
        brandList: [],
      },
      enableManualValidation: false,  // Human-in-the-loop disabled by default
    },
    taxonomyPreferences: {
      useIndustryStandard: true,
      customDimensions: [],
      sentimentGranularity: '3-level',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('projectConfig', JSON.stringify(config));
    router.push('/upload');
  };

  const handleAnalysisTypeChange = (type: AnalysisType) => {
    setConfig({
      ...config,
      projectContext: {
        ...config.projectContext!,
        analysisType: type,
        brandCoding: {
          enabled: type === 'brand_coding',
          brandList: config.projectContext?.brandCoding?.brandList || [],
          category: config.projectContext?.brandCoding?.category,
          country: config.projectContext?.brandCoding?.country,
        },
      },
    });
  };

  const addBrand = () => {
    if (!brandInput.trim()) return;
    const brands = config.projectContext?.brandCoding?.brandList || [];
    if (brands.length >= 20) {
      alert(locale === 'es' ? 'Máximo 20 marcas permitidas' : 'Maximum 20 brands allowed');
      return;
    }
    if (brands.includes(brandInput.trim())) {
      alert(locale === 'es' ? 'Marca ya existe' : 'Brand already exists');
      return;
    }

    setConfig({
      ...config,
      projectContext: {
        ...config.projectContext!,
        brandCoding: {
          ...config.projectContext!.brandCoding!,
          brandList: [...brands, brandInput.trim()],
        },
      },
    });
    setBrandInput('');
  };

  const removeBrand = (index: number) => {
    const brands = config.projectContext?.brandCoding?.brandList || [];
    setConfig({
      ...config,
      projectContext: {
        ...config.projectContext!,
        brandCoding: {
          ...config.projectContext!.brandCoding!,
          brandList: brands.filter((_, i) => i !== index),
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.nav.home}
          </Link>
          <LanguageToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.setup.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t.setup.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.setup.projectName}
              </label>
              <input
                type="text"
                required
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={t.setup.projectNamePlaceholder}
              />
            </div>

            {/* Analysis Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t.setup.analysisType}
              </label>
              <div className="space-y-3">
                <label
                  className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    config.projectContext?.analysisType === 'theme_analysis'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisType"
                    value="theme_analysis"
                    checked={config.projectContext?.analysisType === 'theme_analysis'}
                    onChange={() => handleAnalysisTypeChange('theme_analysis')}
                    className="sr-only"
                  />
                  <span className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t.setup.themeAnalysis}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t.setup.themeAnalysisDesc}
                  </span>
                </label>

                <label
                  className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    config.projectContext?.analysisType === 'brand_coding'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisType"
                    value="brand_coding"
                    checked={config.projectContext?.analysisType === 'brand_coding'}
                    onChange={() => handleAnalysisTypeChange('brand_coding')}
                    className="sr-only"
                  />
                  <span className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t.setup.brandCoding}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t.setup.brandCodingDesc}
                  </span>
                </label>
              </div>
            </div>

            {/* Brand Coding Options */}
            {config.projectContext?.analysisType === 'brand_coding' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4 border border-blue-200 dark:border-blue-800">
                {/* Brand List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.setup.brandList}
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBrand())}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={t.setup.brandPlaceholder}
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={addBrand}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t.setup.addBrand}
                    </button>
                  </div>

                  {/* Brand Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {config.projectContext?.brandCoding?.brandList?.map((brand, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm"
                      >
                        {brand}
                        <button
                          type="button"
                          onClick={() => removeBrand(index)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {config.projectContext?.brandCoding?.brandList?.length === 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {locale === 'es' ? 'No hay marcas agregadas' : 'No brands added'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {config.projectContext?.brandCoding?.brandList?.length || 0} / 20 {locale === 'es' ? 'marcas' : 'brands'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.setup.category}
                  </label>
                  <select
                    value={config.projectContext?.brandCoding?.category || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        projectContext: {
                          ...config.projectContext!,
                          brandCoding: {
                            ...config.projectContext!.brandCoding!,
                            category: e.target.value as BrandCategory,
                          },
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t.setup.selectCategory}</option>
                    {Object.entries(BRAND_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {locale === 'es' ? value.es : value.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.setup.country}
                  </label>
                  <select
                    value={config.projectContext?.brandCoding?.country || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        projectContext: {
                          ...config.projectContext!,
                          brandCoding: {
                            ...config.projectContext!.brandCoding!,
                            country: e.target.value as Country,
                          },
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t.setup.selectCountry}</option>
                    {Object.entries(COUNTRIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {locale === 'es' ? value.es : value.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Study Type - only show for theme analysis */}
            {config.projectContext?.analysisType === 'theme_analysis' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.setup.studyType}
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(t.setup.studyTypes).map(([key, label]) => (
                    <label
                      key={key}
                      className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        config.projectContext?.studyType === key
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="studyType"
                        value={key}
                        checked={config.projectContext?.studyType === key}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            projectContext: {
                              ...config.projectContext!,
                              studyType: e.target.value as StudyType,
                            },
                          })
                        }
                        className="sr-only"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brand/Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.setup.brand}
              </label>
              <input
                type="text"
                required
                value={config.projectContext?.brand}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    projectContext: { ...config.projectContext!, brand: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={t.setup.brandPlaceholder}
              />
            </div>

            {/* Study Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.setup.objective}
              </label>
              <textarea
                required
                rows={3}
                value={config.projectContext?.objective}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    projectContext: { ...config.projectContext!, objective: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={t.setup.objectivePlaceholder}
              />
            </div>

            {/* Study Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.setup.studyPhase}
              </label>
              <select
                value={config.projectContext?.studyPhase}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    projectContext: {
                      ...config.projectContext!,
                      studyPhase: e.target.value as StudyPhase,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(t.setup.studyPhases).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {t.setup.advancedSettings}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {locale === 'es' ? 'Audiencia Objetivo (Opcional)' : 'Target Audience (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={config.projectContext?.targetAudience}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          projectContext: {
                            ...config.projectContext!,
                            targetAudience: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={locale === 'es' ? 'ej., Millennials, profesionales urbanos' : 'e.g., Millennials, urban professionals'}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.taxonomyPreferences?.useIndustryStandard}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            taxonomyPreferences: {
                              ...config.taxonomyPreferences!,
                              useIndustryStandard: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {locale === 'es'
                          ? 'Usar marcos de referencia estándar de la industria'
                          : 'Use industry-standard frameworks for categorization'}
                      </span>
                    </label>
                  </div>

                  {/* Human-in-the-Loop Toggle */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.projectContext?.enableManualValidation || false}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            projectContext: {
                              ...config.projectContext!,
                              enableManualValidation: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-300 block">
                          {t.setup.enableManualValidation}
                        </span>
                        <span className="text-xs text-blue-700 dark:text-blue-400 mt-1 block">
                          {t.setup.enableManualValidationDesc}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t.common.cancel}
              </Link>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t.common.continue} →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
