// Core types for the survey analysis platform

export type StudyType =
  | 'commercial_evaluation'
  | 'product_feedback'
  | 'concept_test'
  | 'brand_health'
  | 'ux_research'
  | 'customer_satisfaction'
  | 'custom';

export type StudyPhase =
  | 'exploratory'
  | 'validation'
  | 'optimization'
  | 'tracking';

export type QuestionType = 'REFERENCE' | 'OPINION';

export type AnalysisType = 'theme_analysis' | 'brand_coding';

export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

export type BrandCategory =
  | 'beverages_beer'
  | 'beverages_soft_drinks'
  | 'beverages_water'
  | 'food_dairy'
  | 'food_snacks'
  | 'food_packaged'
  | 'personal_care_skincare'
  | 'personal_care_haircare'
  | 'personal_care_oral'
  | 'automotive'
  | 'technology'
  | 'retail'
  | 'financial'
  | 'telecom'
  | 'other';

export type Country =
  | 'CO' | 'MX' | 'US' | 'BR' | 'AR' | 'CL' | 'PE' | 'EC'
  | 'VE' | 'UY' | 'PY' | 'BO' | 'CR' | 'PA' | 'GT' | 'HN'
  | 'SV' | 'NI' | 'DO' | 'PR' | 'ES' | 'global';

export interface BrandCodingConfig {
  enabled: boolean;
  brandList: string[];  // Up to 20 brands
  category?: BrandCategory;
  country?: Country;
}

export interface ProjectContext {
  studyType: StudyType;
  studyPhase: StudyPhase;
  analysisType: AnalysisType;
  brand: string;
  objective: string;
  targetAudience?: string;
  competitiveSet?: string[];
  brandCoding?: BrandCodingConfig;
  enableManualValidation?: boolean;  // Human-in-the-loop: validate codes before final analysis
}

export interface TaxonomyPreferences {
  useIndustryStandard: boolean;
  customDimensions?: string[];
  sentimentGranularity: '3-level' | '5-level';
}

export interface ProjectConfig {
  id?: string;
  name: string;
  projectContext: ProjectContext;
  taxonomyPreferences: TaxonomyPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Question {
  id: string;
  text: string;
  type?: QuestionType;
  columnIndex?: number;
}

export interface Answer {
  id: string;
  questionId: string;
  respondentId: string;
  text: string;
  originalText: string;
}

export interface Code {
  id: string;
  name: string;
  sentiment: Sentiment;
  count?: number;
  questionId: string;
}

export interface Net {
  id: string;
  name: string;
  description?: string;
  codes: Code[];
  questionId: string;
}

export interface ClassifiedAnswer {
  answerId: string;
  answer: string;
  nets: {
    net: string;
    codes: {
      code: string;
      sentiment: Sentiment;
    }[];
  }[];
}

export interface NetTemplate {
  net: string;
  description: string;
}

export const NET_TEMPLATES: Record<StudyType, NetTemplate[]> = {
  commercial_evaluation: [
    { net: 'Message & Communication', description: 'Clarity, understanding, information' },
    { net: 'Emotional Response', description: 'Feelings, reactions, engagement' },
    { net: 'Brand Perception', description: 'Brand fit, recall, credibility' },
    { net: 'Purchase Intent', description: 'Motivation, barriers, likelihood' },
    { net: 'Creative Execution', description: 'Visuals, music, characters, storytelling' }
  ],
  product_feedback: [
    { net: 'Functional Performance', description: 'Efficacy, quality, durability' },
    { net: 'Sensory Experience', description: 'Taste, smell, texture, appearance' },
    { net: 'Price & Value', description: 'Cost perception, value for money' },
    { net: 'Packaging & Presentation', description: 'Design, convenience, info' },
    { net: 'Usage & Context', description: 'Occasions, frequency, barriers' }
  ],
  concept_test: [
    { net: 'Relevance & Need', description: 'Personal relevance, solves a problem' },
    { net: 'Uniqueness', description: 'Differentiation, innovation, newness' },
    { net: 'Believability', description: 'Credibility, trust, feasibility' },
    { net: 'Appeal', description: 'Liking, interest, attraction' },
    { net: 'Purchase Intent', description: 'Willingness to buy, trial intent' }
  ],
  brand_health: [
    { net: 'Awareness & Familiarity', description: 'Knowledge, recognition, experience' },
    { net: 'Brand Image', description: 'Personality, attributes, associations' },
    { net: 'Brand Equity', description: 'Trust, quality perception, preference' },
    { net: 'Loyalty & Advocacy', description: 'Repeat purchase, recommendation' },
    { net: 'Competitive Position', description: 'Comparison, advantages, disadvantages' }
  ],
  ux_research: [
    { net: 'Usability', description: 'Ease of use, navigation, learning curve' },
    { net: 'Functionality', description: 'Features, capabilities, performance' },
    { net: 'Visual Design', description: 'Aesthetics, layout, clarity' },
    { net: 'User Satisfaction', description: 'Enjoyment, frustration, expectations' },
    { net: 'Pain Points', description: 'Issues, errors, barriers' }
  ],
  customer_satisfaction: [
    { net: 'Product/Service Quality', description: 'Performance, reliability, features' },
    { net: 'Customer Service', description: 'Support, responsiveness, helpfulness' },
    { net: 'Value for Money', description: 'Pricing, worth, affordability' },
    { net: 'Experience & Convenience', description: 'Process, ease, accessibility' },
    { net: 'Loyalty & Recommendation', description: 'Return intent, word-of-mouth' }
  ],
  custom: [
    { net: 'Theme 1', description: 'Custom theme 1' },
    { net: 'Theme 2', description: 'Custom theme 2' },
    { net: 'Theme 3', description: 'Custom theme 3' }
  ]
};
