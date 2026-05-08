# HURBY — GLOBAL.md
# FOUNDATION PROTOCOL
# STATUS: AUTH_FINANCE_LGPD_STABLE
# VERSION: v1.1.0-foundation-cloud-stable

-----------------------------------------------------------------------------

# 📌 VISÃO DO PRODUTO

HURBY é um ecossistema imobiliário com economia interna,
baseado em performance, prioridade e competição entre corretores.

O sistema organiza:

- geração de leads
- atendimento
- gestão de imóveis
- monetização por ação
- economia digital interna
- prioridade comercial
- escassez operacional

O projeto foi concebido para operar como:

- plataforma escalável
- marketplace imobiliário
- motor de geração de leads
- ecossistema orientado por comportamento

-----------------------------------------------------------------------------

# 🧠 PRINCÍPIOS DE PRODUTO

- não construir antes de validar
- tudo deve gerar valor ou receita
- simplicidade > complexidade
- comportamento > funcionalidade
- dados antes de opinião
- arquitetura antes de escala
- monetização desde o início
- evitar hardcodes permanentes
- proteger o núcleo do sistema

-----------------------------------------------------------------------------

# 💰 ECONOMIA INTERNA

## Moeda

Nome interno:
AXE

Símbolo:
ⓐ

AXE é utilizada para:

- desbloqueio de leads
- impulsionamentos (futuro)
- ações premium
- assinatura
- boosts
- priorizações
- features premium

-----------------------------------------------------------------------------

# TIPOS DE CRÉDITO

- PAID → comprado com dinheiro real
- BONUS → concedido pela plataforma
- REWARD → ganho por ações
- TRANSFER → recebido de outro usuário

-----------------------------------------------------------------------------

# REGRAS ECONÔMICAS

- consumo prioriza BONUS → REWARD → PAID
- BONUS pode expirar
- PAID não expira
- saldo nunca pode ser negativo
- toda movimentação passa pelo ledger
- saldo sempre derivado do ledger
- operações financeiras somente via RPC/funções oficiais

-----------------------------------------------------------------------------

# ECONOMIA CONFIGURÁVEL (FUTURO)

IMPORTANTE:

Toda lógica econômica do sistema deverá evoluir futuramente para um modelo centralizado e administrável.

NÃO hardcodar permanentemente:

- bônus
- rewards
- expiração
- campanhas
- unlock costs
- cashback
- referral
- boosts
- multiplicadores
- regras promocionais

-----------------------------------------------------------------------------

# FUTURO CORE ECONOMY

Planejado:

- platform_settings
- economy_rules
- admin economy panel

Objetivo:

Permitir gerenciamento operacional de:

- signup bonus
- expiração
- campanhas
- promoções
- monetização dinâmica
- custos de unlock
- rewards
- regras comerciais

SEM necessidade de deploy.

-----------------------------------------------------------------------------

# 🔓 MONETIZAÇÃO

## Unlock de Lead

- custo oficial: 40 AXE
- exclusividade: 24 horas
- apenas 1 corretor por vez
- após expiração outro corretor pode desbloquear
- quem já desbloqueou mantém acesso

-----------------------------------------------------------------------------

# CONCEITO OFICIAL

"Exclusividade temporária por prioridade"

Quem chega primeiro, atende primeiro.

-----------------------------------------------------------------------------

# OBJETIVOS DO MODELO

- gerar urgência
- criar escassez
- estimular frequência
- gerar recorrência
- incentivar consumo de AXE
- criar comportamento competitivo

-----------------------------------------------------------------------------

# FUNÇÕES OFICIAIS

- unlock_lead
- get_lead_status
- purchase_coin
- consume_coin
- transfer_coin
- expire_coin

-----------------------------------------------------------------------------

# 🧠 LEADS

Lead = oportunidade comercial.

Um lead pode:

- pertencer a um imóvel
- ser exibido para múltiplos corretores
- ser desbloqueado mediante pagamento
- possuir status operacional
- possuir origem rastreável

-----------------------------------------------------------------------------

# ESTADOS DE LEAD

- available
- locked
- unlocked

-----------------------------------------------------------------------------

# ORIGEM DE LEADS

- portal
- marketplace
- canais do corretor (futuro)
- campanhas (futuro)
- tráfego pago (futuro)

-----------------------------------------------------------------------------

# 🏠 PROPERTIES (IMÓVEIS)

Property = ativo comercial do corretor.

Função principal:
→ gerar leads.

-----------------------------------------------------------------------------

# ESTRUTURA BASE PROPERTIES

- id
- owner_id
- title
- description
- price
- status
- created_at
- updated_at

-----------------------------------------------------------------------------

# STATUS OFICIAIS PROPERTY

- active
- paused
- negotiating
- sold
- draft

-----------------------------------------------------------------------------

# RELAÇÕES

1 property
→ N leads

1 broker
→ N properties

-----------------------------------------------------------------------------

# 👤 USERS

Auth oficial:
auth.users

Profile oficial:
users_profile

-----------------------------------------------------------------------------

# USER TYPES OFICIAIS

- broker
- agency
- owner

-----------------------------------------------------------------------------

