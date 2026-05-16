# HURBY — Documento Profissional do Imóvel V1
## Módulo Rural

Status: Modelagem conceitual e técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Módulo: Rural  
Depende de: Base Comum do Documento Profissional  

-------------------------------------

# 1. Objetivo do Módulo

Este módulo complementa a Base Comum do Documento Profissional com perguntas, validações e análises específicas para imóveis rurais.

Abrange:

- chácara
- sítio
- fazenda
- área rural
- área de lazer rural
- imóvel rural produtivo
- imóvel rural para moradia
- imóvel rural para investimento
- área rural com benfeitorias
- área rural sem benfeitorias

Serve para captação, análise comercial, validação de acesso, infraestrutura, documentação rural, benfeitorias, potencial produtivo, risco ambiental, precificação e estratégia de negociação.

Não substitui laudo técnico, georreferenciamento, análise ambiental, análise agronômica, avaliação rural formal, análise jurídica ou avaliação bancária.

-------------------------------------

# 2. Subtipo Rural

Campo:
rural_subtype

Tipo:
select/radio

Opções:

- small_farm
- country_house
- farm
- rural_land
- leisure_area
- productive_farm
- rural_residence
- rural_investment_area
- rural_area_with_improvements
- rural_area_without_improvements
- other

Uso:

- define campos condicionais
- alimenta filtros
- ajuda análise comercial
- ajuda precificação
- ajuda público-alvo
- orienta documentação necessária

Campo estruturado no futuro:
sim

Não deixar em metadata no fechamento do core.

-------------------------------------

# 3. Área e Unidade de Medida

Campos:

total_area:
number

area_unit:
- square_meter
- hectare
- alqueire
- acre
- not_verified

usable_area:
number

preserved_area_estimate:
number

open_area_estimate:
number

area_source:
- informed_by_owner
- document_presented
- georeferencing_document
- previous_listing
- not_verified

area_matches_document:
- yes
- no
- to_confirm
- not_verified

Uso:

- valida anúncio
- precificação
- documentação
- risco
- liquidez
- financiamento

Regra:
Área rural informada sem documento ou georreferenciamento deve manter confiança reduzida.

-------------------------------------

# 4. Acesso e Estrada

Campos:

access_type:
- paved_road
- gravel_road
- dirt_road
- mixed_access
- river_access
- not_verified

access_quality:
- excellent
- good
- regular
- difficult
- seasonal_difficulty
- not_evaluated

distance_from_city:
number

distance_unit:
- km
- not_verified

distance_from_main_road:
number

heavy_vehicle_access:
- yes
- no
- limited
- seasonal
- not_verified

rainy_season_access_risk:
- low
- medium
- high
- not_evaluated

Uso:

- preço
- liquidez
- operação rural
- turismo/lazer
- risco
- descrição comercial

-------------------------------------

# 5. Água

Campos:

water_sources:
multi-select

Opções:

- well
- artesian_well
- river
- stream
- lake
- spring
- public_network
- rainwater_storage
- water_truck
- not_verified

water_availability:
- abundant
- sufficient
- limited
- seasonal
- not_verified

water_quality_informed:
- good
- regular
- poor
- not_verified

irrigation_potential:
- high
- medium
- low
- not_evaluated

water_risk:
- low
- medium
- high
- not_evaluated

Uso:

- valor rural
- produção
- moradia
- lazer
- risco
- documentação ambiental futura

-------------------------------------

# 6. Energia e Comunicação

Campos:

electricity_available:
- yes
- no
- partial
- not_verified

electricity_type:
- public_grid
- solar
- generator
- mixed
- not_available
- not_verified

internet_signal:
- good
- regular
- poor
- unavailable
- not_verified

phone_signal:
- good
- regular
- poor
- unavailable
- not_verified

Uso:

- moradia
- produtividade
- turismo rural
- operação
- preço
- liquidez

-------------------------------------

# 7. Benfeitorias

Campos:
rural_improvements

Multi-select:

- main_house
- caretaker_house
- barn
- shed
- corral
- stable
- chicken_coop
- pigsty
- machinery_storage
- fence
- gate
- internal_roads
- pool
- leisure_area
- barbecue_area
- orchard
- garden
- pasture
- crop_area
- irrigation_system
- none
- not_verified

