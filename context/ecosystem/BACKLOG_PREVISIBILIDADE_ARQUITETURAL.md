# HURBY â€” BACKLOG DE PREVISIBILIDADE ARQUITETURAL

STATUS: REGISTRO OFICIAL DE PENDÃŠNCIAS FUTURAS  
TIPO: BACKLOG TÃ‰CNICO / CONCEITUAL  
ESCOPO: DECISÃ•ES IDENTIFICADAS DURANTE REVISÃƒO DO CORE OPERACIONAL  
ÃšLTIMA ATUALIZAÃ‡ÃƒO: 2026-05-10  

-------------------------------------

# OBJETIVO

Este documento registra decisÃµes, pendÃªncias, riscos e ajustes que foram identificados durante a revisÃ£o estrutural do ecossistema HURBY.

A funÃ§Ã£o deste backlog Ã© evitar que observaÃ§Ãµes importantes fiquem perdidas em chat, memÃ³ria informal ou decisÃµes soltas.

Sempre que algo for tratado como:

- deixar por enquanto
- congelar como foundation
- revisar depois
- corrigir antes de produÃ§Ã£o
- refatorar futuramente
- nÃ£o expandir agora
- dependente de outro core
- bom para teste, mas nÃ£o ideal para futuro

deve ser registrado aqui.

-------------------------------------

# 1. LEADS

STATUS: REFAZER DO ZERO

A estrutura atual de leads foi considerada fraca para a nova visÃ£o operacional do HURBY.

Como ainda nÃ£o foi utilizada em produÃ§Ã£o, nÃ£o compensa reaproveitar a foundation existente.

DecisÃ£o:

- descartar a modelagem atual como core definitivo
- criar futuramente um CORE_LEADS_V2
- leads devem nascer ligados a origem, contexto, funil, marketplace, campanha, pÃ¡gina, listing, carteira e ownership contextual

Motivo:

Lead no HURBY nÃ£o Ã© apenas contato.

Lead representa relacionamento operacional rastreÃ¡vel.

DependÃªncias futuras:

- Core Portfolio
- Core Origins
- Core Visibility
- Core Funnel
- Core Marketplace

-------------------------------------

# 2. CORE PROPERTIES

STATUS: PRESERVAR COMO FOUNDATION, MAS NÃƒO EXPANDIR AGORA

A separaÃ§Ã£o entre property_asset e property_listing estÃ¡ correta e deve ser preservada.

DecisÃ£o:

- manter asset separado de listing
- manter mÃ­dia vinculada ao listing
- manter service layer
- nÃ£o expandir formulÃ¡rio de cadastro agora
- nÃ£o desenvolver gestÃ£o avanÃ§ada de imÃ³vel ainda
- nÃ£o acoplar marketplace, leads, IA ou financeiro neste core neste momento

PendÃªncia futura:

- adaptar criaÃ§Ã£o de imÃ³veis para portfolio_id
- incluir operational_context
- incluir origin_context
- incluir visibility_scope
- incluir responsible_operator
- substituir ou complementar managed_by_profile_id

Motivo:

O fluxo atual funciona para corretor solo, mas ainda nÃ£o representa o ecossistema operacional completo.

-------------------------------------

# 3. managed_by_profile_id

STATUS: ACEITÃVEL TEMPORARIAMENTE

O campo managed_by_profile_id funciona para a foundation inicial, mas nÃ£o deve ser tratado como arquitetura final.

Problema:

Ele amarra diretamente imÃ³vel/listing ao usuÃ¡rio, sem representar carteira, organizaÃ§Ã£o, origem, contexto ou visibilidade.

DecisÃ£o futura:

Substituir ou complementar por:

- portfolio_id
- operational_context_id
- origin_id
- responsible_operator_id
- organization_id, quando aplicÃ¡vel
- created_by_profile_id
- visibility_scope

Motivo:

O HURBY nÃ£o trabalha apenas com relaÃ§Ã£o simples usuÃ¡rio â†’ imÃ³vel.

Ele trabalha com contexto operacional.

-------------------------------------

# 4. FINANCEIRO / AXÃ‰

STATUS: PRESERVAR LEDGER, REVISAR FUNÃ‡Ã•ES

A arquitetura de ledger deve ser preservada.

O ledger Ã© a fonte oficial de verdade financeira.

PorÃ©m, algumas funÃ§Ãµes RPC precisam ser revisadas antes de produÃ§Ã£o.

Riscos identificados:

- funÃ§Ãµes recebendo p_user_id diretamente
- frontend chamando consume_coin com user.id
- purchase_coin sem validaÃ§Ã£o real de pagamento
- transfer_coin nÃ£o deve ser produto ativo agora
- expire_coin precisa controle por lote para evitar expiraÃ§Ã£o duplicada

DecisÃµes:

- ledger fica
- wallet_balance fica como cache derivado
- frontend nÃ£o deve decidir usuÃ¡rio financeiro
- funÃ§Ãµes financeiras devem usar auth.uid() quando forem de usuÃ¡rio comum
- funÃ§Ãµes administrativas devem ter camada de autorizaÃ§Ã£o explÃ­cita
- transfer_coin deve ficar congelada ou removida
- purchase_coin precisa depender de pedido/pagamento real

-------------------------------------

# 5. BROKER PAGE

STATUS: TELA DE TESTE

A pÃ¡gina broker atual contÃ©m botÃ£o de teste para consumir 10 AXE.

DecisÃ£o:

- preservar enquanto ambiente de teste
- remover ou substituir antes de produÃ§Ã£o
- nÃ£o usar como padrÃ£o definitivo de consumo financeiro

Motivo:

O frontend nÃ£o deve chamar funÃ§Ã£o financeira passando p_user_id diretamente.

-------------------------------------

# 6. LOGIN / SIGNUP / ENTRY FLOW

STATUS: RECONSTRUÃDO COMO FOUNDATION NEUTRA, COM EVOLUÃ‡ÃƒO FUTURA

O login/signup deixou de depender de user_type.

DecisÃ£o consolidada:

- users_profile Ã© conta autenticada neutra
- corretor Ã© broker_profile
- imobiliÃ¡ria Ã© organization + organization_membership
- usuÃ¡rio comum do marketplace deve ter conta simples
- login nÃ£o deve perguntar toda vez quem a pessoa Ã©
- login deve rotear conforme contexto jÃ¡ existente
- entrada profissional deve ocorrer por fluxo prÃ³prio
- entrada comum do marketplace deve permanecer no ambiente comum

O signup profissional atual cria:

- auth.users
- users_profile neutro
- broker_profile

O login profissional atual considera:

- organization_membership owner/manager ativo
- broker_profile existente
- ausÃªncia de contexto profissional

PendÃªncias futuras:

- criar login pÃºblico do marketplace
- criar entrada profissional /hurb
- criar pÃ¡gina institucional Hurby/Hurb
- criar fluxo prÃ³prio para cadastro de imobiliÃ¡ria
- criar fluxo prÃ³prio para usuÃ¡rio comum anunciante
- criar conta comum do marketplace com favoritos/dados/anÃºncios
- criar seletor de ambiente somente quando o usuÃ¡rio tiver mÃºltiplos contextos
- criar item de menu "Hurby Pro" ou "Painel Hurby" para profissional logado no marketplace

Regra:

Login feito no marketplace nÃ£o deve redirecionar automaticamente para /broker.

Login feito no ambiente profissional deve validar contexto profissional.

Motivo:

A intenÃ§Ã£o deve ser definida antes ou durante o cadastro, e nÃ£o por onboarding genÃ©rico depois do login.

-------------------------------------

# 7. AGENCY

STATUS: FOUNDATION BOA

A pÃ¡gina agency estÃ¡ bem alinhada com a nova visÃ£o.

Pontos corretos:

- agency nÃ£o Ã© user_type
- acesso por organization_memberships
- valida membership_status active
- restringe acesso para owner e manager

PendÃªncias futuras:

- mÃºltiplas organizaÃ§Ãµes por usuÃ¡rio
- seleÃ§Ã£o de organizaÃ§Ã£o ativa
- contexto operacional ativo
- gestÃ£o de membros
- homologaÃ§Ã£o de corretores
- carteira institucional
- permissÃµes por escopo

-------------------------------------

# 8. STORAGE / MÃDIA DE IMÃ“VEL

STATUS: BOA BASE, REVISAR ANTES DE PRODUÃ‡ÃƒO

DecisÃµes corretas:

- bucket privado
- signed URL
- mÃ­dia vinculada ao listing
- nÃ£o vincular mÃ­dia diretamente ao asset

PendÃªncia:

- revisar policies de storage
- impedir upload indevido em listing de terceiro
- validar ownership/contexto antes de upload
- alinhar storage com portfolio e visibility

-------------------------------------

# 9. LGPD / AUDITORIA

STATUS: FOUNDATION BOA, MAS INCOMPLETA

A base de LGPD e consentimento Ã© Ãºtil, mas ainda nÃ£o cobre toda a visÃ£o futura.

PendÃªncias:

- unificar audit_logs
- evitar dois caminhos oficiais de auditoria
- criar lifecycle de retenÃ§Ã£o de dados
- criar regra de inatividade
- criar regra de exclusÃ£o
- criar regra de anonimizaÃ§Ã£o
- criar lÃ³gica de dados Ã³rfÃ£os
- criar absorÃ§Ã£o contextual pelo marketplace
- registrar evidÃªncia de ciÃªncia do usuÃ¡rio quando aplicÃ¡vel

Motivo:

O HURBY trabalha com memÃ³ria operacional viva, mas precisa respeitar retenÃ§Ã£o, finalidade e proteÃ§Ã£o de dados.

-------------------------------------

# 10. CORE PORTFOLIO

