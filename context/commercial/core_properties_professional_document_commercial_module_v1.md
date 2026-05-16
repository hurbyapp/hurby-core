# HURBY — Documento Profissional do Imóvel V1
## Módulo Comercial

Status: Modelagem conceitual e técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Módulo: Comercial  
Depende de: Base Comum do Documento Profissional  

-------------------------------------

# 1. Objetivo do Módulo

Este módulo complementa a Base Comum do Documento Profissional com perguntas, validações e análises específicas para imóveis comerciais.

Abrange:

- sala comercial
- loja
- galpão
- barracão
- ponto comercial
- conjunto comercial
- prédio comercial
- imóvel misto com uso comercial
- espaço para operação logística

Serve para captação, análise de uso, validação de infraestrutura, risco operacional, precificação, liquidez, adequação de atividade e estratégia comercial.

Não substitui laudo técnico, análise jurídica, estudo urbanístico, AVCB, licença sanitária, alvará, vistoria de engenharia ou avaliação bancária.

-------------------------------------

# 2. Subtipo Comercial

Campo:
commercial_subtype

Tipo:
select/radio

Opções:

- office_room
- commercial_store
- warehouse
- industrial_shed
- commercial_point
- commercial_set
- commercial_building
- mixed_use_property
- logistics_space
- other

Uso:

- define campos condicionais
- alimenta filtros
- orienta análise de operação
- ajuda precificação
- ajuda público-alvo
- ajuda risco de uso

Campo estruturado no futuro:
sim

Não deixar em metadata no fechamento do core.

-------------------------------------

# 3. Uso Atual e Uso Pretendido

Campos:

current_use:
- vacant
- office
- retail
- food_service
- storage
- industry
- logistics
- mixed_use
- residential_adapted
- not_verified

intended_best_use:
- office
- retail
- restaurant_or_food
- clinic_or_health
- school_or_course
- logistics
- storage
- light_industry
- showroom
- mixed_use
- investment_hold
- not_evaluated

activity_restriction_known:
- yes
- no
- to_confirm
- not_verified

Uso:

- adequação comercial
- zoneamento
- risco de locação
- público-alvo
- estratégia de anúncio

-------------------------------------

# 4. Área, Layout e Pé-direito

Campos:

usable_area:
number

total_area:
number

floor_level:
- ground_floor
- upper_floor
- basement
- multiple_floors
- not_verified

ceiling_height:
number

ceiling_height_category:
- low
- regular
- high
- industrial
- not_verified

layout_type:
- open_space
- divided_rooms
- showroom
- warehouse_layout
- mixed_layout
- not_verified

layout_flexibility:
- high
- medium
- low
- not_evaluated

Uso:

- operação
- preço
- liquidez
- público-alvo
- tipo de atividade compatível

-------------------------------------

# 5. Fachada, Vitrine e Visibilidade

Campos:

street_frontage:
- yes
- no
- internal
- not_verified

front_measure:
number

showcase_window:
- yes
- no
- partial
- not_applicable
- not_verified

visibility_from_street:
- high
- medium
- low
- not_evaluated

signage_potential:
- high
- medium
- low
- restricted
- not_evaluated

corner_property:
- yes
- no
- not_verified

Uso:

- atratividade comercial
- varejo
- precificação
- tags visuais
- público-alvo
- liquidez

-------------------------------------

# 6. Acesso, Fluxo e Estacionamento

Campos:

customer_access_quality:
- excellent
- good
- regular
- difficult
- not_evaluated

pedestrian_flow:
- high
- medium
- low
- not_evaluated

vehicle_flow:
- high
- medium
- low
- not_evaluated

parking_available:
- yes
- no
- nearby
- limited
- not_verified

parking_spots_count:
number

loading_unloading_area:
- yes
- no
- limited
- not_applicable
- not_verified

heavy_vehicle_access:
- yes
- no
- limited
- not_applicable
- not_verified

Uso:

- varejo
- logística
- galpão
- locação comercial
- risco de operação
- precificação

-------------------------------------

# 7. Infraestrutura Operacional

Campos:

bathrooms_count:
number

accessible_bathroom:
- yes
- no
- to_confirm
- not_verified

kitchen_or_pantry:
- yes
- no
- not_verified

reception_area:
- yes
- no
- not_applicable
- not_verified

