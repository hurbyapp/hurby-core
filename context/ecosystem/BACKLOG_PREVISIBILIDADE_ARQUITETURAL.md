# HURBY — BACKLOG DE PREVISIBILIDADE ARQUITETURAL

STATUS: REGISTRO OFICIAL DE PENDÊNCIAS FUTURAS  
TIPO: BACKLOG TÉCNICO / CONCEITUAL  
ESCOPO: DECISÕES IDENTIFICADAS DURANTE REVISÃO DO CORE OPERACIONAL  
ÚLTIMA ATUALIZAÇÃO: 2026-05-09  

-------------------------------------

# OBJETIVO

Este documento registra decisões, pendências, riscos e ajustes que foram identificados durante a revisão estrutural do ecossistema HURBY.

A função deste backlog é evitar que observações importantes fiquem perdidas em chat, memória informal ou decisões soltas.

Sempre que algo for tratado como:

- deixar por enquanto
- congelar como foundation
- revisar depois
- corrigir antes de produção
- refatorar futuramente
- não expandir agora
- dependente de outro core
- bom para teste, mas não ideal para futuro

deve ser registrado aqui.

-------------------------------------

# 1. LEADS

STATUS: REFAZER DO ZERO

A estrutura atual de leads foi considerada fraca para a nova visão operacional do HURBY.

Como ainda não foi utilizada em produção, não compensa reaproveitar a foundation existente.

Decisão:

- descartar a modelagem atual como core definitivo
- criar futuramente um CORE_LEADS_V2
- leads devem nascer ligados a origem, contexto, funil, marketplace, campanha, página, listing, carteira e ownership contextual

Motivo:

Lead no HURBY não é apenas contato.

Lead representa relacionamento operacional rastreável.

Dependências futuras:

- Core Portfolio
- Core Origins
- Core Visibility
- Core Funnel
- Core Marketplace

-------------------------------------

# 2. CORE PROPERTIES

STATUS: PRESERVAR COMO FOUNDATION, MAS NÃO EXPANDIR AGORA

A separação entre property_asset e property_listing está correta e deve ser preservada.

Decisão:

- manter asset separado de listing
- manter mídia vinculada ao listing
- manter service layer
- não expandir formulário de cadastro agora
- não desenvolver gestão avançada de imóvel ainda
- não acoplar marketplace, leads, IA ou financeiro neste core neste momento

Pendência futura:

- adaptar criação de imóveis para portfolio_id
- incluir operational_context
- incluir origin_context
- incluir visibility_scope
- incluir responsible_operator
- substituir ou complementar managed_by_profile_id

Motivo:

O fluxo atual funciona para corretor solo, mas ainda não representa o ecossistema operacional completo.

-------------------------------------

# 3. managed_by_profile_id

STATUS: ACEITÁVEL TEMPORARIAMENTE

O campo managed_by_profile_id funciona para a foundation inicial, mas não deve ser tratado como arquitetura final.

Problema:

Ele amarra diretamente imóvel/listing ao usuário, sem representar carteira, organização, origem, contexto ou visibilidade.

Decisão futura:

Substituir ou complementar por:

- portfolio_id
- operational_context_id
- origin_id
- responsible_operator_id
- organization_id, quando aplicável
- created_by_profile_id
- visibility_scope

Motivo:

O HURBY não trabalha apenas com relação simples usuário → imóvel.

Ele trabalha com contexto operacional.

-------------------------------------

# 4. FINANCEIRO / AXÉ

STATUS: PRESERVAR LEDGER, REVISAR FUNÇÕES

A arquitetura de ledger deve ser preservada.

O ledger é a fonte oficial de verdade financeira.

Porém, algumas funções RPC precisam ser revisadas antes de produção.

Riscos identificados:

- funções recebendo p_user_id diretamente
- frontend chamando consume_coin com user.id
- purchase_coin sem validação real de pagamento
- transfer_coin não deve ser produto ativo agora
- expire_coin precisa controle por lote para evitar expiração duplicada

Decisões:

- ledger fica
- wallet_balance fica como cache derivado
- frontend não deve decidir usuário financeiro
- funções financeiras devem usar auth.uid() quando forem de usuário comum
- funções administrativas devem ter camada de autorização explícita
- transfer_coin deve ficar congelada ou removida
- purchase_coin precisa depender de pedido/pagamento real

-------------------------------------

# 5. BROKER PAGE

STATUS: TELA DE TESTE

A página broker atual contém botão de teste para consumir 10 AXE.

Decisão:

- preservar enquanto ambiente de teste
- remover ou substituir antes de produção
- não usar como padrão definitivo de consumo financeiro

Motivo:

O frontend não deve chamar função financeira passando p_user_id diretamente.

-------------------------------------

# 6. LOGIN / SIGNUP

STATUS: FUNCIONAL, MAS PRECISA EVOLUIR

O login está correto ao tratar agency como organization + membership, e não como user_type.

Porém, o signup ainda cria todo novo usuário como broker.

Decisão:

- preservar por enquanto
- futuramente criar onboarding operacional

O onboarding deverá permitir:

- sou corretor
- sou imobiliária
- sou proprietário
- estou procurando imóvel
- quero anunciar imóvel próprio
- sou incorporadora

Motivo:

O HURBY terá usuários comuns, seekers, property providers, brokers, owners, agencies e incorporadoras.

Nem todo usuário deve nascer como broker.

-------------------------------------

# 7. AGENCY

STATUS: FOUNDATION BOA

A página agency está bem alinhada com a nova visão.

Pontos corretos:

- agency não é user_type
- acesso por organization_memberships
- valida membership_status active
- restringe acesso para owner e manager

Pendências futuras:

- múltiplas organizações por usuário
- seleção de organização ativa
- contexto operacional ativo
- gestão de membros
- homologação de corretores
- carteira institucional
- permissões por escopo

-------------------------------------

# 8. STORAGE / MÍDIA DE IMÓVEL

STATUS: BOA BASE, REVISAR ANTES DE PRODUÇÃO

Decisões corretas:

- bucket privado
- signed URL
- mídia vinculada ao listing
- não vincular mídia diretamente ao asset

Pendência:

- revisar policies de storage
- impedir upload indevido em listing de terceiro
- validar ownership/contexto antes de upload
- alinhar storage com portfolio e visibility

-------------------------------------

# 9. LGPD / AUDITORIA

STATUS: FOUNDATION BOA, MAS INCOMPLETA

A base de LGPD e consentimento é útil, mas ainda não cobre toda a visão futura.

Pendências:

- unificar audit_logs
- evitar dois caminhos oficiais de auditoria
- criar lifecycle de retenção de dados
- criar regra de inatividade
- criar regra de exclusão
- criar regra de anonimização
- criar lógica de dados órfãos
- criar absorção contextual pelo marketplace
- registrar evidência de ciência do usuário quando aplicável

Motivo:

O HURBY trabalha com memória operacional viva, mas precisa respeitar retenção, finalidade e proteção de dados.

-------------------------------------

# 10. CORE PORTFOLIO

STATUS: PRÓXIMO CORE OBRIGATÓRIO

O Core Portfolio deve ser consolidado antes da expansão de imóveis, leads, marketplace, parcerias e visibilidade.

Função:

Portfolio representa carteira operacional contextual.

Ele deve conectar:

- profile
- organization
- membership
- property_asset
- property_listing
- origins
- visibility
- responsibility
- partnerships futuras

Decisão:

Não avançar em formulário completo de imóveis antes do Core Portfolio.

Motivo:

Sem Portfolio, o sistema volta a cair no modelo simples usuário → imóvel, que não representa o HURBY real.

-------------------------------------

# 11. CORE MARKETPLACE / CADÊ NEGÓCIOS

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

O marketplace Cadê Negócios será a camada pública de circulação do ecossistema.

Não implementar ainda.

Pendências futuras:

- origem do lead
- ownership contextual do lead
- exclusividade paga por imobiliária
- anúncio de usuário comum
- integração com portais externos
- anúncios patrocinados
- AdSense
- comportamento de navegação
- inteligência de rejeição
- banco de oportunidades

Dependências:

- Core Portfolio
- Core Leads V2
- Core Visibility
- Core Origins
- Core Products
- Core Economy

-------------------------------------

# 12. PÁGINAS PERSONALIZADAS

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

As páginas personalizadas serão produto comercial da presença digital.

Não implementar ainda.

Pendências futuras:

- página gratuita
- nível 1
- nível 2
- nível 3
- domínio próprio
- analytics
- reputação pública
- módulos desbloqueados refletidos na página
- exibição de contratos, gestão, carteira, negócios e score
- AdSense conforme nível

Dependências:

- Core Portfolio
- Core Reputation
- Core Products
- Core Visibility
- Core Marketplace

-------------------------------------

# 13. SISTEMA DE CONTRATOS

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

O sistema de contratos será ferramenta acoplável futura.

Pendências futuras:

- biblioteca de contratos
- cláusulas inteligentes
- contratos vinculados a imóvel
- contratos vinculados a proprietário
- contratos vinculados a comprador/locatário
- assinatura digital
- histórico documental
- dossiê operacional
- integração futura com assinatura eletrônica

Motivo:

Contrato no HURBY não será apenas PDF.

Será memória documental da operação.

-------------------------------------

# 14. GESTÃO ADMINISTRATIVA DE IMÓVEIS

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

A gestão administrativa de imóveis será núcleo futuro.

Pendências futuras:

- locação contínua
- contrato ativo
- inquilino
- proprietário
- cobrança
- atraso
- ocorrência
- manutenção
- vistoria
- dossiê histórico
- comunicação rastreável
- interação via plataforma/WhatsApp

Dependências:

- Core Clients
- Core Contracts
- Core Properties
- Core Portfolio
- Core Notifications

-------------------------------------

# 15. GOVERNANÇA OWNER

STATUS: FUTURO, PREVER ARQUITETURA

O painel owner deverá permitir gestão total do ecossistema.

Pendências futuras:

- expurgar usuário
- suspender usuário
- criar produtos
- criar campanhas
- dar bônus
- gerenciar auditoria
- gerenciar denúncias
- monitorar palavras suspeitas
- monitorar anúncios
- monitorar comportamento
- criar administradores
- delegar núcleos de auditoria
- acompanhar monetização
- acompanhar KPIs globais

Dependências:

- Core Audit
- Core Products
- Core Economy
- Core Governance
- Core Moderation

-------------------------------------

# 16. INCORPORADORAS

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

O módulo de incorporadoras será expansão futura.

Pendências futuras:

- cadastro de incorporadora
- empreendimentos
- lançamentos
- maquetes
- XML/API
- distribuição para corretores compatíveis
- aceite de representação
- presença no marketplace
- classificação de imóvel e corretor por perfil

Dependências:

- Core Organizations
- Core Portfolio
- Core Marketplace
- Core Partnerships
- Core Visibility

-------------------------------------

# REGRA FINAL

Nenhum item deste backlog deve ser resolvido por impulso.

Cada item deve ser tratado somente quando o core correspondente for aberto oficialmente.

Antes de qualquer alteração:

1. revisar documentação atual
2. revisar migrations atuais
3. revisar impacto semântico
4. revisar impacto técnico
5. gerar proposta
6. validar
7. só então executar