STATUS: PRÃ“XIMO CORE OBRIGATÃ“RIO

O Core Portfolio deve ser consolidado antes da expansÃ£o de imÃ³veis, leads, marketplace, parcerias e visibilidade.

FunÃ§Ã£o:

Portfolio representa carteira operacional contextual.

Ele deve conectar:

- profile
- organization
- membership
- property_asset
- property_listing
- origins
- visibility
- responsibility
- partnerships futuras

DecisÃ£o:

NÃ£o avanÃ§ar em formulÃ¡rio completo de imÃ³veis antes do Core Portfolio.

Motivo:

Sem Portfolio, o sistema volta a cair no modelo simples usuÃ¡rio â†’ imÃ³vel, que nÃ£o representa o HURBY real.

-------------------------------------

# 11. CORE MARKETPLACE / CADÃŠ NEGÃ“CIOS

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

O marketplace CadÃª NegÃ³cios serÃ¡ a camada pÃºblica de circulaÃ§Ã£o do ecossistema.

NÃ£o implementar ainda.

PendÃªncias futuras:

- origem do lead
- ownership contextual do lead
- exclusividade paga por imobiliÃ¡ria
- anÃºncio de usuÃ¡rio comum
- integraÃ§Ã£o com portais externos
- anÃºncios patrocinados
- AdSense
- comportamento de navegaÃ§Ã£o
- inteligÃªncia de rejeiÃ§Ã£o
- banco de oportunidades

DependÃªncias:

- Core Portfolio
- Core Leads V2
- Core Visibility
- Core Origins
- Core Products
- Core Economy

-------------------------------------

# 12. PÃGINAS PERSONALIZADAS

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

As pÃ¡ginas personalizadas serÃ£o produto comercial da presenÃ§a digital.

NÃ£o implementar ainda.

PendÃªncias futuras:

- pÃ¡gina gratuita
- nÃ­vel 1
- nÃ­vel 2
- nÃ­vel 3
- domÃ­nio prÃ³prio
- analytics
- reputaÃ§Ã£o pÃºblica
- mÃ³dulos desbloqueados refletidos na pÃ¡gina
- exibiÃ§Ã£o de contratos, gestÃ£o, carteira, negÃ³cios e score
- AdSense conforme nÃ­vel

DependÃªncias:

- Core Portfolio
- Core Reputation
- Core Products
- Core Visibility
- Core Marketplace

-------------------------------------

# 13. SISTEMA DE CONTRATOS

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

O sistema de contratos serÃ¡ ferramenta acoplÃ¡vel futura.

PendÃªncias futuras:

- biblioteca de contratos
- clÃ¡usulas inteligentes
- contratos vinculados a imÃ³vel
- contratos vinculados a proprietÃ¡rio
- contratos vinculados a comprador/locatÃ¡rio
- assinatura digital
- histÃ³rico documental
- dossiÃª operacional
- integraÃ§Ã£o futura com assinatura eletrÃ´nica

Motivo:

Contrato no HURBY nÃ£o serÃ¡ apenas PDF.

SerÃ¡ memÃ³ria documental da operaÃ§Ã£o.

-------------------------------------

# 14. GESTÃƒO ADMINISTRATIVA DE IMÃ“VEIS

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

A gestÃ£o administrativa de imÃ³veis serÃ¡ nÃºcleo futuro.

PendÃªncias futuras:

- locaÃ§Ã£o contÃ­nua
- contrato ativo
- inquilino
- proprietÃ¡rio
- cobranÃ§a
- atraso
- ocorrÃªncia
- manutenÃ§Ã£o
- vistoria
- dossiÃª histÃ³rico
- comunicaÃ§Ã£o rastreÃ¡vel
- interaÃ§Ã£o via plataforma/WhatsApp

DependÃªncias:

- Core Clients
- Core Contracts
- Core Properties
- Core Portfolio
- Core Notifications

-------------------------------------

# 15. GOVERNANÃ‡A OWNER

STATUS: FUTURO, PREVER ARQUITETURA

O painel owner deverÃ¡ permitir gestÃ£o total do ecossistema.

PendÃªncias futuras:

- expurgar usuÃ¡rio
- suspender usuÃ¡rio
- criar produtos
- criar campanhas
- dar bÃ´nus
- gerenciar auditoria
- gerenciar denÃºncias
- monitorar palavras suspeitas
- monitorar anÃºncios
- monitorar comportamento
- criar administradores
- delegar nÃºcleos de auditoria
- acompanhar monetizaÃ§Ã£o
- acompanhar KPIs globais

DependÃªncias:

- Core Audit
- Core Products
- Core Economy
- Core Governance
- Core Moderation

-------------------------------------

# 16. INCORPORADORAS

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

O mÃ³dulo de incorporadoras serÃ¡ expansÃ£o futura.

PendÃªncias futuras:

