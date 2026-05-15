# HURBY — Documento Profissional do Imóvel V1
## Base Comum

Status: Modelagem conceitual e técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Fase: Antes de migration/backend  

-------------------------------------

# 1. Objetivo do Documento Profissional

O Documento Profissional do Imóvel não deve ser tratado como formulário comum.

Ele é um produto técnico e operacional para:

- captação profissional
- vistoria comercial
- análise crítica do imóvel
- apoio à precificação
- identificação de riscos
- validação de informações do anúncio
- estratégia de negociação
- organização da relação com cliente/proprietário
- geração de próximos passos para broker/agência

Ele não substitui laudo técnico de engenharia, arquitetura, perícia, avaliação bancária ou análise jurídica formal.

Ele funciona como documento profissional interno de apoio à decisão comercial e operacional.

-------------------------------------

# 2. Regra central

O Documento Profissional pode nascer:

- a partir de anúncio existente
- sem anúncio existente
- com cliente vinculado
- sem cliente vinculado
- a partir de atendimento externo
- a partir de demanda de agência/imobiliária
- a partir de captação preliminar

Regra de maturidade:

- levantamento preliminar pode estar incompleto
- documento técnico em elaboração pode ter pendências
- documento pronto para revisão deve ter vínculos e informações mínimas
- documento aprovado/formalizado deve ter maior rigor de cliente, anúncio, origem da informação e confiança

-------------------------------------

# 3. Separação de responsabilidades

## Core Clients

Guarda dados de pessoa/cliente/proprietário.

Exemplos:

- nome
- CPF/CNPJ
- telefone
- WhatsApp
- e-mail
- entidade cliente
- relacionamento com imóvel/anúncio

O Documento Profissional não deve criar cadastro paralelo de pessoa.

## Core Property / Asset

Guarda dados estruturais compartilhados do imóvel.

Exemplos:

- tipo
- subtipo
- áreas
- quartos
- banheiros
- vagas
- localização estrutural
- condomínio
- características estruturais

## Property Listing

Guarda a vitrine comercial do anúncio.

Exemplos:

- título
- descrição comercial
- preço público
- fotos públicas
- tags visuais
- finalidade
- status de publicação
- código público do anúncio

## Documento Profissional

Guarda análise profissional.

Exemplos:

- origem da informação
- nível de confiança
- risco
- situação documental
- situação financeira
- estratégia de preço interna
- fotos técnicas
- recomendações
- próximos passos
- validação/correção de dados do anúncio

-------------------------------------

# 4. Estados conceituais do documento

A Base Comum V1 prevê três estados principais:

## 4.1 Levantamento preliminar

Pode existir com poucos dados.

Uso:

- profissional está na rua
- internet ruim
- ainda não tem cliente cadastrado
- ainda não tem anúncio criado
- ainda está coletando informação inicial

Pode permitir:

- salvar rascunho técnico
- registrar observações
- anexar fotos técnicas
- deixar cliente/anúncio pendentes

## 4.2 Documento técnico em elaboração

Já possui mais informações.

Pode ter:

- vínculo com anúncio ou cliente
- origem da informação
- situação de ocupação
- riscos gerais
- preço pedido
- fotos técnicas
- pendências documentais

Ainda pode ter pendências.

## 4.3 Documento pronto para revisão

Exige maior completude.

Deve ter:

- responsável
- origem da informação
- nível de confiança
- situação documental básica
- situação financeira básica
- riscos gerais classificados
- recomendação profissional
- próximos passos

Pode exigir cliente/anúncio conforme regra de workflow futuro.

-------------------------------------

# 5. Base Comum — Seções

## Seção 1 — Identificação do Documento

Objetivo:
Entender por que o documento existe.

Campos:

- tipo do documento
- origem do documento
- status do documento
- data de criação
- responsável pelo documento

Opções para tipo do documento:

- preliminary_survey
- professional_capture
- commercial_inspection
- listing_review
- pricing_support
- proposal_preparation
- contract_preparation

Opções para origem do documento:

- from_existing_listing
- without_listing
- from_existing_client
- external_lead
- referral
- agency_demand
- marketplace_migration

Destino técnico futuro:

- document_type
- document_origin
- assessment_status
- created_by_profile_id
- responsible_profile_id

Não deve terminar em metadata.

-------------------------------------

## Seção 2 — Vínculos

Objetivo:
Saber se o documento está relacionado a cliente, anúncio e imóvel.

Campos:

- cliente vinculado
- anúncio vinculado
- imóvel/asset vinculado
- responsável operacional
- agência/imobiliária, quando houver

Status sugeridos:

client_link_status:
- pending
- linked
- not_required_yet

listing_link_status:
- pending
- linked
- create_later
- link_later

Campos técnicos:

- client_entity_id
- client_relationship_id
- property_listing_id
- property_asset_id
- created_by_profile_id
- responsible_profile_id

Regra:
Esses status podem ser usados provisoriamente em JSONB durante validação, mas devem virar campos estruturados antes de fechar o core.

-------------------------------------

