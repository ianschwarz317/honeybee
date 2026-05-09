// supabase/functions/register-chip/index.ts
//
// Registers a microchip to a pet and owner.
// This is the core Honeybee workflow:
//   1. Validate chip number format
//   2. Verify chip exists and is unregistered
//   3. Link chip to pet
//   4. Set emergency contact info
//   5. Log the action for audit

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHIP_NUMBER_REGEX = /^\d{15}$/;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // User-scoped client (respects RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Admin client (bypasses RLS for chip updates + audit log)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { chip_number, nfc_uid, pet_id, emergency_contact } = await req.json();

    // ---- Validation ----

    if (!chip_number || !CHIP_NUMBER_REGEX.test(chip_number)) {
      return new Response(
        JSON.stringify({ error: 'Invalid chip number. Must be 15 digits.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    if (!pet_id) {
      return new Response(
        JSON.stringify({ error: 'pet_id is required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    if (!emergency_contact?.name || !emergency_contact?.phone) {
      return new Response(
        JSON.stringify({ error: 'Emergency contact name and phone are required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ---- Verify the user owns this pet ----

    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, owner_id, name')
      .eq('id', pet_id)
      .single();

    if (petError || !pet) {
      return new Response(
        JSON.stringify({ error: 'Pet not found or you do not have access' }),
        { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ---- Get the authenticated user ----

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's profile for org info
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    // ---- Check chip status ----
    // Use admin client because unregistered chips might not be
    // visible to the user through RLS

    const { data: existingChip } = await adminClient
      .from('chips')
      .select('id, status, pet_id')
      .eq('chip_number', chip_number)
      .single();

    if (existingChip && existingChip.status === 'registered') {
      return new Response(
        JSON.stringify({ error: 'This chip is already registered to a pet' }),
        { status: 409, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ---- Register the chip ----

    let chipId: string;

    if (existingChip) {
      // Chip exists in system but is unregistered — update it
      const { data: updated, error: updateError } = await adminClient
        .from('chips')
        .update({
          pet_id,
          nfc_uid: nfc_uid || existingChip.nfc_uid,
          registered_by: user.id,
          registered_at_org: profile?.organization_id || null,
          status: 'registered',
          emergency_contact,
          registered_at: new Date().toISOString(),
        })
        .eq('id', existingChip.id)
        .select()
        .single();

      if (updateError) throw updateError;
      chipId = updated.id;
    } else {
      // Chip doesn't exist yet — create it
      const { data: created, error: createError } = await adminClient
        .from('chips')
        .insert({
          chip_number,
          nfc_uid: nfc_uid || null,
          pet_id,
          registered_by: user.id,
          registered_at_org: profile?.organization_id || null,
          status: 'registered',
          emergency_contact,
          registered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      chipId = created.id;
    }

    // ---- Audit log ----

    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      action: 'chip.registered',
      resource_type: 'chip',
      resource_id: chipId,
      metadata: {
        chip_number,
        pet_id,
        pet_name: pet.name,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        chip_id: chipId,
        message: `Chip ${chip_number} registered to ${pet.name}`,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chip registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to register chip' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
