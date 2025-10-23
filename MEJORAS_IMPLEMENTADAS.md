# Mejoras Implementadas y Pendientes

## ✅ Completado

### 1. Detección Automática de Idioma
- **Instalado**: `franc-min` para detección de idioma
- **Archivo**: `lib/utils/language.ts`
- **Función**: Detecta automáticamente si las respuestas están en español, inglés u otros idiomas
- **Uso**: Se aplicará automáticamente al analizar respuestas

### 2. Página de Validación Humana (Human-in-the-Loop)
- **Archivo**: `app/validate-codes/page.tsx`
- **Funcionalidades**:
  - ✅ Ver todos los códigos extraídos por la IA
  - ✅ Editar nombre de códigos (click para editar)
  - ✅ Cambiar sentimiento (Positivo/Neutral/Negativo)
  - ✅ Fusionar códigos similares (seleccionar múltiples + botón Fusionar)
  - ✅ Dividir códigos compuestos (botón Dividir)
  - ✅ Eliminar códigos irrelevantes (botón X)
  - ✅ Agregar códigos manualmente (botón + Agregar Código)

## 🔧 Cambios Necesarios en el Flujo

### Flujo Actual (Problemático)
```
Setup → Upload → Review (procesa todo) → Results
```

### Nuevo Flujo (Mejorado)
```
Setup → Upload → Validate Codes → Review (procesa) → Results
                      ↑
                Human validation aquí
```

### Cambios Requeridos

#### 1. Modificar `app/review/page.tsx`
**Línea ~72-81**: Después de clasificar la pregunta y ANTES de extraer todos los códigos:

```typescript
// NUEVO: Solo extraer códigos inicialmente para la primera pregunta
// Luego enviar al usuario a /validate-codes

if (questionIndex === 0) {
  // Detectar idioma
  const language = detectLanguage(answerTexts.join(' '));

  // Extraer códigos
  const extractRes = await fetch('/api/extract-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: answerTexts,
      questionTitle: question.text,
      projectLanguage: language,
      projectContext: surveyData.projectConfig.projectContext,
    }),
  });
  const extractData = await extractRes.json();

  // Guardar para validación humana
  localStorage.setItem('extractedCodes', JSON.stringify({
    questionText: question.text,
    codes: extractData.codes,
    language: language,
  }));

  // Redirigir a validación
  router.push('/validate-codes');
  return;
}

// CONTINUAR: Después de la validación, usar códigos validados
const validatedCodesData = localStorage.getItem('validatedCodes');
if (validatedCodesData) {
  const { codes: validatedCodes } = JSON.parse(validatedCodesData);
  // Usar validatedCodes en lugar de extractData.codes
}
```

#### 2. Actualizar Prompts para Español
**Archivo**: `lib/llm/prompts.ts`

Todos los prompts deben adaptar el idioma de salida:

```typescript
export function buildExtractCodesPrompt(
  answerList: string[],
  questionTitle: string,
  projectLanguage: string = 'es',  // ← CAMBIAR DEFAULT A 'es'
  context?: ProjectContext
): { system: string; user: string } {

  const languageInstructions = projectLanguage === 'es'
    ? 'Los códigos deben estar en ESPAÑOL. Usa acentos correctos.'
    : 'Codes must be in ENGLISH.';

  const system = `Categorize open-ended responses into concise codes with sentiment.

${languageInstructions}

## Language and Style
- **Output codes in language locale:** ${projectLanguage}
- **Code format**: Natural phrases, first word capitalized
- **Proper spelling/accents** for target language

...resto del prompt
`;
}
```

**Hacer lo mismo para**:
- `buildGenerateNetsPrompt` - nets en español
- `buildClassifyAnswersPrompt` - clasificaciones en español

#### 3. Templates de Nets en Español
**Archivo**: `types/index.ts`

```typescript
export const NET_TEMPLATES: Record<StudyType, NetTemplate[]> = {
  commercial_evaluation: [
    { net: 'Mensaje y Comunicación', description: 'Claridad, comprensión, información' },
    { net: 'Respuesta Emocional', description: 'Sentimientos, reacciones, engagement' },
    { net: 'Percepción de Marca', description: 'Ajuste de marca, recordación, credibilidad' },
    { net: 'Intención de Compra', description: 'Motivación, barreras, probabilidad' },
    { net: 'Ejecución Creativa', description: 'Visuales, música, personajes, storytelling' }
  ],
  product_feedback: [
    { net: 'Rendimiento Funcional', description: 'Eficacia, calidad, durabilidad' },
    { net: 'Experiencia Sensorial', description: 'Sabor, olor, textura, apariencia' },
    { net: 'Precio y Valor', description: 'Percepción de costo, relación precio-valor' },
    { net: 'Empaque y Presentación', description: 'Diseño, conveniencia, información' },
    { net: 'Uso y Contexto', description: 'Ocasiones, frecuencia, barreras' }
  ],
  // ... etc para todos los tipos
};
```

## 🐛 Correcciones de Bugs

### 1. Sentimientos Inconsistentes
**Problema**: Mismo código aparece a veces con sentimiento, a veces sin él
**Solución**:

