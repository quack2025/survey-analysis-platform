# API Examples - Uso Directo de las APIs

Si quieres integrar la funcionalidad de análisis en tu propia aplicación, puedes llamar directamente a las APIs.

## Endpoints Disponibles

Base URL (desarrollo): `http://localhost:3000/api`
Base URL (producción): `https://tu-dominio.vercel.app/api`

### 1. Clasificar Preguntas

**POST** `/api/classify-questions`

Clasifica preguntas como REFERENCE (hechos) o OPINION (subjetivas).

```bash
curl -X POST http://localhost:3000/api/classify-questions \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      "What brands come to mind when you think of energy drinks?",
      "What did you think of the commercial?"
    ],
    "projectContext": {
      "studyType": "commercial_evaluation",
      "studyPhase": "exploratory",
      "brand": "Red Bull",
      "objective": "Evaluate ad effectiveness",
      "targetAudience": "Young adults 18-25"
    }
  }'
```

**Respuesta:**
```json
{
  "results": [
    {
      "question": "What brands come to mind when you think of energy drinks?",
      "type": "REFERENCE"
    },
    {
      "question": "What did you think of the commercial?",
      "type": "OPINION"
    }
  ]
}
```

### 2. Extraer Códigos

**POST** `/api/extract-codes`

Extrae temas (códigos) con sentimiento de respuestas abiertas.

```bash
curl -X POST http://localhost:3000/api/extract-codes \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      "I loved the music and visuals",
      "The message was confusing",
      "Very engaging and memorable",
      "Too long and boring"
    ],
    "questionTitle": "What did you think of the commercial?",
    "projectLanguage": "en",
    "projectContext": {
      "studyType": "commercial_evaluation",
      "studyPhase": "exploratory",
      "brand": "Red Bull",
      "objective": "Evaluate ad effectiveness"
    }
  }'
```

**Respuesta:**
```json
{
  "codes": [
    { "name": "Engaging", "sentiment": "Positive" },
    { "name": "Confusing message", "sentiment": "Negative" },
    { "name": "Music and visuals", "sentiment": "Positive" },
    { "name": "Too long", "sentiment": "Negative" },
    { "name": "Memorable", "sentiment": "Positive" },
    { "name": "Boring", "sentiment": "Negative" }
  ]
}
```

### 3. Normalizar Códigos

**POST** `/api/normalize-codes`

Elimina duplicados semánticos y reduce a los códigos más importantes.

```bash
curl -X POST http://localhost:3000/api/normalize-codes \
  -H "Content-Type: application/json" \
  -d '{
    "codes": [
      { "name": "Engaging", "sentiment": "Positive" },
      { "name": "Confusing message", "sentiment": "Negative" },
      { "name": "Confusing", "sentiment": "Negative" },
      { "name": "Music", "sentiment": "Positive" },
      { "name": "Great music", "sentiment": "Positive" },
      { "name": "Boring", "sentiment": "Negative" }
    ],
    "questionTitle": "What did you think of the commercial?"
  }'
```

**Respuesta:**
```json
{
  "codes": [
    { "name": "Engaging", "sentiment": "Positive" },
    { "name": "Confusing", "sentiment": "Negative" },
    { "name": "Music", "sentiment": "Positive" },
    { "name": "Boring", "sentiment": "Negative" }
  ]
}
```

### 4. Generar Nets

**POST** `/api/generate-nets`

Agrupa códigos en categorías temáticas (nets) usando frameworks de industria.

```bash
curl -X POST http://localhost:3000/api/generate-nets \
  -H "Content-Type: application/json" \
  -d '{
    "codes": [
      { "name": "Engaging", "sentiment": "Positive" },
      { "name": "Confusing", "sentiment": "Negative" },
      { "name": "Music", "sentiment": "Positive" },
      { "name": "Boring", "sentiment": "Negative" },
      { "name": "Memorable", "sentiment": "Positive" },
      { "name": "Clear message", "sentiment": "Positive" }
    ],
    "questionTitle": "What did you think of the commercial?",
    "projectLanguage": "en",
    "projectContext": {
      "studyType": "commercial_evaluation",
      "studyPhase": "exploratory",
      "brand": "Red Bull",
      "objective": "Evaluate ad effectiveness"
    }
  }'
```

**Respuesta:**
```json
{
  "nets": [
    {
      "net": "Message & Communication",
      "codes": [
        { "code": "Clear message", "sentiment": "Positive" },
        { "code": "Confusing", "sentiment": "Negative" }
      ]
    },
    {
      "net": "Emotional Response",
      "codes": [
        { "code": "Engaging", "sentiment": "Positive" },
        { "code": "Boring", "sentiment": "Negative" },
        { "code": "Memorable", "sentiment": "Positive" }
      ]
    },
    {
      "net": "Creative Execution",
      "codes": [
        { "code": "Music", "sentiment": "Positive" }
      ]
    },
    {
      "net": "Uncategorized",
      "codes": [
        { "code": "Uncategorized", "sentiment": "Neutral" }
      ]
    }
  ]
}
```

