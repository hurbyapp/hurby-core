\# =========================================

\# HURBY — CORE PORTFOLIO PROTOCOL

\# STATUS: FOUNDATION PROTOCOL

\# PRIORIDADE: CRÍTICA

\# =========================================



\# OBJETIVO DO PROTOCOLO



Garantir:

\- previsibilidade arquitetural

\- consistência semântica

\- ausência de acoplamento destrutivo

\- evolução saudável da carteira operacional

\- expansão futura sem refatoração traumática



\# REGRA PRINCIPAL



Portfolio NÃO é:

\- agrupamento abstrato

\- coleção simples de imóveis



Portfolio representa:

\- contexto operacional real.



\# REGRA CANÔNICA



Todo ativo operacional:

\- deve possuir contexto operacional

\- deve possuir responsável operacional

\- não pode ficar órfão



\# REGRA DE OWNERSHIP



Ownership:

\- NÃO é absoluto

\- NÃO nasce apenas da entidade



Ownership deve considerar:

\- origem operacional

\- contexto operacional

\- vínculo operacional

\- esforço comercial

\- contexto institucional

\- contexto individual



\# REGRA DE DESACOPLAMENTO



É proibido:

\- acoplar organization diretamente no users\_profile

\- acoplar carteira diretamente na identidade base

\- centralizar ownership absoluto

\- transformar agency em user\_type



\# REGRA DE CONTEXTO



Organizations:

\- representam contexto institucional



Users\_profile:

\- representa identidade base



Memberships:

\- representam vínculo operacional



Portfolio:

\- representa contexto operacional da carteira



\# REGRA DE IMÓVEL



O mesmo imóvel físico:

\- pode coexistir em múltiplos portfolios

\- pode coexistir em múltiplas operações

\- pode coexistir em múltiplos contexts



O sistema modela:

\- operações comerciais

e NÃO:

\- unicidade física absoluta do imóvel



\# REGRA DE PROPERTY PROVIDER



O property provider:

\- acompanha o imóvel

\- acompanha a carteira operacional do ativo



Se o imóvel permanece:

\- o provider permanece.



\# REGRA DE SEEKER



Leads/clientes buscadores:

\- pertencem ao contexto de origem operacional



Exemplo:

\- corretor captou

→ ownership do corretor



\- agency captou

→ ownership institucional



\# REGRA DE RESPONSABILIDADE OPERACIONAL



Responsabilidade operacional:

\- NÃO substitui ownership

\- NÃO substitui vínculo institucional



Representa:

\- operador prático contextual



\# REGRA DE SHARING FUTURO



Compartilhamento:

\- deve ser explícito

\- deve ser consensual

\- deve ser rastreável

\- NÃO pode ser transitivo



Se:

A ↔ B

e

B ↔ C



NÃO implica:

A ↔ C



\# REGRA DE VISIBILITY FUTURA



Visibility:

\- deve ser contextual

\- deve considerar:

&#x20; - ownership

&#x20; - memberships

&#x20; - exclusividade

&#x20; - partnerships

&#x20; - contexts



\# REGRA DE DESVINCULAÇÃO



Ao ocorrer desligamento:

\- ativos institucionais permanecem institucionais

\- ativos individuais permanecem individuais



O sistema deve prever:

\- revogação limpa

\- separação contextual

\- continuidade histórica



\# REGRA DE PREVISIBILIDADE



Toda nova entidade do core deve prever:

\- ownership

\- visibility

\- origins

\- memberships

\- expansão futura

\- contexts futuros



ANTES:

\- da implementação profunda



\# REGRA DE IMPLEMENTAÇÃO



Antes de alterar:

\- tabelas

\- RLS

\- ownership

\- visibility

\- memberships

\- property contexts



É obrigatório:

1\. revisar migrations atuais

2\. revisar dependências existentes

3\. revisar impacto semântico

4\. revisar impacto estrutural

5\. revisar impacto futuro



\# REGRA DE SEGURANÇA



É proibido:

\- criar regras destrutivas

\- criar cascatas perigosas

\- criar ownership rígido

\- criar acoplamento irreversível



\# REGRA FINAL



O CORE\_PORTFOLIO deve nascer:

\- preparado para crescimento futuro

\- semanticamente correto

\- estruturalmente expansível

\- operacionalmente realista



Sem:

\- overengineering

\- abstrações artificiais

\- simplificações destrutivas.

