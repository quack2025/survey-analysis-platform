import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm/client';
import { buildClassifyAnswersPrompt } from '@/lib/llm/prompts';

const BATCH_SIZE = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, nets, questionTitle } = body as {
      answers: string[];
      nets: any[];
      questionTitle: string;
    };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    if (!nets || !Array.isArray(nets) || nets.length === 0) {
      return NextResponse.json(
        { error: 'Nets array is required' },
        { status: 400 }
      );
    }

    if (!questionTitle) {
      return NextResponse.json(
        { error: 'Question title is required' },
        { status: 400 }
      );
    }

    // Process answers in batches
    const batches = [];
    for (let i = 0; i < answers.length; i += BATCH_SIZE) {
      batches.push(answers.slice(i, i + BATCH_SIZE));
    }

    const allClassified = [];
    for (const batch of batches) {
      const { system, user } = buildClassifyAnswersPrompt(batch, nets, questionTitle);
      const response = await callLLM(system, user);
      const parsed = JSON.parse(response);
      allClassified.push(...parsed.answers);
    }

    return NextResponse.json({ classifiedAnswers: allClassified });
  } catch (error) {
    console.error('Error classifying answers:', error);
    return NextResponse.json(
      { error: 'Failed to classify answers' },
      { status: 500 }
    );
  }
}
