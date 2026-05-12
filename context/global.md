# HURBY — GLOBAL PROJECT STATE

Data: 2026-05-10

Status geral: CORE_IDENTITY_REBUILD + CORE_CLIENTS_FOUNDATION validado localmente

Repositório oficial:
https://github.com/hurbyapp/hurby-core.git

Ambiente atual:
- DEV/local: ativo para desenvolvimento e reset controlado
- STAGING: usado para testes de deploy e comportamento em ambiente virtual
- PROD: ainda não usado para dados reais

Regra de ambiente:
DEV/STAGING não possuem dados importantes ou consistentes neste momento. Quando a modelagem estrutural exigir, é permitido ajustar migrations, remover/refatorar migrations ruins, rodar reset local, sincronizar STAGING e revalidar, desde que PROD não seja afetado.

-------------------------------------

## 1. Estado consolidado do ecossistema

O HURBY está em fase de construção canônica das foundations operacionais.

O projeto não deve ser tratado como:

- ERP imobiliário tradicional
- sistema centrado apenas em imóveis
- sistema centrado apenas em imobiliárias
- portal fechado de anúncios

O HURBY deve ser tratado como:

- ecossistema operacional imobiliário
- rede comercial colaborativa
- plataforma de relacionamento e distribuição
- sistema operacional profissional para corretores e imobiliárias
- infraestrutura integrada ao marketplace Cadê Negócios

-------------------------------------

## 2. Foundations já consolidadas

Já foram criadas e validadas as seguintes bases:

- Auth foundation
- SSR/middleware foundation
- Ledger/Axé foundation
- LGPD/compliance foundation
- Organizations/Memberships foundation
- Core Real Estate Operational Foundation
- Core Identity Rebuild
- Core Clients Foundation inicial
- Broker Profile foundation

-------------------------------------

## 3. Core Real Estate Operational Foundation

A fundação imobiliária operacional foi concluída e validada.

O imóvel deixou de ser tratado como cadastro isolado e passou a fazer parte de um contexto operacional composto por:

- portfolio
- portfolio_item
- operational_origin
- property_asset
- property_asset_location
- property_asset_features
- property_listing
- property_listing_media

A criação de imóvel operacional deve continuar ocorrendo pela RPC transacional:

- public.create_property_operational_bundle

Essa RPC cria, em uma única operação:

- portfolio individual, se não existir
- operational_origin
- property_asset
- property_asset_location
- property_asset_features
- property_listing
- portfolio_item

A função usa auth.uid() como referência de segurança e evita criação parcial ou registros órfãos no fluxo principal.

O Core Properties foi validado em:

- banco local
- Supabase STAGING
- Vercel
- fluxo broker
- cadastro de imóvel
- listagem
- detalhe
- edição básica

-------------------------------------

## 4. Core Properties Form V1

CORE_PROPERTIES_FORM_V1 não deve ser executado agora.

Status:
BACKLOG FUTURO / NÃO EXECUTAR NESTE MOMENTO

Natureza:
Melhoria e ampliação do formulário de cadastro/edição de imóveis.

Motivo:
O formulário atual já cumpre o papel de validação da foundation imobiliária. Melhorar a experiência do formulário é útil, mas não é o próximo gargalo estrutural do ecossistema.

Decisão:

- não abrir missão CORE_PROPERTIES_FORM_V1 agora
- não refatorar formulário neste momento
- não expandir campos de imóvel agora
- não mexer na foundation validada sem necessidade real
- não alterar RPC create_property_operational_bundle sem necessidade real
- não alterar RLS, storage ou lifecycle de listing nesta etapa

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

Foi realizada a reconstrução da base de identidade.

Decisão central:

users_profile não representa mais corretor, cliente, agência, proprietário ou plano comercial.

users_profile agora representa apenas a conta autenticada neutra.

Contrato técnico preservado:

auth.users.id = users_profile.id

Isso mantém compatibilidade com:

- Ledger/Axé
- Wallet
- LGPD
- Audit
- Organizations
- Memberships
- Portfolio
- Properties
- RPC create_property_operational_bundle

Foram removidas da fundação ativa as semânticas antigas:

- user_type
- account_tier
- broker automático
- PAY_PER_USE automático em users_profile

A trigger de criação de usuário agora cria apenas profile neutro.

Arquivos envolvidos:

- supabase/migrations/20260504000000_base_clean.sql
- supabase/migrations/20260504000100_profiles.sql
- supabase/migrations/20260506021141_auth_profile_trigger.sql
- src/app/page.tsx

-------------------------------------

## 6. Core Clients Foundation

Foi criada a fundação inicial do Core Clients.

