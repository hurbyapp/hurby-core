# HURBY â€” GLOBAL PROJECT STATE

Data: 2026-05-10

Status geral: CORE_IDENTITY_REBUILD + CORE_CLIENTS_FOUNDATION validado localmente

RepositÃ³rio oficial:
https://github.com/hurbyapp/hurby-core.git

Ambiente atual:
- DEV/local: ativo para desenvolvimento e reset controlado
- STAGING: usado para testes de deploy e comportamento em ambiente virtual
- PROD: ainda nÃ£o usado para dados reais

Regra de ambiente:
DEV/STAGING nÃ£o possuem dados importantes ou consistentes neste momento. Quando a modelagem estrutural exigir, Ã© permitido ajustar migrations, remover/refatorar migrations ruins, rodar reset local, sincronizar STAGING e revalidar, desde que PROD nÃ£o seja afetado.

-------------------------------------

## 1. Estado consolidado do ecossistema

O HURBY estÃ¡ em fase de construÃ§Ã£o canÃ´nica das foundations operacionais.

O projeto nÃ£o deve ser tratado como:

- ERP imobiliÃ¡rio tradicional
- sistema centrado apenas em imÃ³veis
- sistema centrado apenas em imobiliÃ¡rias
- portal fechado de anÃºncios

O HURBY deve ser tratado como:

- ecossistema operacional imobiliÃ¡rio
- rede comercial colaborativa
- plataforma de relacionamento e distribuiÃ§Ã£o
- sistema operacional profissional para corretores e imobiliÃ¡rias
- infraestrutura integrada ao marketplace CadÃª NegÃ³cios

-------------------------------------

## 2. Foundations jÃ¡ consolidadas

JÃ¡ foram criadas e validadas as seguintes bases:

- Auth foundation
- SSR/middleware foundation
- Ledger/AxÃ© foundation
- LGPD/compliance foundation
- Organizations/Memberships foundation
- Core Real Estate Operational Foundation
- Core Identity Rebuild
- Core Clients Foundation inicial
- Broker Profile foundation

-------------------------------------

## 3. Core Real Estate Operational Foundation

A fundaÃ§Ã£o imobiliÃ¡ria operacional foi concluÃ­da e validada.

O imÃ³vel deixou de ser tratado como cadastro isolado e passou a fazer parte de um contexto operacional composto por:

- portfolio
- portfolio_item
- operational_origin
- property_asset
- property_asset_location
- property_asset_features
- property_listing
- property_listing_media

A criaÃ§Ã£o de imÃ³vel operacional deve continuar ocorrendo pela RPC transacional:

- public.create_property_operational_bundle

Essa RPC cria, em uma Ãºnica operaÃ§Ã£o:

- portfolio individual, se nÃ£o existir
- operational_origin
- property_asset
- property_asset_location
- property_asset_features
- property_listing
- portfolio_item

A funÃ§Ã£o usa auth.uid() como referÃªncia de seguranÃ§a e evita criaÃ§Ã£o parcial ou registros Ã³rfÃ£os no fluxo principal.

O Core Properties foi validado em:

- banco local
- Supabase STAGING
- Vercel
- fluxo broker
- cadastro de imÃ³vel
- listagem
- detalhe
- ediÃ§Ã£o bÃ¡sica

-------------------------------------

## 4. Core Properties Form V1

CORE_PROPERTIES_FORM_V1 nÃ£o deve ser executado agora.

Status:
BACKLOG FUTURO / NÃƒO EXECUTAR NESTE MOMENTO

Natureza:
Melhoria e ampliaÃ§Ã£o do formulÃ¡rio de cadastro/ediÃ§Ã£o de imÃ³veis.

Motivo:
O formulÃ¡rio atual jÃ¡ cumpre o papel de validaÃ§Ã£o da foundation imobiliÃ¡ria. Melhorar a experiÃªncia do formulÃ¡rio Ã© Ãºtil, mas nÃ£o Ã© o prÃ³ximo gargalo estrutural do ecossistema.

DecisÃ£o:

