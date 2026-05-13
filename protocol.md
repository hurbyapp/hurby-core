# HURBY PROTOCOL
VersÃ£o: 1.1  
Status: Ativo  

-------------------------------------

## 1. OBJETIVO

Este protocolo define COMO o projeto Hurby deve ser desenvolvido, garantindo:

- consistÃªncia tÃ©cnica  
- seguranÃ§a do sistema  
- ausÃªncia de regressÃµes  
- controle de qualidade  
- continuidade entre execuÃ§Ãµes  

Este documento NÃƒO contÃ©m regras de negÃ³cio especÃ­ficas nem estrutura de pÃ¡ginas.

-------------------------------------

## 2. PRINCÃPIOS FUNDAMENTAIS

1. Backend Ã© a fonte da verdade  
2. Frontend NÃƒO contÃ©m lÃ³gica crÃ­tica  
3. Toda operaÃ§Ã£o sensÃ­vel deve ser validada no backend  
4. Sistema deve evoluir sem quebrar o que jÃ¡ funciona  
5. Nenhuma evoluÃ§Ã£o com dÃ­vida tÃ©cnica ativa  
6. SeguranÃ§a e rastreabilidade sÃ£o obrigatÃ³rias (LGPD / Auditoria)  

-------------------------------------

## 3. REGRAS INEGOCIÃVEIS

- NÃƒO alterar lÃ³gica financeira no frontend  
- NÃƒO inserir diretamente em tabelas crÃ­ticas (ex: credit_transactions)  
- SEMPRE usar funÃ§Ãµes seguras para operaÃ§Ãµes crÃ­ticas (RPC)  
- NÃƒO modificar estrutura existente sem validaÃ§Ã£o  
- NÃƒO prosseguir com erro ou inconsistÃªncia  
- NÃƒO remover cÃ³digo existente sem autorizaÃ§Ã£o explÃ­cita  
- NÃƒO causar regressÃ£o funcional ou estrutural  

Se houver dÃºvida:  
â†’ PARAR execuÃ§Ã£o  
â†’ validar antes de continuar  

-------------------------------------

## 4. FLUXO DE EXECUÃ‡ÃƒO PADRÃƒO

Toda tarefa deve seguir:

1. Executor implementa  
2. Executor gera RELATÃ“RIO DE ETAPA  
3. UsuÃ¡rio valida  
4. Auditoria externa (Gemini)  
5. CorreÃ§Ãµes (se necessÃ¡rio)  
6. AtualizaÃ§Ã£o de CONTEXTO  
7. AvanÃ§a para prÃ³xima etapa  

Nenhuma etapa Ã© considerada concluÃ­da sem esse ciclo completo.

-------------------------------------

## 5. DEFINIÃ‡ÃƒO DE TAREFA CONCLUÃDA (DoD)

Uma tarefa sÃ³ Ã© considerada concluÃ­da quando:

- CÃ³digo estÃ¡ funcional  
- NÃ£o hÃ¡ erros ou inconsistÃªncias  
- NÃ£o hÃ¡ dÃ­vida tÃ©cnica  
- Contexto atualizado (quando aplicÃ¡vel)  
- Fluxo validado  
- Auditoria concluÃ­da (quando necessÃ¡rio)  
- NÃ£o hÃ¡ regressÃ£o  

-------------------------------------

## 6. GESTÃƒO DE CONTEXTO

O sistema utiliza CONTEXTO como memÃ³ria estruturada.

### Tipos de contexto:

- Contexto Global â†’ arquitetura e regras do sistema  
- Contexto de PÃ¡gina â†’ comportamento especÃ­fico  

### Regras:

- Contexto deve refletir o estado real do sistema  
- Atualizar contexto apÃ³s mudanÃ§as relevantes  
- NÃƒO misturar contexto com protocolo  

-------------------------------------

## 7. USO DE HANDOFF

Handoff Ã© utilizado para:

- transferÃªncia entre chats  
- continuidade de execuÃ§Ã£o  

Deve conter:

- resumo do que foi feito  
- estado atual real  
- arquitetura atual  
- decisÃµes tomadas  
- pendÃªncias tÃ©cnicas  
- prÃ³ximos passos  
- pontos de atenÃ§Ã£o  

Handoff NÃƒO Ã© documentaÃ§Ã£o do sistema.

-------------------------------------

## 8. PADRÃƒO DE INTERAÃ‡ÃƒO COM EXECUTOR

O executor deve:

- sempre fornecer cÃ³digo COMPLETO (nÃ£o fragmentado)  
- evitar explicaÃ§Ãµes desnecessÃ¡rias  
- priorizar clareza e execuÃ§Ã£o direta  
- respeitar estrutura jÃ¡ existente  
- NÃƒO remover ou quebrar cÃ³digo sem validaÃ§Ã£o  
- incluir CHANGELOG no topo de todo cÃ³digo  
- incluir OBSERVAÃ‡Ã•ES TÃ‰CNICAS quando necessÃ¡rio  

