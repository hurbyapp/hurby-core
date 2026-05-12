/*
=========================================
HURBY — ACCESS SERVICE
LOCAL:
src/lib/services/accessService.ts

OBJETIVO:
Centralizar validacoes de contexto operacional.

REGRAS:
- users_profile e conta neutra
- broker access depende de broker_profiles
- agency access depende de organization_memberships
- marketplace comum nao acessa ambiente profissional
=========================================
*/

import { supabase } from '@/lib/supabaseClient'

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function hasBrokerAccess(userId: string) {
  const { data, error } = await supabase
    .from('broker_profiles')
    .select('id, professional_status')
    .eq('profile_id', userId)
    .neq('professional_status', 'suspended')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('ACCESS BROKER ERROR:', error)
    return false
  }

  return !!data
}

export async function hasAgencyAccess(userId: string) {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('id, membership_role, membership_status')
    .eq('profile_id', userId)
    .eq('membership_status', 'active')
    .in('membership_role', ['owner', 'manager'])
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('ACCESS AGENCY ERROR:', error)
    return false
  }

  return !!data
}

export async function hasProfessionalAccess(userId: string) {
  const [brokerAccess, agencyAccess] = await Promise.all([
    hasBrokerAccess(userId),
    hasAgencyAccess(userId),
  ])

  return brokerAccess || agencyAccess
}

export async function requireProfessionalAccess() {
  const user = await getCurrentUser()

  if (!user) {
    window.location.href = '/login'
    return {
      allowed: false,
      user: null,
    }
  }

  const allowed = await hasProfessionalAccess(user.id)

  if (!allowed) {
    window.location.href = '/account'
    return {
      allowed: false,
      user,
    }
  }

  return {
    allowed: true,
    user,
  }
}
