import { BrandCategory, Country } from '@/types';

export const BRAND_CATEGORIES: Record<BrandCategory, { en: string; es: string }> = {
  beverages_beer: {
    en: 'Beverages - Beer',
    es: 'Bebidas - Cerveza',
  },
  beverages_soft_drinks: {
    en: 'Beverages - Soft Drinks',
    es: 'Bebidas - Refrescos',
  },
  beverages_water: {
    en: 'Beverages - Water',
    es: 'Bebidas - Agua',
  },
  food_dairy: {
    en: 'Food - Dairy',
    es: 'Alimentos - Lácteos',
  },
  food_snacks: {
    en: 'Food - Snacks',
    es: 'Alimentos - Snacks',
  },
  food_packaged: {
    en: 'Food - Packaged Foods',
    es: 'Alimentos - Empacados',
  },
  personal_care_skincare: {
    en: 'Personal Care - Skincare',
    es: 'Cuidado Personal - Cuidado de Piel',
  },
  personal_care_haircare: {
    en: 'Personal Care - Haircare',
    es: 'Cuidado Personal - Cuidado del Cabello',
  },
  personal_care_oral: {
    en: 'Personal Care - Oral Care',
    es: 'Cuidado Personal - Cuidado Oral',
  },
  automotive: {
    en: 'Automotive',
    es: 'Automotriz',
  },
  technology: {
    en: 'Technology',
    es: 'Tecnología',
  },
  retail: {
    en: 'Retail',
    es: 'Retail',
  },
  financial: {
    en: 'Financial Services',
    es: 'Servicios Financieros',
  },
  telecom: {
    en: 'Telecommunications',
    es: 'Telecomunicaciones',
  },
  other: {
    en: 'Other',
    es: 'Otro',
  },
};

export const COUNTRIES: Record<Country, { en: string; es: string }> = {
  CO: { en: 'Colombia', es: 'Colombia' },
  MX: { en: 'Mexico', es: 'México' },
  US: { en: 'United States', es: 'Estados Unidos' },
  BR: { en: 'Brazil', es: 'Brasil' },
  AR: { en: 'Argentina', es: 'Argentina' },
  CL: { en: 'Chile', es: 'Chile' },
  PE: { en: 'Peru', es: 'Perú' },
  EC: { en: 'Ecuador', es: 'Ecuador' },
  VE: { en: 'Venezuela', es: 'Venezuela' },
  UY: { en: 'Uruguay', es: 'Uruguay' },
  PY: { en: 'Paraguay', es: 'Paraguay' },
  BO: { en: 'Bolivia', es: 'Bolivia' },
  CR: { en: 'Costa Rica', es: 'Costa Rica' },
  PA: { en: 'Panama', es: 'Panamá' },
  GT: { en: 'Guatemala', es: 'Guatemala' },
  HN: { en: 'Honduras', es: 'Honduras' },
  SV: { en: 'El Salvador', es: 'El Salvador' },
  NI: { en: 'Nicaragua', es: 'Nicaragua' },
  DO: { en: 'Dominican Republic', es: 'República Dominicana' },
  PR: { en: 'Puerto Rico', es: 'Puerto Rico' },
  ES: { en: 'Spain', es: 'España' },
  global: { en: 'Global/Multiple Countries', es: 'Global/Múltiples Países' },
};