```typescript
// En lib/llm/prompts.ts - buildExtractCodesPrompt
const system = `...

## Rules
- **CRÍTICO**: TODOS los códigos DEBEN tener un sentimiento asignado
- No dejes el campo sentiment vacío NUNCA
- Si no estás seguro, usa "Neutral"
- Formato OBLIGATORIO: { "name": "...", "sentiment": "Positive|Neutral|Negative" }

...`;
```

### 2. Multi-label para Respuestas Complejas
**Problema**: Respuestas con múltiples temas solo se clasifican en un código
**Solución**:

```typescript
// En lib/llm/prompts.ts - buildClassifyAnswersPrompt
const system = `...

## Rules
- Asigna **TODOS** los nets/códigos que la respuesta **mencione claramente**
- Una respuesta puede tener 1-5 códigos diferentes
- Prioriza exhaustividad sobre simplicidad
- Ejemplo: "Me encanta el sabor y me recuerda a mi niñez" →
  * Product Attributes / Flavor preference / Positive
  * Brand Connection / Childhood nostalgia / Positive

...`;
```

### 3. Formato CSV Correcto
**Problema**: Códigos múltiples mal formateados en CSV

**Archivo**: `app/results/page.tsx` - función `exportToCSV`:

```typescript
const exportToCSV = () => {
  if (!results) return;

  const question = results.questions[selectedQuestion];
  if (question.type === 'OPINION') {
    const rows = [
      ['Answer', 'Nets', 'Codes', 'Sentiments'].join(','),
      ...question.classifiedAnswers!.map((ca) => {
        const netsStr = ca.nets.map((n: any) => n.net).join(' | ');
        const codesStr = ca.nets
          .flatMap((n: any) => n.codes.map((c: any) => c.code))
          .join(' | ');  // ← Usar " | " en lugar de ";"
        const sentimentsStr = ca.nets
          .flatMap((n: any) => n.codes.map((c: any) => c.sentiment))
          .join(' | ');  // ← Usar " | " en lugar de ";"
        return [`"${ca.answer.replace(/"/g, '""')}"`, `"${netsStr}"`, `"${codesStr}"`, `"${sentimentsStr}"`].join(',');
      }),
    ];
    const csv = rows.join('\n');
    downloadCSV(csv, `${sanitizeFilename(question.text)}_analysis.csv`);
  }
};
```

## 📊 Nets Adicionales Sugeridos

Para tu caso de "sabor a lechera", estos nets mejorarían el análisis:

```typescript
product_feedback: [
  { net: 'Atributos del Producto', description: 'Sabor, calidad, características' },
  { net: 'Conexión Emocional', description: 'Sentimientos, afecto, pasión por el producto' },
  { net: 'Nostalgia', description: 'Recuerdos de infancia, tradición familiar' },  // ← NUEVO
  { net: 'Expectativas', description: 'Lo que esperan del producto, anticipación' },  // ← NUEVO
  { net: 'Combinaciones', description: 'Cómo combinarlo, ocasiones de uso' },  // ← NUEVO
  { net: 'Precio y Valor', description: 'Percepción de costo, relación precio-valor' },
],
```

## 🚀 Pasos para Implementar

### Inmediato (15 minutos)
1. ✅ Instalar franc-min (YA HECHO)
2. ✅ Crear `lib/utils/language.ts` (YA HECHO)
3. ✅ Crear `app/validate-codes/page.tsx` (YA HECHO)

### Prioridad Alta (30 minutos)
4. Modificar prompts para español por defecto
5. Actualizar NET_TEMPLATES a español
6. Integrar detección de idioma en review.tsx
7. Agregar redirección a `/validate-codes` después de extraer códigos

### Prioridad Media (20 minutos)
8. Corregir formato CSV en results.tsx
9. Mejorar prompt de multi-label
10. Forzar sentimientos obligatorios en prompts

### Opcional (10 minutos)
11. Agregar nets adicionales (Nostalgia, Expectativas, Combinaciones)
12. Agregar filtro de respuestas vacías/inútiles

## 📝 Testing

Después de implementar, probar con:
1. El mismo archivo Excel que usaste
2. Verificar que:
   - ✅ Códigos están en español
   - ✅ Nets están en español
   - ✅ TODOS los códigos tienen sentimiento
   - ✅ Respuestas complejas tienen múltiples códigos
   - ✅ CSV se exporta correctamente con delimitador "|"
   - ✅ Página de validación permite editar/fusionar/dividir códigos

## 🎯 Resultado Esperado

**CSV Mejorado**:
```csv
Answer,Nets,Codes,Sentiments
"porque siempre me a gustado el sabor de la lechera","Atributos del Producto | Conexión Emocional","Preferencia de sabor | Lealtad a la marca","Positive | Positive"
"me traslada a mi niñez","Nostalgia | Conexión Emocional","Recuerdos de infancia | Vínculo afectivo","Positive | Positive"
```

¿Quieres que implemente estos cambios ahora o prefieres hacerlo tú siguiendo esta guía?
