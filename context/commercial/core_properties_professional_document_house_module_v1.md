# HURBY — Documento Profissional do Imóvel V1
## Módulo Casa

Status: Modelagem conceitual e técnica inicial  
Core: Core Properties Form V1  
Escopo: Documento Profissional do Imóvel  
Módulo: Casa  
Depende de: Base Comum do Documento Profissional  

-------------------------------------

# 1. Objetivo do Módulo Casa

O Módulo Casa complementa a Base Comum do Documento Profissional com perguntas, validações e análises específicas para imóveis do tipo casa.

Abrange:

- casa de rua
- casa em condomínio
- sobrado
- casa térrea
- casa geminada
- casa isolada no lote
- casa com edícula
- casa com piscina
- casa em lote amplo

Este módulo não substitui laudo técnico de engenharia, arquitetura, perícia ou avaliação bancária. Ele serve como instrumento profissional de captação, vistoria comercial, análise de risco e apoio à precificação.

-------------------------------------

# 2. Subtipo da Casa

Campo:
house_subtype

Tipo:
select/radio

Opções:

- street_house
- condominium_house
- townhouse
- single_story_house
- semi_detached_house
- isolated_house
- house_with_annex
- other

Uso:

- define campos condicionais
- ajuda classificação do imóvel
- alimenta anúncio
- alimenta filtros
- alimenta padrão do imóvel
- alimenta análise de liquidez

Campo estruturado no futuro:
sim

Não deixar em metadata no fechamento do core.

-------------------------------------

# 3. Contexto Condominial

Exibir somente quando:

house_subtype = condominium_house

Campos:

has_condominium_context:
- yes
- no

condominium_name:
texto

condominium_infrastructure:
multi-select

Opções:

- gated_access
- concierge_24h
- security_rounds
- playground
- sports_court
- pool
- party_room
- gym
- walking_track
- green_area
- lake
- internal_market
- coworking
- visitor_parking

condominium_fee_status:
- informed
- not_informed
- to_confirm

condominium_risk:
- low
- medium
- high
- not_evaluated

Observações:

- nome do condomínio pode nascer como texto
- no futuro deve apontar para entidade própria de condomínio
- condomínio não deve ficar apenas como string livre no produto final

-------------------------------------

# 4. Terreno e Implantação

Objetivo:
Entender como a casa ocupa o lote e se há potencial, restrição ou risco.

Campos:

land_total_area:
number

built_area:
number

front_measure:
number

back_measure:
number

left_side_measure:
number

right_side_measure:
number

lot_position:
- regular
- corner
- irregular
- internal_lot
- not_verified

topography:
- flat
- uphill
- downhill
- irregular
- not_verified

house_position_on_lot:
- centered
- front_aligned
- back_aligned
- side_aligned
- not_verified

free_land_area:
- none
- small
- medium
- large
- not_verified

Expansion potential:
- yes
- no
- limited
- not_evaluated

Uso:

- valida área informada no anúncio
- ajuda precificação
- ajuda padrão do imóvel
- ajuda análise de reforma/ampliação
- gera risco se houver divergência de área

-------------------------------------

# 5. Construção e Tipologia

Campos:

construction_type:
- masonry
- wood
- mixed
- steel_frame
- other
- not_verified

floors:
- one_floor
- two_floors
- three_or_more
- not_verified

building_layout:
- detached
- semi_detached
- row_house
- not_verified

construction_age_estimate:
- new
- up_to_5_years
- 6_to_15_years
- 16_to_30_years
- over_30_years
- not_verified

renovation_status:
- recently_renovated
- partially_renovated
- needs_minor_repairs
- needs_major_renovation
- not_verified

Uso:

- padrão do imóvel
- risco físico
- liquidez
- recomendação de preço
- alerta de manutenção

-------------------------------------

# 6. Estado Geral de Conservação

Campo:
general_conservation_status

Opções:

- excellent
- good
- regular
- poor
- critical
- not_verified

Campos complementares:

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

Observação técnica:
technical_conservation_notes

Uso:

- score de conservação
- padrão do imóvel
- preço recomendado
- riscos
- recomendações antes de anunciar

-------------------------------------

# 7. Telhado e Cobertura

Campos:

roof_type:
- ceramic_tile
- fiber_cement
- concrete_slab
- metal_roof
- mixed
- not_visible
- not_verified

roof_condition:
- good
- regular
- needs_repair
- critical
- not_verified

visible_leaks:
- yes
- no
- signs_only
- not_verified

gutter_condition:
- good
- regular
- damaged
- not_existing
- not_verified

