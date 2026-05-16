# HURBY — Documento Profissional do Imóvel V1
## Módulo Terreno / Lote

Status: Modelagem conceitual e técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Módulo: Terreno / Lote  
Depende de: Base Comum do Documento Profissional  

-------------------------------------

# 1. Objetivo do Módulo

Este módulo complementa a Base Comum do Documento Profissional com perguntas, validações e análises específicas para terrenos e lotes.

Abrange:

- terreno em rua pública
- lote em loteamento aberto
- lote em condomínio fechado
- terreno urbano
- terreno comercial
- terreno misto
- terreno industrial
- lote com construção não considerada principal
- área com potencial de incorporação

Este módulo serve para captação, análise comercial, validação de medidas, avaliação de potencial construtivo, identificação de riscos, apoio à precificação e estratégia de negociação.

Não substitui levantamento topográfico, laudo técnico, análise jurídica, avaliação bancária, estudo urbanístico formal ou parecer de engenharia/arquitetura.

-------------------------------------

# 2. Subtipo do Terreno

Campo:
land_subtype

Tipo:
select/radio

Opções:

- public_street_lot
- gated_lot
- open_subdivision_lot
- urban_land
- commercial_land
- mixed_use_land
- industrial_land
- incorporation_potential_area
- other

Uso:

- define campos condicionais
- alimenta filtros
- ajuda análise de uso
- ajuda precificação
- ajuda risco documental/urbanístico
- orienta público-alvo

Campo estruturado no futuro:
sim

Não deixar em metadata no fechamento do core.

-------------------------------------

# 3. Contexto de Loteamento / Condomínio

Exibir quando:

land_subtype = gated_lot
ou
land_subtype = open_subdivision_lot

Campos:

has_subdivision_context:
- yes
- no

subdivision_name:
texto

subdivision_type:
- gated_community
- open_subdivision
- rural_subdivision
- industrial_subdivision
- not_verified

subdivision_infrastructure:
multi-select

Opções:

- paved_streets
- controlled_access
- concierge_or_gatehouse
- public_lighting
- water_network
- sewage_network
- drainage
- green_area
- leisure_area
- security_rounds
- internal_lakes
- commercial_area
- not_verified

subdivision_fee_status:
- informed
- not_informed
- to_confirm

subdivision_risk:
- low
- medium
- high
- not_evaluated

Observação:
Nome do loteamento/condomínio pode nascer como texto, mas deve evoluir para entidade própria no futuro, se virar domínio relevante.

-------------------------------------

# 4. Medidas e Área

Campos:

total_area:
number

front_measure:
number

back_measure:
number

left_side_measure:
number

right_side_measure:
number

area_unit:
- square_meter
- hectare
- alqueire
- not_verified

shape:
- regular
- irregular
- corner
- narrow_front
- deep_lot
- not_verified

measure_source:
- informed_by_owner
- document_presented
- measured_on_site
- previous_listing
- not_verified

Uso:

- valida dados do anúncio
- gera alerta de divergência
- precificação
- cálculo de potencial construtivo
- avaliação de liquidez

Regra:
Medidas informadas sem documento ou sem conferência devem manter status de confiança menor.

-------------------------------------

# 5. Topografia e Solo Aparente

Campos:

topography:
- flat
- uphill
- downhill
- irregular
- mixed
- not_verified

soil_condition_apparent:
- dry_firm
- wet_or_soft
- rocky
- landfill_signs
- erosion_signs
- vegetation_covered
- not_verified

need_earthwork:
- no
- low
- medium
- high
- not_evaluated

drainage_condition:
- good
- regular
- poor
- not_verified

flood_risk_perception:
- low
- medium
- high
- not_evaluated

Uso:

- risco técnico
- custo futuro de obra
- preço
- liquidez
- recomendação profissional

Alerta:
Não afirmar condição geotécnica definitiva. Registrar apenas percepção aparente e necessidade de análise especializada quando aplicável.

-------------------------------------

# 6. Infraestrutura da Rua / Entorno

Campos:

street_type:
- asphalt
- paving_stone
- dirt_road
- mixed
- not_verified

