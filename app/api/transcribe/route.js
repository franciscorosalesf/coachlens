import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio');

    if (!file) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Step 1: Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'text',
    });

    // Step 2: Anonymize with Claude
    const anonymized = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `You are a privacy specialist. Anonymize the following coaching session transcript by:
1. Identifying who is the coach and who is the client based on context
2. Replacing the coach's name with "Coach:" at the start of each of their lines
3. Replacing the client's name with "Client:" at the start of each of their lines
4. Removing or replacing any other identifying information (company names, locations, third-party names) with generic labels like [Company], [Location], [Person]
5. Keeping the conversation content intact — do not summarize or change the meaning
6. Maintaining the original language of the transcript — if it's in Spanish, keep it in Spanish

Return ONLY the anonymized transcript, nothing else.

Transcript:
${transcription}`,
        },
      ],
    });

    const anonymizedTranscript = anonymized.content[0].text;
    return Response.json({ transcript: anonymizedTranscript });

  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}