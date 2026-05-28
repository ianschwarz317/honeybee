import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MODEL = 'claude-sonnet-4-20250514'
const MODEL_VERSION = '20250514'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { petId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { petId } = body
  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 })
  }

  const { data: records, error: recordsError } = await supabase
    .from('medical_records')
    .select('id, record_type, title, content, record_date')
    .eq('pet_id', petId)
    .eq('is_visible_to_owner', true)
    .order('record_date', { ascending: false })

  if (recordsError) {
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }
  if (!records || records.length === 0) {
    return NextResponse.json({ error: 'No records found' }, { status: 404 })
  }

  const recordsText = records
    .map(r => `Type: ${r.record_type}\nTitle: ${r.title}\nDate: ${r.record_date}\nNotes: ${r.content}`)
    .join('\n\n---\n\n')

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system:
        "You are a veterinary health assistant. Summarize this pet's medical history in 2-3 plain English sentences that a pet owner would understand. Be warm, clear, and focus on what matters most: current health status, recent treatments, and anything the owner should know.",
      messages: [{ role: 'user', content: `Here are the medical records:\n\n${recordsText}` }],
    }),
  })

  if (!anthropicRes.ok) {
    console.error('Anthropic error:', await anthropicRes.text())
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }

  const aiData = await anthropicRes.json()
  const summary: string = aiData.content?.[0]?.text ?? ''

  await supabase.from('medical_summaries').insert({
    pet_id: petId,
    summary,
    model_used: MODEL,
    model_version: MODEL_VERSION,
    records_included: records.map(r => r.id),
  })

  return NextResponse.json({ summary })
}
