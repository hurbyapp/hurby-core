# HURBY PROTOCOL
Versão: 1.1  
Status: Ativo  

-------------------------------------

## 1. OBJETIVO

Este protocolo define COMO o projeto Hurby deve ser desenvolvido, garantindo:

- consistência técnica  
- segurança do sistema  
- ausência de regressões  
- controle de qualidade  
- continuidade entre execuções  

Este documento NÃO contém regras de negócio específicas nem estrutura de páginas.

-------------------------------------

## 2. PRINCÍPIOS FUNDAMENTAIS

1. Backend é a fonte da verdade  
2. Frontend NÃO contém lógica crítica  
3. Toda operação sensível deve ser validada no backend  
4. Sistema deve evoluir sem quebrar o que já funciona  
5. Nenhuma evolução com dívida técnica ativa  
6. Segurança e rastreabilidade são obrigatórias (LGPD / Auditoria)  

-------------------------------------

## 3. REGRAS INEGOCIÁVEIS

- NÃO alterar lógica financeira no frontend  
- NÃO inserir diretamente em tabelas críticas (ex: credit_transactions)  
- SEMPRE usar funções seguras para operações críticas (RPC)  
- NÃO modificar estrutura existente sem validação  
- NÃO prosseguir com erro ou inconsistência  
- NÃO remover código existente sem autorização explícita  
- NÃO causar regressão funcional ou estrutural  

Se houver dúvida:  
→ PARAR execução  
→ validar antes de continuar  

-------------------------------------

## 4. FLUXO DE EXECUÇÃO PADRÃO

Toda tarefa deve seguir:

1. Executor implementa  
2. Executor gera RELATÓRIO DE ETAPA  
3. Usuário valida  
4. Auditoria externa (Gemini)  
5. Correções (se necessário)  
6. Atualização de CONTEXTO  
7. Avança para próxima etapa  

Nenhuma etapa é considerada concluída sem esse ciclo completo.

-------------------------------------

## 5. DEFINIÇÃO DE TAREFA CONCLUÍDA (DoD)

Uma tarefa só é considerada concluída quando:

- Código está funcional  
- Não há erros ou inconsistências  
- Não há dívida técnica  
- Contexto atualizado (quando aplicável)  
- Fluxo validado  
- Auditoria concluída (quando necessário)  
- Não há regressão  

-------------------------------------

## 6. GESTÃO DE CONTEXTO

O sistema utiliza CONTEXTO como memória estruturada.

### Tipos de contexto:

- Contexto Global → arquitetura e regras do sistema  
- Contexto de Página → comportamento específico  

### Regras:

- Contexto deve refletir o estado real do sistema  
- Atualizar contexto após mudanças relevantes  
- NÃO misturar contexto com protocolo  

-------------------------------------

## 7. USO DE HANDOFF

Handoff é utilizado para:

- transferência entre chats  
- continuidade de execução  

Deve conter:

- resumo do que foi feito  
- estado atual real  
- arquitetura atual  
- decisões tomadas  
- pendências técnicas  
- próximos passos  
- pontos de atenção  

Handoff NÃO é documentação do sistema.

-------------------------------------

## 8. PADRÃO DE INTERAÇÃO COM EXECUTOR

O executor deve:

- sempre fornecer código COMPLETO (não fragmentado)  
- evitar explicações desnecessárias  
- priorizar clareza e execução direta  
- respeitar estrutura já existente  
- NÃO remover ou quebrar código sem validação  
- incluir CHANGELOG no topo de todo código  
- incluir OBSERVAÇÕES TÉCNICAS quando necessário  

-------------------------------------

## 9. PADRÃO DE EXECUÇÃO DE COMANDOS

Quando houver comandos:

- fornecer em blocos separados  
- um comando por bloco  
- sem texto desnecessário entre blocos  
- sequência pronta para execução  
- sempre contextualizar o que será feito antes  

-------------------------------------

## 10. CONTROLE DE RISCO

Antes de qualquer alteração:

- avaliar impacto  
- identificar dependências  
- verificar risco de quebra  
- validar se existe regressão potencial  

Se houver risco:

→ validar antes de executar  

-------------------------------------

## 11. AMBIENTES

- HURBY-DEV → ambiente de desenvolvimento  
- HURBY-PROD → ambiente de produção  

Regras:

- DEV é o único ambiente de alteração ativa  
- PROD nunca é ambiente de teste  
- PROD não deve sofrer alterações manuais  
- toda alteração deve vir de migrations  

-------------------------------------

## 12. BANCO DE DADOS E MIGRATIONS

- É PROIBIDO criar tabelas manualmente no painel  
- Toda alteração deve ser via migration  
- O banco deve ser reconstruível via CLI  
- Estrutura deve ser idêntica entre DEV e PROD  

-------------------------------------

## 13. SEGURANÇA E LGPD (OBRIGATÓRIO)

- Dados sensíveis NÃO ficam no schema público  
- Separação obrigatória:
  - public → dados operacionais
  - private → dados sensíveis
  - audit → logs

- RLS obrigatório em tabelas sensíveis  
- Nunca expor dados sensíveis diretamente ao frontend  

-------------------------------------

## 14. AUTENTICAÇÃO E ACESSO

- Middleware é a camada oficial de segurança  
- Frontend NÃO é responsável por proteger rotas  
- Controle por user_type é obrigatório  
- Bloqueio deve ocorrer antes da renderização  

-------------------------------------

## 15. AUDITORIA (GEMINI)

Deve ser utilizada quando:

- conclusão de etapas críticas  
- mudanças estruturais  
- implementação de segurança  
- dúvidas relevantes  

Objetivo:

- evitar dívida técnica  
- validar direção  
- garantir consistência  

-------------------------------------

## 16. REGRA DE OURO

Sempre perguntar:

→ Isso é PROTOCOLO?  
→ Isso é CONTEXTO?  
→ Isso é EXECUÇÃO?  

Nunca misturar responsabilidades.

-------------------------------------

## 17. VIOLAÇÃO DE PROTOCOLO

Se qualquer regra for violada:

- interromper execução  
- corrigir imediatamente  
- revalidar antes de continuar  

-------------------------------------

## 18. EVOLUÇÃO DO PROTOCOLO

Este protocolo só deve ser alterado quando houver:

- mudança de processo  
- melhoria estrutural  
- necessidade comprovada  

-------------------------------------

## 19. DÍVIDAS TÉCNICAS PLANEJADAS

Registrar obrigatoriamente:

- decisões adiadas (ex: estrutura de rotas /dashboard vs /broker/dashboard)
- mudanças estruturais futuras
- riscos controlados

Essas dívidas NÃO podem ser esquecidas.

-------------------------------------