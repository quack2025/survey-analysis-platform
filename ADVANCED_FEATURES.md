# Advanced Features & Improvements

Ideas para extender la plataforma con características avanzadas.

## 1. Base de Datos Persistente

### Por qué
Actualmente los datos se guardan en `localStorage`, lo que significa:
- Se pierden al limpiar el navegador
- No se comparten entre dispositivos
- No hay historial de proyectos

### Implementación con Vercel Postgres

```bash
npm install @vercel/postgres
```

```typescript
// lib/database/schema.sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  study_type VARCHAR(100) NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  text TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  column_index INTEGER
);

CREATE TABLE codes (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  name VARCHAR(255) NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  count INTEGER DEFAULT 0
);

CREATE TABLE nets (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE classified_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  answer TEXT NOT NULL,
  classifications JSONB NOT NULL,
  respondent_id VARCHAR(100)
);
```

### Beneficios
- ✅ Historial completo de análisis
- ✅ Búsqueda y filtrado de proyectos
- ✅ Exportar múltiples proyectos a la vez
- ✅ Comparar análisis entre periodos

## 2. Autenticación de Usuarios

### Con NextAuth.js

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Características
- Login con Google, GitHub, email
- Proyectos privados por usuario
- Compartir proyectos con equipo
- Control de acceso por rol

## 3. Validación Humana en el Loop

### Interfaz de Revisión de Códigos

Agregar una página intermedia después de extraer códigos:

```typescript
// app/validate-codes/page.tsx
export default function ValidateCodesPage() {
  return (
    <div>
      <h2>Revisa los códigos generados</h2>

      {/* Mostrar códigos con opciones para: */}
      {codes.map(code => (
        <CodeCard
          code={code}
          onEdit={handleEdit}
          onMerge={handleMerge}
          onDelete={handleDelete}
        />
      ))}

      {/* Detectar duplicados semánticos */}
      {potentialDuplicates.map(pair => (
        <DuplicateAlert
          code1={pair[0]}
          code2={pair[1]}
          onMerge={() => mergeCodes(pair)}
        />
      ))}

      {/* Agregar códigos manualmente */}
      <AddCodeButton onClick={handleAddCode} />
    </div>
  );
}
```

### Beneficios
- Mayor precisión en la categorización
- Conocimiento del dominio del usuario
- Refinamiento iterativo
- Confianza en los resultados

## 4. Visualizaciones Avanzadas

### Charts con Recharts

```bash
npm install recharts
```

```typescript
// components/analysis/SentimentChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function SentimentChart({ data }: { data: Net[] }) {
  const chartData = data.map(net => ({
    name: net.name,
    positive: net.codes.filter(c => c.sentiment === 'Positive').length,
    neutral: net.codes.filter(c => c.sentiment === 'Neutral').length,
    negative: net.codes.filter(c => c.sentiment === 'Negative').length,
  }));

  return (
    <BarChart width={600} height={300} data={chartData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="positive" fill="#10b981" />
      <Bar dataKey="neutral" fill="#6b7280" />
      <Bar dataKey="negative" fill="#ef4444" />
    </BarChart>
  );
}
```

### Word Clouds

```bash
npm install react-wordcloud
```

```typescript
// components/analysis/CodeCloud.tsx
import ReactWordcloud from 'react-wordcloud';

export function CodeCloud({ codes }: { codes: Code[] }) {
  const words = codes.map(code => ({
    text: code.name,
    value: code.count || 1,
  }));

  return <ReactWordcloud words={words} />;
}
```

### Características
- Gráficos de barras por sentimiento
- Word clouds de códigos frecuentes
- Gráficos de tendencias temporales
- Comparaciones entre segmentos

## 5. Procesamiento en Background

### Con Queue de Jobs

```bash
npm install bull
```

```typescript
// lib/queue/analysis-queue.ts
import Queue from 'bull';

export const analysisQueue = new Queue('analysis', process.env.REDIS_URL);

analysisQueue.process(async (job) => {
  const { surveyData } = job.data;

  // Procesar pregunta por pregunta
  for (const question of surveyData.questions) {
    await processQuestion(question);
    job.progress(calculateProgress());
  }

  return { status: 'completed' };
});
```

### API Route para Queue

```typescript
// app/api/analyze/route.ts
export async function POST(request: Request) {
  const surveyData = await request.json();

  // Agregar a queue
  const job = await analysisQueue.add(surveyData);

  return NextResponse.json({ jobId: job.id });
}

// Endpoint para verificar progreso
// GET /api/analyze/[jobId]
export async function GET(request: Request, { params }) {
  const job = await analysisQueue.getJob(params.jobId);
  return NextResponse.json({
    status: await job.getState(),
    progress: job.progress(),
  });
}
```

### Beneficios
- No bloquear el navegador
- Procesar múltiples proyectos en paralelo
- Reintentos automáticos si hay errores
- Mejor experiencia de usuario

## 6. Cache de Respuestas LLM

### Implementación Simple

```typescript
// lib/llm/cache.ts
import { createHash } from 'crypto';

const cache = new Map<string, string>();

function getCacheKey(systemPrompt: string, userPrompt: string): string {
  const content = systemPrompt + userPrompt;
  return createHash('sha256').update(content).digest('hex');
}

export async function callLLMWithCache(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.0,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const cacheKey = getCacheKey(systemPrompt, userPrompt);

  // Verificar cache
  if (cache.has(cacheKey)) {
    console.log('Cache hit!');
    return cache.get(cacheKey)!;
  }

  // Llamar a LLM
  const response = await callLLM(systemPrompt, userPrompt, temperature, model);

  // Guardar en cache
  cache.set(cacheKey, response);

  return response;
}
```

### Con Redis (producción)

