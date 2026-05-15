# HURBY — Documento Profissional do Imóvel V1
## Módulo Apartamento / Studio / Loft / Kitnet

Status: Modelagem conceitual e técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Módulo: Apartamento / Studio / Loft / Kitnet  
Depende de: Base Comum do Documento Profissional  

-------------------------------------

# 1. Objetivo do Módulo

Este módulo complementa a Base Comum do Documento Profissional com perguntas, validações e análises específicas para unidades residenciais em edifícios ou estruturas condominiais.

Abrange:

- apartamento
- studio
- loft
- kitnet
- cobertura
- garden
- duplex
- unidade em condomínio vertical
- unidade compacta para moradia ou investimento

Este módulo serve para captação, vistoria comercial, análise de risco, validação de anúncio, apoio à precificação e estratégia de negociação.

Não substitui laudo técnico, avaliação bancária, vistoria de engenharia, arquitetura ou análise jurídica formal.

-------------------------------------

# 2. Subtipo da Unidade

Campo:
apartment_subtype

Tipo:
select/radio

Opções:

- standard_apartment
- studio
- loft
- kitnet
- penthouse
- garden
- duplex
- flat
- serviced_apartment
- other

Uso:

- define campos condicionais
- alimenta filtros
- ajuda classificação de padrão
- ajuda liquidez
- ajuda público-alvo
- orienta estratégia comercial

Campo estruturado no futuro:
sim

Não deixar em metadata no fechamento do core.

-------------------------------------

# 3. Edifício / Condomínio

Campos:

has_condominium_context:
- yes
- no

condominium_name:
texto

building_name:
texto

tower_or_block:
texto

unit_floor:
number

total_floors:
number

units_per_floor:
number

elevators_count:
number

elevator_status:
- yes
- no
- not_verified

building_age_estimate:
- new
- up_to_5_years
- 6_to_15_years
- 16_to_30_years
- over_30_years
- not_verified

Uso:

- validação do anúncio
- filtro futuro
- classificação de padrão
- precificação
- risco condominial
- liquidez

Observação:
Condomínio/edifício pode nascer como texto, mas deve evoluir para entidade própria no futuro.

-------------------------------------

# 4. Unidade e Distribuição Interna

Campos:

private_area:
number

total_area:
number

bedrooms_verified:
number

suites_verified:
number

bathrooms_verified:
number

parking_spots_verified:
number

layout_type:
- traditional
- integrated
- open_concept
- compact
- duplex
- not_verified

balcony:
- yes
- no
- gourmet
- technical
- not_verified

laundry_area:
- yes
- no
- integrated
- not_verified

home_office:
- yes
- no
- adapted
- not_verified

layout_quality:
- excellent
- good
- regular
- poor
- not_evaluated

Uso:

- valida dados do anúncio
- ajuda descrição comercial
- ajuda liquidez
- ajuda padrão
- identifica divergências

-------------------------------------

# 5. Vaga de Garagem

Campos:

parking_spots_count:
number

parking_type:
- covered
- uncovered
- rotating
- deeded
- assigned
- not_available
- not_verified

parking_documentation_status:
- linked_to_unit
- separate_registration
- condominium_assignment
- informal
- not_verified

parking_access_quality:
- easy
- regular
- difficult
- not_evaluated

Uso:

- filtro
- preço
- risco documental
- liquidez
- validação de anúncio

Alerta:
Vaga informada como própria precisa ser conferida documentalmente quando aplicável.

-------------------------------------

# 6. Conservação da Unidade

Campos:

general_unit_conservation:
- excellent
- good
- regular
- poor
- critical
- not_verified

painting_status:
- good
- regular
- needs_paint
- not_verified

floor_status:
- good
- regular
- damaged
- not_verified

doors_windows_status:
- good
- regular
- damaged
- not_verified

ceiling_status:
- good
- regular
- damaged
- not_verified

built_in_furniture_status:
- excellent
- good
- regular
- damaged
- not_applicable
- not_verified

Uso:

- score de conservação
- precificação
- alerta de reforma
- padrão
- recomendação de fotos/anúncio

-------------------------------------

# 7. Hidráulica, Elétrica e Instalações Aparentes

Campos:

electrical_condition_apparent:
- good
- regular
- old_installation
- exposed_wiring
- risk_signs
- not_verified

hydraulic_condition_apparent:
- good
- regular
- leak_signs
- old_installation
- not_verified

air_conditioning_points:
- yes
- no
- partial
- not_verified

gas_system:
- piped_gas
- individual_gas
- not_available
- not_verified

water_heating:
- electric
- gas
- solar
- none
- not_verified

Uso:

- risco
- conforto
- padrão
- manutenção
- precificação

-------------------------------------

# 8. Posição, Vista e Conforto Ambiental

Campos:

sun_position:
- morning_sun
- afternoon_sun
- no_direct_sun
- not_verified

view_type:
- open_view
- internal_view
- street_view
- blocked_view
- premium_view
- not_verified

noise_level:
- low
- medium
- high
- not_evaluated

ventilation_quality:
- excellent
- good
- regular
- poor
- not_evaluated

natural_light_quality:
- excellent
- good
- regular
- poor
- not_evaluated

privacy_level:
- high
- medium
- low
- not_evaluated

Uso:

- tags visuais
- descrição comercial
- liquidez
- padrão
- preço
- público-alvo

-------------------------------------

# 9. Infraestrutura do Condomínio

Campos:
condominium_infrastructure

Multi-select:

- concierge_24h
- remote_concierge
- security_cameras
- controlled_access
- elevator
- pool
- gym
- party_room
- gourmet_area
- coworking
- laundry
- playground
- sports_court
- pet_area
- bike_storage
- visitor_parking
- market_or_convenience
- rooftop
- green_area
- none_verified

Uso:

- tags
- filtros
- padrão
- valor percebido
- descrição comercial
- precificação

-------------------------------------

# 10. Taxa Condominial e Risco Condominial

Campos:

condo_fee_informed:
number

condo_fee_status:
- informed
- not_informed
- to_confirm

condo_fee_perception:
- low
- compatible
- high
- very_high
- not_evaluated

condominium_debt_informed:
- yes
- no
- to_confirm

condominium_risk:
- low
- medium
- high
- not_evaluated

condominium_restrictions:
multi-select

Opções:

- pet_restriction
- short_term_rental_restriction
- commercial_use_restriction
- renovation_restriction
- visitor_parking_restriction
- not_verified

Uso:

- risco
- locação
- Airbnb
- investimento
- liquidez
- precificação

-------------------------------------

# 11. Perfil Comercial da Unidade

Campos:

apartment_market_appeal:
- high
- medium
- low
- depends_on_price
- not_evaluated

target_audience:
multi-select

Opções:

- family
- single_person
- couple
- student
- investor
- airbnb
- rental_income
- high_income
- first_home_buyer
- elderly_accessibility

best_selling_points:
multi-select

Opções:

- good_location
- condominium_infrastructure
- morning_sun
- open_view
- furnished
- ready_to_live
- compact_liquidity
- investment_profile
- accepts_financing
- below_market_opportunity

Uso:

- tags editoriais controladas
- descrição comercial
- campanha
- preço
- público-alvo

-------------------------------------

# 12. Documentação Específica da Unidade

Campos:

unit_area_matches_documents:
- yes
- no
- to_confirm
- not_verified

parking_matches_documents:
- yes
- no
- to_confirm
- not_verified

condominium_document_presented:
- yes
- no
- partial
- not_verified

unit_registration_status:
- apparently_regular
- pending_review
- discrepancy_found
- relevant_risk
- not_verified

short_term_rental_allowed:
- yes
- no
- to_confirm
- not_verified

Uso:

- financiamento
- risco
- locação
- Airbnb
- proposta
- revisão documental

Regra:
Não declarar regularidade jurídica definitiva. Registrar evidência/percepção e necessidade de conferência.

