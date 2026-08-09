import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Server-side Supabase client using the secret key.
// This bypasses row-level security, so it must never be exposed to the browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // The browser now sends only a file path, not the audio itself.
    const { audioPath } = await request.json();

    if (!audioPath) {
      return Response.json({ error: 'No audio path provided' }, { status: 400 });
    }

    // Step 1: Pull the audio file out of Supabase Storage
    const { data: audioBlob, error: downloadError } = await supabaseAdmin
      .storage
      .from('session-audio')
      .download(audioPath);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      return Response.json(
        { error: `Could not retrieve audio file: ${downloadError.message}` },
        { status: 500 }
      );
    }

    // OpenAI rejects anything over 25MB, so fail with a clear message
    // rather than a confusing API error.
    const sizeMB = audioBlob.size / (1024 * 1024);
    if (sizeMB > 25) {
      return Response.json(
        {
          error: `This recording is ${sizeMB.toFixed(1)}MB. The transcription service accepts files up to 25MB. Please compress the audio or split the session into two files.`,
        },
        { status: 400 }
      );
    }

    // Turn the download into a File the OpenAI SDK will accept
    const fileName = audioPath.split('/').pop() || 'audio.m4a';
    const audioFile = new File([audioBlob], fileName, {
      type: audioBlob.type || 'audio/m4a',
    });

    // Step 2: Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    // Step 3: Anonymize with Claude
    const anonymized = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 32000,
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

Return the complete anonymized transcript from beginning to end. Do not truncate. Return ONLY the anonymized transcript, nothing else.

Transcript:
${transcription}`,
        },
      ],
    });

    const anonymizedTranscript = anonymized.content[0].text;

    // Warn if Claude ran out of room rather than silently returning a partial transcript
    if (anonymized.stop_reason === 'max_tokens') {
      console.warn('Anonymization hit max_tokens — transcript may be incomplete');
    }

    return Response.json({
      transcript: anonymizedTranscript,
      truncated: anonymized.stop_reason === 'max_tokens',
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
