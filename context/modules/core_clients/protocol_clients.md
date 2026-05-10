# HURBY — CORE CLIENTS PROTOCOL

Status: PROTOCOLO OPERACIONAL VALIDADO

Data: 2026-05-10

-------------------------------------

## 1. Objetivo do protocolo

Este protocolo define as regras operacionais para evolução do Core Clients dentro do HURBY.

O Core Clients não deve ser tratado como uma simples tabela de contatos.

Ele é a base relacional que permitirá futuramente:

- leads
- marketplace
- funil de atendimento
- contratos
- gestão de locação
- relacionamento com proprietários
- carteira de clientes
- dados órfãos
- score
- avaliações
- denúncias
- trust/safety
- governança jurídica

-------------------------------------

## 2. Regra central

Cliente no HURBY é entidade relacional e contextual.

Nunca assumir que:

- cliente = usuário autenticado
- cliente = lead
- cliente = proprietário
- cliente = comprador
- cliente = telefone
- cliente = registro único preso a um corretor

A mesma pessoa pode existir em vários contextos.

A modelagem deve sempre preservar:

- entidade
- contexto
- origem
- vínculo
- responsável operacional
- papel exercido
- rastreabilidade
- consentimento futuro
- possibilidade de score futuro
- possibilidade de denúncia futura

-------------------------------------

## 3. users_profile

users_profile é conta autenticada neutra.

É proibido usar users_profile como:

- corretor
- cliente
- imobiliária
- proprietário
- dono de imóvel
- plano comercial
- assinatura
- tipo fixo de usuário

Contrato técnico obrigatório:

auth.users.id = users_profile.id

Esse contrato não deve ser quebrado, pois preserva compatibilidade com:

- Ledger/Axé
- Wallet
- LGPD
- Audit
- Organizations
- Memberships
- Portfolio
- Properties
- RPC create_property_operational_bundle

-------------------------------------

## 4. Broker Profile

Corretor deve ser representado por broker_profiles.

Regras:

- corretor não nasce automaticamente em users_profile
- corretor nasce por fluxo profissional próprio
- CRECI pertence ao broker_profile
- status profissional pertence ao broker_profile
- status de verificação pertence ao broker_profile/broker_verifications
- visibilidade pública profissional pertence ao broker_profile

É proibido recriar lógica baseada em:

- users_profile.user_type
- account_tier
- broker automático
- PAY_PER_USE automático

-------------------------------------

## 5. Broker Verification

Validação profissional deve ser tratada como processo.

Não concentrar toda verificação em um campo único.

broker_verifications deve permitir futuramente:

- validação CRECI
- validação documental
- revisão manual
- integração com API externa
- retorno de validação
- histórico de tentativas
- selos progressivos
- rastreabilidade jurídica

-------------------------------------

## 6. Profissional sem CRECI

Profissional sem CRECI não deve operar livremente como corretor.

Regra futura:

- pode existir apenas em modalidade restrita
- deve ser rastreável
- deve ter permissões limitadas
- não deve receber selo equivalente a corretor validado
- não deve ter o mesmo acesso a dados sensíveis
- preferencialmente deve estar vinculado a corretor ou imobiliária verificada

Essa regra existe para proteger:

- consumidor
- corretor regularizado
- imobiliária séria
- HURBY juridicamente
- reputação do marketplace

-------------------------------------

## 7. Client Entity

client_entities representa pessoa/cliente relacional.

Pode existir:

- com login
- sem login
- criada por corretor
- criada por imobiliária
- criada pelo marketplace
- importada
- captada por campanha
- vinculada futuramente a lead
- vinculada futuramente a contrato

linked_profile_id é opcional.

Nunca exigir login para toda entidade cliente.

-------------------------------------

## 8. Client Contact Methods

Telefone, e-mail e WhatsApp devem ficar em client_contact_methods.

Não espalhar contatos sensíveis em múltiplas tabelas sem governança.

Essa estrutura deve preservar:

- tipo de contato
- contato principal
- status de verificação
- status de consentimento
- rastreabilidade
- controle futuro de visibilidade

Acesso a telefone/e-mail deve futuramente respeitar:

- LGPD
- consentimento
- nível de verificação
- selos
- contexto operacional
- termo de responsabilidade
- regras de leads/funil

-------------------------------------

## 9. Client Relationships

client_relationships é o coração operacional do Core Clients.

Ela deve responder:

- quem é o cliente?
- com quem ele se relaciona?
- quem é responsável por esse relacionamento?
- veio de qual origem?
- está vinculado a qual imóvel?
- está vinculado a qual listing?
- pertence ao marketplace?
- pertence ao corretor?
- pertence à imobiliária?
- virou lead?
- virou parte de contrato?

Toda relação deve ter contexto.

Evitar cliente órfão sem explicação operacional.

-------------------------------------

## 10. Client Relationship Roles

Papéis devem ser contextuais.

Uma pessoa pode ser:

- marketplace_user
- seeker
- property_provider
- buyer
- tenant
- landlord
- contact

Não criar campo único de tipo no client_entities para resolver todos os casos.

Papel depende de relacionamento.

-------------------------------------

## 11. Entry Flow

O HURBY não deve usar onboarding genérico depois do login como base de decisão.

A intenção deve vir antes ou durante o cadastro.

Fluxos previstos:

- usuário comum do marketplace
- quero anunciar meu imóvel
- sou corretor
- sou imobiliária
- convite institucional
- entrada profissional HURBY/Hurb

Cada fluxo deve abrir formulário adequado.

Login não deve perguntar toda vez quem a pessoa é.

Login deve rotear com base em contexto já existente.

-------------------------------------

## 12. Marketplace / Cadê Negócios

Usuário comum do marketplace deve ter conta simples única.

A mesma conta deve permitir:

- buscar imóveis
- salvar favoritos
- atualizar dados
- anunciar imóvel próprio
- acompanhar anúncios próprios
- navegar logado

Usuário comum não deve cair no ambiente de corretor.

Profissional logado no marketplace deve navegar como usuário comum, mas com acesso visível ao painel profissional, como:

- Hurby Pro
- Painel Hurby
- Ambiente Profissional

-------------------------------------

## 13. Login profissional

Login profissional deve respeitar:

- broker_profile existente
- organization_membership ativo
- ausência de contexto profissional

Regras:

- se tem organization_membership owner/manager ativo, pode ir para /agency
- se tem broker_profile ativo, pode ir para /broker
- se não tem contexto profissional, não deve ser jogado para /broker
- users_profile não deve autorizar ambiente profissional sozinho

-------------------------------------

## 14. Relação com Organizations/Memberships

Organizations e Memberships devem continuar sendo a base institucional.

Imobiliária não deve ser users_profile.

Imobiliária deve ser organization.

Responsável pela imobiliária deve ser users_profile + organization_membership.

Acesso institucional deve passar por membership.

-------------------------------------

## 15. Relação com Properties

Core Clients deve se integrar futuramente com:

- property_asset
- property_listing
- portfolio
- portfolio_item
- operational_origin

Exemplos futuros:

- cliente proprietário do imóvel
- cliente interessado no anúncio
- cliente comprador
- cliente locatário
- cliente parte de contrato
- cliente originado por campanha
- cliente absorvido pelo marketplace

Não alterar Core Properties sem necessidade real.

-------------------------------------

## 16. Relação com Leads

Core Clients não é Core Leads.

Não implementar lead dentro do Core Clients.

Leads futuros devem usar clients como base relacional, mas nascer em core próprio.

O lead deve poder apontar para:

- client_entity
- client_relationship
- property_listing
- broker_profile
- organization
- origin
- funil/atendimento futuro

-------------------------------------

## 17. Relação com Contratos

Core Clients deve preparar base para contratos, mas não implementar contratos agora.

Contratos futuros poderão usar:

- client_entity
- client_relationship
- broker_profile
- organization
- property_asset
- property_listing