- nÃ£o abrir missÃ£o CORE_PROPERTIES_FORM_V1 agora
- nÃ£o refatorar formulÃ¡rio neste momento
- nÃ£o expandir campos de imÃ³vel agora
- nÃ£o mexer na foundation validada sem necessidade real
- nÃ£o alterar RPC create_property_operational_bundle sem necessidade real
- nÃ£o alterar RLS, storage ou lifecycle de listing nesta etapa

Executar futuramente, depois de amadurecer:

- Core Clients
- Core Origins
- Core Visibility
- Core Leads V2
- Core Marketplace
- lifecycle real de listing
- regras de visibilidade e ownership

-------------------------------------

## 5. Core Identity Rebuild

Foi realizada a reconstruÃ§Ã£o da base de identidade.

DecisÃ£o central:

users_profile nÃ£o representa mais corretor, cliente, agÃªncia, proprietÃ¡rio ou plano comercial.

users_profile agora representa apenas a conta autenticada neutra.

Contrato tÃ©cnico preservado:

auth.users.id = users_profile.id

Isso mantÃ©m compatibilidade com:

- Ledger/AxÃ©
- Wallet
- LGPD
- Audit
- Organizations
- Memberships
- Portfolio
- Properties
- RPC create_property_operational_bundle

Foram removidas da fundaÃ§Ã£o ativa as semÃ¢nticas antigas:

- user_type
- account_tier
- broker automÃ¡tico
- PAY_PER_USE automÃ¡tico em users_profile

A trigger de criaÃ§Ã£o de usuÃ¡rio agora cria apenas profile neutro.

Arquivos envolvidos:

- supabase/migrations/20260504000000_base_clean.sql
- supabase/migrations/20260504000100_profiles.sql
- supabase/migrations/20260506021141_auth_profile_trigger.sql
- src/app/page.tsx

-------------------------------------

## 6. Core Clients Foundation

Foi criada a fundaÃ§Ã£o inicial do Core Clients.

Cliente no HURBY nÃ£o Ã© uma tabela simples nem um dado solto.

Cliente Ã© uma entidade relacional e contextual.

A mesma pessoa pode existir em mÃºltiplos contextos:

- usuÃ¡rio comum do marketplace
- pessoa buscando imÃ³vel
- proprietÃ¡rio/fornecedor de imÃ³vel
- comprador
- locatÃ¡rio
- cliente de corretor
- cliente de imobiliÃ¡ria
- contato vindo de campanha
- contato importado
- futuro lead
- parte de contrato

A foundation criada prevÃª:

- client_entities
- client_contact_methods
- client_relationships
- client_relationship_roles

PrincÃ­pios:

- nÃ£o duplicar pessoa sem estratÃ©gia
- nÃ£o misturar cliente com usuÃ¡rio autenticado
- nÃ£o misturar cliente com lead
- nÃ£o prender cliente a um Ãºnico corretor sem contexto
- nÃ£o criar dado sensÃ­vel sem rastreabilidade
- preservar LGPD desde a foundation
- permitir relacionamento futuro com marketplace, leads, contratos, funil, imÃ³veis e gestÃ£o

Arquivo criado:

- supabase/migrations/20260510120000_core_identity_clients_foundation.sql

-------------------------------------

## 7. Broker Profile Foundation

Foi criada a camada profissional do corretor.

users_profile continua sendo conta neutra.

broker_profiles representa o perfil profissional.

Estruturas criadas:

- broker_profiles
- broker_verifications

Conceito:

- corretor nÃ£o Ã© users_profile
- corretor Ã© uma camada profissional vinculada a uma conta neutra
- CRECI, validaÃ§Ã£o, visibilidade e status profissional pertencem ao broker_profile
- profissionais sem CRECI nÃ£o devem ter os mesmos privilÃ©gios de corretores verificados

Status previstos:

- professional_status
- verification_status
- public_visibility_status

A verificaÃ§Ã£o profissional deve evoluir futuramente para:

- validaÃ§Ã£o de CRECI
- revisÃ£o manual
- selos progressivos
- reputaÃ§Ã£o operacional
- restriÃ§Ãµes por risco
- trust/safety

-------------------------------------

## 8. Login e roteamento profissional

O login foi ajustado para nÃ£o depender mais de user_type.

O login profissional agora considera:

- organization_membership ativo como owner/manager
- broker_profile existente
- ausÃªncia de contexto profissional

