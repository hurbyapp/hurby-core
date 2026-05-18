# HURBY — PLANO SQL PIPELINE PRO V1

Status: plano técnico preliminar
Natureza: documentação, não migration
Decisão: nenhuma tabela será criada nesta etapa

---

## 1. Objetivo

Planejar a futura persistência real do Pipeline Pro no banco sem quebrar a base atual de:

- property_assets
- property_listings
- portfolio_items
- property_professional_assessments
- client_entities
- client_relationships
- organization_memberships
- broker_profiles

---

## 2. Princípio central

O Pipeline Pro deve ser uma camada operacional própria.

Ele deve orquestrar:

- imóvel/patrimônio;
- anúncio;
- dossiê/análise;
- proprietário;
- responsável principal;
- responsáveis por módulo;
- participantes;
- prazos;
- tarefas;
- eventos;
- liberação de inteligência;
- liberação de publicação.

Ele não deve substituir Properties, Clients, Assessment, Portfolio, AXE, Contratos ou Leads.

---

## 3. Tabelas futuras previstas

### 3.1 property_pipeline_workflows

Tabela principal do processo.

Responsável por representar uma jornada Pipeline Pro vinculada a um asset/listing.

Campos previstos:

- id uuid primary key
- property_asset_id uuid not null
- property_listing_id uuid null
- portfolio_item_id uuid null
- professional_assessment_id uuid null
- client_entity_id uuid null
- client_relationship_id uuid null
- workflow_status text/enum
- workflow_origin text/enum
- workflow_mode text/enum
- main_responsible_profile_id uuid not null
- responsible_organization_id uuid null
- created_by_profile_id uuid not null
- scheduled_visit_at timestamptz null
- accepted_at timestamptz null
- declined_at timestamptz null
- rescheduled_at timestamptz null
- started_at timestamptz null
- due_at timestamptz null
- completed_at timestamptz null
- archived_at timestamptz null
- overall_progress numeric default 0
- intelligence_release_status text/enum
- publication_release_status text/enum
- metadata jsonb default '{}'
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

### 3.2 property_pipeline_modules

Tabela dos módulos do workflow.

Campos previstos:

- id uuid primary key
- workflow_id uuid not null
- module_key text/enum not null
- module_status text/enum not null
- module_order integer not null
- responsible_profile_id uuid null
- responsible_organization_id uuid null
- assigned_by_profile_id uuid null
- can_be_skipped boolean default true
- is_not_applicable boolean default false
- not_applicable_reason text null
- progress numeric default 0
- minimum_required_progress numeric default 60
- due_at timestamptz null
- started_at timestamptz null
- completed_at timestamptz null
- closed_with_exception_at timestamptz null
- closure_reason text null
- metadata jsonb default '{}'
- created_at timestamptz default now()
- updated_at timestamptz default now()

Módulos iniciais previstos:

- atendimento
- levantamento
- diagnostico
- estrategia
- proposta
- publicacao
- acompanhamento

---

### 3.3 property_pipeline_participants

Tabela de participantes do Pipeline.

Campos previstos:

- id uuid primary key
- workflow_id uuid not null
- module_id uuid null
- profile_id uuid null
- organization_id uuid null
- participant_role text/enum not null
- permission_scope text/enum not null
- can_view boolean default true
- can_edit boolean default false
- can_comment boolean default false
- can_assign boolean default false
- can_close_module boolean default false
- commission_impact_status text null
- commission_metadata jsonb default '{}'
- invited_by_profile_id uuid null
- accepted_at timestamptz null
- declined_at timestamptz null
- removed_at timestamptz null
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

### 3.4 property_pipeline_events

Tabela de histórico/auditoria operacional.

Campos previstos:

- id uuid primary key
- workflow_id uuid not null
- module_id uuid null
- event_type text/enum not null
- event_payload jsonb default '{}'
- created_by_profile_id uuid not null
- created_at timestamptz default now()

Eventos previstos:

- workflow_created
- responsible_assigned
- assignment_accepted
- assignment_declined
- visit_rescheduled
- module_started
- module_updated
- field_marked_not_applicable
- module_completed
- module_closed_with_exception
- intelligence_released
- proposal_generated
- owner_approved
- publication_released
- listing_published
- listing_paused
- workflow_archived

---

### 3.5 property_pipeline_tasks

Tabela de tarefas operacionais.

Campos previstos:

- id uuid primary key
- workflow_id uuid not null
- module_id uuid null
- task_title text not null
- task_description text null
- task_status text/enum not null
- task_priority text/enum null
- responsible_profile_id uuid null
- due_at timestamptz null
- completed_at timestamptz null
- is_required boolean default true
- is_not_applicable boolean default false
- not_applicable_reason text null
- created_by_profile_id uuid not null
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

## 4. Funções futuras previstas

Antes de criar policies definitivas, deverão existir funções de acesso.

Funções sugeridas:

- can_access_pipeline_workflow(p_workflow_id uuid)
- can_manage_pipeline_workflow(p_workflow_id uuid)
- can_edit_pipeline_module(p_module_id uuid)
- can_view_pipeline_module(p_module_id uuid)

Essas funções devem considerar:

- created_by_profile_id
- main_responsible_profile_id
- responsible_profile_id do módulo
- responsible_organization_id
- organization_memberships
- owner/manager
- participantes convidados
- can_view/can_edit
- status do workflow
- status do módulo

---

## 5. RLS futura

Todas as tabelas do Pipeline Pro devem ter RLS habilitada.

Tabelas:

- property_pipeline_workflows
- property_pipeline_modules
- property_pipeline_participants
- property_pipeline_events
- property_pipeline_tasks

Nenhuma tabela deve ficar sem policy.

---

## 6. Integração com base atual

O Pipeline Pro deve reaproveitar:

### property_assets

Base do patrimônio.

### property_listings

Base do anúncio.

### portfolio_items

Base do pertencimento operacional.

### property_professional_assessments

Base do dossiê/análise consolidada.

### client_entities/client_relationships

Base do proprietário/cliente.

### organization_memberships

Base da estrutura de agência.

---

## 7. Pontos que não entram nesta migration futura

Não incluir agora:

- AXE
- cobrança
- comissão/rateio
- contratos
- leads
- automações externas
- portais externos
- IA gerativa
- auditoria global
- LGPD avançado

Esses cores serão acoplados depois.

---

## 8. Ordem futura de implementação

1. Criar migration planejada.
2. Rodar supabase db reset local.
3. Criar policies mínimas.
4. Criar service de workflow.
5. Criar botão iniciar pipeline real.
6. Criar workflow a partir de listing existente.
7. Criar workflow a partir de placeholder.
8. Listar workflows reais.
9. Salvar progresso por módulo.
10. Só depois liberar lógica de inteligência.

---

## 9. Validação obrigatória antes de virar migration

Antes de qualquer migration:

- revisar schema real;
- revisar functions existentes;
- revisar RLS;
- revisar services;
- revisar pages;
- revisar risco de duplicação de cliente;
- revisar risco de duplicação de anúncio;
- revisar ambiente Supabase linkado;
- rodar build;
- rodar db reset local;
- validar no navegador.

---

## 10. Decisão atual

Este arquivo é apenas plano.

Não aplicar no banco ainda.
Não criar migration automática a partir dele sem revisão.
