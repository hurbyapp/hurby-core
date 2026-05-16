# HURBY — Documento Profissional do Imóvel V1
## Mapa Mestre de Campos

Status: Consolidação técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Fase: Antes de migration/backend  

-------------------------------------

# 1. Objetivo

Este documento consolida os campos da Base Comum e dos módulos específicos do Documento Profissional do Imóvel V1:

- Base Comum
- Módulo Casa
- Módulo Apartamento / Studio / Loft / Kitnet
- Módulo Terreno / Lote
- Módulo Comercial
- Módulo Rural

Objetivo principal:

- separar campos estruturados de JSONB temporário
- identificar o que gera score
- identificar o que gera workflow
- identificar o que é interno/sensível
- identificar o que conversa com anúncio, Core Asset e Core Clients
- evitar duplicidade de dados
- preparar futura modelagem backend sem criar migration no escuro

-------------------------------------

# 2. Regra geral de arquitetura

## 2.1 Core Clients

Tudo que for pessoa, cliente, proprietário, representante ou contato pertence ao Core Clients.

Exemplos:

- client_entity_id
- client_relationship_id
- CPF/CNPJ
- telefone
- WhatsApp
- e-mail
- proprietário vinculado

O Documento Profissional pode exibir esses dados, mas não deve ser fonte principal de cadastro de pessoa.

-------------------------------------

## 2.2 Core Property / Asset

Tudo que for estrutura fundamental do imóvel deve ficar no Core Property/Asset.

Exemplos:

- tipo
- subtipo
- área
- quartos
- suítes
- banheiros
- vagas
- endereço estrutural
- condomínio
- características estruturais principais
- aceita financiamento, quando usado como filtro
- imóvel quitado, quando usado como filtro
- padrão calculado futuro

O Documento Profissional valida, complementa ou aponta divergência.

-------------------------------------

## 2.3 Property Listing

Tudo que for anúncio público/comercial pertence ao Property Listing.

Exemplos:

- título
- descrição comercial
- preço público
- fotos públicas
- status de publicação
- código público do anúncio
- tags visuais públicas
- finalidade do anúncio

-------------------------------------

## 2.4 Documento Profissional

Tudo que for análise, validação, vistoria, risco, estratégia, precificação interna, recomendação e próximos passos pertence ao Documento Profissional.

Exemplos:

- origem da informação
- nível de confiança
- riscos
- divergências
- documentação apresentada
- situação financeira analisada
- preço mínimo aceitável
- preço recomendado
- fotos técnicas
- recomendações
- próximo passo

-------------------------------------

# 3. Campos estruturados obrigatórios no produto final

Estes campos não devem terminar em metadata/JSONB no fechamento do Core Properties Form V1.

## 3.1 Identidade e workflow do documento

| Campo | Módulo | Tipo | Motivo |
|---|---|---|---|
| assessment_status | Base Comum | status/domain | Workflow |
| document_type | Base Comum | domain | Classificação do documento |
| document_origin | Base Comum | domain | Origem operacional |
| created_by_profile_id | Base Comum | uuid | Auditoria |
| responsible_profile_id | Base Comum | uuid | Responsável operacional |
| client_link_status | Base Comum | status/domain | Workflow |
| listing_link_status | Base Comum | status/domain | Workflow |
| property_asset_id | Base Comum | uuid | Vínculo com imóvel |
| property_listing_id | Base Comum | uuid nullable | Vínculo com anúncio |
| client_entity_id | Base Comum | uuid nullable | Vínculo com cliente |
| client_relationship_id | Base Comum | uuid nullable | Relação cliente-imóvel |

-------------------------------------

## 3.2 Origem e confiança

| Campo | Módulo | Tipo | Gera score? |
|---|---|---|---|
| information_origin | Base Comum | domain | Sim |
| visit_status | Base Comum | domain | Sim |
| information_provider | Base Comum | domain | Sim |
| information_confidence | Base Comum | domain | Sim |

-------------------------------------

## 3.3 Situação geral

| Campo | Módulo | Tipo | Uso |
|---|---|---|---|
| commercial_purpose | Base Comum | domain | Finalidade técnica |
| occupancy_status | Base Comum | domain | Risco/operação |
| visit_availability | Base Comum | domain | Operação |
| documentation_status | Base Comum | domain | Risco |
| paid_off_status | Base Comum | domain | Filtro/risco |
| financing_status | Base Comum | domain | Filtro/risco |
| financial_status | Base Comum | domain | Risco |
| market_price_perception | Base Comum | domain | Score comercial |
| estimated_liquidity | Base Comum | domain | Score comercial |
| commercial_attractiveness | Base Comum | domain | Score comercial |
| recommendation_status | Base Comum | domain | Workflow |
| next_step_status | Base Comum | domain | Workflow |