Regras atuais:

- usuÃ¡rio com membership institucional ativo pode ir para /agency
- usuÃ¡rio com broker_profile pode ir para /broker
- usuÃ¡rio sem contexto profissional nÃ£o deve ser jogado automaticamente para /broker
- users_profile nÃ£o deve mais definir acesso profissional sozinho

Arquivos alterados:

- src/app/login/page.tsx
- src/app/broker/page.tsx

Middleware:

- middleware.ts foi preservado
- ele continua responsÃ¡vel apenas por autenticaÃ§Ã£o/proteÃ§Ã£o de rotas
- nÃ£o deve carregar lÃ³gica de perfil profissional neste momento

-------------------------------------

## 9. CadÃª NegÃ³cios e Hurby/Hurb

A arquitetura de navegaÃ§Ã£o deve prever dois ambientes integrados:

CadÃª NegÃ³cios:
- marketplace pÃºblico
- busca de imÃ³veis
- favoritos
- anÃºncios comuns
- conta comum de usuÃ¡rio
- navegaÃ§Ã£o pÃºblica

Hurby/Hurb:
- sistema operacional profissional
- corretor
- imobiliÃ¡ria
- carteira
- imÃ³veis
- clientes
- contratos futuros
- funil futuro
- gestÃ£o futura

DomÃ­nios previstos:

- cadÃªnegÃ³cios.com.br
- cadÃªnegÃ³cios.com.br/hurb
- hurb.com.br

Regra de login:

- login no marketplace nÃ£o deve redirecionar automaticamente o profissional para o painel
- o profissional logado no marketplace deve navegar como usuÃ¡rio comum
- se for profissional, deve ver acesso claro no topo, como â€œHurby Proâ€ ou â€œPainel Hurbyâ€
- usuÃ¡rio comum que tentar entrar no ambiente profissional deve ser roteado de volta para o ambiente comum ou receber orientaÃ§Ã£o de ausÃªncia de acesso profissional

-------------------------------------

## 10. Entry Flow / Fluxo de Entrada

O projeto nÃ£o deve usar onboarding genÃ©rico depois do login como base de identidade.

A intenÃ§Ã£o deve vir antes ou durante o cadastro.

Portas de entrada previstas:

- usuÃ¡rio comum do marketplace
- quero anunciar meu imÃ³vel
- sou corretor
- sou imobiliÃ¡ria
- convite institucional
- entrada profissional Hurby/Hurb

Cada porta deve conduzir para formulÃ¡rio adequado.

Exemplos:

UsuÃ¡rio comum:
- nome
- telefone
- e-mail
- conta simples
- favoritos
- dados
- anÃºncios prÃ³prios

Corretor:
- nome
- telefone
- e-mail
- CPF
- CRECI
- UF do CRECI
- cidade/regiÃ£o de atuaÃ§Ã£o
- broker_profile

ImobiliÃ¡ria:
- responsÃ¡vel autenticado
- CNPJ
- razÃ£o social
- nome fantasia
- dados institucionais
- organization
- organization_membership

-------------------------------------

## 11. Ledger/AxÃ©

Ledger/AxÃ© estÃ¡ preservado e nÃ£o deve ser refeito agora.

A anÃ¡lise confirmou que as funÃ§Ãµes financeiras nÃ£o dependem semanticamente de users_profile.

O contrato lÃ³gico deve continuar:

- wallet_ledger.user_id = auth.users.id
- wallet_balance.user_id = auth.users.id

Backlog financeiro futuro:

- revisar add_coin duplicado/sobrecarregado
- revisar activate_subscription
- revisar user_subscription
- revisar purchase_coin
- revisar transfer_coin
- revisar expire_coin
- adaptar assinatura ao novo modelo de produto/pacote operacional
- diferenciar AxÃ© livre e AxÃ© reservado/bloqueado
- preservar preÃ§o contratado atÃ© fim de ciclo
- reajustes somente em novas contrataÃ§Ãµes/renovaÃ§Ãµes

A assinatura deve ser entendida comercialmente como assinatura, mas tecnicamente pode funcionar como produto/pacote adquirido por perÃ­odo, com AxÃ©s reservados para dÃ©bitos de acesso.

-------------------------------------

