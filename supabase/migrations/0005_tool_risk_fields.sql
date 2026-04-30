alter table public.tools
  add column if not exists tool_type text,
  add column if not exists typical_data text,
  add column if not exists risk_level text,
  add column if not exists data_residency text,
  add column if not exists compliance_status text,
  add column if not exists recommended_decision text,
  add column if not exists ai_act_note_cs text,
  add column if not exists legal_security_note_cs text,
  add column if not exists risk_conditions_cs text,
  add column if not exists risk_rationale_cs text,
  add column if not exists risk_guarantor text,
  add column if not exists risk_source_name text,
  add column if not exists risk_source_url text,
  add column if not exists risk_checked_at date,
  add column if not exists risk_updated_at timestamptz;

create index if not exists tools_risk_level_idx on public.tools(risk_level);
create index if not exists tools_recommended_decision_idx on public.tools(recommended_decision);
create index if not exists tools_category_idx on public.tools(category);
