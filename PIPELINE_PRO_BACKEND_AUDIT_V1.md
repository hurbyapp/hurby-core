# HURBY — AUDITORIA BACKEND PIPELINE PRO V1

Status: auditoria local concluída  
Escopo: reconhecimento de banco, RLS, policies e funções antes de qualquer migration  
Decisão: não criar migration nesta etapa

---

## 1. Decisão central

O Pipeline Pro não deve começar com migration nova.

A estrutura atual já possui base suficiente para leitura, acoplagem e validação inicial:

- property_assets
- property_listings
- portfolio_items
- portfolios
- property_professional_assessments
- client_entities
- client_relationships
- organization_memberships
- broker_profiles

O próximo passo técnico deve ser aproveitar essas estruturas e apenas conectar leitura/permissão real no front.

---

## 2. O que o banco já suporta

### Properties

- property_assets representa o ativo imobiliário/patrimônio.
- property_listings representa a manifestação comercial/anúncio.
- property_listing_media representa mídias do anúncio.
- property_asset_locations representa localização do asset.
- property_asset_features representa atributos físicos do asset.

### Portfolio

- portfolios organiza carteiras por contexto.
- portfolio_items vincula portfolio, asset, listing, origem, responsável e visibilidade.

### Clients

- client_entities representa pessoa/empresa.
- client_relationships vincula cliente ao contexto, inclusive property_provider.
- client_relationship_roles define papéis no relacionamento.

### Professional Assessments

- property_professional_assessments já existe como análise/dossiê técnico-comercial.
- Possui vínculos com asset, listing, portfolio item, cliente e relacionamento.
- Possui campos JSONB para technical, commercial, owner interview, documentation, financial, summaries, notes e metadata.

---

## 3. Funções/RPCs relevantes

### can_access_listing

Permite acesso ao listing quando:

- usuário criou o listing;
- usuário é responsável pelo listing;
- listing é público/marketplace;
- existe portfolio_item ativo com visibilidade pública/marketplace;
- ou usuário pode acessar o portfolio vinculado.

### can_manage_listing

Permite gerenciar o listing quando:

- usuário criou o listing;
- usuário é responsável pelo listing;
- ou pode gerenciar o portfolio vinculado.

### can_access_portfolio

Permite acesso ao portfolio quando:

- usuário é profile dono;
- usuário criou;
- ou é membro ativo da organização vinculada.

### can_manage_portfolio

Permite gerenciar portfolio quando:

- usuário é profile dono;
- usuário criou;
- ou é membro ativo da organização com papel owner/manager.

---

## 4. Encaixe com a visão operacional do Pipeline Pro

A estrutura atual suporta a lógica conceitual:

- corretor responsável pode conduzir;
- dono/manager da agência pode gerenciar;
- membro ativo pode visualizar conforme portfolio;
- anúncio/asset podem ser lidos por permissão já existente;
- dossiê/análise já pode ser vinculado ao listing e asset;
- proprietário já pode ser vinculado via Core Clients.

---

## 5. Pontos de atenção

### 5.1 property_professional_assessments com roles public

As policies de property_professional_assessments aparecem com roles `{public}`.

Mesmo usando funções como can_access_listing/can_manage_listing e auth.uid(), isso deve ser revisado antes de produção.

Não alterar agora sem missão própria de RLS.

### 5.2 Pipeline Pro final não deve ficar inteiro em metadata

Metadata pode servir como ponte curta, mas Pipeline Pro tem regras de negócio fortes:

- responsável principal;
- responsável por módulo;
- participantes convidados;
- permissão de edição;
- prazo/SLA;
- aceite/recusa;
- reagendamento;
- progresso;
- "não se aplica";
- conclusão justificada;
- liberação da inteligência;
- histórico de ações.

Esses pontos provavelmente exigem tabela própria no futuro.

### 5.3 AXE/economia

Não acoplar agora.

Qualquer cobrança, consumo, destaque, turbinar anúncio ou inteligência premium deve passar pelo ledger e por revisão do Core AXE.

### 5.4 LGPD/auditoria

Não abrir core agora.

Mas quando Pipeline começar a salvar dados reais, será necessário revisar:

- dados sensíveis;
- perfil do proprietário;
- notas privadas;
- histórico de acesso;
- logs;
- retenção;
- anonimização/exclusão.

### 5.5 Contratos e comissão

Não implementar agora.

Pipeline deve apenas prever pontos futuros de integração com:

- contratos;
- autorização de venda;
- exclusividade;
- comissão;
- rateio;
- financeiro.

---

## 6. Próximo passo seguro

Conectar no front a leitura real de permissões:

- can_access_listing
- can_manage_listing

Objetivo:

No modo attach, além de mostrar o anúncio real, o Pipeline deve indicar:

- se usuário pode acessar;
- se usuário pode editar;
- se está apenas em modo consulta;
- se está sem permissão.

Isso ainda não salva nada e não exige migration.

---

## 7. Decisão de arquitetura

Não criar tabela Pipeline agora.

Primeiro:

1. leitura real do listing;
2. leitura real do dossiê;
3. leitura real do cliente;
4. leitura real da permissão;
5. registro de gaps;
6. depois modelagem da tabela própria do Pipeline.

---