- cadastro de incorporadora
- empreendimentos
- lanÃ§amentos
- maquetes
- XML/API
- distribuiÃ§Ã£o para corretores compatÃ­veis
- aceite de representaÃ§Ã£o
- presenÃ§a no marketplace
- classificaÃ§Ã£o de imÃ³vel e corretor por perfil

DependÃªncias:

- Core Organizations
- Core Portfolio
- Core Marketplace
- Core Partnerships
- Core Visibility


-------------------------------------

# 17. CORE_PROPERTIES_FORM_V1

STATUS: BACKLOG / NÃƒO EXECUTAR AGORA

A melhoria do formulÃ¡rio de cadastro e ediÃ§Ã£o de imÃ³veis foi identificada como evoluÃ§Ã£o Ãºtil, mas nÃ£o deve ser executada neste momento.

A fundaÃ§Ã£o imobiliÃ¡ria operacional jÃ¡ foi validada em:

- banco local
- Supabase STAGING
- Vercel
- fluxo broker
- cadastro de imÃ³vel
- listagem
- detalhe
- ediÃ§Ã£o

DecisÃ£o:

- nÃ£o abrir a missÃ£o CORE_PROPERTIES_FORM_V1 agora
- nÃ£o refatorar formulÃ¡rio neste momento
- nÃ£o expandir campos de imÃ³vel agora
- nÃ£o mexer na foundation validada
- nÃ£o alterar RPC create_property_operational_bundle sem necessidade real
- nÃ£o alterar RLS, storage ou lifecycle de listing nesta etapa

Motivo:

A prioridade estratÃ©gica agora Ã© continuar os cores estruturais do ecossistema.

O formulÃ¡rio pode melhorar a experiÃªncia do corretor, mas nÃ£o Ã© o prÃ³ximo gargalo arquitetural.

Antes de melhorar a camada visual e operacional do formulÃ¡rio, o HURBY precisa consolidar os prÃ³ximos nÃºcleos estruturais, principalmente:

- Core Clients
- Core Origins
- Core Visibility
- Core Leads V2
- Core Marketplace
- Core Products/Economy

PendÃªncias futuras da missÃ£o CORE_PROPERTIES_FORM_V1:

- melhorar UX do cadastro
- criar fluxo em etapas
- trocar labels tÃ©cnicos por labels comerciais
- adicionar Arrendamento em finalidade do anÃºncio
- trocar "Modelo operacional" por "Forma de operaÃ§Ã£o"
- trocar "Transacional" por "Apenas intermediaÃ§Ã£o"
- trocar "Gerenciado" por "Gerenciado pelo corretor/imobiliÃ¡ria"
- trocar "HÃ­brido" por "IntermediaÃ§Ã£o + administraÃ§Ã£o"
- expandir localizaÃ§Ã£o
- expandir caracterÃ­sticas
- validar upload de mÃ­dia
- avaliar cards/radios no lugar de dropdowns
- implementar status por botÃµes de aÃ§Ã£o
- iniciar soft delete controlado
- criar lifecycle real de listing
- exigir motivo de encerramento quando aplicÃ¡vel

DependÃªncias recomendadas antes de executar:

- Core Clients mais maduro
- Core Origins mais maduro
- Core Visibility mais maduro
- definiÃ§Ã£o futura de lifecycle de listing
- validaÃ§Ã£o de impacto no marketplace
- validaÃ§Ã£o de impacto em leads
- validaÃ§Ã£o de impacto em gestÃ£o administrativa

Regra:

CORE_PROPERTIES_FORM_V1 sÃ³ deve ser aberto quando a arquitetura estrutural estiver pronta para suportar a evoluÃ§Ã£o do cadastro sem gerar retrabalho.

-------------------------------------

# REGRA FINAL

Nenhum item deste backlog deve ser resolvido por impulso.

Cada item deve ser tratado somente quando o core correspondente for aberto oficialmente.

Antes de qualquer alteraÃ§Ã£o:

1. revisar documentaÃ§Ã£o atual
2. revisar migrations atuais
3. revisar impacto semÃ¢ntico
4. revisar impacto tÃ©cnico
5. gerar proposta
6. validar
7. sÃ³ entÃ£o executar

-------------------------------------

# 18. CORE_IDENTITY_REBUILD + CORE_CLIENTS_FOUNDATION

STATUS: FOUNDATION VALIDADA LOCALMENTE

A base de identidade foi reconstruÃ­da para remover a semÃ¢ntica antiga baseada em user_type/account_tier.

DecisÃ£o:

- users_profile passa a representar apenas conta autenticada neutra
- auth.users.id = users_profile.id deve ser preservado
- corretor passa a ser representado por broker_profiles
- validaÃ§Ã£o profissional passa a ser representada por broker_verifications
- cliente passa a ser representado por client_entities
- vÃ­nculo contextual passa a ser representado por client_relationships

Migrations envolvidas:

- 20260504000000_base_clean.sql
- 20260504000100_profiles.sql
- 20260506021141_auth_profile_trigger.sql
- 20260510120000_core_identity_clients_foundation.sql