public_lighting:
- yes
- no
- partial
- not_verified

water_network:
- yes
- no
- to_confirm
- not_verified

electricity_network:
- yes
- no
- to_confirm
- not_verified

sewage_network:
- yes
- no
- to_confirm
- not_verified

internet_available:
- yes
- no
- to_confirm
- not_verified

sidewalk:
- yes
- no
- partial
- not_verified

curb:
- yes
- no
- partial
- not_verified

Uso:

- filtro futuro
- padrão de localização
- preço
- liquidez
- risco
- público-alvo
- descrição comercial

-------------------------------------

# 7. Zoneamento e Uso Permitido

Campos:

zoning_informed:
- residential
- commercial
- mixed
- industrial
- rural_transition
- special_zone
- not_informed
- not_verified

current_use:
- vacant
- residential_use
- commercial_use
- parking
- storage
- agricultural
- irregular_use
- not_verified

intended_best_use:
- residential_building
- commercial_building
- mixed_use
- condominium_development
- warehouse
- investment_hold
- not_evaluated

use_restriction_known:
- yes
- no
- to_confirm
- not_verified

Uso:

- análise comercial
- potencial de incorporação
- risco
- financiamento
- perfil de investidor
- preço

Regra:
Zoneamento deve ser tratado como informação pendente de confirmação se não houver fonte oficial/documental.

-------------------------------------

# 8. Acesso e Logística

Campos:

access_quality:
- excellent
- good
- regular
- difficult
- not_evaluated

vehicle_access:
- easy
- regular
- difficult
- not_evaluated

main_road_proximity:
- very_close
- close
- medium
- far
- not_evaluated

public_transport_nearby:
- yes
- no
- not_verified

heavy_vehicle_access:
- yes
- no
- limited
- not_applicable
- not_verified

Uso:

- comercial
- industrial
- logística
- precificação
- público-alvo
- tag visual futura

-------------------------------------

# 9. Limpeza, Ocupação e Benfeitorias

Campos:

land_cleanliness:
- clean
- light_vegetation
- dense_vegetation
- debris
- not_verified

fencing_status:
- fully_fenced
- partially_fenced
- not_fenced
- not_verified

wall_status:
- fully_walled
- partially_walled
- not_walled
- not_verified

gate_status:
- yes
- no
- damaged
- not_verified

existing_improvements:
multi-select

Opções:

- small_building
- foundation
- wall
- gate
- water_point
- electricity_standard
- shed
- pool
- demolished_structure
- none
- not_verified

improvement_regularization_risk:
- low
- medium
- high
- not_evaluated

Uso:

- risco
- custo de limpeza
- negociação
- documentação
- fotos técnicas
- preço

-------------------------------------

# 10. Documentação Específica de Terreno

Campos:

registration_document_presented:
- yes
- no
- partial
- not_verified

area_matches_document:
- yes
- no
- to_confirm
- not_verified

subdivision_regularization_status:
- regular_apparent
- pending_review
- discrepancy_found
- relevant_risk
- not_verified

iptu_or_tax_matches_land:
- yes
- no
- to_confirm
- not_verified

environmental_restriction_known:
- yes
- no
- to_confirm
- not_verified

Uso:

- risco jurídico
- financiamento
- proposta
- negociação
- recomendação de documentos

Regra:
Não declarar regularidade jurídica definitiva. Registrar evidência/percepção e necessidade de conferência.

-------------------------------------

# 11. Potencial Construtivo e Comercial

Campos:

construction_potential:
- high
- medium
- low
- restricted
- not_evaluated

investment_profile:
- end_user
- builder
- investor
- developer
- commercial_operator
- not_evaluated

liquidity_profile:
- high
- medium
- low
- depends_on_price
- not_evaluated

best_selling_points:
multi-select

Opções:

- good_location
- flat_land
- corner_lot
- paved_street
- commercial_potential
- gated_lot
- large_front
- investment_profile
- below_market_opportunity
- easy_access
- infrastructure_ready

Uso:

- tags editoriais controladas
- descrição comercial
- preço
- público-alvo
- campanhas
- Documento Profissional