Cliente no HURBY não é uma tabela simples nem um dado solto.

Cliente é uma entidade relacional e contextual.

A mesma pessoa pode existir em múltiplos contextos:

- usuário comum do marketplace
- pessoa buscando imóvel
- proprietário/fornecedor de imóvel
- comprador
- locatário
- cliente de corretor
- cliente de imobiliária
- contato vindo de campanha
- contato importado
- futuro lead
- parte de contrato

A foundation criada prevê:

- client_entities
- client_contact_methods
- client_relationships
- client_relationship_roles

Princípios:

- não duplicar pessoa sem estratégia
- não misturar cliente com usuário autenticado
- não misturar cliente com lead
- não prender cliente a um único corretor sem contexto
- não criar dado sensível sem rastreabilidade
- preservar LGPD desde a foundation
- permitir relacionamento futuro com marketplace, leads, contratos, funil, imóveis e gestão

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

- corretor não é users_profile
- corretor é uma camada profissional vinculada a uma conta neutra
- CRECI, validação, visibilidade e status profissional pertencem ao broker_profile
- profissionais sem CRECI não devem ter os mesmos privilégios de corretores verificados

Status previstos:

- professional_status
- verification_status
- public_visibility_status

A verificação profissional deve evoluir futuramente para:

- validação de CRECI
- revisão manual
- selos progressivos
- reputação operacional
- restrições por risco
- trust/safety

-------------------------------------

## 8. Login e roteamento profissional

O login foi ajustado para não depender mais de user_type.

O login profissional agora considera:

- organization_membership ativo como owner/manager
- broker_profile existente
- ausência de contexto profissional

Regras atuais:

- usuário com membership institucional ativo pode ir para /agency
- usuário com broker_profile pode ir para /broker
- usuário sem contexto profissional não deve ser jogado automaticamente para /broker
- users_profile não deve mais definir acesso profissional sozinho

Arquivos alterados:

- src/app/login/page.tsx
- src/app/broker/page.tsx

Middleware:

- middleware.ts foi preservado
- ele continua responsável apenas por autenticação/proteção de rotas
- não deve carregar lógica de perfil profissional neste momento

-------------------------------------

## 9. Cadê Negócios e Hurby/Hurb

A arquitetura de navegação deve prever dois ambientes integrados:

Cadê Negócios:
- marketplace público
- busca de imóveis
- favoritos
- anúncios comuns
- conta comum de usuário
- navegação pública

Hurby/Hurb:
- sistema operacional profissional
- corretor
- imobiliária
- carteira
- imóveis
- clientes
- contratos futuros
- funil futuro
- gestão futura

Domínios previstos:

- cadênegócios.com.br
- cadênegócios.com.br/hurb
- hurb.com.br

Regra de login:

- login no marketplace não deve redirecionar automaticamente o profissional para o painel
- o profissional logado no marketplace deve navegar como usuário comum
- se for profissional, deve ver acesso claro no topo, como “Hurby Pro” ou “Painel Hurby”
- usuário comum que tentar entrar no ambiente profissional deve ser roteado de volta para o ambiente comum ou receber orientação de ausência de acesso profissional

-------------------------------------

## 10. Entry Flow / Fluxo de Entrada

O projeto não deve usar onboarding genérico depois do login como base de identidade.

A intenção deve vir antes ou durante o cadastro.

Portas de entrada previstas:

- usuário comum do marketplace
- quero anunciar meu imóvel
- sou corretor
- sou imobiliária
- convite institucional
- entrada profissional Hurby/Hurb

Cada porta deve conduzir para formulário adequado.

Exemplos:

Usuário comum:
- nome
- telefone
- e-mail
- conta simples
- favoritos
- dados
- anúncios próprios

Corretor:
- nome
- telefone
- e-mail
- CPF
- CRECI
- UF do CRECI
- cidade/região de atuação
- broker_profile

Imobiliária:
- responsável autenticado
- CNPJ
- razão social
- nome fantasia
- dados institucionais
- organization
- organization_membership

-------------------------------------

## 11. Ledger/Axé

Ledger/Axé está preservado e não deve ser refeito agora.

A análise confirmou que as funções financeiras não dependem semanticamente de users_profile.

O contrato lógico deve continuar:

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
- diferenciar Axé livre e Axé reservado/bloqueado
- preservar preço contratado até fim de ciclo
- reajustes somente em novas contratações/renovações

A assinatura deve ser entendida comercialmente como assinatura, mas tecnicamente pode funcionar como produto/pacote adquirido por período, com Axés reservados para débitos de acesso.

-------------------------------------

## 12. LGPD / Compliance

LGPD foundation deve ser preservada.