## 12. LGPD / Compliance

LGPD foundation deve ser preservada.

register_consent e log_action usam auth.uid() e nÃ£o dependem de users_profile.user_type.

A fundaÃ§Ã£o de clientes deve continuar respeitando:

- minimizaÃ§Ã£o de dados
- finalidade legÃ­tima
- rastreabilidade
- consentimento
- retenÃ§Ã£o adequada
- controle de acesso
- uso cuidadoso de dados sensÃ­veis

client_contact_methods foi criada jÃ¡ preparando:

- validaÃ§Ã£o de contato
- consent_status
- controle futuro de acesso a telefone/e-mail
- integraÃ§Ã£o futura com visibilidade, leads e trust/safety

-------------------------------------

## 13. Score futuro

Score nÃ£o deve ser implementado agora.

Score serÃ¡ um core/sistema prÃ³prio futuro.

A foundation atual precisa apenas estar preparada para ele.

Diretrizes:

- score nÃ£o pode ser coluna simples em users_profile
- score deve ser contextual
- score de marketplace nÃ£o pode se misturar com score profissional
- score precisa ter lastro explicÃ¡vel
- score deve evitar rÃ³tulos discriminatÃ³rios
- score deve usar termos operacionais, como:
  - nÃ­vel de verificaÃ§Ã£o
  - intenÃ§Ã£o
  - maturidade da jornada
  - confiabilidade cadastral
  - reputaÃ§Ã£o operacional
  - qualidade do atendimento

Scores futuros possÃ­veis:

- score da conta
- score do corretor
- score da imobiliÃ¡ria
- score do anÃºncio
- score do imÃ³vel
- score do lead
- score do cliente
- score da relaÃ§Ã£o
- score de comportamento
- score de qualidade operacional

-------------------------------------

## 14. Trust, Safety, DenÃºncias, Banimento e AvaliaÃ§Ãµes

NÃ£o implementar agora.

Registrar como core futuro obrigatÃ³rio.

O Hurby deve futuramente permitir denÃºncias em:

- usuÃ¡rios
- clientes
- corretores
- imobiliÃ¡rias
- anÃºncios
- imÃ³veis
- mensagens
- atendimentos
- publicidades
- pÃ¡ginas profissionais
- conteÃºdos

As denÃºncias devem prever:

- motivo obrigatÃ³rio
- descriÃ§Ã£o
- categoria
- evidÃªncias
- IP
- user agent
- dispositivo/navegador
- sessÃ£o
- origem
- timestamp
- geolocalizaÃ§Ã£o aproximada quando legalmente adequada e consentida
- entidade denunciada
- usuÃ¡rio denunciante
- anÃ¡lise automÃ¡tica
- fila humana
- decisÃ£o
- retenÃ§Ã£o de evidÃªncias para defesa jurÃ­dica

AvaliaÃ§Ãµes futuras devem ser contextuais:

- anÃºncio
- atendimento
- corretor
- imÃ³vel
- imobiliÃ¡ria
- experiÃªncia geral

AvaliaÃ§Ãµes e denÃºncias devem alimentar futuramente:

- score
- reputaÃ§Ã£o
- monitoria
- alertas
- prevenÃ§Ã£o de fraude
- melhoria de anÃºncios
- orientaÃ§Ã£o comercial
- qualificaÃ§Ã£o profissional

Cores futuros sugeridos:

- CORE_TRUST_SAFETY
- CORE_REVIEWS
- CORE_SCORE

-------------------------------------

## 15. Profissionais sem CRECI

Profissionais sem CRECI nÃ£o devem operar livremente como corretores.

Eles podem existir futuramente apenas em modalidade restrita e rastreÃ¡vel, preferencialmente vinculados a:

- corretor verificado
- imobiliÃ¡ria verificada

Eles nÃ£o devem ter:

- mesmos privilÃ©gios de corretor verificado
- mesma visibilidade
- mesmo acesso a dados sensÃ­veis
- selo profissional equivalente
- capacidade plena de receber leads qualificados

A plataforma deve priorizar:

- seguranÃ§a do consumidor
- proteÃ§Ã£o jurÃ­dica do Hurby
- valorizaÃ§Ã£o do corretor regularizado
- prevenÃ§Ã£o contra golpes
- rastreabilidade operacional