Arquivos de frontend impactados:

- src/app/login/page.tsx
- src/app/broker/page.tsx
- src/app/page.tsx

ValidaÃ§Ãµes realizadas:

- supabase db reset
- npm run build
- login profissional
- criaÃ§Ã£o de broker_profile
- acesso ao /broker
- correÃ§Ã£o do erro de perfil causado pela remoÃ§Ã£o de user_type

Regra:

NÃ£o restaurar user_type, account_tier, PAY_PER_USE automÃ¡tico ou broker automÃ¡tico em users_profile.

-------------------------------------

# 19. CORE CLIENTS

STATUS: FOUNDATION CRIADA, NÃƒO EXPANDIR FUNCIONALMENTE AGORA

Core Clients foi criado como fundaÃ§Ã£o relacional.

Estruturas criadas:

- client_entities
- client_contact_methods
- client_relationships
- client_relationship_roles

DecisÃ£o:

Cliente nÃ£o Ã© usuÃ¡rio autenticado.

Cliente tambÃ©m nÃ£o Ã© lead.

Cliente Ã© entidade relacional e contextual.

A mesma pessoa pode ser:

- usuÃ¡rio comum do marketplace
- buscador de imÃ³vel
- proprietÃ¡rio/fornecedor de imÃ³vel
- comprador
- locatÃ¡rio
- cliente de corretor
- cliente de imobiliÃ¡ria
- contato vindo de campanha
- contato importado
- futuro lead
- parte de contrato

PendÃªncias futuras:

- integrar com Leads V2
- integrar com Marketplace
- integrar com Funil
- integrar com Contratos
- integrar com Trust/Safety
- integrar com Score
- integrar com Reviews
- criar fluxo de dados Ã³rfÃ£os
- criar lifecycle de relacionamento
- criar regras de exclusividade por origem

Regra:

NÃ£o transformar client_entities em tabela plana de contato.

-------------------------------------

# 20. CORE SCORE

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

Score serÃ¡ um core prÃ³prio.

NÃ£o deve ser coluna simples em users_profile, broker_profiles ou client_entities.

Diretrizes:

- score deve ser contextual
- score deve ser explicÃ¡vel
- score deve ser baseado em eventos
- score deve separar marketplace de reputaÃ§Ã£o profissional
- score deve evitar rÃ³tulos discriminatÃ³rios
- score deve usar linguagem operacional

Scores futuros possÃ­veis:

- score da conta
- score do corretor
- score da imobiliÃ¡ria
- score do anÃºncio
- score do imÃ³vel
- score do lead
- score do cliente
- score do relacionamento
- score de comportamento
- score de qualidade operacional

Termos recomendados:

- nÃ­vel de verificaÃ§Ã£o
- intenÃ§Ã£o
- maturidade da jornada
- confiabilidade cadastral
- reputaÃ§Ã£o operacional
- qualidade de atendimento

DependÃªncias futuras:

- Core Events
- Core Trust/Safety
- Core Reviews
- Core Leads V2
- Core Marketplace
- Core Clients maduro
- Core Visibility

Regra:

NÃ£o implementar score antes de criar base de eventos e explicabilidade.

-------------------------------------

# 21. CORE TRUST / SAFETY / GOVERNANCE

STATUS: FUTURO, OBRIGATÃ“RIO

O HURBY deve possuir sistema futuro de prevenÃ§Ã£o a fraude, monitoria, denÃºncias, suspensÃ£o e banimento.

O sistema deve permitir denÃºncias contra:

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
- triagem automÃ¡tica
- fila humana
- decisÃ£o
- retenÃ§Ã£o de evidÃªncias para defesa jurÃ­dica

O sistema deve prever lifecycle de risco:

- normal
- em observaÃ§Ã£o
- alertado
- restrito
- suspenso
- banido
- expurgado
- retido para defesa jurÃ­dica

Regra:

Profissionais sem CRECI nÃ£o devem operar livremente como corretores.

Eles sÃ³ podem existir futuramente com modalidade restrita, rastreÃ¡vel e preferencialmente vinculada a corretor ou imobiliÃ¡ria verificada.

-------------------------------------

# 22. CORE REVIEWS / AVALIAÃ‡Ã•ES

STATUS: FUTURO, NÃƒO IMPLEMENTAR AGORA

AvaliaÃ§Ãµes serÃ£o core prÃ³prio futuro.

AvaliaÃ§Ãµes devem ser contextuais.

Itens avaliÃ¡veis futuramente:

- anÃºncio
- atendimento
- corretor
- imÃ³vel
- imobiliÃ¡ria
- experiÃªncia geral

CritÃ©rios possÃ­veis:

- qualidade das fotos
- clareza das informaÃ§Ãµes
- qualidade do atendimento
- aderÃªncia do imÃ³vel ao anÃºncio
- confianÃ§a percebida
- experiÃªncia geral

As avaliaÃ§Ãµes devem alimentar:

- score
- reputaÃ§Ã£o
- qualidade dos anÃºncios
- alertas operacionais
- recomendaÃ§Ãµes comerciais
- qualificaÃ§Ã£o profissional
- Academy Broker futura
- marketplace de prestadores futuro

Regra:

AvaliaÃ§Ã£o nÃ£o deve ser apenas exposiÃ§Ã£o pÃºblica. Deve servir para elevar qualidade operacional do ecossistema.

-------------------------------------

# 23. ACESSO A DADOS SENSÃVEIS

STATUS: FUTURO, DEPENDENTE DE VISIBILITY / TRUST / LEADS

O acesso a dados sensÃ­veis, como telefone e e-mail de lead/cliente, deve ser controlado futuramente por:

- contexto
- consentimento
- nÃ­vel de verificaÃ§Ã£o
- selos profissionais
- termo de responsabilidade
- origem do lead
- relationship ownership
- visibilidade
- LGPD

DecisÃ£o futura provÃ¡vel:

- profissional sem verificaÃ§Ã£o alta nÃ£o acessa telefone diretamente
- atendimento deve ocorrer pela plataforma/funil
- profissional verificado e com selo adequado pode acessar telefone apÃ³s aceite de responsabilidade

Regra:

NÃ£o expor dados sensÃ­veis por padrÃ£o.

-------------------------------------

# 24. AXÃ‰ / ASSINATURA COMO PRODUTO

STATUS: FUTURO, REVISAR ECONOMIA

A assinatura deve ser entendida comercialmente como assinatura, mas tecnicamente pode funcionar como produto/pacote operacional adquirido por perÃ­odo.

Modelo conceitual:

- AxÃ© livre para compras avulsas
- AxÃ© reservado/bloqueado para manter pacote/assinatura ativo
- pacote de 3, 6, 9 ou 12 meses
- direitos de uso liberados enquanto pacote estiver ativo
- reajustes afetam novas contrataÃ§Ãµes/renovaÃ§Ãµes
- preÃ§o contratado deve ser preservado atÃ© o fim do ciclo

PendÃªncias futuras:

- revisar activate_subscription
- revisar user_subscription
- revisar purchase_coin
- revisar add_coin duplicado/sobrecarregado
- criar modelo de products/purchases/entitlements
- criar saldo reservado
- separar compra avulsa de pacote recorrente

Regra:

NÃ£o tratar assinatura como mensalidade SaaS simples dentro de users_profile.

-------------------------------------

# 25. REFERÃŠNCIA DO PROTOCOLO OPERACIONAL

STATUS: CORRIGIR REFERÃŠNCIAS DOCUMENTAIS

Caminho oficial versionado:

docs/protocols/hurby-operational-protocol.md

PendÃªncia:

Corrigir documentos, handoffs, checklists e comandos que ainda citem:

hurby-operational-protocol.md

como se estivesse na raiz do projeto.

Regra:

O protocolo operacional nÃ£o deve ser movido para a raiz apenas para compatibilizar comando antigo.


-------------------------------------

# HURBY_CONTEXT_UPDATE_20260511_BACKLOG_OWNER_CLIENTS_LEDGER

Data: 2026-05-11  
Status: BACKLOG TECNICO / CONCEITUAL REGISTRADO

## 1. Refinar statement/extrato financeiro

Durante a validacao do ciclo Owner/Broker/Agency, foram percebidas logicas equivocadas no fluxo de extrato/statement.

Decisao atual:

- nao corrigir agora
- nao mexer no ledger validado
- nao bloquear continuidade dos proximos cores
- abrir missao futura especifica para statement/extrato

Motivo:

O fluxo principal esta funcionando:

- owner_add_axe grava no wallet_ledger
- wallet_balance reflete saldo
- Owner distribui AXE
- Broker recebe AXE

Risco futuro:

Extrato pode exibir informacoes inconsistentes, confusas ou incompletas se for usado como base financeira definitiva sem revisao.

## 2. Core Owner/Admin definitivo

O Owner atual e temporario.

Nao transformar o Owner temporario em admin definitivo sem nova modelagem.

O Core Owner/Admin futuro deve prever:

- permissoes administrativas formais
- papeis administrativos dedicados
- auditoria completa
- logs de acao
- trilha financeira
- governanca de acesso
- bloqueio/suspensao/banimento
- revisao de usuarios, anuncios, saldos e operacoes
- seguranca juridica e LGPD

## 3. Owner tentando acessar /broker

Foi aceito como pendencia nao bloqueante que Owner tentando acessar /broker pode cair em /account.

Nao corrigir agora se o fluxo principal estiver validado.

Essa regra deve ser revista quando o Core Owner/Admin definitivo for desenhado.

## 4. Blindagem da RPC owner_add_axe

A RPC owner_add_axe foi corrigida para usar BONUS/BONUS.

Risco futuro:

Nao recriar owner_add_axe usando valores textuais inexistentes como ADMIN.