## Seção 3 — Contexto da Captação

Objetivo:
Registrar como o imóvel chegou ao profissional.

Campo:
Como o imóvel chegou?

Opções:

- owner_contacted_broker
- broker_prospected
- referral
- agency_assigned
- marketplace_origin
- campaign_origin
- social_media_origin
- other

Campo:
Situação atual da demanda

Opções:

- first_contact
- visit_scheduled
- inspection_done
- waiting_documents
- waiting_authorization
- listing_draft_created
- listing_published
- paused

Uso futuro:

- funil de captação
- painel broker
- painel agência
- maturidade operacional
- tarefas

-------------------------------------

## Seção 4 — Origem da Informação

Objetivo:
Dar lastro ao que foi informado.

Campo:
Origem principal das informações

Opções:

- verified_in_person
- informed_by_owner
- informed_by_representative
- informed_by_tenant
- informed_by_third_party
- extracted_from_document
- extracted_from_previous_listing
- not_verified

Campo:
Houve visita presencial?

Opções:

- yes
- no
- partial

Campo:
Quem forneceu as informações?

Opções:

- owner
- owner_representative
- tenant
- building_staff
- another_broker
- third_party
- unknown

Impacto:
Gera score de confiabilidade.

-------------------------------------

## Seção 5 — Nível de Confiança

Objetivo:
Classificar o quanto o profissional confia nas informações.

Campo:
information_confidence

Opções:

- high
- medium
- low
- pending_verification

Critério sugerido:

high:
vistoria presencial e documento apresentado

medium:
vistoria parcial ou informação coerente, mas sem documento

low:
informação verbal sem conferência

pending_verification:
ainda precisa validar

Uso:

- score de confiabilidade
- alerta de revisão
- workflow
- cockpit broker/agência

Não deve ficar em metadata no produto final.

-------------------------------------

## Seção 6 — Finalidade Comercial

Objetivo:
Entender o uso pretendido do imóvel.

Campo:
commercial_purpose

Opções:

- sale
- rental
- seasonal_rental
- property_management
- price_review
- portfolio_capture
- proposal_preparation
- listing_review

Observação:
A finalidade do anúncio pode ser pública.
A finalidade do Documento Profissional pode ser técnica.

Exemplo:
Anúncio = venda
Documento = revisão de preço para venda

-------------------------------------

## Seção 7 — Situação de Ocupação

Objetivo:
Entender disponibilidade, risco e operação.

Campo:
occupancy_status

Opções:

- vacant
- occupied_by_owner
- occupied_by_tenant
- occupied_by_third_party
- under_construction
- closed_no_access
- not_verified

Campo:
visit_availability

Opções:

- free_access
- by_appointment
- restricted
- authorization_required
- unavailable

Uso:

- risco
- agenda
- negociação
- tags futuras
- operação interna

-------------------------------------

## Seção 8 — Acesso e Chaves

Objetivo:
Organizar a operação de visita.

Campo:
key_holder

Opções:

- owner
- broker
- agency
- building_staff
- tenant
- third_party
- unknown

Campo:
access_method

Opções:

- physical_key
- password_or_remote
- appointment
- prior_authorization
- restricted_access

Visibilidade:
Interno.

Nunca expor em anúncio público.

-------------------------------------

## Seção 9 — Situação Documental Básica

Objetivo:
Classificar risco documental sem afirmar regularidade jurídica definitiva.

Campo:
documents_presented

Opções:

- yes
- no
- partial

Campo:
document_types_seen

Opções múltiplas:

- property_registry
- deed
- contract
- iptu
- certificate
- condominium_document
- rural_document
- none

Campo:
documentation_status

Opções:

- apparently_regular
- pending_review
- discrepancy_found
- relevant_risk
- not_verified

Regra:
O sistema não deve declarar regularidade jurídica definitiva.
Deve registrar percepção, origem e pendência.

-------------------------------------

## Seção 10 — Situação Financeira Básica

Objetivo:
Registrar condição financeira inicial.

Campo:
paid_off_status

Opções:

- yes
- no
- to_confirm

Campo:
financing_status

Opções:

- yes
- no
- to_confirm

Campo:
debt_informed

Opções:

- yes
- no
- to_confirm

Campo:
debt_types

Opções múltiplas:

- iptu
- condominium_fee
- financing
- rural_tax
- other

Regra:
No anúncio, esses dados podem virar filtro.
No Documento Profissional, precisam ter origem e confiança.

-------------------------------------

## Seção 11 — Estratégia de Preço Interna

Objetivo:
Registrar negociação e estratégia comercial.

Campos:

- owner_requested_price
- owner_minimum_acceptable_price
- professional_recommended_price
- initial_listing_price
- current_listing_price
- negotiation_margin_authorized
- price_strategy_notes
- price_confidence_level

Visibilidade:
Interno/sensível.

Nunca expor em endpoint público.

Uso:

- histórico de preço
- campanhas
- desconto temporário
- negociação
- relatório ao broker/agência
- integração futura com contrato/autorização

Não deve ficar em metadata final.

-------------------------------------

