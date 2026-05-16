# HURBY — Auditoria Técnica
## Documento Profissional do Imóvel V1 x Schema Atual

Status: Auditoria inicial concluída  
Core: Core Properties Form V1  
Escopo: property_professional_assessments  
Fase: Antes de migration/backend estrutural  

-------------------------------------

# 1. Objetivo

Comparar a modelagem nova do Documento Profissional do Imóvel V1 com a estrutura atual existente no banco local.

Esta auditoria não cria migration.
Esta auditoria não altera schema.
Esta auditoria registra lacunas, riscos e próximos passos.

-------------------------------------

# 2. Tabela auditada

Tabela atual:

public.property_professional_assessments

Status:

Boa foundation inicial, mas ainda genérica demais para representar a modelagem final do Documento Profissional.

-------------------------------------

# 3. Pontos positivos da estrutura atual

A tabela atual já possui vínculos importantes:

- property_asset_id
- property_listing_id
- portfolio_item_id
- client_entity_id
- client_relationship_id
- created_by_profile_id
- responsible_profile_id
- responsible_organization_id

Também já possui:

- assessment_status
- assessment_purpose
- created_at
- updated_at
- reviewed_at
- reviewed_by_profile_id

E blocos JSONB úteis para validação inicial:

- essential_snapshot
- technical_assessment
- commercial_assessment
- owner_interview
- documentation_assessment
- financial_assessment
- public_summary
- private_notes
- metadata

Conclusão:
A tabela permite validar o fluxo inicial, mas ainda não é a estrutura final do core.

-------------------------------------

# 4. Lacunas frente à nova modelagem

Campos estruturados ausentes que foram identificados no Mapa Mestre:

- document_type
- document_origin
- client_link_status
- listing_link_status
- information_origin
- information_confidence
- visit_status
- occupancy_status
- documentation_status
- financial_status
- market_price_perception
- estimated_liquidity
- commercial_attractiveness
- recommendation_status
- next_step_status

Campos estruturados de estratégia de preço ausentes:

- owner_requested_price
- owner_minimum_acceptable_price
- professional_recommended_price
- initial_listing_price
- current_listing_price
- negotiation_margin_authorized
- price_confidence_level

Estes campos podem ser simulados temporariamente em JSONB, mas não devem permanecer em metadata/JSONB até o fechamento do core se forem usados para workflow, filtro, score, revisão, permissão ou auditoria.

-------------------------------------

# 5. Índices atuais

A auditoria confirmou índices relevantes para a foundation:

- índice por asset
- índice por listing
- índice por cliente
- índice por relacionamento
- índice por responsável
- índice por status
- índice único para 1 Documento Profissional atual por listing

Conclusão:
A indexação inicial está adequada para a foundation atual.

-------------------------------------

# 6. RLS / Policies atuais

Policies identificadas:

## SELECT

Permite acesso quando:

- property_listing_id existe e o usuário pode acessar o listing
ou
- o usuário pode acessar o asset

## INSERT

Permite inserir quando:

- created_by_profile_id = auth.uid()
- responsible_profile_id = auth.uid()
- usuário pode gerenciar o asset
- se houver listing, usuário pode gerenciar o listing

## UPDATE

Permite atualizar quando:

- usuário pode gerenciar o asset
- se houver listing, usuário pode gerenciar o listing

Conclusão:
As policies são conservadoras e adequadas para a foundation atual.

-------------------------------------

# 7. Ponto de atenção futuro: agência atribuindo demanda

A policy de INSERT hoje exige:

responsible_profile_id = auth.uid()

Isso funciona para o broker criando documento para si mesmo.

Mas futuramente, agência/imobiliária poderá precisar criar uma demanda ou Documento Profissional e atribuir para outro corretor.

Nesse cenário, a policy precisará evoluir para permitir atribuição controlada por organização/equipe, respeitando permissões.

Não alterar agora.
Registrar como evolução futura de permissões e fluxo agency/broker.

-------------------------------------

# 8. Decisão técnica atual

Não criar migration ainda.

Motivo:

- a modelagem documental foi recém-consolidada
- ainda falta validar UX e comportamento real
- tabela atual permite validação inicial com JSONB
- mudanças estruturais devem ser feitas com plano de migration próprio
- evitar criar colunas antes de confirmar quais campos realmente serão workflow, filtro, score ou auditoria

-------------------------------------

# 9. Regra para próxima fase

Antes de qualquer migration estrutural:

1. auditar schema atual novamente
2. auditar services existentes
3. auditar páginas consumidoras
4. definir quais campos sairão de JSONB
5. definir domínios/tabelas auxiliares
6. validar impacto em RLS
7. validar impacto em build
8. validar reset local
9. aplicar em staging somente após validação

-------------------------------------

# 10. Próximo passo recomendado

Próxima etapa não deve ser migration.

Próxima etapa recomendada:

Evoluir a interface do Documento Profissional para deixar de ser campo livre genérico e começar a refletir a Base Comum V1:

- origem do documento
- vínculo com cliente/anúncio
- origem da informação
- confiança da informação
- situação documental
- situação financeira
- estratégia de preço interna
- riscos gerais
- recomendações
- próximos passos

Essa evolução pode continuar salvando em JSONB inicialmente, mas já deve usar chaves compatíveis com o Mapa Mestre.