Antes de qualquer ajuste no ledger, validar pg_enum.

Valores reais nesta fase:

- coin_origin_type: PURCHASE, BONUS, REWARD, TRANSFER_IN, TRANSFER_OUT, CONSUMPTION, REFUND, EXPIRATION
- coin_credit_type: PAID, BONUS, REWARD, TRANSFER

## 5. Separacao entre usuario do site e cliente comercial

A nomenclatura deve ser observada em proximas missoes.

Usuario do site:

- users_profile
- conta autenticada
- marketplace user
- broker
- agency
- owner temporario

Cliente comercial/relacional:

- client_entities
- client_relationships
- leads
- fornecedores
- contatos
- interessados
- relacoes comerciais

Nao misturar novamente "usuario do site" com "cliente" no sentido comercial do Core Clients.

## 6. Limpeza de arquivos temporarios

Manter o repositorio limpo antes de commit.

Arquivos temporarios conhecidos desta rodada:

- context_update_input_owner_clients.txt
- context_update_input_owner_clients_PARTE_*.txt
- src/app/register/owner/page.backup.tsx

Remover antes do commit se existirem.

-------------------------------------

-------------------------------------

## BACKLOG_OWNER_TEMPORARIO_ROTAS_DIRECIONAMENTOS_20260512

Status: BACKLOG TECNICO / REVISAR POSTERIORMENTE
Data: 2026-05-12
Prioridade: MEDIA
Escopo: Owner temporario, rotas protegidas, navegabilidade operacional

### Contexto

Durante a validacao da foundation Auth + Clients + Properties + AXE + Owner temporario, foi identificado que o fluxo principal esta funcional, mas existem ajustes pendentes de direcionamento entre areas.

O Owner temporario consegue acessar o painel principal, mas ao tentar navegar para algumas areas, como statement/extrato ou rotas profissionais, pode ser redirecionado para /account ou outra pagina comum.

### Rotas a revisar

Revisar regras de acesso e direcionamento entre:

- /owner
- /agency
- /broker
- /statement
- /operations
- /account

### Problema observado

Owner temporario tentando acessar /statement pode ser redirecionado para pagina comum/minha conta.

Esse comportamento nao bloqueia a foundation atual, mas precisa ser revisado para melhorar validacao operacional.

### Diretriz temporaria

Enquanto o Core Owner/Admin definitivo nao existir, o Owner temporario pode precisar navegar por areas ampliadas para fiscalizar:

- interfaces
- design
- usuarios
- imoveis
- saldos
- extratos
- fluxos operacionais
- comportamento de Broker
- comportamento de Agency
- comportamento de usuario comum

### Cuidado arquitetural

Essa permissao ampliada deve ser tratada como regra temporaria de validacao.

Nao confundir Owner temporario com o futuro Core Owner/Admin definitivo.

O Core Owner/Admin futuro deve ter:

- governanca propria
- permissions formais
- auditoria
- logs administrativos
- trilha financeira
- regras de seguranca
- capacidade de fiscalizacao controlada
- separacao clara entre visualizar, operar, auditar e administrar

### Recomendacao futura

Criar uma revisao especifica de matriz de acesso com pelo menos:

- usuario comum
- broker
- agency
- owner temporario
- futuro admin/owner definitivo

Validar para cada perfil:

- pode acessar
- deve redirecionar
- pode visualizar
- pode editar
- pode operar
- pode auditar

### Nao executar agora

Nao corrigir este backlog dentro da estabilizacao atual se o fluxo principal permanecer funcional.

Executar em missao futura dedicada a:

- Access Matrix
- Owner/Admin temporario
- Routing Governance
- Middleware/Access Service

-------------------------------------

## HURBY_CONTEXT_UPDATE_20260512_PROPERTIES_FORM_V1_AUTHORIZED

Data: 2026-05-12
Status: CORE_PROPERTIES_FORM_V1 AUTORIZADO COMO PRÓXIMA MISSÃO

Após a estabilização da foundation Auth + Clients + Properties + AXE + Owner temporário, a evolução do formulário profissional de imóveis foi autorizada como próxima missão ativa.

A decisão anterior de manter CORE_PROPERTIES_FORM_V1 em backlog foi revista.

Motivo:

O formulário profissional de imóvel já está funcional, mas ainda opera como camada mínima de validação da foundation. Evoluir sua experiência agora reduz atrito operacional, melhora a validação do Core Properties e prepara a interface para uso profissional antes da sequência CORE_ORIGINS_FOUNDATION e CORE_VISIBILITY_FOUNDATION.

Escopo autorizado:

- melhorar UX do cadastro profissional de imóvel
- melhorar edição profissional de imóvel
- trocar labels técnicos por labels comerciais
- organizar fluxo em etapas, se fizer sentido
- melhorar clareza de finalidade, tipo, valor, localização, características e descrição
- preservar RPC create_property_operational_bundle
- preservar tabelas e migrations já validadas
- preservar fluxo broker, agency, owner e account
- validar cadastro, listagem, detalhe e edição após alteração
- rodar build antes de commit

