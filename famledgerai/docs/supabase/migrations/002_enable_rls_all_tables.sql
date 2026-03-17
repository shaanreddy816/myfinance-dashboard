-- ============================================================
-- Migration 002: Enable Row-Level Security on all 19 tables
-- ============================================================
-- This migration enables RLS and creates user isolation policies
-- so that each user can only access their own data.
--
-- Run this migration manually in the Supabase SQL Editor.
-- ============================================================

-- ── 1. Tables with `user_id` column (standard pattern) ──

-- income
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.income
FOR ALL
USING (user_id = auth.uid());

-- expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.expenses
FOR ALL
USING (user_id = auth.uid());

-- budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.budgets
FOR ALL
USING (user_id = auth.uid());

-- investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.investments
FOR ALL
USING (user_id = auth.uid());

-- goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.goals
FOR ALL
USING (user_id = auth.uid());

-- loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.loans
FOR ALL
USING (user_id = auth.uid());

-- loan_prepayments
ALTER TABLE public.loan_prepayments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.loan_prepayments
FOR ALL
USING (user_id = auth.uid());

-- insurance_policies
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.insurance_policies
FOR ALL
USING (user_id = auth.uid());

-- insurance_claims
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.insurance_claims
FOR ALL
USING (user_id = auth.uid());

-- insurance_analysis
ALTER TABLE public.insurance_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.insurance_analysis
FOR ALL
USING (user_id = auth.uid());

-- family_members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.family_members
FOR ALL
USING (user_id = auth.uid());

-- alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.alerts
FOR ALL
USING (user_id = auth.uid());

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.notifications
FOR ALL
USING (user_id = auth.uid());

-- ai_conversations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.ai_conversations
FOR ALL
USING (user_id = auth.uid());

-- retirement_plan
ALTER TABLE public.retirement_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.retirement_plan
FOR ALL
USING (user_id = auth.uid());

-- nri_return_plan
ALTER TABLE public.nri_return_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.nri_return_plan
FOR ALL
USING (user_id = auth.uid());

-- nri_return_checklist_items
ALTER TABLE public.nri_return_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
ON public.nri_return_checklist_items
FOR ALL
USING (user_id = auth.uid());

-- ── 2. user_profiles (uses `id`, not `user_id`) ──

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own profile"
ON public.user_profiles
FOR ALL
USING (id = auth.uid());

-- ── 3. ai_messages (ownership through ai_conversations) ──

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own messages"
ON public.ai_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);