-------------------------------------

# 4. Campos de estratégia de preço

Campos internos e sensíveis.

| Campo | Público? | Estruturado? | Observação |
|---|---|---|---|
| owner_requested_price | Não | Sim | Valor pedido pelo proprietário |
| owner_minimum_acceptable_price | Não | Sim | Valor mínimo/carta branca |
| professional_recommended_price | Não | Sim | Recomendação profissional |
| initial_listing_price | Não/Público histórico controlado | Sim | Base histórica |
| current_listing_price | Sim, se publicado | Sim | Preço atual do anúncio |
| negotiation_margin_authorized | Não | Sim | Sensível |
| price_strategy_notes | Não | Pode ser texto/JSONB | Nota interna |
| price_confidence_level | Não | Sim | Apoia score |

Regra:
price_strategy nunca deve ser exposto em endpoint público.

-------------------------------------

# 5. Campos por módulo que devem ser estruturados

## 5.1 Módulo Casa

| Campo | Tipo | Motivo |
|---|---|---|
| house_subtype | domain | Filtro/classificação |
| has_condominium_context | boolean/domain | Filtro e lógica |
| topography | domain | Risco/padrão |
| construction_type | domain | Padrão/risco |
| floors | domain | Característica |
| general_conservation_status | domain | Score |
| roof_condition | domain | Risco |
| structural_risk_perception | domain | Alerta |
| built_area_matches_documents | domain | Risco documental |
| construction_registered | domain | Financiamento/risco |
| house_market_appeal | domain | Score comercial |
| house_recommendation | domain | Workflow |

-------------------------------------

## 5.2 Módulo Apartamento / Studio / Loft / Kitnet

| Campo | Tipo | Motivo |
|---|---|---|
| apartment_subtype | domain | Filtro/classificação |
| has_condominium_context | boolean/domain | Filtro |
| unit_floor | number | Característica |
| private_area | number | Filtro/validação |
| parking_type | domain | Filtro/risco |
| general_unit_conservation | domain | Score |
| sun_position | domain | Tag/filtro |
| view_type | domain | Valor percebido |
| condo_fee_status | domain | Risco |
| condominium_risk | domain | Risco |
| apartment_market_appeal | domain | Score comercial |
| unit_registration_status | domain | Risco documental |
| apartment_recommendation | domain | Workflow |

-------------------------------------

## 5.3 Módulo Terreno / Lote

| Campo | Tipo | Motivo |
|---|---|---|
| land_subtype | domain | Filtro/classificação |
| has_subdivision_context | boolean/domain | Contexto |
| total_area | number | Filtro/preço |
| front_measure | number | Valor comercial |
| topography | domain | Risco/custo |
| zoning_informed | domain | Uso/risco |
| street_type | domain | Infraestrutura |
| water_network | domain | Infraestrutura |
| electricity_network | domain | Infraestrutura |
| sewage_network | domain | Infraestrutura |
| area_matches_document | domain | Risco |
| construction_potential | domain | Valor comercial |
| liquidity_profile | domain | Score comercial |
| land_recommendation | domain | Workflow |

-------------------------------------

## 5.4 Módulo Comercial

| Campo | Tipo | Motivo |
|---|---|---|
| commercial_subtype | domain | Filtro/classificação |
| current_use | domain | Uso |
| intended_best_use | domain | Estratégia |
| ceiling_height_category | domain | Operação |
| street_frontage | domain | Visibilidade |
| visibility_from_street | domain | Score comercial |
| parking_available | domain | Operação |
| three_phase_power_available | domain | Operação |
| avcb_status_informed | domain | Risco |
| accessibility_apparent | domain | Risco/operação |
| business_region_profile | domain | Localização comercial |
| commercial_market_appeal | domain | Score comercial |
| commercial_recommendation | domain | Workflow |

-------------------------------------

## 5.5 Módulo Rural

| Campo | Tipo | Motivo |
|---|---|---|
| rural_subtype | domain | Filtro/classificação |
| total_area | number | Filtro/preço |
| area_unit | domain | Medida rural |
| area_matches_document | domain | Risco |
| access_quality | domain | Liquidez |
| electricity_available | domain | Infraestrutura |
| water_availability | domain | Valor rural |
| improvements_condition | domain | Valor/risco |
| current_rural_use | domain | Estratégia |
| productive_potential | domain | Valor |
| environmental_risk | domain | Risco |
| rural_documentation_status | domain | Risco |
| georeferencing_status | domain | Risco/documentação |
| rural_market_appeal | domain | Score comercial |
| rural_recommendation | domain | Workflow |

