/*
=========================================
HURBY â€” AUTH MIDDLEWARE
LOCAL:
middleware.ts

STATUS:
CONTEXT_ACCESS_GUARDS_CONSOLIDATED

REGRA CONSOLIDADA:

Marketplace:
- /broker -> /account
- /agency -> /account
- /owner -> /account
- /operations -> /account

Broker:
- /broker -> abre
- /agency -> /broker
- /owner -> /broker
- /operations -> abre

Agency / Imobiliaria:
- /agency -> abre
- /broker -> abre
- /owner -> /agency
- /operations -> abre

IMPORTANTE:
Owner/Admin real ainda nao existe.
Owner sempre redireciona conforme contexto.
=========================================
*/

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function hasBrokerAccess(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('broker_profiles')
    .select('id, professional_status')
    .eq('profile_id', userId)
    .neq('professional_status', 'suspended')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('MIDDLEWARE BROKER ACCESS ERROR:', error)
    return false
  }

  return !!data
}

async function hasOwnerAccess(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('users_profile')
    .select('id, primary_entry_flow, account_status')
    .eq('id', userId)
    .eq('account_status', 'active')
    .eq('primary_entry_flow', 'platform_owner')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('MIDDLEWARE OWNER ACCESS ERROR:', error)
    return false
  }

  return !!data
}

async function hasAgencyAccess(supabase: any, userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from('users_profile')
    .select('id, primary_entry_flow, account_status')
    .eq('id', userId)
    .eq('account_status', 'active')
    .eq('primary_entry_flow', 'agency_owner')
    .limit(1)
    .maybeSingle()

  if (profileError) {
    console.error('MIDDLEWARE AGENCY PROFILE ERROR:', profileError)
    return false
  }

  if (!profile) {
    return false
  }

  const { data, error } = await supabase
    .from('organization_memberships')
    .select('id, membership_role, membership_status')
    .eq('profile_id', userId)
    .eq('membership_status', 'active')
    .in('membership_role', ['owner', 'manager'])
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('MIDDLEWARE AGENCY ACCESS ERROR:', error)
    return false
  }

  return !!data
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },

        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response = NextResponse.next({
            request,
          })

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },

        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          response = NextResponse.next({
            request,
          })

          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const path = request.nextUrl.pathname

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = [
    '/broker',
    '/agency',
    '/owner',
    '/operations',
    '/statement',
    '/account',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!user) {
    return response
  }

  const [ownerAccess, brokerAccess, agencyAccess] = await Promise.all([
    hasOwnerAccess(supabase, user.id),
    hasBrokerAccess(supabase, user.id),
    hasAgencyAccess(supabase, user.id),
  ])

  if (path.startsWith('/owner')) {
    if (ownerAccess) {
      return response
    }

    if (agencyAccess) {
      return NextResponse.redirect(new URL('/agency', request.url))
    }

    if (brokerAccess) {
      return NextResponse.redirect(new URL('/broker', request.url))
    }

    return NextResponse.redirect(new URL('/account', request.url))
  }

  if (path.startsWith('/agency')) {
    if (agencyAccess) {
      return response
    }

    if (brokerAccess) {
      return NextResponse.redirect(new URL('/broker', request.url))
    }

    return NextResponse.redirect(new URL('/account', request.url))
  }

  if (path.startsWith('/broker')) {
    if (ownerAccess || brokerAccess || agencyAccess) {
      return response
    }

    return NextResponse.redirect(new URL('/account', request.url))
  }

  if (path.startsWith('/operations') || path.startsWith('/statement')) {
    if (brokerAccess || agencyAccess) {
      return response
    }

    return NextResponse.redirect(new URL('/account', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/broker',
    '/broker/:path*',

    '/agency',
    '/agency/:path*',

    '/owner',
    '/owner/:path*',

    '/operations',
    '/operations/:path*',

    '/statement',
    '/statement/:path*',

    '/account',
    '/account/:path*',
  ],
}

