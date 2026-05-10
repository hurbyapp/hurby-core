# HURBY — BACKLOG DE PREVISIBILIDADE ARQUITETURAL

STATUS: REGISTRO OFICIAL DE PENDÊNCIAS FUTURAS  
TIPO: BACKLOG TÉCNICO / CONCEITUAL  
ESCOPO: DECISÕES IDENTIFICADAS DURANTE REVISÃO DO CORE OPERACIONAL  
ÚLTIMA ATUALIZAÇÃO: 2026-05-10  

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

# 6. LOGIN / SIGNUP / ENTRY FLOW

STATUS: RECONSTRUÍDO COMO FOUNDATION NEUTRA, COM EVOLUÇÃO FUTURA

O login/signup deixou de depender de user_type.

Decisão consolidada:

- users_profile é conta autenticada neutra
- corretor é broker_profile
- imobiliária é organization + organization_membership
- usuário comum do marketplace deve ter conta simples
- login não deve perguntar toda vez quem a pessoa é
- login deve rotear conforme contexto já existente
- entrada profissional deve ocorrer por fluxo próprio
- entrada comum do marketplace deve permanecer no ambiente comum

O signup profissional atual cria:

- auth.users
- users_profile neutro
- broker_profile

O login profissional atual considera:

- organization_membership owner/manager ativo
- broker_profile existente
- ausência de contexto profissional

Pendências futuras:

- criar login público do marketplace
- criar entrada profissional /hurb
- criar página institucional Hurby/Hurb
- criar fluxo próprio para cadastro de imobiliária
- criar fluxo próprio para usuário comum anunciante
- criar conta comum do marketplace com favoritos/dados/anúncios
- criar seletor de ambiente somente quando o usuário tiver múltiplos contextos
- criar item de menu "Hurby Pro" ou "Painel Hurby" para profissional logado no marketplace

Regra:

Login feito no marketplace não deve redirecionar automaticamente para /broker.

Login feito no ambiente profissional deve validar contexto profissional.

Motivo:

A intenção deve ser definida antes ou durante o cadastro, e não por onboarding genérico depois do login.

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

# 17. CORE_PROPERTIES_FORM_V1

STATUS: BACKLOG / NÃO EXECUTAR AGORA

A melhoria do formulário de cadastro e edição de imóveis foi identificada como evolução útil, mas não deve ser executada neste momento.

A fundação imobiliária operacional já foi validada em:

- banco local
- Supabase STAGING
- Vercel
- fluxo broker
- cadastro de imóvel
- listagem
- detalhe
- edição

Decisão:

- não abrir a missão CORE_PROPERTIES_FORM_V1 agora
- não refatorar formulário neste momento
- não expandir campos de imóvel agora
- não mexer na foundation validada
- não alterar RPC create_property_operational_bundle sem necessidade real
- não alterar RLS, storage ou lifecycle de listing nesta etapa

Motivo:

A prioridade estratégica agora é continuar os cores estruturais do ecossistema.

O formulário pode melhorar a experiência do corretor, mas não é o próximo gargalo arquitetural.

Antes de melhorar a camada visual e operacional do formulário, o HURBY precisa consolidar os próximos núcleos estruturais, principalmente:

- Core Clients
- Core Origins
- Core Visibility
- Core Leads V2
- Core Marketplace
- Core Products/Economy

Pendências futuras da missão CORE_PROPERTIES_FORM_V1:

- melhorar UX do cadastro
- criar fluxo em etapas
- trocar labels técnicos por labels comerciais
- adicionar Arrendamento em finalidade do anúncio
- trocar "Modelo operacional" por "Forma de operação"
- trocar "Transacional" por "Apenas intermediação"
- trocar "Gerenciado" por "Gerenciado pelo corretor/imobiliária"
- trocar "Híbrido" por "Intermediação + administração"
- expandir localização
- expandir características
- validar upload de mídia
- avaliar cards/radios no lugar de dropdowns
- implementar status por botões de ação
- iniciar soft delete controlado
- criar lifecycle real de listing
- exigir motivo de encerramento quando aplicável

Dependências recomendadas antes de executar:

- Core Clients mais maduro
- Core Origins mais maduro
- Core Visibility mais maduro
- definição futura de lifecycle de listing
- validação de impacto no marketplace
- validação de impacto em leads
- validação de impacto em gestão administrativa

Regra:

CORE_PROPERTIES_FORM_V1 só deve ser aberto quando a arquitetura estrutural estiver pronta para suportar a evolução do cadastro sem gerar retrabalho.

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

-------------------------------------

# 18. CORE_IDENTITY_REBUILD + CORE_CLIENTS_FOUNDATION

STATUS: FOUNDATION VALIDADA LOCALMENTE

A base de identidade foi reconstruída para remover a semântica antiga baseada em user_type/account_tier.

Decisão:

- users_profile passa a representar apenas conta autenticada neutra
- auth.users.id = users_profile.id deve ser preservado
- corretor passa a ser representado por broker_profiles
- validação profissional passa a ser representada por broker_verifications
- cliente passa a ser representado por client_entities
- vínculo contextual passa a ser representado por client_relationships

Migrations envolvidas:

- 20260504000000_base_clean.sql
- 20260504000100_profiles.sql
- 20260506021141_auth_profile_trigger.sql
- 20260510120000_core_identity_clients_foundation.sql

Arquivos de frontend impactados:

- src/app/login/page.tsx
- src/app/broker/page.tsx
- src/app/page.tsx

Validações realizadas:

- supabase db reset
- npm run build
- login profissional
- criação de broker_profile
- acesso ao /broker
- correção do erro de perfil causado pela remoção de user_type

Regra:

Não restaurar user_type, account_tier, PAY_PER_USE automático ou broker automático em users_profile.

-------------------------------------

# 19. CORE CLIENTS

STATUS: FOUNDATION CRIADA, NÃO EXPANDIR FUNCIONALMENTE AGORA

Core Clients foi criado como fundação relacional.

Estruturas criadas:

- client_entities
- client_contact_methods
- client_relationships
- client_relationship_roles

Decisão:

Cliente não é usuário autenticado.

Cliente também não é lead.

Cliente é entidade relacional e contextual.

A mesma pessoa pode ser:

- usuário comum do marketplace
- buscador de imóvel
- proprietário/fornecedor de imóvel
- comprador
- locatário
- cliente de corretor
- cliente de imobiliária
- contato vindo de campanha
- contato importado
- futuro lead
- parte de contrato

Pendências futuras:

- integrar com Leads V2
- integrar com Marketplace
- integrar com Funil
- integrar com Contratos
- integrar com Trust/Safety
- integrar com Score
- integrar com Reviews
- criar fluxo de dados órfãos
- criar lifecycle de relacionamento
- criar regras de exclusividade por origem

Regra:

Não transformar client_entities em tabela plana de contato.

-------------------------------------

# 20. CORE SCORE

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

Score será um core próprio.

Não deve ser coluna simples em users_profile, broker_profiles ou client_entities.

Diretrizes:

- score deve ser contextual
- score deve ser explicável
- score deve ser baseado em eventos
- score deve separar marketplace de reputação profissional
- score deve evitar rótulos discriminatórios
- score deve usar linguagem operacional

Scores futuros possíveis:

- score da conta
- score do corretor
- score da imobiliária
- score do anúncio
- score do imóvel
- score do lead
- score do cliente
- score do relacionamento
- score de comportamento
- score de qualidade operacional

Termos recomendados:

- nível de verificação
- intenção
- maturidade da jornada
- confiabilidade cadastral
- reputação operacional
- qualidade de atendimento

Dependências futuras:

- Core Events
- Core Trust/Safety
- Core Reviews
- Core Leads V2
- Core Marketplace
- Core Clients maduro
- Core Visibility

Regra:

Não implementar score antes de criar base de eventos e explicabilidade.

-------------------------------------

# 21. CORE TRUST / SAFETY / GOVERNANCE

STATUS: FUTURO, OBRIGATÓRIO

O HURBY deve possuir sistema futuro de prevenção a fraude, monitoria, denúncias, suspensão e banimento.

