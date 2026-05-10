/*
=========================================
HURBY — ROOT PAGE
LOCAL:
src/app/page.tsx

OBJETIVO:
Redirecionar o acesso raiz para o login oficial.

IMPORTANTE:
Toda lógica de autenticação deve permanecer centralizada em:
- /login
- middleware.ts

NÃO implementar autenticação duplicada aqui.

HISTÓRICO:
A rota raiz não executa lógica de perfil, permissão ou contexto operacional.
Ela apenas direciona para a entrada oficial.

O roteamento contextual deve acontecer nas camadas próprias:
- login público
- login profissional
- marketplace/common account
- broker profile
- organization membership
- painel profissional
- ambiente público Cadê Negócios

=========================================
*/

import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/login')
}