# REGRAS USERS

- nunca criar profile sem auth.user
- user_id é a chave central do sistema
- auth.users é autoridade oficial
- users_profile é extensão operacional

-----------------------------------------------------------------------------

# ROTA OFICIAL DO CORRETOR

/broker

PROIBIDO:

- /dashboard
- corretor

-----------------------------------------------------------------------------

# 🔐 SEGURANÇA

RLS obrigatório em tabelas críticas:

- wallet_ledger
- users_profile
- user_subscription
- leads
- properties

-----------------------------------------------------------------------------

# REGRAS DE SEGURANÇA

- usuário acessa apenas seus dados
- operações financeiras somente via função/RPC
- inserts diretos proibidos
- saldo nunca manual
- middleware SSR obrigatório
- auth centralizado

-----------------------------------------------------------------------------

# ⚙️ ESTRUTURA DO SISTEMA

Frontend previsto:

/broker
  /properties
  /leads
  /clients
  /marketplace
  /wallet
  /statement

-----------------------------------------------------------------------------

# FLUXO PRINCIPAL

login
→ /broker
→ properties
→ property detail
→ leads
→ unlock

-----------------------------------------------------------------------------

# FOUNDATION TÉCNICA

STATUS OFICIAL:

AUTH_FINANCE_LGPD_STABLE

BASELINE:
v1.1.0-foundation-cloud-stable

-----------------------------------------------------------------------------

# AUTH FLOW OFICIAL

Supabase Auth
→ auth.users
→ trigger handle_new_user()
→ users_profile

Fluxo estabilizado e blindado.

-----------------------------------------------------------------------------

# SSR AUTH FOUNDATION

Stack oficial SSR:

- Next.js App Router
- @supabase/ssr
- middleware.ts único
- createServerClient()
- cookies SSR sincronizados

Fluxo oficial:

browser
→ middleware SSR
→ Supabase Auth
→ protected routes
→ hydration client-side

-----------------------------------------------------------------------------

# CLIENT AUTH OFICIAL

Client frontend oficial:

src/lib/supabaseClient.ts

Configuração obrigatória:

- persistSession: true
- autoRefreshToken: true
- detectSessionInUrl: true

PROIBIDO:

- múltiplos clients Supabase
- createClient local em páginas
- auth providers paralelos
- auth stores paralelos

-----------------------------------------------------------------------------

# MIDDLEWARE

Middleware oficial:

/middleware.ts

PROIBIDO:

- middleware duplicado
- src/middleware.ts
- auth paralelo

-----------------------------------------------------------------------------

# RESPONSABILIDADES DO MIDDLEWARE

- SSR auth
- proteção de rotas
- sincronização cookies
- validação sessão
- bloqueio acesso indevido
- persistência SSR

-----------------------------------------------------------------------------

# ROTAS PROTEGIDAS OFICIAIS

Proteção SSR obrigatória:

- /broker
- /owner
- /agency
- /statement

Toda rota protegida deve:

✔ validar SSR auth
✔ validar profile
✔ validar role
✔ bloquear acesso cruzado

-----------------------------------------------------------------------------

# AUTH / LOGIN

STATUS:
STABLE

Validado:

✔ signup
✔ login
✔ logout
✔ persistência sessão
✔ SSR cookies
✔ redirect
✔ middleware SSR
✔ trigger profile
✔ sincronização users_profile

-----------------------------------------------------------------------------

# CLOUD STABILIZATION

[2026-05-07]

Problemas históricos corrigidos:

- login loop Vercel
- cookies SSR inconsistentes
- hydration race condition
- redirects prematuros
- sessão fantasma
- logout inconsistente
- auth cloud desincronizado

Correções implementadas:

✔ getUser() oficial
✔ retry hydration
✔ SSR cookies estabilizados
✔ middleware sincronizado
✔ redirects seguros
✔ protected routes estabilizadas

-----------------------------------------------------------------------------

# REGRAS AUTH

Usar:

window.location.href

Evitar:

router.push()
em fluxos críticos auth/logout.

-----------------------------------------------------------------------------

# USERS_PROFILE

Tabela oficial de perfis.

STATUS:
STABLE

Fluxo oficial:

auth.users
→ trigger
→ users_profile

NÃO criar profile manualmente sem necessidade.

-----------------------------------------------------------------------------

# CORE FINANCEIRO

STATUS:
STABLE

Estrutura oficial:

- wallet_ledger
- wallet_balance
- unlock_lead
- lead_status
- purchase_coin
- consume_coin
- transfer_coin
- expire_coin

-----------------------------------------------------------------------------

# SECURITY DEFINER

Funções financeiras oficiais utilizam:

SECURITY DEFINER

Motivo:

- bypass interno controlado de RLS
- estabilidade financeira
- compatibilidade Supabase Cloud
- operações agregadas seguras

Aplicado em:

- update_wallet_balance
- add_coin
- consume_coin
- transfer_coin

-----------------------------------------------------------------------------

# LEDGER

wallet_ledger é IMUTÁVEL.

NUNCA:

- editar saldo manualmente
- sobrescrever transações
- criar saldo paralelo