-------------------------------------

## 16. Arquivos e migrations consolidados nesta etapa

Migrations alteradas:

- supabase/migrations/20260504000000_base_clean.sql
- supabase/migrations/20260504000100_profiles.sql
- supabase/migrations/20260506021141_auth_profile_trigger.sql

Migration criada:

- supabase/migrations/20260510120000_core_identity_clients_foundation.sql

Frontend alterado:

- src/app/page.tsx
- src/app/login/page.tsx
- src/app/broker/page.tsx

Preservados:

- middleware.ts
- wallet_ledger
- wallet_balance
- consent_logs
- audit_logs
- organizations
- organization_memberships
- portfolios
- portfolio_items
- operational_origins
- property_assets
- property_listings
- create_property_operational_bundle

-------------------------------------

## 17. ValidaÃ§Ãµes realizadas

ValidaÃ§Ãµes confirmadas:

- supabase db reset
- npm run build
- login profissional
- criaÃ§Ã£o de broker_profile
- redirecionamento para /broker
- broker page sem erro de profile
- busca por user_type/account_tier/PAY_PER_USE limpa
- git commit/push realizado
- working tree clean

-------------------------------------

## 18. PendÃªncias documentais obrigatÃ³rias

Atualizar tambÃ©m:

- context/ecosystem/CANONICAL_OPERATIONAL_MAP.md
- context/ecosystem/BACKLOG_PREVISIBILIDADE_ARQUITETURAL.md
- context/modules/core_clients/global_clients.md
- context/modules/core_clients/protocol_clients.md

Corrigir referÃªncias antigas de:

hurby-operational-protocol.md

para:

docs/protocols/hurby-operational-protocol.md

em comandos, handoffs, checklists e documentaÃ§Ã£o.

-------------------------------------

## 19. Regra de continuidade

Esta missÃ£o deve parar apÃ³s:

- auditoria senior
- atualizaÃ§Ã£o documental
- commit da documentaÃ§Ã£o
- handoff final

NÃ£o iniciar agora:

- Core Leads V2
- Core Marketplace
- Core Funnel
- Core Contracts
- Core Trust/Safety
- Core Score
- Core Reviews
- Core Properties Form V1
- Core Products/Economy

-------------------------------------

## 20. PrÃ³xima missÃ£o recomendada

Antes de novo core funcional, concluir documentaÃ§Ã£o desta missÃ£o.

Depois da documentaÃ§Ã£o e handoff, a prÃ³xima missÃ£o estrutural deve ser definida com base no mapa canÃ´nico.

RecomendaÃ§Ã£o provÃ¡vel:

- CORE_ORIGINS_FOUNDATION
ou
- CORE_VISIBILITY_FOUNDATION

A escolha deve considerar dependÃªncia para Leads, Marketplace, Clients e Properties.

-------------------------------------

## 21. Status final da missÃ£o atual

CORE_IDENTITY_REBUILD + CORE_CLIENTS_FOUNDATION:

- Banco: aprovado
- Build: aprovado
- Login: aprovado
- Broker profile: aprovado
- Core Clients foundation: aprovado
- Compatibilidade Ledger: preservada
- Compatibilidade LGPD: preservada
- Compatibilidade Properties: preservada
- Status: validado localmente

MissÃ£o em fase documental final.


-------------------------------------

## 22. HURBY_CONTEXT_UPDATE_20260511_OWNER_BROKER_AGENCY_VALIDATION

Data: 2026-05-11  
Status: CICLO TEMPORARIO OWNER/BROKER/AGENCY VALIDADO LOCALMENTE

### 22.1. Estado validado

Foi validado localmente o ciclo temporario de acesso envolvendo:

- Owner temporario de validacao
- Broker
- Agency
- Conta comum de marketplace
- Distribuicao de AXE via Owner
- Persistencia em wallet_ledger
- Reflexo em wallet_balance

### 22.2. Owner temporario

O Owner temporario nao representa o Core Owner/Admin definitivo.

Ele existe apenas para validar:

- login Owner
- acesso a /owner
- listagem de usuarios
- listagem de imoveis
- distribuicao manual de AXE
- leitura de saldos
- comportamento basico de administracao temporaria