Escopo proibido:

- não remodelar banco sem necessidade real
- não alterar Core Properties foundation sem auditoria
- não alterar ledger/AXE
- não alterar auth/login/middleware
- não iniciar marketplace
- não iniciar leads
- não iniciar origins
- não iniciar visibility
- não iniciar contratos
- não transformar formulário em novo core de lifecycle completo

Próximo core estrutural após esta missão:

- CORE_ORIGINS_FOUNDATION

Regra:

CORE_PROPERTIES_FORM_V1 deve ser tratado como melhoria operacional controlada sobre a foundation existente, não como refatoração arquitetural ampla.


-------------------------------------

# HURBY_CONTEXT_UPDATE_20260513_CORE_CLIENTS_OWNER_TRACKING_BACKLOG

Status: BACKLOG FUTURO / NÃO IMPLEMENTAR AGORA

Durante a missão CORE_PROPERTIES_FORM_V1, ficou definido que o formulário profissional deve coletar e vincular o proprietário/fornecedor do imóvel usando a base do Core Clients, mas a experiência completa do proprietário será evoluída em missão futura.

Itens a evoluir futuramente no Core Clients / Marketplace Account:

- painel "Meu Imóvel" ou "Meus Imóveis" no ambiente básico do Marketplace/Cadê Negócios
- exibição de imóveis em que o usuário é proprietário/fornecedor
- identificação visual de "Cadastro profissional" quando o imóvel foi cadastrado por broker/agency
- acompanhamento do status do anúncio pelo proprietário
- acompanhamento de alterações relevantes, como valor, publicação, revisão e encerramento
- acesso controlado ao anúncio e informações profissionais permitidas
- direcionamento para página do profissional responsável quando o imóvel foi cadastrado por broker/agency
- direcionamento para o Marketplace quando o imóvel foi cadastrado pelo próprio usuário comum
- histórico congelado após concretização do negócio
- vínculo entre client_entity, client_relationship, property_asset, property_listing e profissional responsável
- cuidado LGPD para não expor dados privados, notas internas ou ficha avaliativa completa
- integração futura com negociação, contratos, propostas e gestão administrativa de imóvel

Regra:

O proprietário/dono do imóvel acompanha o andamento pelo painel básico do Marketplace, usando o mesmo login do ecossistema Hurby.

A ficha profissional completa continua sendo ferramenta interna do profissional/imobiliária.


-------------------------------------

## BACKLOG — CORE_PROPERTIES_FORM_V1 / FLUXOS FUTUROS

Status: BACKLOG TECNICO E CONCEITUAL
Data: 2026-05-13

Pendencias registradas para evolucao posterior:

1. Criar fluxo de ficha profissional avulsa antes do anuncio.
   - permitir ficha vinculada a property_asset preliminar sem property_listing
   - permitir avaliacao de imovel antes de virar anuncio publico/comercial

2. Criar rota dedicada para ficha profissional vinculada ao anuncio:
   - /operations/properties/[listingId]/assessment

3. Criar estrutura futura de midias tecnicas da ficha:
   - property_assessment_media
   - bucket/visibilidade privada
   - sem indexacao publica
   - sem exposicao para marketplace/parceiros

4. Separar fotos publicas e fotos tecnicas:
   - property_listing_media = fotos publicas/comerciais do anuncio
   - property_assessment_media = fotos tecnicas/privadas da ficha

5. Criar regra de limite de fotos:
   - ate 22 fotos no anuncio como limite base
   - acima de 22 fotos, cobrar por Axe/pacote/assinatura

6. Criar fluxo de chave/token para migracao do Marketplace para ambiente profissional:
   - usuario comum autoriza profissional
   - profissional puxa anuncio para gestao profissional
   - token deve ser seguro, dificil de adivinhar, auditavel e expiravel

7. Criar governanca de revisao da ficha:
   - corretor vinculado envia para revisao
   - agency/admin pode aprovar, rejeitar, arquivar ou marcar como precisa de revisao
   - usar linguagem "precisa de revisao", nao "precisa de correcao"
   - criar mensagens temporarias/transitorias de revisao futuramente

8. Criar regras de vinculacao/troca de ficha:
   - ficha vinculada ao anuncio nao deve ser trocada livremente
   - corretor independente pode trocar com alerta e log
   - corretor vinculado deve depender de agency/admin
   - toda troca deve gerar auditoria futura

9. Criar painel Meu Imovel para proprietario acompanhar:
   - anuncio
   - status
   - evolucao
   - proposta/interessados
   - resumo autorizado
   - historico futuro

10. Criar camada de IA/moderacao:
   - revisar descricao publica
   - sugerir melhoria de texto
   - detectar conteudo indevido
   - gerar resumo controlado para proprietario/parceiros
   - sem expor notas privadas