Exemplos de papéis contratuais futuros:

- vendedor
- comprador
- locador
- locatário
- corretor intermediador
- imobiliária administradora
- testemunha
- representante

-------------------------------------

## 18. Relação com LGPD

Toda evolução do Core Clients deve respeitar:

- minimização de dados
- finalidade legítima
- consentimento
- rastreabilidade
- retenção adequada
- direito de exclusão quando aplicável
- defesa jurídica quando necessária
- controle de acesso a dados sensíveis

Dados de contato não devem ser expostos sem regra clara.

-------------------------------------

## 19. Relação com Ledger/Axé

Core Clients não deve mexer diretamente no Ledger/Axé.

Futuras monetizações envolvendo clientes devem ser tratadas pelos cores adequados:

- Leads
- Products/Economy
- Marketplace
- Funil
- Contratos
- Serviços

Ledger continua baseado em:

- wallet_ledger.user_id
- wallet_balance.user_id
- auth.users.id

-------------------------------------

## 20. Score futuro

Score não deve ser implementado neste core.

Mas toda evolução de Clients deve preservar compatibilidade com score contextual futuro.

É proibido criar:

- users_profile.score
- client_entities.score como solução definitiva
- score sem explicação
- score misturando marketplace e reputação profissional

Score futuro deve ser sistema próprio.

-------------------------------------

## 21. Trust/Safety futuro

Denúncias, banimento, monitoria e antifraude não devem ser implementados agora.

Mas a foundation deve permitir que futuramente sejam denunciáveis:

- users_profile
- client_entity
- broker_profile
- organization
- property_listing
- property_asset
- atendimento
- mensagem
- publicidade
- conteúdo

O core futuro deve registrar evidências técnicas quando legalmente adequado:

- IP
- user agent
- sessão
- origem
- timestamp
- dispositivo/navegador
- geolocalização aproximada quando permitida
- entidade denunciada
- denunciante
- decisão humana
- retenção para defesa jurídica

-------------------------------------

## 22. Avaliações futuras

Avaliações não devem ser implementadas agora.

Futuramente poderão avaliar:

- anúncio
- atendimento
- corretor
- imóvel
- imobiliária
- experiência geral

Avaliações devem alimentar:

- qualidade
- reputação
- score
- alertas
- melhoria de anúncio
- orientação comercial
- qualificação profissional

-------------------------------------

## 23. Regras de alteração

Antes de alterar qualquer arquivo do Core Clients:

1. pedir o conteúdo atual do arquivo
2. revisar impacto em Identity, Broker, Organizations, Properties, LGPD e Ledger
3. preservar o histórico relevante
4. não refatorar por estética
5. não criar dependência circular
6. não misturar leads, contratos, score ou trust/safety neste core
7. registrar qualquer pendência no backlog

-------------------------------------

## 24. Regras de banco

Antes de criar nova migration relacionada ao Core Clients:

1. verificar migrations existentes
2. validar FKs com users_profile
3. preservar auth.users.id = users_profile.id
4. validar RLS
5. rodar supabase db reset local
6. rodar npm run build
7. testar fluxo mínimo
8. só depois commitar

DEV/STAGING podem ser resetados enquanto não houver dados reais.

PROD não deve ser afetado.

-------------------------------------

## 25. Status atual

Core Clients Foundation validado localmente.

Validado:

- migration aplicada
- supabase db reset
- npm run build
- login profissional
- criação de broker_profile
- acesso ao /broker
- erro de user_type corrigido
- compatibilidade com Ledger preservada
- compatibilidade com LGPD preservada
- compatibilidade com Properties preservada

-------------------------------------

## 26. Próximos passos permitidos

Permitido agora:

- atualizar documentação
- atualizar backlog
- atualizar mapa canônico
- gerar handoff final da missão

Não permitido agora:

- implementar score
- implementar denúncias
- implementar avaliações
- implementar leads
- implementar marketplace
- implementar contratos
- ampliar formulário de imóveis
- refatorar properties sem necessidade real
