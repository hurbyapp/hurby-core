\# HURBY — GLOBAL ECOSYSTEM



========================================

STATUS

========================================



ECOSSISTEMA EM REESTRUTURAÇÃO CANÔNICA OPERACIONAL.



A expansão funcional do Core Imóveis foi pausada estrategicamente para:

\- revisão estrutural

\- revisão semântica

\- revisão operacional

\- consolidação arquitetural



========================================

DIREÇÃO ARQUITETURAL

========================================



O Hurby NÃO será:

\- ERP imobiliário tradicional

\- sistema centrado em imóvel

\- sistema centrado em imobiliária



O Hurby será:

\- ecossistema operacional imobiliário

\- rede operacional comercial

\- plataforma de relacionamento e colaboração



========================================

NÚCLEO OPERACIONAL CENTRAL

========================================



Entidade central:

\- broker/corretor



Camadas organizacionais:

\- agency/imobiliária

\- partnerships

\- memberships

\- portfolio

\- visibility

\- sharing

\- operational contexts



========================================

CORES IDENTIFICADOS

========================================



CORE\_PROPERTIES

CORE\_MEMBERSHIPS

CORE\_PORTFOLIO

CORE\_PARTNERSHIPS

CORE\_VISIBILITY

CORE\_CLIENTS

CORE\_ORIGINS

CORE\_AGENCY\_LAYER

CORE\_EXCLUSIVITY

CORE\_COMMERCIAL\_CONTEXT



========================================

FOUNDATIONS EXISTENTES

========================================



✔ auth foundation

✔ users foundation

✔ profiles foundation

✔ ledger foundation

✔ storage foundation

✔ property foundation inicial

✔ SSR auth foundation

✔ RLS foundation

✔ service layer foundation



========================================

PRÓXIMA FASE

========================================



1\. MAPA CANÔNICO OPERACIONAL

2\. REVISÃO FOUNDATION

3\. MODELAGEM DOS NOVOS CORES

4\. REFATORAÇÃO CONTROLADA

5\. EXPANSÃO MODULAR FUTURA



========================================

IMPORTANTE

========================================



Nenhum novo core deve expandir:

\- ownership

\- sharing

\- visibility

\- memberships

\- partnerships



antes da consolidação canônica operacional.



-------------------------------------

## HURBY_CONTEXT_UPDATE_20260511_CANONICAL_ACCESS_STATE

Status: ESTADO CANONICO TEMPORARIO VALIDADO  
Data: 2026-05-11

O ecossistema passa a reconhecer quatro contextos operacionais distintos nesta fase:

1. Usuario comum do marketplace
2. Broker profissional
3. Agency / imobiliaria
4. Owner temporario de validacao

O Owner temporario existe apenas como ferramenta de validacao operacional antes do Core Owner/Admin definitivo.

Regra de separacao:

- users_profile representa identidade/base de conta
- broker_profiles representa permissao/contexto profissional de corretor
- organization_memberships representa vinculo institucional com agency
- platform_owner representa apenas Owner temporario de validacao
- client_entities e client_relationships representam clientes, leads, fornecedores e relacoes futuras, nao a conta basica do usuario do site

Nenhum novo core deve assumir que primary_entry_flow sozinho e autorizacao definitiva.

Permissao real deve continuar sendo derivada de:

- contexto da conta
- perfil profissional
- membership ativa
- RPC segura
- RLS
- validacao de backend

-------------------------------------
