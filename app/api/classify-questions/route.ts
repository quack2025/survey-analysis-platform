import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm/client';
import { buildClassifyQuestionPrompt } from '@/lib/llm/prompts';
import { ProjectContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions, projectContext } = body as {
      questions: string[];
      projectContext: ProjectContext;
    };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array is required' },
        { status: 400 }
      );
    }

    // Classify each question
    const results = await Promise.all(
      questions.map(async (questionTitle) => {
        const { system, user } = buildClassifyQuestionPrompt(questionTitle, projectContext);
        const response = await callLLM(system, user);
        const parsed = JSON.parse(response);
        return {
          question: questionTitle,
          type: parsed.type,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error classifying questions:', error);
    return NextResponse.json(
      { error: 'Failed to classify questions' },
      { status: 500 }
    );
  }
}
