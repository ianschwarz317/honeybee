// supabase/functions/ai-summarize/index.ts
//
// Generates an AI summary of a pet's medical history.
// Called by both the mobile app and web dashboard.
//
// The AI provider is abstracted behind the summarize() function.
// To swap providers: change the implementation inside summarize(),
// nothing else in the codebase needs to change.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---- AI provider abstraction ----

interface SummarizeResult {
  summary: string;
  model: string;
  model_version: string;
  prompt_tokens: number;
  completion_tokens: number;
}

async function summarize(
  petName: string,
  species: string,
  records: { record_type: string; title: string; content: string; record_date: string }[]
): Promise<SummarizeResult> {
  // ---- ANTHROPIC IMPLEMENTATION ----
  // Swap this block to use a different provider.

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const recordsText = records
    .map((r) => `[${r.record_date}] ${r.record_type.toUpperCase()}: ${r.title}\n${r.content || '(no notes)'}`)
    .join('\n\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are a veterinary medical records assistant. Summarize the following medical history for a ${species} named ${petName}. Write for a pet owner audience — clear, compassionate, and actionable. Organize by: current health status, recent visits, ongoing treatments, and upcoming needs. Flag anything that may need follow-up.`,
      messages: [{ role: 'user', content: recordsText }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI provider error: ${response.status} ${error}`);
  }

  const data = await response.json();

  return {
    summary: data.content[0].text,
    model: data.model,
    model_version: data.model,
    prompt_tokens: data.usage?.input_tokens ?? 0,
    completion_tokens: data.usage?.output_tokens ?? 0,
  };

  // ---- SELF-HOSTED IMPLEMENTATION (future) ----
  // Uncomment and swap when ready:
  //
  // const serviceUrl = Deno.env.get('AI_SERVICE_URL');
  // const response = await fetch(`${serviceUrl}/summarize`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ pet_name: petName, species, records }),
  // });
  // const data = await response.json();
  // return { summary: data.summary, model: data.model, ... };
}

// ---- Edge Function handler ----

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Create a Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { pet_id } = await req.json();
    if (!pet_id) {
      return new Response(JSON.stringify({ error: 'pet_id is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the pet (RLS ensures the user owns it or has clinic access)
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('name, species')
      .eq('id', pet_id)
      .single();

    if (petError || !pet) {
      return new Response(JSON.stringify({ error: 'Pet not found or access denied' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Fetch medical records (RLS-filtered)
    const { data: records, error: recordsError } = await supabase
      .from('medical_records')
      .select('id, record_type, title, content, record_date')
      .eq('pet_id', pet_id)
      .order('record_date', { ascending: false })
      .limit(50);

    if (recordsError) throw recordsError;
    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No medical records to summarize' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the summary
    const result = await summarize(pet.name, pet.species, records);

    // Store the summary using the service role (bypasses RLS for insert)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: summary, error: insertError } = await adminClient
      .from('medical_summaries')
      .insert({
        pet_id,
        summary: result.summary,
        model_used: result.model,
        model_version: result.model_version,
        records_included: records.map((r) => r.id),
        prompt_tokens: result.prompt_tokens,
        completion_tokens: result.completion_tokens,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI summarize error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate summary' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
