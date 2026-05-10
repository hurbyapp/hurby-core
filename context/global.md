\# ATUALIZAÇÃO GLOBAL — CORE\_REAL\_ESTATE\_OPERATIONAL\_FOUNDATION



Data: 2026-05-09  

Missão: CORE\_REAL\_ESTATE\_OPERATIONAL\_FOUNDATION  

Status técnico: Validado localmente  

Status de auditoria: Validado para auditoria externa  

Próxima missão recomendada: CORE\_PROPERTIES\_FORM\_V1



\-------------------------------------



\## 1. Consolidação da fundação operacional imobiliária



Foi concluída e validada a fundação operacional imobiliária do Hurby, substituindo a estrutura antiga e simples de properties/leads por uma arquitetura mais compatível com a visão de ecossistema operacional.



A nova fundação passa a tratar o imóvel não como cadastro isolado, mas como parte de um contexto operacional composto por:



\- portfolio

\- portfolio\_item

\- property\_asset

\- property\_listing

\- operational\_origin

\- visibility\_scope



A estrutura foi validada em banco, frontend e fluxo operacional broker.



\-------------------------------------



\## 2. Estruturas principais consolidadas



Foram consolidadas as seguintes entidades:



\- portfolios

\- portfolio\_items

\- operational\_origins

\- property\_assets

\- property\_asset\_locations

\- property\_asset\_features

\- property\_listings

\- property\_listing\_media



Também foram consolidados os catálogos base:



\- property\_type

\- property\_business\_context

\- operational\_model

\- listing\_status

\- media\_type

\- media\_provider



O storage bucket `property-media` foi criado para mídia vinculada a listings.



\-------------------------------------



\## 3. Decisão arquitetural central



A criação de imóvel operacional não deve ser feita pelo frontend com múltiplos inserts diretos em tabelas protegidas por RLS.



Foi criada a RPC transacional:



\- public.create\_property\_operational\_bundle



Essa função cria, em uma única operação:



\- portfolio individual, se não existir

\- operational\_origin

\- property\_asset

\- property\_asset\_location

\- property\_asset\_features

\- property\_listing

\- portfolio\_item



A função usa `auth.uid()` como referência de segurança e evita criação parcial ou registros órfãos no fluxo principal.



\-------------------------------------



\## 4. Validação realizada



A fundação foi validada por:



\- supabase db reset

\- npm run build

\- criação de usuário local

\- login broker

\- acesso ao broker dashboard

\- cadastro de imóvel

\- listagem de imóvel

\- detalhe do imóvel

\- edição básica do imóvel

\- consulta SQL de integridade



A validação confirmou registros nas tabelas:



\- portfolios

\- operational\_origins

\- property\_assets

\- property\_asset\_locations

\- property\_asset\_features

\- property\_listings

\- portfolio\_items



Também foi confirmado vínculo correto:



property\_listing  

→ property\_asset  

→ portfolio\_item  

→ portfolio  

→ operational\_origin



\-------------------------------------



\## 5. Arquivos principais alterados



Arquivos de frontend/service:



\- src/lib/services/propertyService.ts

\- src/app/broker/page.tsx

\- src/app/operations/properties/page.tsx

\- src/app/operations/properties/new/page.tsx

\- src/app/operations/properties/list/page.tsx

\- src/app/operations/properties/\[listingId]/page.tsx

\- src/app/operations/properties/\[listingId]/edit/page.tsx



Migrations principais:



\- 20260509190000\_core\_real\_estate\_operational\_foundation.sql

\- 20260509204500\_create\_property\_operational\_bundle\_rpc.sql



Migrations antigas removidas do fluxo ativo:



\- 20260504000200\_business.sql

\- 20260505020905\_lead\_unlock.sql

\- 20260505022650\_lead\_status.sql

\- 20260508001612\_core\_properties\_v2\_foundation.sql

\- 20260508002142\_core\_properties\_v2\_rls\_storage.sql



