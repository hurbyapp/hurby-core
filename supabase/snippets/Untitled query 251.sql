insert into public.organizations (
  organization_type,
  legal_name,
  trade_name,
  created_by_profile_id
)
values (
  'agency',
  'Agency Teste',
  'Agency Teste',
  '2e6eb937-4861-4460-901f-8917bb6caddd'
);

insert into public.organization_memberships (
  organization_id,
  profile_id,
  membership_role,
  membership_status,
  invited_by_profile_id
)
select
  id,
  '2e6eb937-4861-4460-901f-8917bb6caddd',
  'owner',
  'active',
  '2e6eb937-4861-4460-901f-8917bb6caddd'
from public.organizations
where trade_name = 'Agency Teste';