### 5. Clasificar Respuestas

**POST** `/api/classify-answers`

Clasifica cada respuesta individual asignándola a nets y códigos.

```bash
curl -X POST http://localhost:3000/api/classify-answers \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      "I loved the music and visuals. Very engaging!",
      "The message was confusing but memorable.",
      "Too long and boring. Lost interest."
    ],
    "nets": [
      {
        "net": "Message & Communication",
        "codes": [
          { "code": "Clear message", "sentiment": "Positive" },
          { "code": "Confusing", "sentiment": "Negative" }
        ]
      },
      {
        "net": "Emotional Response",
        "codes": [
          { "code": "Engaging", "sentiment": "Positive" },
          { "code": "Boring", "sentiment": "Negative" },
          { "code": "Memorable", "sentiment": "Positive" }
        ]
      },
      {
        "net": "Creative Execution",
        "codes": [
          { "code": "Music and visuals", "sentiment": "Positive" }
        ]
      }
    ],
    "questionTitle": "What did you think of the commercial?"
  }'
```

**Respuesta:**
```json
{
  "classifiedAnswers": [
    {
      "answer": "I loved the music and visuals. Very engaging!",
      "nets": [
        {
          "net": "Creative Execution",
          "codes": [
            { "code": "Music and visuals", "sentiment": "Positive" }
          ]
        },
        {
          "net": "Emotional Response",
          "codes": [
            { "code": "Engaging", "sentiment": "Positive" }
          ]
        }
      ]
    },
    {
      "answer": "The message was confusing but memorable.",
      "nets": [
        {
          "net": "Message & Communication",
          "codes": [
            { "code": "Confusing", "sentiment": "Negative" }
          ]
        },
        {
          "net": "Emotional Response",
          "codes": [
            { "code": "Memorable", "sentiment": "Positive" }
          ]
        }
      ]
    },
    {
      "answer": "Too long and boring. Lost interest.",
      "nets": [
        {
          "net": "Emotional Response",
          "codes": [
            { "code": "Boring", "sentiment": "Negative" }
          ]
        }
      ]
    }
  ]
}
```

## Pipeline Completo

Para analizar una pregunta completa de principio a fin:

```javascript
// 1. Clasificar tipo de pregunta
const classifyResponse = await fetch('/api/classify-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questions: [questionText],
    projectContext: projectContext,
  }),
});
const { results } = await classifyResponse.json();
const questionType = results[0].type;

if (questionType === 'OPINION') {
  // 2. Extraer códigos
  const extractResponse = await fetch('/api/extract-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: answerTexts,
      questionTitle: questionText,
      projectLanguage: 'en',
      projectContext: projectContext,
    }),
  });
  const { codes } = await extractResponse.json();

  // 3. Normalizar códigos
  const normalizeResponse = await fetch('/api/normalize-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codes: codes,
      questionTitle: questionText,
    }),
  });
  const { codes: normalizedCodes } = await normalizeResponse.json();

  // 4. Generar nets
  const netsResponse = await fetch('/api/generate-nets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codes: normalizedCodes,
      questionTitle: questionText,
      projectLanguage: 'en',
      projectContext: projectContext,
    }),
  });
  const { nets } = await netsResponse.json();

  // 5. Clasificar respuestas
  const classifyAnswersResponse = await fetch('/api/classify-answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: answerTexts,
      nets: nets,
      questionTitle: questionText,
    }),
  });
  const { classifiedAnswers } = await classifyAnswersResponse.json();

  console.log('Analysis complete!', {
    questionType,
    nets,
    classifiedAnswers,
  });
}
```

## Ejemplo en Python

