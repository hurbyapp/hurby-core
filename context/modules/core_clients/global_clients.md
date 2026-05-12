# HURBY — CORE CLIENTS GLOBAL

Status: FOUNDATION VALIDADA

Data: 2026-05-10

-------------------------------------

## 1. Função do Core Clients

O Core Clients é a fundação responsável por estruturar clientes, pessoas de relacionamento e vínculos contextuais dentro do ecossistema HURBY.

Cliente no HURBY não é apenas uma pessoa cadastrada.

Cliente é uma entidade relacional que pode participar de diferentes contextos operacionais:

- usuário comum do marketplace
- pessoa buscando imóvel
- proprietário ou fornecedor de imóvel
- comprador
- locatário
- cliente de corretor
- cliente de imobiliária
- contato vindo de campanha
- contato importado
- futuro lead
- parte de contrato
- participante de atendimento futuro

-------------------------------------

## 2. Princípio central

O HURBY não deve tratar cliente como uma tabela plana.

O cliente deve ser separado em:

- entidade
- contato
- relacionamento
- papel contextual
- origem
- proprietário operacional do relacionamento
- vínculo com imóvel, anúncio, carteira ou organização

A mesma pessoa pode ter múltiplos papéis e múltiplos vínculos sem duplicação indevida.

Exemplo:

Uma pessoa pode ser:

- usuário comum do Cadê Negócios
- interessada em comprar um imóvel
- proprietária de outro imóvel
- cliente de uma imobiliária
- lead futuro de um corretor
- locatária em contrato futuro

Tudo isso precisa coexistir sem transformar users_profile em uma tabela confusa.

-------------------------------------

## 3. Relação com users_profile

users_profile é conta autenticada neutra.

users_profile NÃO representa:

- corretor
- cliente
- imobiliária
- proprietário
- plano comercial
- assinatura
- tipo fixo de usuário

Contrato técnico preservado:

auth.users.id = users_profile.id

A partir dessa conta neutra nascem camadas específicas:

- broker_profiles
- client_entities
- organizations
- organization_memberships
- portfolios
- client_relationships

-------------------------------------

## 4. Estruturas criadas

A foundation inicial criou:

- broker_profiles
- broker_verifications
- client_entities
- client_contact_methods
- client_relationships
- client_relationship_roles

Migration responsável:

- supabase/migrations/20260510120000_core_identity_clients_foundation.sql

-------------------------------------

## 5. broker_profiles

broker_profiles representa a camada profissional do corretor.

Não substitui users_profile.

Um corretor é uma conta autenticada que possui uma camada profissional vinculada.

A estrutura prevê:

- profile_id
- professional_name
- document_cpf
- creci_number
- creci_uf
- main_city
- main_state
- service_region
- bio
- professional_status
- verification_status
- public_visibility_status

O corretor não nasce automaticamente em users_profile.

Ele nasce como broker_profile por fluxo profissional.

-------------------------------------

## 6. broker_verifications

broker_verifications representa o histórico de validações profissionais.

Essa estrutura foi criada para permitir futuramente:

- validação de CRECI
- validação documental
- revisão manual
- retorno de API externa
- registro de tentativas
- histórico de aprovação/reprovação
- selos progressivos
- suporte a Trust/Safety

A verificação profissional não deve ser apenas um campo simples dentro do corretor.

Ela é um processo.

-------------------------------------

## 7. client_entities

client_entities representa a pessoa ou entidade de relacionamento dentro do ecossistema.

Pode existir com ou sem login.

Exemplos:

- cliente cadastrado por corretor
- proprietário de imóvel
- usuário comum do marketplace
- comprador potencial
- locatário
- contato importado
- contato vindo de campanha
- futuro lead

linked_profile_id é opcional.

Isso permite que um cliente exista antes de criar conta.

-------------------------------------

## 8. client_contact_methods

client_contact_methods centraliza os meios de contato do cliente.

Tipos previstos:

- email
- phone
- whatsapp

A estrutura já prepara:

- verificação de contato
- consentimento
- rastreabilidade
- controle futuro de visibilidade
- LGPD
- restrição de dados sensíveis
- integração futura com leads, funil e Trust/Safety

Telefone e e-mail não devem ficar espalhados em várias tabelas sem governança.

-------------------------------------

## 9. client_relationships

client_relationships é o coração relacional do Core Clients.

Ela define o vínculo contextual entre uma entidade cliente e uma operação.

Contextos previstos:

- marketplace
- broker_portfolio
- agency_portfolio
- property_provider
- property_interest
- future_lead
- contract_party
- imported_contact

Essa tabela permite responder:

- esse cliente pertence a quem?
- veio de onde?
- está relacionado a qual imóvel?
- está em qual carteira?
- pertence ao marketplace?
- pertence a um corretor?
- pertence a uma imobiliária?
- virou lead?
- virou parte de contrato?

-------------------------------------

## 10. client_relationship_roles

client_relationship_roles permite papéis múltiplos dentro de uma relação.

Papéis previstos:

- marketplace_user
- seeker
- property_provider
- buyer
- tenant
- landlord
- contact

A pessoa não deve ter apenas um tipo fixo.

O papel depende do contexto.

-------------------------------------

## 11. Relação com Cadê Negócios

Usuário comum do marketplace deve usar uma única conta simples.

A mesma conta comum pode:

- buscar imóveis
- salvar favoritos
- atualizar dados
- anunciar imóvel próprio
- acompanhar seus anúncios
- navegar logada no Cadê Negócios

Usuário comum não deve cair no ambiente de corretor.