Uso:

- risco técnico
- recomendação de vistoria complementar
- impacto no preço
- necessidade de reparo antes de venda/locação

Alerta:
Não declarar condição estrutural definitiva. Registrar apenas condição aparente/visível.

-------------------------------------

# 8. Estrutura Aparente

Campos:

visible_cracks:
- none
- minor
- relevant
- severe
- not_verified

wall_condition:
- good
- regular
- moisture_signs
- cracks
- not_verified

floor_leveling:
- apparently_regular
- uneven
- not_verified

structural_risk_perception:
- low
- medium
- high
- requires_specialist
- not_evaluated

Uso:

- alerta de risco
- recomendação de avaliação técnica especializada
- bloqueio futuro para aprovação sem revisão
- precificação

Regra:
Se structural_risk_perception = high ou requires_specialist, gerar alerta forte no Documento Profissional.

-------------------------------------

# 9. Elétrica, Hidráulica e Saneamento Aparente

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

water_supply:
- public_network
- well
- shared
- not_verified

sewage_system:
- public_sewage
- septic_tank
- unknown
- not_verified

water_tank_condition:
- good
- regular
- not_visible
- not_verified

Uso:

- risco
- habitabilidade
- financiamento
- manutenção
- padrão do imóvel

-------------------------------------

# 10. Ambientes e Distribuição

Campos:

bedrooms_verified:
number

suites_verified:
number

bathrooms_verified:
number

parking_spots_verified:
number

living_rooms:
number

kitchen_type:
- traditional
- american
- integrated
- gourmet
- not_verified

laundry_area:
- yes
- no
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
- ajuda filtro
- ajuda padrão do imóvel
- ajuda percepção de liquidez

Regra:
Se houver divergência entre anúncio e vistoria, registrar em field_discrepancies.

-------------------------------------

# 11. Área Externa e Lazer Privativo

Campos:

yard:
- none
- small
- medium
- large
- not_verified

garden:
- yes
- no
- not_verified

pool:
- yes
- no
- not_verified

pool_condition:
- good
- regular
- needs_maintenance
- not_applicable
- not_verified

gourmet_area:
- yes
- no
- partial
- not_verified

barbecue_area:
- yes
- no
- not_verified

annex_or_edicule:
- yes
- no
- not_verified

service_area_external:
- yes
- no
- not_verified

Uso:

- tags visuais
- padrão
- valor percebido
- potencial de anúncio
- fotos públicas sugeridas
- fotos técnicas, se houver avaria

-------------------------------------

# 12. Segurança e Fechamento

Campos:

wall_status:
- fully_walled
- partially_walled
- not_walled
- not_verified

gate_type:
- manual
- automatic
- none
- not_verified

security_items:
multi-select

Opções:

- alarm
- cameras
- electric_fence
- intercom
- smart_lock
- guardhouse
- none
- not_verified

street_security_perception:
- good
- regular
- sensitive
- not_evaluated

Uso:

- tags
- percepção comercial
- risco
- público-alvo
- padrão

-------------------------------------

# 13. Garagem e Acesso Veicular

Campos:

parking_type:
- covered
- uncovered
- mixed
- none
- not_verified

parking_spots_count:
number

garage_gate_condition:
- good
- regular
- damaged
- not_applicable
- not_verified

vehicle_access_quality:
- easy
- regular
- difficult
- not_evaluated

Uso:

- filtro
- liquidez
- padrão
- preço
- descrição comercial

-------------------------------------

# 14. Localização e Entorno Específico de Casa

Campos:

street_type:
- asphalt
- paving_stone
- dirt_road
- mixed
- not_verified

street_width_perception:
- wide
- regular
- narrow
- not_evaluated

neighborhood_profile:
- residential
- mixed
- commercial
- rural_transition
- not_evaluated

noise_level:
- low
- medium
- high
- not_evaluated

nearby_services:
multi-select

Opções:

- school
- market
- pharmacy
- hospital
- shopping
- public_transport
- park
- main_avenue
- none_verified

Uso:

- tags comerciais
- busca interna
- descrição
- score de localização
- recomendação de público-alvo

-------------------------------------

# 15. Documentação Específica de Casa

Campos:

built_area_matches_documents:
- yes
- no
- to_confirm
- not_verified

construction_registered:
- yes
- no
- to_confirm
- not_verified

iptu_matches_property:
- yes
- no
- to_confirm
- not_verified

possible_unregistered_expansion:
- yes
- no
- to_confirm
- not_verified

Uso:

- financiamento
- risco
- proposta
- recomendação de documentos
- alerta para avaliação especializada

Regra:
Não afirmar regularidade jurídica definitiva. Registrar apenas evidência/percepção e necessidade de conferência.

-------------------------------------

# 16. Avaliação Comercial Específica de Casa

Campos:

house_market_appeal:
- high
- medium
- low
- depends_on_price
- not_evaluated

target_audience:
multi-select

Opções:

- family
- investor
- first_home_buyer
- high_income
- rental_income
- airbnb
- elderly_accessibility
- commercial_adaptation

best_selling_points:
multi-select

Opções:

- large_land
- good_location
- condominium_security
- private_leisure
- ready_to_live
- renovation_potential
- below_market_opportunity
- accepts_financing
- accepts_exchange

Uso:

- tags editoriais controladas
- descrição comercial sugerida
- campanhas
- estratégia de preço
- público-alvo

-------------------------------------

# 17. Divergências com o Anúncio

Campo:
field_discrepancies

Formato inicial:
JSONB padronizado

Exemplo:

{
  "built_area": {
    "listing_value": 200,
    "verified_value": 180,
    "status": "divergent",
    "note": "Área informada pelo proprietário diverge do IPTU apresentado."
  }
}

Campos que podem gerar divergência:

- área construída
- área total
- quartos
- suítes
- banheiros
- vagas
- condomínio
- preço
- financiamento
- endereço
- padrão
- features

Uso:

- alerta no checkup
- sugestão de correção do anúncio
- revisão interna
- score de confiabilidade

-------------------------------------

# 18. Recomendações para Casa

Campo:
house_recommendation

Opções:

- publish_as_is
- review_price
- request_documents
- improve_photos
- request_repairs_before_publish
- require_specialist_assessment
- not_recommend_publish_yet

Ações sugeridas:

- fotografar fachada
- fotografar quintal
- fotografar área gourmet
- verificar telhado
- confirmar área construída
- solicitar IPTU
- solicitar matrícula
- revisar preço por conservação
- revisar anúncio por divergência

Uso:

- tarefas
- maturidade operacional
- painel broker/agência

-------------------------------------

# 19. Pontuação futura do Módulo Casa

## 19.1 Score de conservação

Entradas:

- general_conservation_status
- roof_condition
- visible_leaks
- wall_condition
- floor_status
- electrical_condition_apparent
- hydraulic_condition_apparent

## 19.2 Score de risco físico

Entradas:

- visible_cracks
- structural_risk_perception
- roof_condition
- moisture_signs
- electrical_risk_signs
- hydraulic_leak_signs

## 19.3 Score comercial da casa

Entradas:

- layout_quality
- yard
- leisure_area
- parking
- location_context
- house_market_appeal
- target_audience
- price_coherence

## 19.4 Padrão do imóvel

Entradas:

- subtipo
- metragem
- localização
- conservação
- lazer privativo
- condomínio
- acabamento
- vagas
- segurança
- diferenciais premium

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

# 20. O que deve ser estruturado antes do fechamento do core

Campos que não devem terminar em metadata:

- house_subtype
- has_condominium_context
- topography
- construction_type
- floors
- general_conservation_status
- roof_condition
- structural_risk_perception
- occupancy_status herdado da Base Comum
- documentation_status herdado da Base Comum
- built_area_matches_documents
- construction_registered
- house_market_appeal
- house_recommendation

-------------------------------------

# 21. O que pode ficar em JSONB inicialmente

Pode ficar em JSONB durante validação:

- field_discrepancies
- technical_conservation_notes
- roof_notes
- structure_notes
- electrical_hydraulic_notes
- external_area_notes
- house_specific_risk_details
- house_recommendation_details

Mas deve virar estrutura se passar a ser:

- filtro
- workflow
- score
- auditoria
- aprovação
- bloqueio
- publicação

-------------------------------------

# 22. Decisão de produto

O Módulo Casa deve responder:

- que tipo de casa é?
- a casa está em condomínio?
- como ela ocupa o terreno?
- qual é a condição aparente da construção?
- há risco físico aparente?
- a área construída parece compatível com documentos?
- a casa tem atratividade comercial?
- quais pontos valorizam o anúncio?
- quais pontos exigem cuidado?
- há divergência com o anúncio?
- qual recomendação profissional?

-------------------------------------

# 23. Próxima etapa

Depois do Módulo Casa, modelar:

1. Módulo Apartamento / Studio / Loft / Kitnet
2. Módulo Terreno
3. Módulo Comercial
4. Módulo Rural