```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function callLLMWithCache(...) {
  const cacheKey = getCacheKey(systemPrompt, userPrompt);

  // Intentar obtener de Redis
  const cached = await redis.get(cacheKey);
  if (cached) return cached as string;

  // Llamar a LLM
  const response = await callLLM(...);

  // Guardar con TTL de 7 días
  await redis.setex(cacheKey, 60 * 60 * 24 * 7, response);

  return response;
}
```

### Beneficios
- Ahorro de costos en OpenAI
- Respuestas más rápidas
- Menos dependencia de API externa

## 7. Soporte Multilenguaje

### Detección Automática

```typescript
// lib/utils/language-detection.ts
import { franc } from 'franc';

export function detectLanguage(text: string): string {
  const detected = franc(text);

  const languageMap: Record<string, string> = {
    'spa': 'es',
    'eng': 'en',
    'fra': 'fr',
    'por': 'pt',
  };

  return languageMap[detected] || 'en';
}
```

### Prompts Adaptados

```typescript
// En buildExtractCodesPrompt
const language = detectLanguage(answerList.join(' '));

const system = `
Categorize open-ended responses into concise codes with sentiment.

${language === 'es' ?
  'Los códigos deben estar en español.' :
  'Codes must be in English.'
}

Output codes in language locale: ${language}
...
`;
```

### Beneficios
- Análisis en cualquier idioma
- Sin configuración manual
- Mejores resultados con idioma nativo

## 8. Exportación Avanzada

### Múltiples Formatos

```typescript
// lib/export/formats.ts
export function exportToExcel(results: AnalysisResults) {
  const workbook = XLSX.utils.book_new();

  // Hoja de resumen
  const summarySheet = XLSX.utils.json_to_sheet([
    { Project: results.projectConfig.name, ... }
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Hoja por pregunta
  results.questions.forEach((q, i) => {
    const sheet = XLSX.utils.json_to_sheet(formatQuestionData(q));
    XLSX.utils.book_append_sheet(workbook, sheet, `Q${i+1}`);
  });

  return XLSX.write(workbook, { type: 'buffer' });
}

export function exportToPowerPoint(results: AnalysisResults) {
  // Usar pptxgenjs para crear presentación
}

export function exportToSPSS(results: AnalysisResults) {
  // Formato .sav para análisis estadístico
}
```

### Dashboard de Exportación

```typescript
<ExportMenu>
  <ExportOption format="csv" onClick={exportCSV} />
  <ExportOption format="excel" onClick={exportExcel} />
  <ExportOption format="powerpoint" onClick={exportPPT} />
  <ExportOption format="spss" onClick={exportSPSS} />
  <ExportOption format="json" onClick={exportJSON} />
</ExportMenu>
```

## 9. Análisis Comparativo

### Comparar entre Segmentos

```typescript
// app/compare/page.tsx
export default function ComparePage() {
  return (
    <div>
      <h2>Comparar Análisis</h2>

      {/* Seleccionar proyectos o segmentos */}
      <ProjectSelector
        onSelect={handleSelectProjects}
        multiSelect
      />

      {/* Mostrar comparación lado a lado */}
      <ComparisonView>
        <SegmentColumn segment={segmentA} />
        <SegmentColumn segment={segmentB} />
      </ComparisonView>

      {/* Destacar diferencias */}
      <DifferenceHighlights
        segment1={segmentA}
        segment2={segmentB}
      />
    </div>
  );
}
```

### Características
- Comparar diferentes periodos (Pre vs Post)
- Comparar segmentos demográficos
- Comparar marcas competidoras
- Identificar diferencias significativas

## 10. IA Generativa para Insights

### Generación Automática de Insights

```typescript
// app/api/generate-insights/route.ts
export async function POST(request: Request) {
  const { analysisResults } = await request.json();

  const prompt = `
Based on this survey analysis, generate 5 key insights:

Study: ${analysisResults.projectConfig.objective}

Results:
${formatResultsForLLM(analysisResults)}

Provide:
1. Top finding (most mentioned theme)
2. Sentiment summary
3. Surprising insight
4. Actionable recommendation
5. Area for deeper investigation
  `;

  const insights = await callLLM(insightsSystemPrompt, prompt);

  return NextResponse.json({ insights });
}
```

### Recomendaciones Automáticas

```typescript
// Generar recomendaciones de negocio
const recommendations = await generateRecommendations({
  studyType: 'commercial_evaluation',
  results: analysisResults,
  context: projectContext,
});

// Ejemplo de salida:
// "Based on the analysis, consider:
//  1. Emphasize 'clarity' in messaging (mentioned 45 times positively)
//  2. Address 'confusion' about pricing (mentioned 23 times negatively)
//  3. Leverage emotional connection (highest positive sentiment net)"
```

## Prioridades de Implementación

### Fase 1: Fundamentos (Semanas 1-2)
1. ✅ Base de datos persistente
2. ✅ Autenticación de usuarios
3. ✅ Mejores visualizaciones

### Fase 2: UX Mejorada (Semanas 3-4)
4. ✅ Validación humana de códigos
5. ✅ Procesamiento en background
6. ✅ Cache de LLM

### Fase 3: Análisis Avanzado (Semanas 5-6)
7. ✅ Soporte multilenguaje
8. ✅ Exportación avanzada
9. ✅ Análisis comparativo

### Fase 4: IA Avanzada (Semanas 7-8)
10. ✅ Generación automática de insights
11. ✅ Recomendaciones accionables

## Conclusión

Estas mejoras transformarían la plataforma de una herramienta de análisis básica a una **suite completa de investigación de mercado** con capacidades enterprise.

La inversión en estas características depende de:
- Volumen de uso esperado
- Presupuesto disponible
- Tiempo de desarrollo
- Necesidades específicas del negocio

¿Cuál de estas características te interesa implementar primero?
