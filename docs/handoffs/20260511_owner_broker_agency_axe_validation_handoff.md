# HURBY - HANDOFF CONSOLIDADO
Modulo: Owner Temporario, Broker, Agency e Distribuicao de AXE
Status: Funcional validado
Data: 2026-05-11

-------------------------------------

## 1. Contexto da missao

Foi realizada correcao e validacao do fluxo temporario de Owner, junto com os acessos principais de Broker e Agency.

O objetivo foi permitir que o ambiente Owner temporario pudesse:

- criar usuario Owner de validacao
- acessar /owner
- visualizar usuarios
- visualizar imoveis
- distribuir AXE para usuarios
- validar saldo em wallet_balance
- registrar creditos corretamente no wallet_ledger

Este Owner ainda nao representa o Core Owner/Admin definitivo.

-------------------------------------

## 2. Estado funcional validado

### Owner

Validado:

- cadastro Owner temporario funcionando
- usuario Owner nasce como platform_owner
- login Owner funcionando
- acesso ao painel /owner funcionando
- painel Owner lista usuarios
- painel Owner distribui AXE
- ledger registra distribuicao
- wallet_balance atualiza saldo

Regra critica:

- primary_entry_flow = platform_owner
- account_status = active
- registration_status = completed

### Broker

Validado:

- login Broker funcionando
- acesso a /broker funcionando
- recebimento de AXE funcionando
- saldo atualizado em wallet_balance

### Agency

Validado:

- login Agency funcionando
- acesso a /agency funcionando
- Agency pode acessar /broker conforme regra validada

### Marketplace comum

Validado:

- usuario comum permanece em /account
- usuario comum nao deve cair automaticamente em rotas profissionais

-------------------------------------

## 3. Correcao relevante feita

A RPC temporaria owner_add_axe estava quebrando porque tentava usar origem ADMIN, mas ADMIN nao existe no enum coin_origin_type.

Enums reais encontrados:

coin_origin_type:
- PURCHASE
- BONUS
- REWARD
- TRANSFER_IN
- TRANSFER_OUT
- CONSUMPTION
- REFUND
- EXPIRATION

coin_credit_type:
- PAID
- BONUS
- REWARD
- TRANSFER

Decisao aplicada:

A distribuicao temporaria de AXE pelo Owner deve ser registrada como:

- origin_type = BONUS
- credit_type = BONUS

Motivo:

Essa distribuicao nao representa compra real, nem transferencia entre carteiras. E credito operacional temporario para validacao.

-------------------------------------

## 4. Arquivos envolvidos

Principais arquivos tocados ou auditados:

- middleware.ts
- src/app/login/page.tsx
- src/app/owner/page.tsx
- src/app/broker/page.tsx
- src/app/agency/page.tsx
- src/app/account/page.tsx
- src/app/register/owner/page.tsx
- src/lib/services/accessService.ts
- supabase/migrations/20260510235500_fix_owner_add_axe_bonus_origin.sql

-------------------------------------

## 5. Banco e RPCs relevantes

Tabelas e estruturas envolvidas:

- public.users_profile
- public.broker_profiles
- public.organization_memberships
- public.wallet_ledger
- public.wallet_balance
- auth.users

RPCs envolvidas:

- public.is_platform_owner()
- public.owner_validation_users()
- public.owner_validation_properties()
- public.owner_add_axe()
- public.add_coin()

-------------------------------------

## 6. Decisoes importantes

1. Owner temporario deve continuar sendo temporario.

Nao transformar este fluxo em Core Owner/Admin definitivo agora.

2. Nao refatorar o extrato neste momento.

Foram identificadas logicas equivocadas em /statement, mas o fluxo principal esta funcionando. Isso deve ir para backlog tecnico.

3. Nao mexer novamente em auth e ledger sem necessidade.

A autenticacao ficou sensivel. Qualquer alteracao futura deve comecar por reconhecimento completo de:

- middleware
- login
- paginas /owner, /broker, /agency, /account
- accessService
- RPCs
- RLS
- users_profile
- broker_profiles
- organization_memberships
- wallet_ledger
- wallet_balance

4. Preservar regra de navegacao validada.

- Owner acessa /owner
- Broker acessa /broker
- Agency acessa /agency
- Agency tambem pode acessar /broker
- Usuario comum fica em /account
- Rotas profissionais nao devem jogar usuario comum para ambiente profissional

-------------------------------------

## 7. Pendencias registradas para backlog

### Backlog financeiro / ledger

Revisar posteriormente a pagina e fluxo de extrato:

- /statement
- exibicao de creditos/debitos
- origem de lancamentos
- labels comerciais
- logica de agrupamento
- leitura de saldo
- coerencia entre wallet_ledger e wallet_balance

Nao corrigir agora.

### Backlog Owner/Admin definitivo

Criar futuramente Core Owner/Admin real com:

- permissoes administrativas formais
- auditoria completa
- logs administrativos
- trilha financeira
- governanca
- seguranca
- separacao clara entre Owner temporario e Admin definitivo

-------------------------------------

## 8. Orientacao para o proximo Master

Antes de iniciar o proximo core, fazer checkpoint:

1. Rodar git status.
2. Confirmar que nao existem arquivos temporarios pendentes.
3. Confirmar que o fluxo Owner/Broker/Agency/AXE continua funcional.
4. Nao refatorar statement agora.
5. Seguir para o proximo core estrutural da fila.
6. Antes de codar o proximo core, fazer reconhecimento completo de backend e frontend.
7. Nao ler apenas SQL.
8. Auditar tambem pages TSX, services, hooks, middleware, rotas e navegabilidade.
9. Criar pagina/rota minima de validacao quando o core exigir teste operacional.
10. Ao final, testar antes de declarar pronto.

-------------------------------------

## 9. Status final

Missao encerrada como funcional validada.

Proximo passo recomendado:

Retornar ao Master para continuidade dos proximos cores estruturais, sem mexer novamente no fluxo Owner/Broker/Agency/AXE, salvo regressao objetiva.

