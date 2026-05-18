# HURBY — MODELO MÍNIMO BACKEND PIPELINE PRO V1

Status: desenho técnico preliminar
Decisão: não executar migration ainda
Objetivo: definir como o Pipeline Pro deve ser persistido futuramente sem quebrar a base atual

---

## 1. Decisão central

O Pipeline Pro deve ter estrutura própria no backend futuramente.

Ele não deve ficar inteiro dentro de metadata de:

- property_listings
- property_assets
- portfolio_items
- property_professional_assessments

Metadata pode ser usada apenas como ponte temporária controlada, nunca como arquitetura final.

---

## 2. Por que não salvar tudo em metadata

O Pipeline Pro contém regras de negócio fortes:

- responsável principal;
- responsável por módulo;
- participantes convidados;
- permissão por módulo;
- aceite;
- recusa;
- reagendamento;
- prazo/SLA;
- progresso;
- campos "não se aplica";
- conclusão parcial;
- conclusão com justificativa;
- liberação da inteligência;
- histórico operacional;
- supervisão da agência;
- modo consulta;
- modo edição;
- relacionamento com publicação.

Esses dados precisam ser consultáveis, auditáveis e filtráveis.

Logo, não devem permanecer escondidos em JSONB genérico.

---

## 3. Estruturas existentes que devem ser reaproveitadas

### property_assets

Representa o patrimônio/imóvel real.

Deve continuar sendo a base patrimonial.

### property_listings

Representa o anúncio/publicação comercial.

Deve continuar sendo a base do anúncio.

### portfolio_items

Representa vínculo operacional entre carteira, asset, listing, origem, responsável e visibilidade.

Deve ser usado como referência operacional.

### property_professional_assessments

Representa dossiê/análise técnico-comercial.

Deve continuar existindo como camada consolidada de análise, não como motor de workflow inteiro.

### client_entities

Representa proprietário/cliente.

Não duplicar dados pessoais fora do Core Clients.

### client_relationships

Representa vínculo entre cliente e imóvel/contexto.

Deve ser usado para proprietário/property_provider.

### organization_memberships

Representa membros da agência.

Deve ser base para permissões institucionais.

### broker_profiles

Representa corretor profissional.

Deve ser usado para identificar responsáveis profissionais.

---

## 4. Tabela provável futura: workflow principal

Nome sugerido:

property_pipeline_workflows

Função:

Representar o processo principal do Pipeline Pro para um imóvel/anúncio.

Campos conceituais:

- id
- property_asset_id
- property_listing_id
- portfolio_item_id
- professional_assessment_id
- client_entity_id
- client_relationship_id
- workflow_status
- workflow_origin
- workflow_mode
- main_responsible_profile_id
- responsible_organization_id
- created_by_profile_id
- scheduled_visit_at
- accepted_at
- declined_at
- rescheduled_at
- started_at
- due_at
- completed_at
- archived_at
- overall_progress
- intelligence_release_status
- publication_release_status
- metadata
- created_at
- updated_at

---

## 5. Tabela provável futura: módulos

Nome sugerido:

property_pipeline_modules

Função:

Representar cada módulo/etapa do Pipeline Pro.

Exemplos de módulos:

- atendimento;
- levantamento;
- diagnostico;
- estrategia;
- proposta;
- publicacao;
- acompanhamento.

Campos conceituais:

- id
- workflow_id
- module_key
- module_status
- module_order
- responsible_profile_id
- responsible_organization_id
- assigned_by_profile_id
- can_be_skipped
- is_not_applicable
- not_applicable_reason
- progress
- minimum_required_progress
- due_at
- started_at
- completed_at
- closed_with_exception_at
- closure_reason
- metadata
- created_at
- updated_at

---

## 6. Tabela provável futura: participantes

Nome sugerido:

property_pipeline_participants

Função:

Controlar quem participa do pipeline e com qual papel.

Campos conceituais:

- id
- workflow_id
- module_id
- profile_id
- organization_id
- participant_role
- permission_scope
- can_view
- can_edit
- can_comment
- can_assign
- can_close_module
- commission_impact_status
- commission_metadata
- invited_by_profile_id
- accepted_at
- declined_at
- removed_at
- created_at
- updated_at

Observação:

Comissão/rateio não deve ser implementado agora. Apenas deixar acoplável.

---

## 7. Tabela provável futura: eventos/histórico

Nome sugerido:

property_pipeline_events

Função:

Registrar acontecimentos relevantes.

Exemplos:

- pipeline criado;
- corretor designado;
- corretor aceitou;
- corretor recusou;
- visita reagendada;
- módulo iniciado;
- campo marcado como não se aplica;
- módulo concluído;
- módulo encerrado com justificativa;
- inteligência liberada;
- proposta gerada;
- proprietário aprovou;
- publicação liberada;
- anúncio publicado;
- anúncio pausado;
- imóvel vendido;
- imóvel arquivado.

Campos conceituais:

- id
- workflow_id
- module_id
- event_type
- event_payload
- created_by_profile_id
- created_at

---

## 8. Tabela provável futura: tarefas

Nome sugerido:

property_pipeline_tasks

Função:

Gerenciar tarefas operacionais dentro de módulos.

Campos conceituais:

- id
- workflow_id
- module_id
- task_title
- task_description
- task_status
- task_priority
- responsible_profile_id
- due_at
- completed_at
- is_required
- is_not_applicable
- not_applicable_reason
- created_by_profile_id
- created_at
- updated_at

---

## 9. Integração com permissões existentes

A base atual já possui:

- can_access_listing
- can_manage_listing
- can_access_asset
- can_manage_asset
- can_access_portfolio
- can_manage_portfolio

O Pipeline Pro deve reutilizar essas funções como base.

Depois, deve criar funções próprias, como:

- can_access_pipeline_workflow(workflow_id)
- can_manage_pipeline_workflow(workflow_id)
- can_edit_pipeline_module(module_id)

Essas funções futuras devem considerar:

- responsável principal;
- responsável do módulo;
- owner/manager da organização;
- participante convidado;
- escopo de permissão;
- status do pipeline;
- status do módulo.

---

## 10. Regras de publicação futura

Publicação deve permanecer camada separada.

Pipeline Pro pode liberar a publicação, mas não deve ser confundido com o anúncio.

Fluxo:

Pipeline operacional
-> Inteligência
-> Proposta/Aprovação
-> Publicação/Anúncio distribuível
-> Leads/Acompanhamento

---

## 11. Regras para Anúncio Placeholder

O Anúncio Placeholder pode nascer em property_listings, mas precisa ser marcado claramente.

Sugestão futura em metadata temporário ou campo estruturado definitivo:

- placeholder_status
- internal_name
- public_title_status
- pipeline_origin

Não decidir agora.

---

## 12. O que pode ser feito antes da migration

Antes de criar tabelas:

1. Continuar leitura real por listingId.
2. Mostrar contexto real de listing, asset, assessment e cliente.
3. Mostrar permissão real com can_access_listing/can_manage_listing.
4. Refinar UX.
5. Registrar gaps.
6. Testar fluxo navegável.
7. Só então criar migration planejada.

---

## 13. O que não fazer

Não fazer agora:

- criar migration às pressas;
- salvar workflow inteiro em metadata como solução final;
- duplicar cliente/proprietário;
- criar anúncio paralelo sem asset;
- criar pipeline sem listing/asset;
- misturar dossiê com workflow;
- misturar publicação com inteligência;
- mexer em AXE;
- mexer em comissão;
- mexer em contrato;
- mexer em leads;
- alterar RLS sem missão específica.

---

## 14. Próxima decisão técnica

Antes da migration real, deve ser feito um documento SQL planejado com:

- tabelas;
- FKs;
- enums;
- RLS;
- policies;
- funções can_access/can_manage;
- rollback;
- impacto;
- testes;
- Supabase reset local;
- validação staging.

Nenhuma migration deve ser criada sem esse plano.