improvements_condition:
- excellent
- good
- regular
- poor
- critical
- not_verified

improvements_regularization_risk:
- low
- medium
- high
- not_evaluated

Uso:

- preço
- fotos
- anúncio
- risco documental
- manutenção
- público-alvo

-------------------------------------

# 8. Casa Sede / Moradia Rural

Exibir quando houver moradia.

Campos:

main_house_condition:
- excellent
- good
- regular
- poor
- critical
- not_verified

main_house_bedrooms:
number

main_house_bathrooms:
number

main_house_kitchen:
- yes
- no
- not_verified

main_house_leisure:
- yes
- no
- partial
- not_verified

main_house_ready_to_live:
- yes
- no
- needs_repairs
- not_verified

Uso:

- anúncio
- liquidez
- público-alvo
- preço
- score de conservação

-------------------------------------

# 9. Produção e Uso Rural

Campos:

current_rural_use:
- leisure
- residence
- cattle
- agriculture
- mixed_production
- unused
- rental_income
- tourism
- not_verified

productive_potential:
- high
- medium
- low
- not_evaluated

pasture_condition:
- good
- regular
- poor
- not_applicable
- not_verified

crop_potential:
- high
- medium
- low
- not_applicable
- not_evaluated

livestock_structure:
- good
- regular
- poor
- not_applicable
- not_verified

Uso:

- investimento
- preço
- público-alvo
- descrição comercial
- risco operacional

-------------------------------------

# 10. Vegetação, Reserva e Risco Ambiental

Campos:

vegetation_profile:
- open_area
- mixed
- dense_vegetation
- preserved_area
- not_verified

environmental_restriction_known:
- yes
- no
- to_confirm
- not_verified

legal_reserve_informed:
- yes
- no
- to_confirm
- not_verified

permanent_preservation_area_informed:
- yes
- no
- to_confirm
- not_verified

environmental_risk:
- low
- medium
- high
- not_evaluated

Uso:

- risco
- documentação
- negociação
- financiamento
- público-alvo

Regra:
Não afirmar regularidade ambiental definitiva. Registrar apenas informação apresentada/percepção e necessidade de conferência.

-------------------------------------

# 11. Documentação Rural

Campos:

rural_documents_presented:
multi-select

Opções:

- property_registry
- deed
- ccir
- itr
- car
- georeferencing
- incra_document
- environmental_license
- possession_contract
- none
- not_verified

rural_documentation_status:
- apparently_regular
- pending_review
- discrepancy_found
- relevant_risk
- not_verified

car_status_informed:
- valid
- pending
- not_available
- to_confirm
- not_verified

ccir_status_informed:
- valid
- pending
- not_available
- to_confirm
- not_verified

itr_status_informed:
- valid
- pending
- not_available
- to_confirm
- not_verified

georeferencing_status:
- done
- not_done
- to_confirm
- not_required_informed
- not_verified

Uso:

- risco
- financiamento
- proposta
- negociação
- recomendação profissional

-------------------------------------

# 12. Cercas, Divisas e Confrontantes

Campos:

fencing_status:
- fully_fenced
- partially_fenced
- not_fenced
- not_verified

boundary_clarity:
- clear
- partial
- unclear
- not_verified

neighbor_conflict_informed:
- yes
- no
- to_confirm
- not_verified

access_easement_needed:
- yes
- no
- to_confirm
- not_verified

Uso:

- risco
- documentação
- negociação
- avaliação rural
- recomendação profissional

-------------------------------------

# 13. Perfil Comercial Rural

Campos:

rural_market_appeal:
- high
- medium
- low
- depends_on_price
- not_evaluated

target_audience:
multi-select

Opções:

- leisure_buyer
- rural_residence_buyer
- investor
- cattle_operator
- agriculture_operator
- tourism_operator
- weekend_property_buyer
- high_income
- family
- developer

best_selling_points:
multi-select

Opções:

- good_access
- abundant_water
- main_house
- productive_potential
- pasture
- river_or_lake
- preserved_nature
- close_to_city
- tourism_potential
- below_market_opportunity
- ready_to_use
- investment_profile

Uso:

- tags editoriais controladas
- descrição comercial
- preço
- público-alvo
- campanha