-------------------------------------

# 12. Riscos Específicos de Terreno

Riscos possíveis:

- area_discrepancy
- irregular_shape
- topography_cost
- drainage_issue
- flood_risk
- lack_of_infrastructure
- zoning_uncertainty
- environmental_restriction
- occupation_or_invasion_risk
- documentation_pending
- subdivision_irregularity
- low_liquidity
- access_difficulty

Cada risco deve permitir:

- identified: true/false
- risk_level: low/medium/high
- note: texto curto

Uso:

- score de risco
- revisão de agência
- recomendação profissional
- alerta ao broker

-------------------------------------

# 13. Divergências com o Anúncio

Campo:
field_discrepancies

Formato inicial:
JSONB padronizado

Campos que podem gerar divergência:

- área total
- frente
- fundo
- laterais
- zoneamento
- endereço
- loteamento
- infraestrutura
- preço
- aceita financiamento
- documentação
- restrição ambiental
- features

Uso:

- alerta no checkup
- correção do anúncio
- revisão interna
- score de confiabilidade

-------------------------------------

# 14. Recomendações para Terreno

Campo:
land_recommendation

Opções:

- publish_as_is
- review_price
- request_documents
- validate_area
- validate_zoning
- validate_infrastructure
- request_cleaning_before_photos
- require_specialist_assessment
- not_recommend_publish_yet

Ações sugeridas:

- solicitar matrícula
- solicitar IPTU/taxa
- confirmar medidas
- confirmar zoneamento
- confirmar infraestrutura
- fotografar frente
- fotografar rua
- fotografar entorno
- verificar topografia
- revisar preço por custo de terraplanagem
- revisar anúncio por divergência

Uso:

- tarefas
- maturidade operacional
- painel broker/agência

-------------------------------------

# 15. Pontuação futura do Módulo

## 15.1 Score de infraestrutura

Entradas:

- street_type
- water_network
- electricity_network
- sewage_network
- public_lighting
- sidewalk
- drainage_condition

## 15.2 Score de risco técnico/comercial

Entradas:

- topography
- soil_condition_apparent
- need_earthwork
- flood_risk_perception
- zoning_uncertainty
- environmental_restriction
- access_quality

## 15.3 Score comercial do terreno

Entradas:

- location_context
- construction_potential
- investment_profile
- liquidity_profile
- best_selling_points
- price_coherence
- infrastructure_ready

## 15.4 Padrão / Atratividade do terreno

Entradas:

- subtipo
- metragem
- localização
- frente
- infraestrutura
- topografia
- acesso
- zoneamento
- potencial construtivo
- liquidez

Saídas futuras:

- low_attractiveness
- regular
- good
- strategic
- premium_land

-------------------------------------

# 16. O que deve ser estruturado antes do fechamento do core

Campos que não devem terminar em metadata:

- land_subtype
- has_subdivision_context
- total_area
- front_measure
- topography
- zoning_informed
- street_type
- water_network
- electricity_network
- sewage_network
- area_matches_document
- construction_potential
- liquidity_profile
- land_recommendation

-------------------------------------

# 17. O que pode ficar em JSONB inicialmente

Pode ficar em JSONB durante validação:

- subdivision_infrastructure
- existing_improvements
- land_specific_risk_details
- field_discrepancies
- topography_notes
- infrastructure_notes
- zoning_notes
- documentation_notes
- recommendation_details

Mas deve virar estrutura se passar a ser:

- filtro
- workflow
- score
- auditoria
- aprovação
- bloqueio
- publicação

-------------------------------------

# 18. Decisão de produto

O Módulo Terreno deve responder:

- que tipo de terreno/lote é?
- quais são suas medidas?
- a área confere com documentos?
- há infraestrutura básica?
- qual é a topografia aparente?
- há risco ambiental, urbanístico ou documental?
- qual é o melhor uso comercial?
- o terreno tem potencial construtivo?
- há divergência com o anúncio?
- qual recomendação profissional?

-------------------------------------

# 19. Próxima etapa

Depois deste módulo, modelar:

1. Módulo Comercial
2. Módulo Rural