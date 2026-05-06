/*
=========================================
HURBY — ROOT PAGE
LOCAL:
src/app/page.tsx

OBJETIVO:
Redirecionar acesso raiz para login oficial.

IMPORTANTE:
Toda lógica de autenticação foi centralizada em:
- /login
- middleware.ts

NÃO implementar auth duplicado aqui.

HISTÓRICO:
Código antigo utilizava:
- user_type = corretor
- /dashboard

O sistema oficial atual utiliza:
- broker
- /broker

=========================================
*/

import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/login')
}