meeting_rooms:
number

office_rooms:
number

storage_area:
- yes
- no
- not_verified

air_conditioning:
- yes
- no
- partial
- not_verified

internet_infrastructure:
- good
- regular
- poor
- not_verified

Uso:

- adequação de atividade
- padrão comercial
- preço
- liquidez
- recomendações de melhoria

-------------------------------------

# 8. Energia, Hidráulica e Instalações Especiais

Campos:

electrical_condition_apparent:
- good
- regular
- old_installation
- exposed_wiring
- risk_signs
- not_verified

power_supply_type:
- single_phase
- two_phase
- three_phase
- not_verified

three_phase_power_available:
- yes
- no
- to_confirm
- not_verified

hydraulic_condition_apparent:
- good
- regular
- leak_signs
- old_installation
- not_verified

gas_infrastructure:
- yes
- no
- to_confirm
- not_verified

exhaust_or_ventilation_system:
- yes
- no
- to_confirm
- not_applicable
- not_verified

Uso:

- restaurante
- indústria
- clínica
- galpão
- risco operacional
- adaptação
- precificação

-------------------------------------

# 9. Segurança, AVCB e Regularidade Operacional Aparente

Campos:

fire_safety_items_visible:
multi-select

Opções:

- fire_extinguishers
- emergency_exit
- emergency_lighting
- signage
- fire_hose
- alarm_system
- sprinkler
- none_visible
- not_verified

avcb_status_informed:
- valid
- expired
- not_available
- to_confirm
- not_verified

accessibility_apparent:
- good
- partial
- poor
- not_verified

operational_license_risk:
- low
- medium
- high
- not_evaluated

Uso:

- risco
- locação comercial
- adequação de atividade
- recomendação de documentos
- alerta operacional

Regra:
Não declarar regularidade legal definitiva. Registrar apenas informação apresentada/percepção aparente e necessidade de conferência.

-------------------------------------

# 10. Condomínio Comercial ou Galeria

Exibir quando aplicável.

Campos:

has_commercial_condominium_context:
- yes
- no

condominium_or_gallery_name:
texto

condominium_fee_status:
- informed
- not_informed
- to_confirm

commercial_condominium_infrastructure:
multi-select

Opções:

- concierge
- security
- elevators
- shared_parking
- food_court
- restrooms_common_area
- meeting_rooms
- auditorium
- loading_area
- cleaning_services
- maintenance_services
- not_verified

commercial_condominium_restrictions:
multi-select

Opções:

- activity_restriction
- opening_hours_restriction
- signage_restriction
- food_operation_restriction
- noise_restriction
- visitor_parking_restriction
- not_verified

Uso:

- risco operacional
- perfil de atividade
- precificação
- liquidez

-------------------------------------

# 11. Localização Comercial e Entorno

Campos:

business_region_profile:
- central
- neighborhood_commercial
- high_flow_avenue
- industrial_area
- logistics_area
- mixed_region
- residential_region
- not_evaluated

nearby_anchors:
multi-select

Opções:

- supermarket
- pharmacy
- hospital
- school
- university
- shopping
- public_agency
- bank
- bus_terminal
- main_avenue
- industrial_district
- residential_density
- none_verified

competition_nearby:
- high
- medium
- low
- not_evaluated

commercial_synergy:
- high
- medium
- low
- not_evaluated

Uso:

- tags comerciais
- preço
- público-alvo
- estratégia de anúncio
- atratividade comercial

-------------------------------------

# 12. Documentação Específica Comercial

Campos:

commercial_use_documented:
- yes
- no
- to_confirm
- not_verified

property_registration_status:
- apparently_regular
- pending_review
- discrepancy_found
- relevant_risk
- not_verified

iptu_use_matches_commercial:
- yes
- no
- to_confirm
- not_verified

condominium_rules_presented:
- yes
- no
- partial
- not_applicable
- not_verified

operation_documents_needed:
multi-select

Opções:

- avcb
- alvara
- sanitary_license
- environmental_license
- condominium_authorization
- zoning_certificate
- other
- not_evaluated

Uso:

- risco
- locação
- proposta
- negociação
- recomendação profissional

-------------------------------------

# 13. Perfil Comercial do Imóvel

Campos:

commercial_market_appeal:
- high
- medium
- low
- depends_on_price
- not_evaluated