```python
import requests
import json

BASE_URL = "http://localhost:3000/api"

def analyze_survey_question(
    question_text: str,
    answers: list[str],
    project_context: dict
) -> dict:
    """Analiza una pregunta de encuesta completa."""

    # 1. Clasificar pregunta
    classify_response = requests.post(
        f"{BASE_URL}/classify-questions",
        json={
            "questions": [question_text],
            "projectContext": project_context,
        }
    )
    question_type = classify_response.json()["results"][0]["type"]

    if question_type == "REFERENCE":
        return {
            "questionType": "REFERENCE",
            "answers": answers,
        }

    # 2. Extraer códigos
    extract_response = requests.post(
        f"{BASE_URL}/extract-codes",
        json={
            "answers": answers,
            "questionTitle": question_text,
            "projectLanguage": "en",
            "projectContext": project_context,
        }
    )
    codes = extract_response.json()["codes"]

    # 3. Normalizar códigos
    normalize_response = requests.post(
        f"{BASE_URL}/normalize-codes",
        json={
            "codes": codes,
            "questionTitle": question_text,
        }
    )
    normalized_codes = normalize_response.json()["codes"]

    # 4. Generar nets
    nets_response = requests.post(
        f"{BASE_URL}/generate-nets",
        json={
            "codes": normalized_codes,
            "questionTitle": question_text,
            "projectLanguage": "en",
            "projectContext": project_context,
        }
    )
    nets = nets_response.json()["nets"]

    # 5. Clasificar respuestas
    classify_response = requests.post(
        f"{BASE_URL}/classify-answers",
        json={
            "answers": answers,
            "nets": nets,
            "questionTitle": question_text,
        }
    )
    classified_answers = classify_response.json()["classifiedAnswers"]

    return {
        "questionType": "OPINION",
        "nets": nets,
        "classifiedAnswers": classified_answers,
    }

# Ejemplo de uso
if __name__ == "__main__":
    project_context = {
        "studyType": "commercial_evaluation",
        "studyPhase": "exploratory",
        "brand": "Nike",
        "objective": "Evaluate new commercial effectiveness",
    }

    question = "What did you think of the commercial?"
    answers = [
        "I loved the music and visuals",
        "Very inspiring and motivational",
        "The message was confusing",
        "Great storytelling and emotional",
    ]

    result = analyze_survey_question(question, answers, project_context)
    print(json.dumps(result, indent=2))
```

## Rate Limiting & Consideraciones

### En Desarrollo
- Sin límites de rate
- Todas las llamadas son síncronas

### Para Producción
Se recomienda implementar:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests por minuto
});

export async function middleware(request: Request) {
  const ip = request.headers.get("x-forwarded-for");
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return NextResponse.next();
}
```

### Costos por Llamada
- **classify-questions**: ~$0.001 por pregunta
- **extract-codes**: ~$0.01-0.03 por pregunta (depende del # de respuestas)
- **normalize-codes**: ~$0.001 por pregunta
- **generate-nets**: ~$0.002 por pregunta
- **classify-answers**: ~$0.02-0.10 por pregunta (depende del # de respuestas)

**Total por pregunta OPINION**: ~$0.03-0.15 USD

## Integración con Otras Herramientas

### Google Sheets

```javascript
// Google Apps Script
function analyzeSurveyData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const headers = data[0];
  const questionIndex = headers.indexOf('Question');
  const answerIndex = headers.indexOf('Answer');

  const answers = data.slice(1).map(row => row[answerIndex]);

  const response = UrlFetchApp.fetch('YOUR_VERCEL_URL/api/extract-codes', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      answers: answers,
      questionTitle: data[1][questionIndex],
      projectLanguage: 'en',
    }),
  });

  const result = JSON.parse(response.getContentText());
  // Escribir resultados de vuelta a la hoja
}
```

### Zapier / Make.com

Puedes crear workflows que:
1. Detecten nuevas respuestas en Typeform/Google Forms
2. Llamen a tus APIs de análisis
3. Guarden resultados en Airtable/Notion

### Slack Bot

```javascript
// Slack command: /analyze-feedback
app.command('/analyze-feedback', async ({ command, ack, respond }) => {
  await ack();

  const feedback = await getFeedbackFromDatabase();

  const result = await fetch('YOUR_API/api/extract-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: feedback,
      questionTitle: 'Customer Feedback',
      projectLanguage: 'en',
    }),
  });

  const { codes } = await result.json();

  await respond({
    text: `Top themes: ${codes.map(c => c.name).join(', ')}`,
  });
});
```

## Autenticación (Opcional)

Para proteger tus APIs en producción:

```typescript
// middleware.ts
export async function middleware(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.substring(7);

  // Verificar token
  if (token !== process.env.API_SECRET) {
    return new Response('Invalid token', { status: 403 });
  }

  return NextResponse.next();
}
```

Luego en tus llamadas:

```bash
curl -X POST http://localhost:3000/api/extract-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -d '{ ... }'
```

## Testing con Postman

Importa esta colección:

```json
{
  "info": { "name": "Survey Analysis API" },
  "item": [
    {
      "name": "Classify Questions",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/classify-questions",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"questions\": [\"What brands come to mind?\"],\n  \"projectContext\": {...}\n}"
        }
      }
    }
    // ... más endpoints
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" }
  ]
}
```

---

¿Necesitas ejemplos para algún caso de uso específico?
