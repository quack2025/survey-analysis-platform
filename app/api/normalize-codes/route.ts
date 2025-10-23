import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm/client';
import { buildNormalizeCodesPrompt } from '@/lib/llm/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codes, questionTitle } = body as {
      codes: Array<{ name: string; sentiment: string }>;
      questionTitle: string;
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

    const { system, user } = buildNormalizeCodesPrompt(codes, questionTitle);
    const response = await callLLM(system, user);
    const parsed = JSON.parse(response);

    return NextResponse.json({ codes: parsed.categories });
  } catch (error) {
    console.error('Error normalizing codes:', error);
    return NextResponse.json(
      { error: 'Failed to normalize codes' },
      { status: 500 }
    );
  }
}