Essas migrations pertenciam ao desenho anterior e não devem ser restauradas sem auditoria.



\-------------------------------------



\## 6. Decisões preservadas



Devem ser preservadas:



\- separação entre property\_asset e property\_listing

\- criação via RPC transacional

\- portfolio como camada operacional contextual

\- portfolio\_item como vínculo entre carteira, asset, listing, origem e visibilidade

\- operational\_origin como base de rastreabilidade futura

\- mídia vinculada ao listing, não diretamente ao asset

\- broker page como ponto de entrada operacional temporário

\- não misturar properties com leads, marketplace, contratos, wallet ou LGPD



\-------------------------------------



\## 7. Pontos validados pela auditoria externa



A auditoria externa validou a missão para continuidade, com atenção aos seguintes pontos:



1\. Status `deleted`



`Deleted` não deve ser tratado como status comum de negócio. Deve evoluir para fluxo de soft delete com `deleted\_at`, preservando histórico, asset, portfolio\_item e integridade futura.



2\. Segurança da RPC



A função `create\_property\_operational\_bundle` deve continuar sendo auditada quanto a validações de entrada, uso de `auth.uid()` e prevenção de registros órfãos.



3\. Localização e características



As tabelas `property\_asset\_locations` e `property\_asset\_features` foram criadas como foundation e não devem ter regras prematuras que bloqueiem a evolução do formulário completo.



\-------------------------------------



\## 8. Backlog obrigatório registrado



Backlog técnico/conceitual:



\- implementar soft delete real para anúncios

\- remover `Deletado` como opção comum de select

\- transformar status em ações controladas

\- criar botões: Publicar, Pausar, Reativar, Encerrar, Excluir

\- criar `deleted\_at` operacional quando aplicável

\- criar lifecycle real de listing

\- criar motivo obrigatório para encerramento

\- adicionar Arrendamento em property\_business\_context

\- traduzir labels técnicos no frontend

\- trocar “Modelo operacional” por “Forma de operação”

\- traduzir Transacional para “Apenas intermediação”

\- traduzir Gerenciado para “Gerenciado pelo corretor/imobiliária”

\- traduzir Híbrido para “Intermediação + administração”

\- migrar dropdowns para cards/radios quando fizer sentido

\- manter checkbox apenas para múltiplas características/canais

\- expandir formulário de localização

\- expandir formulário de características

\- validar upload de mídia em fluxo completo

\- criar auditoria para alterações sensíveis de asset

\- avaliar RPC futura também para edição sensível



\-------------------------------------



\## 9. Próxima missão recomendada



A próxima missão deve ser separada e nomeada como:



CORE\_PROPERTIES\_FORM\_V1



Objetivo:



Evoluir o formulário de cadastro e edição de imóveis para uma experiência mais amigável, completa e orientada ao usuário, sem alterar marketplace, leads, contratos ou gestão de locação.



Escopo recomendado:



\- melhoria de UX do formulário

\- etapas de preenchimento

\- labels comerciais claros

\- cards/radios no lugar de dropdowns técnicos

\- inclusão de Arrendamento

\- localização completa

\- características completas

\- status como ações controladas

\- soft delete inicial



\-------------------------------------



\## 10. Regra de continuidade



A missão CORE\_REAL\_ESTATE\_OPERATIONAL\_FOUNDATION deve ser considerada encerrada.



Não continuar evoluindo formulário, marketplace, leads, contratos ou gestão de locação dentro desta mesma missão.



Qualquer evolução deve iniciar novo ciclo, com escopo próprio, validação própria e handoff próprio.



\-------------------------------------



\## 11. Status final



CORE\_REAL\_ESTATE\_OPERATIONAL\_FOUNDATION:



\- Banco: aprovado

\- Frontend: aprovado

\- Build: aprovado

\- Fluxo broker: aprovado

\- Cadastro: aprovado

\- Edição: aprovado

\- Auditoria externa: validado para continuidade



Status final: missão concluída.