O sistema deve permitir denúncias contra:

- usuários
- clientes
- corretores
- imobiliárias
- anúncios
- imóveis
- mensagens
- atendimentos
- publicidades
- páginas profissionais
- conteúdos

As denúncias devem prever:

- motivo obrigatório
- descrição
- categoria
- evidências
- IP
- user agent
- dispositivo/navegador
- sessão
- origem
- timestamp
- geolocalização aproximada quando legalmente adequada e consentida
- entidade denunciada
- usuário denunciante
- triagem automática
- fila humana
- decisão
- retenção de evidências para defesa jurídica

O sistema deve prever lifecycle de risco:

- normal
- em observação
- alertado
- restrito
- suspenso
- banido
- expurgado
- retido para defesa jurídica

Regra:

Profissionais sem CRECI não devem operar livremente como corretores.

Eles só podem existir futuramente com modalidade restrita, rastreável e preferencialmente vinculada a corretor ou imobiliária verificada.

-------------------------------------

# 22. CORE REVIEWS / AVALIAÇÕES

STATUS: FUTURO, NÃO IMPLEMENTAR AGORA

Avaliações serão core próprio futuro.

Avaliações devem ser contextuais.

Itens avaliáveis futuramente:

- anúncio
- atendimento
- corretor
- imóvel
- imobiliária
- experiência geral

Critérios possíveis:

- qualidade das fotos
- clareza das informações
- qualidade do atendimento
- aderência do imóvel ao anúncio
- confiança percebida
- experiência geral

As avaliações devem alimentar:

- score
- reputação
- qualidade dos anúncios
- alertas operacionais
- recomendações comerciais
- qualificação profissional
- Academy Broker futura
- marketplace de prestadores futuro

Regra:

Avaliação não deve ser apenas exposição pública. Deve servir para elevar qualidade operacional do ecossistema.

-------------------------------------

# 23. ACESSO A DADOS SENSÍVEIS

STATUS: FUTURO, DEPENDENTE DE VISIBILITY / TRUST / LEADS

O acesso a dados sensíveis, como telefone e e-mail de lead/cliente, deve ser controlado futuramente por:

- contexto
- consentimento
- nível de verificação
- selos profissionais
- termo de responsabilidade
- origem do lead
- relationship ownership
- visibilidade
- LGPD

Decisão futura provável:

- profissional sem verificação alta não acessa telefone diretamente
- atendimento deve ocorrer pela plataforma/funil
- profissional verificado e com selo adequado pode acessar telefone após aceite de responsabilidade

Regra:

Não expor dados sensíveis por padrão.

-------------------------------------

# 24. AXÉ / ASSINATURA COMO PRODUTO

STATUS: FUTURO, REVISAR ECONOMIA

A assinatura deve ser entendida comercialmente como assinatura, mas tecnicamente pode funcionar como produto/pacote operacional adquirido por período.

Modelo conceitual:

- Axé livre para compras avulsas
- Axé reservado/bloqueado para manter pacote/assinatura ativo
- pacote de 3, 6, 9 ou 12 meses
- direitos de uso liberados enquanto pacote estiver ativo
- reajustes afetam novas contratações/renovações
- preço contratado deve ser preservado até o fim do ciclo

Pendências futuras:

- revisar activate_subscription
- revisar user_subscription
- revisar purchase_coin
- revisar add_coin duplicado/sobrecarregado
- criar modelo de products/purchases/entitlements
- criar saldo reservado
- separar compra avulsa de pacote recorrente

Regra:

Não tratar assinatura como mensalidade SaaS simples dentro de users_profile.

-------------------------------------

# 25. REFERÊNCIA DO PROTOCOLO OPERACIONAL

STATUS: CORRIGIR REFERÊNCIAS DOCUMENTAIS

Caminho oficial versionado:

docs/protocols/hurby-operational-protocol.md

Pendência:

Corrigir documentos, handoffs, checklists e comandos que ainda citem:

hurby-operational-protocol.md

como se estivesse na raiz do projeto.

Regra:

O protocolo operacional não deve ser movido para a raiz apenas para compatibilizar comando antigo.