## Seção 12 — Percepção de Mercado

Objetivo:
Registrar leitura comercial do profissional.

Campo:
market_price_perception

Opções:

- below_market
- coherent
- above_market
- far_above_market
- not_evaluated

Campo:
estimated_liquidity

Opções:

- high
- medium
- low
- depends_on_price_adjustment

Campo:
commercial_attractiveness

Opções:

- high
- medium
- low
- depends_on_improvement

Uso:

- score comercial
- estratégia de anúncio
- recomendações
- cockpit

-------------------------------------

## Seção 13 — Riscos Gerais

Objetivo:
Mapear alertas que exigem atenção.

Riscos possíveis:

- documentation_pending
- price_out_of_market
- occupied_property
- access_difficulty
- renovation_needed
- low_liquidity
- possible_area_discrepancy
- financing_restriction
- financial_pending
- sensitive_location
- information_conflict
- unclear_owner_price
- authorization_pending

Cada risco deve permitir:

- identified: true/false
- risk_level: low/medium/high
- note: texto curto

Uso:

- score de risco
- alerta
- workflow
- revisão de agência

-------------------------------------

## Seção 14 — Fotos Técnicas

Objetivo:
Registrar evidências privadas do levantamento.

media_context:
technical_assessment

Tipos:

- technical_facade
- surroundings
- access
- damage
- infiltration
- cracks
- structure
- visible_electrical_hydraulic
- visual_documentation
- external_area
- non_public_details

Regras:

- não indexar
- não exibir no anúncio
- não misturar com fotos públicas
- acesso restrito
- validar ownership no backend

-------------------------------------

## Seção 15 — Recomendações Profissionais

Objetivo:
Transformar vistoria em decisão.

Campo:
main_recommendation

Opções:

- publish_listing
- review_price_before_publish
- request_documents
- schedule_new_visit
- improve_public_photos
- wait_authorization
- do_not_publish_yet
- archive_capture

Campo:
recommended_actions

Opções múltiplas:

- link_client
- create_listing
- link_existing_listing
- request_registry
- request_iptu
- validate_financing
- review_price
- prepare_contract_authorization

Uso:

- tarefas
- workflow
- painel broker
- painel agência

-------------------------------------

## Seção 16 — Próximos Passos

Objetivo:
Definir continuidade operacional.

Campo:
next_step

Opções:

- create_listing
- review_existing_listing
- link_client
- send_to_internal_review
- request_documents
- adjust_price
- schedule_new_visit
- monitor_performance

Campo:
next_step_owner

Opções:

- current_broker
- agency
- another_broker
- administrative

Campo:
next_step_due_date

Tipo:
data

Uso:

- tarefas
- maturidade operacional
- broker dashboard
- agency dashboard

-------------------------------------

# 6. Pontuação futura

A Base Comum deve alimentar três motores futuros.

## 6.1 Score de confiabilidade

Entradas:

- origem da informação
- visita presencial
- documento apresentado
- nível de confiança
- divergências

## 6.2 Score de risco

Entradas:

- documentação
- situação financeira
- ocupação
- riscos gerais
- acesso
- preço fora do mercado

## 6.3 Score comercial

Entradas:

- percepção de mercado
- liquidez estimada
- atratividade
- coerência de preço
- estratégia de preço
- performance futura do anúncio

Esses scores não devem ser implementados como número solto em metadata no produto final.
Devem virar camada própria de score/eventos quando o core avançar.

-------------------------------------

# 7. O que pode ser JSONB inicialmente

Pode ficar em JSONB durante validação:

- risk_details
- document_checklist
- financial_notes
- pricing_notes
- field_observations
- next_steps_details
- technical_media_metadata

Mas deve virar estrutura se passar a ser:

- filtro
- regra
- status
- score
- workflow
- auditoria
- permissão
- publicação
- aprovação

-------------------------------------

# 8. O que deve ser estruturado antes do fechamento do core

Antes de considerar o Core Properties Form V1 finalizado, devem virar campos estruturados ou tabela própria:

- assessment_status
- document_origin
- document_type
- client_link_status
- listing_link_status
- created_by_profile_id
- responsible_profile_id
- information_origin
- information_confidence
- visit_status
- occupancy_status
- documentation_status
- financial_status
- market_price_perception
- estimated_liquidity
- commercial_attractiveness
- risk_level
- recommendation_status
- next_step_status

-------------------------------------

# 9. Decisão de produto

A Base Comum deve responder:

- quem criou?
- de onde nasceu?
- tem cliente?
- tem anúncio?
- foi verificado?
- qual a confiança?
- qual a finalidade?
- qual a situação geral?
- qual o risco?
- qual a estratégia de preço?
- qual o próximo passo?

-------------------------------------

# 10. Próxima etapa

Depois da Base Comum, modelar:

1. Módulo Casa
2. Módulo Apartamento / Studio / Loft / Kitnet
3. Módulo Terreno
4. Módulo Comercial
5. Módulo Rural

A Base Comum não deve ser pulada. Ela é o chassi do Documento Profissional.