register_consent e log_action usam auth.uid() e não dependem de users_profile.user_type.

A fundação de clientes deve continuar respeitando:

- minimização de dados
- finalidade legítima
- rastreabilidade
- consentimento
- retenção adequada
- controle de acesso
- uso cuidadoso de dados sensíveis

client_contact_methods foi criada já preparando:

- validação de contato
- consent_status
- controle futuro de acesso a telefone/e-mail
- integração futura com visibilidade, leads e trust/safety

-------------------------------------

## 13. Score futuro

Score não deve ser implementado agora.

Score será um core/sistema próprio futuro.

A foundation atual precisa apenas estar preparada para ele.

Diretrizes:

- score não pode ser coluna simples em users_profile
- score deve ser contextual
- score de marketplace não pode se misturar com score profissional
- score precisa ter lastro explicável
- score deve evitar rótulos discriminatórios
- score deve usar termos operacionais, como:
  - nível de verificação
  - intenção
  - maturidade da jornada
  - confiabilidade cadastral
  - reputação operacional
  - qualidade do atendimento

Scores futuros possíveis:

- score da conta
- score do corretor
- score da imobiliária
- score do anúncio
- score do imóvel
- score do lead
- score do cliente
- score da relação
- score de comportamento
- score de qualidade operacional

-------------------------------------

## 14. Trust, Safety, Denúncias, Banimento e Avaliações

Não implementar agora.

Registrar como core futuro obrigatório.

O Hurby deve futuramente permitir denúncias em:

- usuários
- clientes
- corretores
- imobiliárias
- anúncios
- imóveis
- mensagens
- atendimentos
- publicidades
- páginas profissionais
- conteúdos

As denúncias devem prever:

- motivo obrigatório
- descrição
- categoria
- evidências
- IP
- user agent
- dispositivo/navegador
- sessão
- origem
- timestamp
- geolocalização aproximada quando legalmente adequada e consentida
- entidade denunciada
- usuário denunciante
- análise automática
- fila humana
- decisão
- retenção de evidências para defesa jurídica

Avaliações futuras devem ser contextuais:

- anúncio
- atendimento
- corretor
- imóvel
- imobiliária
- experiência geral

Avaliações e denúncias devem alimentar futuramente:

- score
- reputação
- monitoria
- alertas
- prevenção de fraude
- melhoria de anúncios
- orientação comercial
- qualificação profissional

Cores futuros sugeridos:

- CORE_TRUST_SAFETY
- CORE_REVIEWS
- CORE_SCORE

-------------------------------------

## 15. Profissionais sem CRECI

Profissionais sem CRECI não devem operar livremente como corretores.

Eles podem existir futuramente apenas em modalidade restrita e rastreável, preferencialmente vinculados a:

- corretor verificado
- imobiliária verificada

Eles não devem ter:

- mesmos privilégios de corretor verificado
- mesma visibilidade
- mesmo acesso a dados sensíveis
- selo profissional equivalente
- capacidade plena de receber leads qualificados

A plataforma deve priorizar:

- segurança do consumidor
- proteção jurídica do Hurby
- valorização do corretor regularizado
- prevenção contra golpes
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

## 17. Validações realizadas

Validações confirmadas:

- supabase db reset
- npm run build
- login profissional
- criação de broker_profile
- redirecionamento para /broker
- broker page sem erro de profile
- busca por user_type/account_tier/PAY_PER_USE limpa
- git commit/push realizado
- working tree clean

-------------------------------------

## 18. Pendências documentais obrigatórias

Atualizar também:

- context/ecosystem/CANONICAL_OPERATIONAL_MAP.md
- context/ecosystem/BACKLOG_PREVISIBILIDADE_ARQUITETURAL.md
- context/modules/core_clients/global_clients.md
- context/modules/core_clients/protocol_clients.md

Corrigir referências antigas de:

hurby-operational-protocol.md

para:

docs/protocols/hurby-operational-protocol.md

em comandos, handoffs, checklists e documentação.

-------------------------------------

## 19. Regra de continuidade

Esta missão deve parar após:

- auditoria senior
- atualização documental
- commit da documentação
- handoff final

Não iniciar agora:

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

## 20. Próxima missão recomendada

Antes de novo core funcional, concluir documentação desta missão.

Depois da documentação e handoff, a próxima missão estrutural deve ser definida com base no mapa canônico.

Recomendação provável:

- CORE_ORIGINS_FOUNDATION
ou
- CORE_VISIBILITY_FOUNDATION

A escolha deve considerar dependência para Leads, Marketplace, Clients e Properties.

-------------------------------------

## 21. Status final da missão atual

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

Missão em fase documental final.


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
