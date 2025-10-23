import Link from 'next/link';
import { FileText, Upload, CheckCircle, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Survey Analysis Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Analyze open-ended survey responses automatically with AI-powered categorization,
            sentiment analysis, and thematic grouping.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StepCard
            icon={<FileText className="w-8 h-8" />}
            title="1. Configure Project"
            description="Set up your study type, objectives, and analysis framework"
            href="/setup"
            color="blue"
          />
          <StepCard
            icon={<Upload className="w-8 h-8" />}
            title="2. Upload Data"
            description="Import your survey responses from CSV or Excel"
            color="green"
            disabled
          />
          <StepCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="3. Review Codes"
            description="Validate and refine AI-generated codes and themes"
            color="yellow"
            disabled
          />
          <StepCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="4. View Results"
            description="Explore insights, charts, and export your analysis"
            color="purple"
            disabled
          />
        </div>

        <div className="text-center">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <strong>Contextual Analysis:</strong> Provide project context (study type, brand, objectives)
                so the AI understands what to look for in responses.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <strong>Smart Categorization:</strong> AI automatically extracts themes (codes) and groups
                them into higher-level categories (nets) based on industry frameworks.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <strong>Sentiment Detection:</strong> Each code is tagged with sentiment
                (Positive, Neutral, Negative) to understand emotional patterns.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <strong>Classification:</strong> Every response is mapped to relevant codes and nets,
                creating quantifiable insights from qualitative data.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  disabled?: boolean;
}

function StepCard({ icon, title, description, href, color, disabled }: StepCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  };

  const content = (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      }`}
    >
      <div className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        {description}
      </p>
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
