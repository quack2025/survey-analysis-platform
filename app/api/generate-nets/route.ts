import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm/client';
import { buildGenerateNetsPrompt } from '@/lib/llm/prompts';
import { ProjectContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codes, questionTitle, projectLanguage = 'en', projectContext } = body as {
      codes: Array<{ name: string; sentiment: string }>;
      questionTitle: string;
      projectLanguage?: string;
      projectContext?: ProjectContext;
    };

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { error: 'Codes array is required' },
        { status: 400 }
      );
    }

    if (!questionTitle) {
      return NextResponse.json(
        { error: 'Question title is required' },
        { status: 400 }
      );
    }

    const { system, user } = buildGenerateNetsPrompt(
      codes,
      questionTitle,
      projectLanguage,
      projectContext
    );

    const response = await callLLM(system, user);
    const parsed = JSON.parse(response);

    return NextResponse.json({ nets: parsed.nets });
  } catch (error) {
    console.error('Error generating nets:', error);
    return NextResponse.json(
      { error: 'Failed to generate nets' },
      { status: 500 }
    );
  }
}