-------------------------------------

# 13. Riscos Específicos de Apartamento / Studio / Kitnet

Riscos possíveis:

- high_condo_fee
- parking_not_linked
- condominium_debt
- noisy_unit
- poor_ventilation
- blocked_view
- short_term_rental_restricted
- building_maintenance_risk
- low_liquidity_due_to_layout
- discrepancy_in_area
- documentation_pending
- financing_restriction

Cada risco deve permitir:

- identified: true/false
- risk_level: low/medium/high
- note: texto curto

Uso:

- score de risco
- alerta
- revisão de agência
- recomendação profissional

-------------------------------------

# 14. Divergências com o Anúncio

Campo:
field_discrepancies

Formato inicial:
JSONB padronizado

Campos que podem gerar divergência:

- área privativa
- área total
- quartos
- suítes
- banheiros
- vagas
- condomínio
- andar
- elevador
- preço
- financiamento
- endereço
- features
- mobiliado
- vista
- sol da manhã

Uso:

- alerta no checkup
- correção do anúncio
- revisão interna
- score de confiabilidade

-------------------------------------

# 15. Recomendações para Unidade

Campo:
apartment_recommendation

Opções:

- publish_as_is
- review_price
- request_documents
- improve_photos
- validate_condominium_fee
- validate_parking_documentation
- validate_financing
- review_airbnb_viability
- not_recommend_publish_yet

Ações sugeridas:

- fotografar vista
- fotografar vaga
- fotografar lazer do condomínio
- confirmar taxa condominial
- confirmar vaga na matrícula
- confirmar regras de locação curta
- revisar preço por condomínio alto
- revisar anúncio por divergência

Uso:

- tarefas
- maturidade operacional
- painel broker/agência

-------------------------------------

# 16. Pontuação futura do Módulo

## 16.1 Score de conservação

Entradas:

- general_unit_conservation
- floor_status
- painting_status
- doors_windows_status
- ceiling_status
- built_in_furniture_status

## 16.2 Score de condomínio

Entradas:

- condominium_infrastructure
- condo_fee_perception
- condominium_risk
- elevator_status
- building_age_estimate
- restrictions

## 16.3 Score comercial da unidade

Entradas:

- layout_quality
- sun_position
- view_type
- ventilation_quality
- natural_light_quality
- target_audience
- apartment_market_appeal
- price_coherence

## 16.4 Padrão do imóvel

Entradas:

- subtipo
- área
- localização
- infraestrutura do condomínio
- conservação
- vista
- sol
- vaga
- mobiliado
- acabamento
- liquidez

Saídas futuras:

- simple
- economic
- popular
- medium
- medium_high
- elevated
- high_standard
- luxury

-------------------------------------

# 17. O que deve ser estruturado antes do fechamento do core

Campos que não devem terminar em metadata:

- apartment_subtype
- has_condominium_context
- unit_floor
- private_area
- parking_type
- general_unit_conservation
- sun_position
- view_type
- condo_fee_status
- condominium_risk
- apartment_market_appeal
- unit_registration_status
- apartment_recommendation

-------------------------------------

# 18. O que pode ficar em JSONB inicialmente

Pode ficar em JSONB durante validação:

- condominium_infrastructure
- condominium_restrictions
- apartment_specific_risk_details
- field_discrepancies
- conservation_notes
- condominium_notes
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

# 19. Decisão de produto

O Módulo Apartamento / Studio / Loft / Kitnet deve responder:

- que tipo de unidade é?
- qual é o contexto condominial?
- a vaga existe e é documentada?
- o condomínio valoriza ou pesa contra?
- a unidade tem boa luz, ventilação, vista e privacidade?
- o imóvel tem perfil de moradia, renda ou Airbnb?
- há restrição condominial importante?
- há divergência com o anúncio?
- qual recomendação profissional?

-------------------------------------

# 20. Próxima etapa

Depois deste módulo, modelar:

1. Módulo Terreno
2. Módulo Comercial
3. Módulo Rural