Regra validada:

- primary_entry_flow = platform_owner
- account_status = active
- registration_status = completed

### 22.3. Causa raiz do problema de Owner

O cadastro Owner estava nascendo como seeker porque o signUp nao enviava primary_entry_flow = platform_owner no metadata e o update posterior nao gravava esse campo.

Com isso, o login caia no fluxo comum de marketplace/account.

Correcao aplicada no cadastro Owner:

- normalizacao de nome e e-mail
- metadata de signUp com primary_entry_flow = platform_owner
- upsert em users_profile com primary_entry_flow = platform_owner
- validacao via RPC is_platform_owner antes de redirecionar para /owner

### 22.4. Rotas e direcionamentos

Fluxos principais validados:

- Broker acessa /broker
- Agency acessa /agency
- Agency tambem pode acessar /broker
- Usuario comum permanece em /account
- Owner acessa /owner
- Rotas profissionais continuam protegidas para usuario comum

Ponto nao bloqueante registrado:

- Owner tentando acessar /broker pode cair em /account neste ciclo temporario.
- Nao corrigir agora se nao bloquear o fluxo principal.
- Tratar futuramente quando o Core Owner/Admin definitivo existir.

### 22.5. AXE Owner temporario

A distribuicao de AXE pelo Owner voltou a funcionar.

Causa raiz do erro:

- RPC owner_add_axe usava origem ADMIN.
- ADMIN nao existe no enum coin_origin_type.
- Valores reais validados:
  - coin_origin_type = BONUS
  - coin_credit_type = BONUS

Correcao validada:

- owner_add_axe grava CREDIT / BONUS / BONUS no wallet_ledger
- wallet_balance reflete o saldo
- broker de teste recebeu saldo com sucesso
- valores de teste no broker podem estar inflados por testes manuais no frontend

### 22.6. Ponto de atencao: statement/extrato

Foram percebidas logicas equivocadas no fluxo de extrato/statement.

Decisao:

- nao corrigir agora
- manter fluxo atual funcional
- registrar no backlog financeiro/ledger
- corrigir em missao especifica posterior

### 22.7. Estado final da missao

Estado final validado:

- cadastro Owner temporario corrigido
- Owner reconhecido como platform_owner
- painel Owner acessivel
- broker acessivel
- agency acessivel
- usuario comum preservado
- ledger preservado
- owner_add_axe funcionando
- wallet_balance refletindo credito
- build/dev recuperado apos reset do npm run dev
- pendencia de statement registrada para backlog

-------------------------------------

-------------------------------------

## 23. HURBY_CONTEXT_UPDATE_20260512_FOUNDATION_STABILIZATION_ENVIRONMENT_GUARD

Data: 2026-05-12
Status: MARCO DE ESTABILIZACAO CRIADO + ALERTA CRITICO DE AMBIENTE

### 23.1. Marco de estabilizacao

Foi criada e enviada ao GitHub a tag de estabilizacao:

- hurby-foundation-v1-auth-clients-properties-axe

Objetivo da tag:

- marcar a base foundation validada
- preservar historico do GitHub
- criar ponto de retorno confiavel
- separar fase experimental/refatorada da fase estruturada
- servir como referencia para os proximos cores

Escopo validado ate este marco:

- Auth
- users_profile neutro
- Core Clients foundation
- Broker foundation
- Agency/Organizations/Memberships
- Core Properties marketplace e operacional
- AXE/Ledger preservado
- Owner temporario de validacao
- Usuario comum marketplace
- Broker
- Agency
- Cadastro comum
- Cadastro de anuncio simples
- Regra de 1 anuncio gratuito
- Staging reconstruido corretamente
- Vercel validado
- supabase/.temp removido do versionamento Git

### 23.2. Causa raiz do erro de Staging/Vercel

Foi identificado erro critico de ambiente.

O Supabase CLI estava linkado no DEV Cloud:

- wcmbhgjcnhmitetsetpu

Enquanto o Vercel/Staging usava:

- mowkpcwsylogpxsnjfhd

Consequencia:

- comandos supabase db query --linked
- supabase db reset --linked
- supabase db push
- reload schema cache
- validacoes de tabela
- validacoes de trigger
- validacoes de schema

