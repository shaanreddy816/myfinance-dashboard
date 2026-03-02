/**
 * Insurance Service — Supabase-backed Health Insurance Module
 * Handles policy CRUD, claims, PDF upload, and hashing
 * Used by both frontend (via global functions) and API routes
 */

import { createHash } from 'crypto';

// SHA-256 hash for policy numbers (browser crypto)
export async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Server-side SHA-256 (Node.js crypto)
export function sha256Server(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Upsert insurance policy
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} policyNumberPlain - Plain policy number (will be hashed)
 * @param {object} payload - Policy data
 */
export async function upsertInsurancePolicy(supabase, userId, policyNumberPlain, payload) {
  let policyHash;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    policyHash = await sha256(policyNumberPlain.trim());
  } else {
    policyHash = sha256Server(policyNumberPlain.trim());
  }

  const row = {
    user_id: userId,
    insurer: payload.insurer,
    plan_name: payload.plan_name ?? null,
    policy_type: payload.policy_type ?? 'health',
    status: payload.status ?? 'active',
    policy_number_hash: policyHash,
    start_date: payload.start_date ?? null,
    end_date: payload.end_date ?? null,
    renewal_date: payload.renewal_date ?? null,
    currency: payload.currency ?? 'INR',
    premium_amount: payload.premium_amount ?? null,
    premium_frequency: payload.premium_frequency ?? 'annual',
    premium_paid_date: payload.premium_paid_date ?? null,
    premium_next_due_date: payload.premium_next_due_date ?? payload.renewal_date ?? null,
    sum_insured: payload.sum_insured ?? null,
    deductible: payload.deductible ?? null,
    members: payload.members ?? [],
    waiting_periods: payload.waiting_periods ?? {},
    exclusions: payload.exclusions ?? {},
    utilization: payload.utilization ?? {},
    network_hospitals: payload.network_hospitals ?? {},
    documents: payload.documents ?? {},
    source: payload.source ?? 'user_input'
  };

  const { data, error } = await supabase
    .from('insurance_policies')
    .upsert(row, { onConflict: 'user_id,policy_number_hash' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchInsurancePolicies(supabase) {
  const { data, error } = await supabase
    .from('insurance_policies')
    .select('*')
    .order('renewal_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchInsurancePolicyById(supabase, id) {
  const { data, error } = await supabase
    .from('insurance_policies')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInsurancePolicy(supabase, id) {
  const { error } = await supabase
    .from('insurance_policies')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function addClaim(supabase, userId, policyId, claim) {
  const row = {
    user_id: userId,
    policy_id: policyId,
    claim_id: claim.claim_id ?? null,
    member_name: claim.member_name ?? null,
    hospital_name: claim.hospital_name ?? null,
    cashless: !!claim.cashless,
    admission_date: claim.admission_date ?? null,
    discharge_date: claim.discharge_date ?? null,
    status: claim.status ?? null,
    amount_claimed: claim.amount_claimed ?? null,
    amount_paid: claim.amount_paid ?? null,
    source: claim.source ?? 'user_input'
  };

  const { data, error } = await supabase
    .from('insurance_claims')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listClaims(supabase, policyId) {
  const { data, error } = await supabase
    .from('insurance_claims')
    .select('*')
    .eq('policy_id', policyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadPolicyPdf(supabase, userId, file) {
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('insurance_docs')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: signed, error: signedErr } = await supabase.storage
    .from('insurance_docs')
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
  if (signedErr) throw signedErr;

  return { path, signedUrl: signed.signedUrl };
}