Toda movimentação financeira deve passar via:

- RPC
- funções oficiais
- triggers oficiais

-----------------------------------------------------------------------------

# CONSUMO OFICIAL AXE

Ordem:

1. BONUS
2. REWARD
3. PAID

-----------------------------------------------------------------------------

# RLS

STATUS:
PRESERVED

RLS é obrigatório em:

- wallet_ledger
- subscriptions
- properties
- leads
- dados sensíveis

IMPORTANTE:

wallet_balance é tabela derivada
de agregação financeira.

RLS foi desabilitado oficialmente
em wallet_balance para permitir:

- refresh interno
- update agregado
- operações SECURITY DEFINER

O ledger continua sendo
a fonte financeira oficial.

-----------------------------------------------------------------------------

# LGPD

STATUS:
OPERATIONAL

Implementado:

- consent_logs
- aceite explícito
- versionamento consentimento
- rastreabilidade
- segregação inicial
- consentimento auditável

-----------------------------------------------------------------------------

# FUTURO LGPD

Planejado:

- retenção automática
- anonimização
- exportação
- revogação
- masking
- lifecycle
- tenancy avançado

-----------------------------------------------------------------------------

# MIGRATIONS OFICIAIS

- 20260504000000_base_clean.sql
- 20260504000100_profiles.sql
- 20260504000200_business.sql
- 20260504000400_audit.sql
- 20260505004859_coin_core.sql
- 20260505004959_coin_functions.sql
- 20260505005019_coin_expiration.sql
- 20260505005039_coin_scheduler.sql
- 20260505005108_coin_purchase.sql
- 20260505013435_coin_rls_full.sql
- 20260505020905_lead_unlock.sql
- 20260505022650_lead_status.sql
- 20260506012838_compliance_lgpd.sql
- 20260506021141_auth_profile_trigger.sql
- 20260507030004_fix_coin_functions_security_definer.sql
- 20260507031629_fix_wallet_balance_rls.sql

-----------------------------------------------------------------------------

# SEED

NÃO usar users_profile em seed.

Motivo:
auth.users é autoridade oficial.

Futuro:

- seed_dev.sql
- seed_staging.sql
- seed_prod.sql

-----------------------------------------------------------------------------

# PADRÕES OBRIGATÓRIOS

Toda nova feature deve:

✔ usar migrations
✔ usar RLS
✔ validar regressão
✔ respeitar auth flow
✔ respeitar SSR
✔ respeitar wallet_ledger
✔ respeitar middleware
✔ respeitar users_profile

-----------------------------------------------------------------------------

# 🚫 NÃO FAZER (AGORA)

- CRM complexo
- automações pesadas
- IA avançada
- contratos complexos
- dashboards excessivos
- microservices prematuros
- event bus prematuro
- abstrações desnecessárias

-----------------------------------------------------------------------------

# ⚠️ REGRAS CRÍTICAS

O sistema NÃO pode sofrer regressão.

Tudo que envolve:

- ledger
- saldo
- consumo AXE
- unlock_lead
- RLS
- auth
- middleware
- SSR
- users_profile

é considerado:

→ núcleo estável e protegido

Qualquer alteração deve ser auditada.

-----------------------------------------------------------------------------

# PROIBIDO

❌ alterar auth sem auditoria
❌ alterar middleware sem auditoria
❌ alterar financeiro sem auditoria
❌ criar saldo manual
❌ criar auth paralelo
❌ criar middleware paralelo
❌ bypass RLS em ledger
❌ hardcode econômico permanente
❌ quebrar baseline foundation

-----------------------------------------------------------------------------

# ESTADO ATUAL

FOUNDATION:
STABLE

AUTH:
STABLE

FINANCE:
STABLE

LGPD:
OPERATIONAL

RLS:
PRESERVED

BASELINE:
FROZEN

TAG:
v1.1.0-foundation-cloud-stable

-----------------------------------------------------------------------------

# STATUS CLOUD

SUPABASE CLOUD:
STABLE

VERCEL SSR:
STABLE

PROTECTED ROUTES:
STABLE

FINANCIAL RPC:
STABLE

COOKIE SSR:
STABLE

-----------------------------------------------------------------------------

# PRÓXIMO CORE OFICIAL

CORE PROPERTIES

Estrutura prevista:

- properties
- property_media
- property_features
- property_status
- property_type

Com:

- owner_id obrigatório
- RLS obrigatório
- compatibilidade leads
- compatibilidade marketplace
- compatibilidade CRM

-----------------------------------------------------------------------------

# PROTOCOLO PARA FUTUROS CHATS

Todo novo chat DEVE:

1. Ler este GLOBAL.md
2. Ler migrations existentes
3. Validar arquitetura antes de alterar
4. NÃO sair criando estrutura sem auditoria
5. Respeitar baseline congelada

-----------------------------------------------------------------------------

# STATUS FINAL

O HURBY deixou oficialmente o estágio de:

- MVP instável
- fundação experimental

E passou para:

- foundation estabilizada
- arquitetura auditada
- baseline versionada
- estrutura escalável
- foundation enterprise-oriented

-----------------------------------------------------------------------------