-------------------------------------

## 9. PADRÃƒO DE EXECUÃ‡ÃƒO DE COMANDOS

Quando houver comandos:

- fornecer em blocos separados  
- um comando por bloco  
- sem texto desnecessÃ¡rio entre blocos  
- sequÃªncia pronta para execuÃ§Ã£o  
- sempre contextualizar o que serÃ¡ feito antes  

-------------------------------------

## 10. CONTROLE DE RISCO

Antes de qualquer alteraÃ§Ã£o:

- avaliar impacto  
- identificar dependÃªncias  
- verificar risco de quebra  
- validar se existe regressÃ£o potencial  

Se houver risco:

â†’ validar antes de executar  

-------------------------------------

## 11. AMBIENTES

- HURBY-DEV â†’ ambiente de desenvolvimento  
- HURBY-PROD â†’ ambiente de produÃ§Ã£o  

Regras:

- DEV Ã© o Ãºnico ambiente de alteraÃ§Ã£o ativa  
- PROD nunca Ã© ambiente de teste  
- PROD nÃ£o deve sofrer alteraÃ§Ãµes manuais  
- toda alteraÃ§Ã£o deve vir de migrations  

-------------------------------------

## 12. BANCO DE DADOS E MIGRATIONS

- Ã‰ PROIBIDO criar tabelas manualmente no painel  
- Toda alteraÃ§Ã£o deve ser via migration  
- O banco deve ser reconstruÃ­vel via CLI  
- Estrutura deve ser idÃªntica entre DEV e PROD  

-------------------------------------

## 13. SEGURANÃ‡A E LGPD (OBRIGATÃ“RIO)

- Dados sensÃ­veis NÃƒO ficam no schema pÃºblico  
- SeparaÃ§Ã£o obrigatÃ³ria:
  - public â†’ dados operacionais
  - private â†’ dados sensÃ­veis
  - audit â†’ logs

- RLS obrigatÃ³rio em tabelas sensÃ­veis  
- Nunca expor dados sensÃ­veis diretamente ao frontend  

-------------------------------------

## 14. AUTENTICAÃ‡ÃƒO E ACESSO

- Middleware Ã© a camada oficial de seguranÃ§a  
- Frontend NÃƒO Ã© responsÃ¡vel por proteger rotas  
- Controle por user_type Ã© obrigatÃ³rio  
- Bloqueio deve ocorrer antes da renderizaÃ§Ã£o  

-------------------------------------

## 15. AUDITORIA (GEMINI)

Deve ser utilizada quando:

- conclusÃ£o de etapas crÃ­ticas  
- mudanÃ§as estruturais  
- implementaÃ§Ã£o de seguranÃ§a  
- dÃºvidas relevantes  

Objetivo:

- evitar dÃ­vida tÃ©cnica  
- validar direÃ§Ã£o  
- garantir consistÃªncia  

-------------------------------------

## 16. REGRA DE OURO

Sempre perguntar:

â†’ Isso Ã© PROTOCOLO?  
â†’ Isso Ã© CONTEXTO?  
â†’ Isso Ã© EXECUÃ‡ÃƒO?  

Nunca misturar responsabilidades.

-------------------------------------

## 17. VIOLAÃ‡ÃƒO DE PROTOCOLO

Se qualquer regra for violada:

- interromper execuÃ§Ã£o  
- corrigir imediatamente  
- revalidar antes de continuar  

-------------------------------------

## 18. EVOLUÃ‡ÃƒO DO PROTOCOLO

Este protocolo sÃ³ deve ser alterado quando houver:

- mudanÃ§a de processo  
- melhoria estrutural  
- necessidade comprovada  

-------------------------------------

## 19. DÃVIDAS TÃ‰CNICAS PLANEJADAS

Registrar obrigatoriamente:

- decisÃµes adiadas (ex: estrutura de rotas /dashboard vs /broker/dashboard)
- mudanÃ§as estruturais futuras
- riscos controlados

Essas dÃ­vidas NÃƒO podem ser esquecidas.

-------------------------------------

-------------------------------------

## 20. HURBY_CONTEXT_UPDATE_20260511_OWNER_CLIENTS_PROTOCOL

Status: REGRA OPERACIONAL CONSOLIDADA  
Data: 2026-05-11  
Escopo: missoes estruturais, autenticacao, acesso, rotas e RPCs criticas

### 20.1. Reconhecimento completo antes de codar

Toda missao estrutural deve obrigatoriamente iniciar com reconhecimento completo de backend e frontend.

Nao basta ler apenas SQL ou migrations.

O executor deve reconhecer, quando aplicavel:

- migrations SQL
- tabelas envolvidas
- enums reais do banco
- funcoes RPC
- policies RLS
- services TS/TSX
- hooks
- middleware
- pages de login/cadastro
- pages de dashboard
- componentes ligados ao fluxo
- rotas protegidas
- fluxos de redirect
- build local
- regressao em fluxos ja validados

### 20.2. Regra contra regressao por leitura superficial

Se uma alteracao tocar autenticacao, roteamento, carteira, ledger, memberships, broker, agency, owner ou clients, o executor deve validar os arquivos relacionados antes de entregar.

Arquivos minimos para reconhecimento em fluxo de acesso:

- middleware.ts
- src/app/login/page.tsx
- src/lib/services/accessService.ts
- src/app/account/page.tsx
- src/app/broker/page.tsx
- src/app/agency/page.tsx
- src/app/owner/page.tsx
- paginas de cadastro relacionadas

### 20.3. Regra de validacao por matriz de acesso

Toda mudanca em auth/rotas deve ser validada com matriz pratica:

- usuario comum
- broker
- agency
- owner temporario, quando existir
- rotas /account, /broker, /agency, /owner, /operations e /statement

A entrega nao pode ser considerada concluida apenas porque o build passou.

### 20.4. Regra para RPCs financeiras

RPC financeira nao pode assumir texto livre para enums.

Antes de alterar RPC financeira, validar valores reais com pg_enum.

Exemplo validado nesta fase:

- coin_origin_type: BONUS
- coin_credit_type: BONUS

A distribuicao temporaria de AXE pelo Owner de validacao deve usar BONUS/BONUS no ledger, nunca ADMIN, pois ADMIN nao existe no enum atual.

### 20.5. Handoff obrigatorio com falhas e riscos

Todo handoff deve registrar:

- o que foi corrigido
- o que quebrou durante a missao
- como foi diagnosticado
- quais comandos falharam
- quais comandos funcionaram
- quais comportamentos ficaram aceitos temporariamente
- quais pontos foram enviados ao backlog

-------------------------------------

-------------------------------------

## 21. HURBY_CONTEXT_UPDATE_20260512_ENVIRONMENT_AND_RELEASE_RULES

Status: REGRA OBRIGATORIA ADICIONADA
Data: 2026-05-12

### 21.1. Alerta critico de ambiente

Antes de qualquer comando remoto do Supabase CLI, verificar obrigatoriamente:

Get-Content "supabase\.temp\project-ref"

Comparar o resultado com o ambiente alvo.

Ambientes conhecidos:

LOCAL:
- http://127.0.0.1:54321

DEV Cloud:
- wcmbhgjcnhmitetsetpu

STAGING:
- mowkpcwsylogpxsnjfhd

E proibido executar comandos --linked sem essa verificacao.

Comandos bloqueados sem checagem previa:

- supabase db query --linked
- supabase db push
- supabase db reset --linked
- reload schema cache remoto
- validacoes remotas de banco

Motivo:

Foi identificado erro operacional em que o CLI estava linkado no DEV Cloud, enquanto o Vercel consumia o STAGING. Isso fez com que correcoes e validacoes fossem aplicadas no banco errado.

### 21.2. Regra atual de identidade e acesso

A arquitetura atual supersede a regra antiga baseada em user_type como controle principal.

Regra atual:

- users_profile e conta neutra
- primary_entry_flow indica fluxo/intencao inicial
- broker_profiles define acesso de corretor
- organizations e organization_memberships definem acesso de imobiliaria
- Owner atual e temporario de validacao
- acesso profissional nao deve depender apenas de campo simples em users_profile

Essa regra deve prevalecer em novas implementacoes.

### 21.3. Reload schema cache obrigatorio

Apos migration estrutural ou alteracao em tabela, coluna, view, RPC, funcao, enum, trigger ou RLS/policy consumida pela API REST, executar:

select pg_notify('pgrst', 'reload schema');

A etapa e obrigatoria antes de validar Vercel, Staging ou Producao.

### 21.4. Checklist minimo de release

Antes de considerar qualquer entrega concluida:

1. git status
2. revisar arquivos alterados
3. npm run build
4. supabase db reset local quando houver migration estrutural
5. verificar Project Ref antes de qualquer comando --linked
6. aplicar banco no ambiente cloud correto
7. reload schema cache
8. validar RPCs, funcoes e colunas criticas
9. aguardar Vercel Ready
10. testar fluxo real publicado

### 21.5. Handoff de mudanca critica

Toda mudanca critica deve registrar:

- o que mudou
- por que mudou
- impacto
- risco
- rollback
- validacao feita
- alerta ao proximo executor

### 21.6. Marco de estabilizacao

Foi criada a tag:

hurby-foundation-v1-auth-clients-properties-axe

Essa tag marca a foundation estabilizada envolvendo Auth, Clients, Properties, AXE e Owner temporario.