Se a conta também for profissional, ela poderá navegar no marketplace como usuário comum, mas verá acesso ao painel profissional, como:

- Hurby Pro
- Painel Hurby
- Ambiente Profissional

-------------------------------------

## 12. Relação com Hurby/Hurb profissional

O ambiente profissional deve ser acessado por portas próprias:

- cadênegócios.com.br/hurb
- hurb.com.br
- links institucionais profissionais
- cadastro de corretor
- cadastro de imobiliária
- convite institucional

Login feito no marketplace não deve redirecionar automaticamente para o painel profissional.

Login feito no ambiente profissional deve validar contexto profissional.

-------------------------------------

## 13. Profissionais sem CRECI

Profissionais sem CRECI não devem operar livremente como corretores.

Eles poderão existir futuramente apenas em modalidade restrita, rastreável e preferencialmente vinculada a:

- corretor verificado
- imobiliária verificada

Não devem ter os mesmos privilégios de um corretor validado.

Isso protege:

- consumidor final
- corretores regularizados
- imobiliárias sérias
- reputação da plataforma
- defesa jurídica do HURBY

-------------------------------------

## 14. Preparação para Score futuro

Score não foi implementado agora.

A foundation apenas prepara o terreno.

O score futuro deve ser:

- contextual
- explicável
- baseado em eventos
- separado por entidade
- juridicamente cuidadoso

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

Score não deve ser coluna simples em users_profile.

-------------------------------------

## 15. Preparação para Trust/Safety futuro

O Core Clients foi desenhado para permitir futuramente:

- denúncias contra usuários
- denúncias contra clientes
- denúncias contra corretores
- denúncias contra imobiliárias
- denúncias contra anúncios
- denúncias contra atendimentos
- monitoria de comportamento suspeito
- suspensão
- banimento
- retenção de evidências
- análise humana
- prevenção de golpes

O Core Trust/Safety será um core próprio futuro.

-------------------------------------

## 16. Preparação para avaliações futuras

Avaliações não foram implementadas agora.

A foundation deve permitir futuramente avaliações contextuais sobre:

- anúncio
- atendimento
- corretor
- imóvel
- imobiliária
- experiência geral

Essas avaliações poderão alimentar:

- score
- reputação
- qualidade dos anúncios
- melhoria de atendimento
- recomendações comerciais
- qualificação profissional

-------------------------------------

## 17. Relação com LGPD

A foundation respeita LGPD desde a origem.

Diretrizes:

- minimizar dados sensíveis
- separar contato de entidade
- permitir consentimento por canal
- controlar visibilidade futura
- preservar rastreabilidade
- permitir auditoria
- evitar exposição indevida de telefone/e-mail
- preparar retenção e governança futura

-------------------------------------

## 18. Relação com Ledger/Axé

Core Clients não mexe no Ledger/Axé.

A relação futura com Axé deve ocorrer por produtos, desbloqueios, leads, pacotes, assinaturas e serviços.

A foundation atual apenas garante que o cliente e os relacionamentos possam ser vinculados futuramente a operações comerciais.

-------------------------------------

## 19. Relação com Properties

Core Clients se conecta futuramente com:

- property_asset
- property_listing
- portfolio
- portfolio_item
- operational_origin

Exemplos futuros:

- cliente proprietário de imóvel
- cliente interessado em anúncio
- cliente locatário
- cliente comprador
- cliente parte de contrato
- lead gerado por imóvel

-------------------------------------

## 20. Regra de continuidade

Não implementar agora dentro do Core Clients:

- leads
- marketplace completo
- funil
- contratos
- score
- avaliações
- denúncias
- banimento
- gestão de locação
- automações
- inteligência comercial

Esses módulos devem nascer em cores próprios.

-------------------------------------

## 21. Status

Core Clients Foundation:

- migration criada
- banco local resetado com sucesso
- build aprovado
- login profissional ajustado
- broker_profile validado
- /broker funcionando sem user_type
- documentação em consolidação

Status:
FOUNDATION VALIDADA LOCALMENTE


-------------------------------------

## 22. HURBY_CONTEXT_UPDATE_20260511_CORE_CLIENTS_IDENTITY_DISTINCTION

Data: 2026-05-11  
Status: COMPLEMENTO CONCEITUAL VALIDADO

### 22.1. Distincao obrigatoria

O Core Clients nao deve ser confundido com a conta basica do usuario do site.

Conta basica / identidade:

- users_profile
- auth.users
- primary_entry_flow
- account_status
- registration_status
- broker_profiles
- organization_memberships

Cliente relacional/comercial:

- client_entities
- client_relationships
- client_contact_methods
- client_relationship_roles

### 22.2. Interpretacao correta

No Hurby, "cliente" no Core Clients pode ser:

- lead
- interessado
- comprador
- locatario
- proprietario
- fornecedor
- parceiro
- contato de relacionamento
- entidade vinculada a uma jornada comercial

Usuario do site pode existir sem ainda ser cliente comercial.

Cliente comercial pode existir como entidade relacional sem necessariamente ter login.

### 22.3. Impacto da validacao Owner/Broker/Agency

Durante a missao, foi validado que o Core Clients nao quebrou:

- login broker
- login agency
- login owner temporario
- acesso broker
- acesso agency
- acesso owner
- ledger
- wallet_balance
- distribuicao AXE

### 22.4. Blindagem

Nao alterar o Core Clients para absorver responsabilidades de:

- autorizacao profissional
- membership institucional
- permissao Owner/Admin
- ledger
- wallet
- rotas de acesso

Essas responsabilidades pertencem a outros cores/camadas.

-------------------------------------
