# Survey Analysis Platform

An AI-powered platform for analyzing open-ended survey responses with automatic categorization, sentiment analysis, and thematic grouping.

## Features

- **Contextual Analysis**: Configure your project with study type, brand, and objectives
- **Smart Question Classification**: Automatically distinguishes between REFERENCE and OPINION questions
- **AI-Powered Coding**: Extracts themes (codes) from responses and groups them into higher-level categories (nets)
- **Sentiment Analysis**: Tags each code with sentiment (Positive, Neutral, Negative)
- **Industry Frameworks**: Uses standard frameworks based on study type (commercial evaluation, product feedback, etc.)
- **Advanced Export System**: 5 different export formats including SPSS/R/Python-ready pivot format with respondent-level data
- **Human-in-the-Loop**: Validate and edit AI-generated codes before final analysis
- **Multi-format Support**: Upload CSV or Excel files

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude Sonnet 4 (May 2025)
- **File Processing**: PapaParse (CSV), XLSX (Excel)
- **Language Detection**: franc-min
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com))

### Installation

1. Clone or navigate to the project directory:
```bash
cd survey-analysis-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your_actual_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Step 1: Configure Project
- Select your study type (commercial evaluation, product feedback, etc.)
- Enter brand/product name and study objective
- Optionally configure advanced settings

### Step 2: Upload Data
- Upload CSV or Excel file with survey responses
- Select respondent ID column
- Choose which questions to analyze

### Step 3: Review & Process
- Review selected questions
- Click "Start Analysis" to begin AI processing
- Wait for the analysis to complete (may take a few minutes)

### Step 4: View & Export Results
- Browse results by question
- View thematic nets and codes with sentiment
- See sample classified responses
- **Export in 5 formats:**
  - Detailed CSV (one row per code assignment)
  - Pivot CSV (SPSS/R/Python ready with 0/1 columns)
  - Summary CSV (aggregated with sentiment counts)
  - SPSS Syntax (auto-generated variable labels)
  - Simple CSV (legacy format)

## Data Format

Your survey data should be in CSV or Excel format with:
- One column for respondent ID
- One column per question
- One row per respondent

Example:
```csv
RespondentID,Q1_Brand_Recall,Q2_Commercial_Feedback,Q3_Purchase_Intent
001,Coca-Cola,"I loved the music and visuals",Very likely
002,Pepsi,"Confusing message but memorable",Somewhat likely
```

## API Endpoints

- `POST /api/classify-questions` - Classifies questions as REFERENCE or OPINION
- `POST /api/extract-codes` - Extracts codes from answers
- `POST /api/normalize-codes` - Normalizes and deduplicates codes
- `POST /api/generate-nets` - Groups codes into thematic nets
- `POST /api/classify-answers` - Classifies individual answers

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import the project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository

3. Configure environment variables:
   - Add `ANTHROPIC_API_KEY` in Vercel project settings

4. Deploy!

## Project Structure

```
survey-analysis-platform/
├── app/
│   ├── api/              # API routes for LLM processing
│   ├── setup/            # Step 1: Project configuration
│   ├── upload/           # Step 2: Data upload
│   ├── review/           # Step 3: Analysis processing
│   ├── results/          # Step 4: Results dashboard
│   ├── validate-codes/   # Human-in-the-loop validation
│   └── page.tsx          # Home page
├── components/
│   └── export/           # Export menu component
├── lib/
│   ├── llm/              # Claude client and prompt builders
│   └── utils/            # Export utilities and helpers
├── types/
│   └── index.ts          # TypeScript type definitions
└── README.md
```

## Customization

### Adding New Study Types

Edit `types/index.ts` to add new study types and their corresponding net templates:

```typescript
export const NET_TEMPLATES: Record<StudyType, NetTemplate[]> = {
  your_new_type: [
    { net: 'Theme 1', description: 'Description' },
    { net: 'Theme 2', description: 'Description' },
    // ...
  ]
}
```

### Changing AI Models

Edit `lib/llm/client.ts` to use different Claude models:

```typescript
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.0,
  model: string = 'claude-sonnet-4-20250514'  // Change model here
)
```

Available models:
- `claude-sonnet-4-20250514` - Recommended (best balance)
- `claude-3-7-sonnet-20250219` - More recent and powerful
- `claude-3-opus-20240229` - Most intelligent but expensive
- `claude-3-haiku-20240307` - Fastest and cheapest

## Cost Estimation

Using Claude Sonnet 4 (default):
- ~$0.15-0.50 per question with 100-500 responses
- Similar to GPT-4o but with better quality for text analysis
- Exact cost depends on response length and complexity

## Limitations

- Maximum 10MB file upload size
- Processing time increases with response count
- Requires internet connection for API calls
- English language optimized (multilingual support available)

## Recent Improvements

- [x] **Advanced Export System** - 5 export formats with respondent-level data
- [x] **Human-in-the-Loop** - Validate and edit codes before final analysis
- [x] **Claude Migration** - Switched from OpenAI to Anthropic Claude for better text analysis
- [x] **Language Detection** - Automatic language detection for responses
- [x] **SPSS Integration** - Auto-generated SPSS syntax for statistical analysis

## Future Improvements

- [ ] Database integration (PostgreSQL/Supabase)
- [ ] User authentication
- [ ] Project history and versioning
- [ ] Advanced visualizations (charts, word clouds)
- [ ] Collaborative features (team sharing)
- [ ] Excel multi-sheet export (all questions in one file)
- [ ] PowerPoint generation with charts
- [ ] Batch project processing

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide for new users
- **[CLAUDE_MIGRATION.md](CLAUDE_MIGRATION.md)** - Details about migration from OpenAI to Claude
- **[EXPORT_DETALLADO.md](EXPORT_DETALLADO.md)** - Comprehensive export system documentation (Spanish)
- **[IMPLEMENTACION_EXPORT.md](IMPLEMENTACION_EXPORT.md)** - Export implementation details (Spanish)
- **[TEMPLATES_MEJORADOS.md](TEMPLATES_MEJORADOS.md)** - Improved Spanish templates for analysis
- **[MEJORAS_IMPLEMENTADAS.md](MEJORAS_IMPLEMENTADAS.md)** - List of implemented improvements

## Support

For issues or questions, please open an issue in the repository.

## License

MIT License