target_audience:
multi-select

Opções:

- retailer
- service_provider
- health_professional
- restaurant_operator
- logistics_operator
- small_industry
- investor
- corporate_user
- school_or_course
- showroom_operator

best_selling_points:
multi-select

Opções:

- high_visibility
- good_location
- parking_available
- street_frontage
- corner_property
- flexible_layout
- three_phase_power
- loading_area
- high_ceiling
- ready_to_operate
- below_market_opportunity

Uso:

- tags editoriais controladas
- descrição comercial
- campanha
- preço
- público-alvo

-------------------------------------

# 14. Riscos Específicos de Comercial

Riscos possíveis:

- incompatible_activity
- zoning_uncertainty
- avcb_pending
- accessibility_issue
- parking_limitation
- low_visibility
- high_condominium_fee
- power_infrastructure_limit
- loading_unloading_limitation
- commercial_flow_low
- documentation_pending
- expensive_adaptation_needed
- operating_restriction

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

- área útil
- área total
- banheiros
- vagas
- pé-direito
- energia trifásica
- vitrine
- carga/descarga
- estacionamento
- preço
- finalidade
- uso permitido
- condomínio
- infraestrutura
- localização

Uso:

- alerta no checkup
- correção do anúncio
- revisão interna
- score de confiabilidade

-------------------------------------

# 16. Recomendações para Comercial

Campo:
commercial_recommendation

Opções:

- publish_as_is
- review_price
- request_documents
- validate_zoning
- validate_avcb
- validate_activity_restriction
- improve_photos
- review_target_audience
- not_recommend_publish_yet

Ações sugeridas:

- solicitar matrícula
- solicitar IPTU
- solicitar regras do condomínio/galeria
- confirmar atividade permitida
- confirmar energia trifásica
- confirmar carga/descarga
- confirmar AVCB
- fotografar fachada
- fotografar vitrine
- fotografar fluxo/entorno
- revisar preço por baixa visibilidade
- revisar anúncio por divergência

Uso:

- tarefas
- maturidade operacional
- painel broker/agência

-------------------------------------

# 17. Pontuação futura do Módulo

## 17.1 Score de infraestrutura comercial

Entradas:

- layout_flexibility
- parking_available
- loading_unloading_area
- three_phase_power_available
- bathrooms_count
- accessibility_apparent
- internet_infrastructure

## 17.2 Score de risco operacional

Entradas:

- activity_restriction_known
- avcb_status_informed
- operational_license_risk
- accessibility_issue
- zoning_uncertainty
- expensive_adaptation_needed

## 17.3 Score comercial

Entradas:

- visibility_from_street
- pedestrian_flow
- vehicle_flow
- business_region_profile
- nearby_anchors
- commercial_synergy
- target_audience
- commercial_market_appeal
- price_coherence

## 17.4 Padrão / Atratividade comercial

Entradas:

- subtipo
- localização
- fluxo
- infraestrutura
- visibilidade
- estacionamento
- pé-direito
- estado de conservação
- adaptação necessária
- liquidez

Saídas futuras:

- low_attractiveness
- regular
- good
- strategic
- premium_commercial

-------------------------------------

# 18. O que deve ser estruturado antes do fechamento do core

Campos que não devem terminar em metadata:

- commercial_subtype
- current_use
- intended_best_use
- ceiling_height_category
- street_frontage
- visibility_from_street
- parking_available
- three_phase_power_available
- avcb_status_informed
- accessibility_apparent
- business_region_profile
- commercial_market_appeal
- commercial_recommendation

-------------------------------------

# 19. O que pode ficar em JSONB inicialmente

Pode ficar em JSONB durante validação:

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

O Módulo Comercial deve responder:

- que tipo de imóvel comercial é?
- qual uso atual e melhor uso pretendido?
- o imóvel tem visibilidade comercial?
- possui infraestrutura compatível com a atividade?
- tem estacionamento, vitrine, carga/descarga ou energia adequada?
- há restrição de atividade ou risco operacional?
- há documentação mínima para operação?
- qual público-alvo comercial faz sentido?
- há divergência com o anúncio?
- qual recomendação profissional?

-------------------------------------

# 21. Próxima etapa

Depois deste módulo, modelar:

1. Módulo Rural