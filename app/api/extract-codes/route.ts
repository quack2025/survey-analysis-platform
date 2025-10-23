import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm/client';
import { buildExtractCodesPrompt } from '@/lib/llm/prompts';
import { ProjectContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, questionTitle, projectLanguage = 'en', projectContext } = body as {
      answers: string[];
      questionTitle: string;
      projectLanguage?: string;
      projectContext?: ProjectContext;
    };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    if (!questionTitle) {
      return NextResponse.json(
        { error: 'Question title is required' },
        { status: 400 }
      );
    }

    const { system, user } = buildExtractCodesPrompt(
      answers,
      questionTitle,
      projectLanguage,
      projectContext
    );

    const response = await callLLM(system, user);
    const parsed = JSON.parse(response);

    return NextResponse.json({ codes: parsed.categories });
  } catch (error) {
    console.error('Error extracting codes:', error);
    return NextResponse.json(
      { error: 'Failed to extract codes' },
      { status: 500 }
    );
  }
}