-------------------------------------

# 6. Campos que podem ficar em JSONB inicialmente

Podem ficar em JSONB durante validação, desde que não virem regra crítica sem estrutura posterior.

## 6.1 Base Comum

- risk_details
- document_checklist
- financial_notes
- pricing_notes
- field_observations
- next_steps_details
- technical_media_metadata

## 6.2 Casa

- field_discrepancies
- technical_conservation_notes
- roof_notes
- structure_notes
- electrical_hydraulic_notes
- external_area_notes
- house_specific_risk_details
- house_recommendation_details

## 6.3 Apartamento

- condominium_infrastructure
- condominium_restrictions
- apartment_specific_risk_details
- field_discrepancies
- conservation_notes
- condominium_notes
- documentation_notes
- recommendation_details

## 6.4 Terreno

- subdivision_infrastructure
- existing_improvements
- land_specific_risk_details
- field_discrepancies
- topography_notes
- infrastructure_notes
- zoning_notes
- documentation_notes
- recommendation_details

## 6.5 Comercial

- fire_safety_items_visible
- commercial_condominium_infrastructure
- commercial_condominium_restrictions
- nearby_anchors
- target_audience
- best_selling_points
- commercial_specific_risk_details
- field_discrepancies
- documentation_notes
- recommendation_details

## 6.6 Rural

- rural_improvements
- rural_documents_presented
- target_audience
- best_selling_points
- rural_specific_risk_details
- field_discrepancies
- water_notes
- access_notes
- documentation_notes
- environmental_notes
- recommendation_details

-------------------------------------

# 7. Regra para JSONB

Qualquer campo inicialmente em JSONB deve virar estrutura se passar a ser usado para:

- filtro
- workflow
- score
- auditoria
- aprovação
- bloqueio
- permissão
- publicação
- revisão
- busca frequente

-------------------------------------

# 8. Relação com anúncio

O Documento Profissional pode validar e sugerir correções para o anúncio.

Campos de divergência relevantes:

- área
- quartos
- suítes
- banheiros
- vagas
- preço
- endereço
- condomínio
- financiamento
- quitado
- features
- padrão
- fotos
- descrição
- finalidade
- documentação

Regra:
O Documento Profissional não deve sobrescrever automaticamente o anúncio sem revisão/ação do usuário ou regra backend explícita.

-------------------------------------

# 9. Relação com scores futuros

O Documento Profissional deve alimentar:

- score de confiabilidade
- score de risco
- score de conservação
- score comercial
- score de infraestrutura
- score de documentação
- padrão calculado/revisado do imóvel

Regra:
Scores definitivos não devem ser número solto em metadata. Devem virar camada própria de score/eventos quando o core avançar.

-------------------------------------

# 10. Relação com fotos

Fotos públicas do anúncio e fotos técnicas do Documento Profissional são separadas.

Fotos públicas:
media_context = public_listing

Fotos técnicas:
media_context = technical_assessment

Regra:
Fotos técnicas não são indexáveis, não são públicas e não aparecem no anúncio.

-------------------------------------

# 11. Relação com tarefas e maturidade operacional

O Documento Profissional deve alimentar:

- próximo passo
- responsável pelo próximo passo
- prazo
- recomendação profissional
- status de vínculo com cliente
- status de vínculo com anúncio
- revisão de preço
- solicitação de documento
- necessidade de nova visita
- necessidade de especialista

Uso futuro:

- broker dashboard
- agency dashboard
- esteira operacional do anúncio
- maturidade da demanda

-------------------------------------

# 12. Próxima etapa técnica

Antes de implementar backend:

1. Auditar schema atual
2. Mapear tabelas existentes
3. Comparar property_professional_assessments atual com este mapa
4. Decidir colunas estruturadas
5. Decidir JSONB provisórios
6. Criar plano de migrations
7. Validar impactos em services/front
8. Só então implementar

-------------------------------------

# 13. Decisão de produto

O Documento Profissional deve ser:

- modular
- técnico
- guiado
- clicável
- orientado por escolhas
- com campos condicionais
- com origem da informação
- com nível de confiança
- com risco
- com estratégia de preço
- com recomendações
- com próximos passos

Não deve permanecer como grandes campos livres de texto.