estavam sendo executados no banco errado.

O Vercel continuava apontando para o Staging real, que ainda estava com schema antigo.

Erro observado:

- PGRST204
- Could not find the 'account_status' column of 'users_profile' in the schema cache

Diagnostico final:

O problema nao era o frontend, nem o middleware, nem o cadastro comum.
O problema era divergencia de ambiente remoto entre CLI e Vercel.

### 23.3. Regra obrigatoria de verificacao de Project Ref

Antes de qualquer comando remoto Supabase CLI, e obrigatorio verificar o Project Ref linkado.

Comando obrigatorio:

Get-Content "supabase\.temp\project-ref"

Comparar sempre com o ambiente alvo.

Referencias atuais:

LOCAL:
- http://127.0.0.1:54321

DEV Cloud:
- wcmbhgjcnhmitetsetpu

STAGING:
- mowkpcwsylogpxsnjfhd

Regra:

E proibido executar os comandos abaixo sem validar o Project Ref:

- supabase db query --linked
- supabase db push
- supabase db reset --linked
- supabase link
- reload schema cache remoto
- validacao remota de tabelas, RPCs, triggers ou policies

Checklist antes de qualquer comando --linked:

1. Verificar project-ref.
2. Confirmar ambiente alvo: DEV Cloud, STAGING ou PROD.
3. Comparar com as variaveis do Vercel quando a validacao envolver site publicado.
4. Confirmar que o banco alvo e descartavel antes de reset remoto.
5. So entao executar o comando.

### 23.4. Regra obrigatoria de schema cache Supabase/PostgREST

Apos qualquer migration ou alteracao estrutural de banco que envolva:

- tabelas
- colunas
- views
- RPCs
- funcoes
- enums
- RLS/policies
- triggers
- assinaturas consumidas pelo frontend/API REST

executar obrigatoriamente:

select pg_notify('pgrst', 'reload schema');

Motivo:

O banco pode estar correto, mas a API REST do Supabase/PostgREST pode continuar com schema antigo em cache.

Esse passo deve ser tratado como requisito de release, nao como correcao opcional.

### 23.5. Regra de conclusao de core

Nenhum core deve ser considerado concluido apenas por funcionar minimamente.

Sequencia obrigatoria:

1. Criar foundation do core.
2. Validar funcionamento minimo.
3. Modelar o core com visao final/estrutural madura.
4. Validar fluxos reais.
5. So entao considerar o core concluido.

Objetivo:

Evitar entregas genericas chamadas de "core pronto" quando a arquitetura ainda esta incompleta.

### 23.6. Checklist obrigatorio de commit/deploy/release

Antes de considerar qualquer entrega concluida:

1. Executar git status.
2. Revisar arquivos alterados.
3. Executar npm run build.
4. Executar supabase db reset local quando houver migration estrutural.
5. Confirmar Project Ref antes de qualquer comando --linked.
6. Se banco mudou, aplicar no ambiente cloud correto.
7. Executar reload schema cache.
8. Validar RPCs, funcoes, colunas e assinaturas criticas.
9. Aguardar Vercel com status Ready.
10. Testar fluxo real no ambiente publicado.
11. So entao considerar concluido.

### 23.7. Mudancas criticas devem constar no handoff

Toda mudanca critica de arquitetura deve ser registrada no handoff com:

- o que mudou
- por que mudou
- impacto
- risco
- rollback
- validacao feita
- alerta para o proximo executor

Aplica-se a mudancas em:

- tabelas
- colunas
- migrations
- RPCs/funcoes
- triggers
- RLS/policies
- enums
- login
- permissoes
- rotas
- services
- contratos de dados
- frontend dependente de banco
- ambientes DEV/STAGING/PROD

### 23.8. Backlog de rotas e Owner temporario

Registrar para revisao posterior:

- /owner
- /agency
- /broker
- /statement
- /operations
- /account

O Owner temporario, por ser dono/tester do portal, pode precisar navegar por areas ampliadas para fiscalizar:

- interfaces
- design
- usuarios
- imoveis
- saldo
- extratos
- fluxos operacionais

Essa permissao deve ser tratada como regra temporaria de validacao e nao deve ser confundida com o futuro Core Owner/Admin definitivo.
