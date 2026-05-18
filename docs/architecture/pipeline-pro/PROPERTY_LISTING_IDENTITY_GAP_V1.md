# HURBY — IDENTIDADE SEMÂNTICA DE IMÓVEL E ANÚNCIO V1

Status: decisão conceitual consolidada
Escopo: Core Properties, Pipeline Pro, Marketplace, carteira profissional e importação entre contextos
Decisão: não executar migration nesta etapa

---

## 1. Decisão central

Imóvel e anúncio precisam ter identidades diferentes.

Não usar a mesma semântica para tudo.

No Hurby:

- property representa o imóvel/patrimônio;
- ad/listing representa o anúncio/publicação;
- asset deve continuar associado ao imóvel/patrimônio, não ao anúncio.

---

## 2. Imóvel / patrimônio

Representado por:

- property_assets

Campos futuros recomendados:

- property_assets.property_reference_code
- property_assets.internal_name

Exemplo:

- property_reference_code: PROP-000481
- internal_name: Florais - Hélio

Função:

- identificar o imóvel dentro do ecossistema;
- rastrear o patrimônio ao longo do tempo;
- manter histórico, dossiê, documentos, análise, lifecycle e transferências;
- diferenciar o bem real das publicações comerciais feitas sobre ele.

---

## 3. Anúncio / publicação

Representado por:

- property_listings

Campos futuros recomendados:

- property_listings.ad_reference_code
- property_listings.ad_internal_name
- property_listings.title

Exemplo:

- ad_reference_code: ADS-000991
- ad_internal_name: Venda Florais Hélio - campanha inicial
- title: Casa térrea em condomínio com área gourmet

Função:

- identificar a peça comercial/publicitária;
- permitir busca, atendimento e comunicação por código;
- permitir importação, espelhamento, compartilhamento ou transferência operacional de anúncios;
- diferenciar o anúncio do imóvel físico.

---

## 4. Diferença entre nome interno e título público

### internal_name

É nome interno do imóvel.

Exemplo:

- Florais - Hélio

Serve para:

- operação;
- equipe;
- carteira;
- Pipeline Pro;
- atendimento;
- controle interno.

Não deve ser usado como título público do anúncio.

---

### ad_internal_name

É nome interno da peça/anúncio.

Exemplo:

- Venda Florais Hélio - campanha inicial
- Locação Goiabeiras Ana - versão premium

Serve para:

- diferenciar versões de anúncio;
- organizar campanhas;
- controlar importações;
- separar republicações;
- identificar variações comerciais.

---

### title

É título público/comercial do anúncio.

Exemplo:

- Casa térrea em condomínio com área gourmet e lazer completo

Serve para:

- marketplace;
- vitrine pública;
- anúncio;
- SEO;
- redes sociais;
- distribuição.

---

## 5. Por que anúncio não deve usar "asset"

Não criar estrutura como ads_assets.

Motivo:

No Core Properties, asset já representa patrimônio/imóvel.

Se anúncio também for chamado de asset, o sistema perde clareza semântica.

Regra:

- property_asset = imóvel/patrimônio;
- ad/listing = anúncio/publicação;
- media_asset, se existir futuramente, deve ser tratado como mídia/arquivo, não como imóvel.

---

## 6. Importação de anúncio

O código do anúncio deve servir para importação entre contextos:

- marketplace -> profissional;
- profissional A -> profissional B;
- corretor -> agência;
- agência -> corretor parceiro;
- carteira A -> carteira B;
- balcão de negócios;
- parcerias.

Quando um anúncio é importado, o sistema não importa apenas texto.

Ele deve importar ou vincular o pacote permitido:

- property_listing;
- property_asset;
- localização;
- características;
- mídias públicas;
- contexto comercial;
- vínculo de portfólio;
- origem;
- responsável;
- metadados permitidos.

Importação de anúncio não significa automaticamente transferência do imóvel, do cliente, do dossiê ou dos dados sensíveis.

---

## 7. Transferência de imóvel

Transferir imóvel é diferente de importar anúncio.

Transferir imóvel envolve:

- property_asset;
- histórico;
- proprietário;
- dossiê;
- documentos;
- permissões;
- carteira;
- responsabilidade;
- contexto jurídico;
- auditoria.

Esse fluxo exige regra própria, aceite, rastreabilidade e autorização.

---

## 8. Segurança

Profissional não pode visualizar, importar, editar, excluir ou acessar dados confidenciais de anúncio/imóvel que não pertence ao seu contexto operacional.

O acesso deve respeitar:

- created_by_profile_id;
- responsible_profile_id;
- portfolio_items;
- portfolios;
- organization_id;
- membership;
- permissões;
- RLS;
- can_access_listing;
- can_manage_listing;
- futuras funções específicas de importação/transferência.

Não basta esconder no frontend.

A restrição deve existir no banco/RLS/funções.

---

## 9. Campos futuros recomendados

### property_assets

- property_reference_code text unique
- internal_name text null

### property_listings

- ad_reference_code text unique
- ad_internal_name text null
- imported_from_listing_id uuid null
- import_origin text/enum null
- import_status text/enum null

### portfolio_items

- local_alias text null
- import_relationship_status text/enum null

---

## 10. O que não fazer agora

Não criar migration agora.

Não gerar código no frontend.

Não usar UUID como código comercial.

Não colocar código definitivo apenas em metadata.

Não usar asset para anúncio.

Não misturar:

- internal_name;
- ad_internal_name;
- title;
- property_reference_code;
- ad_reference_code.

---

## 11. Próxima decisão técnica futura

Antes de migration, definir:

1. Formato dos códigos.
2. Se serão globais ou por organização.
3. Se nascem no insert ou na publicação.
4. Como preencher registros antigos.
5. Como importar marketplace -> profissional.
6. Como importar profissional -> profissional.
7. Como transferir imóvel.
8. Quais dados são importáveis, vinculáveis ou bloqueados.
9. Quais eventos/auditorias serão registrados.