-------------------------------------

# 14. Riscos Específicos de Rural

Riscos possíveis:

- access_difficulty
- rainy_season_access_risk
- area_discrepancy
- documentation_pending
- car_pending
- ccir_pending
- itr_pending
- georeferencing_pending
- environmental_restriction
- water_limitation
- electricity_limitation
- boundary_unclear
- neighbor_conflict
- low_liquidity
- improvements_regularization_risk

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

# 15. Divergências com o Anúncio

Campo:
field_discrepancies

Formato inicial:
JSONB padronizado

Campos que podem gerar divergência:

- área total
- unidade de medida
- distância da cidade
- acesso
- água
- energia
- benfeitorias
- documentação
- preço
- uso produtivo
- features
- localização

Uso:

- alerta no checkup
- correção do anúncio
- revisão interna
- score de confiabilidade

-------------------------------------

# 16. Recomendações para Rural

Campo:
rural_recommendation

Opções:

- publish_as_is
- review_price
- request_documents
- validate_area
- validate_access
- validate_water_sources
- validate_environmental_status
- improve_photos
- require_specialist_assessment
- not_recommend_publish_yet

Ações sugeridas:

- solicitar matrícula
- solicitar CCIR
- solicitar ITR
- solicitar CAR
- solicitar georreferenciamento
- confirmar área
- confirmar acesso em período de chuva
- fotografar acesso
- fotografar água
- fotografar benfeitorias
- fotografar casa sede
- revisar preço por acesso ou documentação
- revisar anúncio por divergência

Uso:

- tarefas
- maturidade operacional
- painel broker/agência

-------------------------------------

# 17. Pontuação futura do Módulo

## 17.1 Score de acesso e infraestrutura

Entradas:

- access_quality
- rainy_season_access_risk
- electricity_available
- internet_signal
- phone_signal
- internal_roads
- distance_from_city

## 17.2 Score hídrico

Entradas:

- water_sources
- water_availability
- water_quality_informed
- irrigation_potential
- water_risk

## 17.3 Score produtivo/comercial

Entradas:

- productive_potential
- current_rural_use
- pasture_condition
- crop_potential
- livestock_structure
- rural_market_appeal
- target_audience

## 17.4 Score de risco rural

Entradas:

- documentation_status
- environmental_risk
- boundary_clarity
- neighbor_conflict
- georeferencing_status
- improvements_regularization_risk

## 17.5 Padrão / Atratividade rural

Entradas:

- subtipo
- área
- acesso
- água
- energia
- benfeitorias
- casa sede
- distância da cidade
- potencial produtivo
- documentação
- natureza/lazer
- liquidez

Saídas futuras:

- low_attractiveness
- regular
- good
- strategic
- premium_rural

-------------------------------------

# 18. O que deve ser estruturado antes do fechamento do core

Campos que não devem terminar em metadata:

- rural_subtype
- total_area
- area_unit
- area_matches_document
- access_quality
- electricity_available
- water_availability
- improvements_condition
- current_rural_use
- productive_potential
- environmental_risk
- rural_documentation_status
- georeferencing_status
- rural_market_appeal
- rural_recommendation

-------------------------------------

# 19. O que pode ficar em JSONB inicialmente

Pode ficar em JSONB durante validação:

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

Mas deve virar estrutura se passar a ser:

- filtro
- workflow
- score
- auditoria
- aprovação
- bloqueio
- publicação

-------------------------------------

# 20. Decisão de produto

O Módulo Rural deve responder:

- que tipo de imóvel rural é?
- qual área e unidade de medida?
- o acesso é viável o ano todo?
- existe água suficiente?
- existe energia e comunicação?
- há benfeitorias relevantes?
- há potencial produtivo ou turístico?
- há documentação rural mínima?
- há risco ambiental, divisa ou acesso?
- há divergência com o anúncio?
- qual recomendação profissional?

-------------------------------------

# 21. Próxima etapa

Depois deste módulo, consolidar:

1. Base Comum
2. Módulo Casa
3. Módulo Apartamento / Studio / Loft / Kitnet
4. Módulo Terreno
5. Módulo Comercial
6. Módulo Rural

Em seguida, criar o Mapa Mestre de Campos do Documento Profissional.