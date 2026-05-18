# HURBY — REGISTRO ARQUITETURAL PIPELINE PRO V1

Status: frontend foundation validada e commitada  
Commit de referência: e6ed4d3 feat: evolve pipeline pro operational workflow  
Natureza: registro de produto, UX operacional e diretriz para futura integração backend

---

## 1. Decisão central

O Pipeline Pro não é ficha.

Ele é uma esteira operacional profissional para transformar uma captação, anúncio básico ou anúncio placeholder em operação imobiliária estruturada.

A lógica antiga de "Ficha Profissional" deve deixar de ser experiência principal.

O novo modelo separa:

- Pipeline Operacional
- Pipeline de Inteligência
- Publicação / Anúncio Distribuível
- Dossiê / Checkup consolidado

---

## 2. Camadas do produto

### 2.1 Pipeline Operacional

Coleta e organiza dados.

Inclui:
- atendimento/captação;
- levantamento patrimonial;
- diagnóstico e risco;
- proprietário;
- documentação;
- fotos/evidências;
- geografia/entorno;
- pesquisa de mercado;
- dados financeiros;
- valor venal declarado no IPTU;
- perfil do proprietário.

### 2.2 Pipeline de Inteligência

Não é uma etapa comum do começo.

É o cérebro que interpreta os dados entregues pelos pipelines operacionais.

Inclui:
- leitura consolidada;
- pontuação do patrimônio;
- sugestão de preço;
- agressividade comercial;
- posicionamento;
- público-alvo;
- estratégia de distribuição;
- narrativa;
- proposta profissional.

A inteligência só deve ativar quando houver maturidade mínima, por exemplo 60% nos módulos essenciais, ou quando módulos forem encerrados com justificativa de impossibilidade.

### 2.3 Proposta e Aprovação

Transforma inteligência em proposta para proprietário ou aprovação interna.

Inclui:
- resumo executivo;
- preço recomendado;
- plano de comercialização;
- aprovação interna;
- retorno do proprietário;
- acoplagem futura com contratos.

O proprietário não acessa o pipeline interno. Ele recebe apenas proposta/apresentação adequada.

### 2.4 Publicação / Anúncio Distribuível

É camada independente.

Não analisa. Não pensa estratégia. Executa a estratégia aprovada.

Inclui:
- título público;
- descrição;
- preço aprovado;
- fotos públicas;
- tags;
- splashes;
- canais;
- marketplace;
- página profissional;
- redes;
- parceiros;
- portais externos futuros.

### 2.5 Acompanhamento e Lifecycle

Representa continuidade pós-publicação.

Inclui:
- leads futuros;
- visitas;
- propostas recebidas;
- ajustes de anúncio;
- contratos futuros;
- encerramento;
- histórico no dossiê;
- governança.

---

## 3. Anúncio Placeholder

O Anúncio Placeholder é o item operacional provisório que aparece antes do anúncio público final.

Função:
- manter o imóvel no radar;
- indicar captação em andamento;
- criar expectativa operacional;
- permitir acesso ao Pipeline Pro;
- evitar que a lista de imóveis vire lista detalhada do pipeline.

Exemplo:
- Nome interno: Florais - Hélio
- Título público: ainda não definido
- Status: placeholder em construção
- Publicação: não publicado

Nome interno é para operação/equipe.  
Título público é para venda/publicação.

---

## 4. Acoplar Pipeline Pro a anúncio existente

Nem todo anúncio nasce pelo Pipeline Pro.

Cenários aceitos:

### Cenário A
Corretor recebe captação  
→ inicia Pipeline Pro  
→ nasce Anúncio Placeholder  
→ evolui até publicação.

### Cenário B
Anúncio básico já existe  
→ corretor acopla Pipeline Pro  
→ anúncio é profissionalizado.

### Cenário C
Anúncio já está publicado e performando mal  
→ corretor acopla Pipeline Pro  
→ revisa preço, fotos, narrativa, estratégia e distribuição.

Na lista de imóveis, o antigo botão "Ficha Profissional" deve ser considerado legado.

Novo conceito:
- Acoplar Pipeline Pro

Esse botão deve conduzir o anúncio existente para o Pipeline Pro em modo attach, preservando listingId/contexto.

Exemplo conceitual:
`/operations/pipeline/atendimento?listingId=<id>&mode=attach`

---

## 5. Lista de imóveis/anúncios

A lista de imóveis não deve repetir o Pipeline Pro.

Ela deve funcionar como carteira operacional.

Papéis dos botões:

### Abrir Checkup / Dossiê
Abre avaliação geral da qualidade do anúncio/imóvel.

Deve consolidar:
- dados estruturais;
- cliente vinculado;
- portfólio;
- anúncio chaveado;
- qualidade técnica das fotos;
- histórico;
- vínculo com cliente;
- se for Anúncio Pro: resumo executivo, estratégia, indicadores de levantamento, documentação e dados do Pipeline Pro.

### Editar anúncio
Continua sendo edição do anúncio público/profissional.

Serve para:
- descrição;
- fotos;
- preço;
- dados publicáveis;
- distribuição;
- parcerias;
- balcão de negócios;
- turbinamento com Axé;
- indexação;
- redes sociais.

Não deve virar Pipeline Pro.

### Acoplar Pipeline Pro
Substitui a antiga ficha profissional.

Serve para iniciar ou conectar um anúncio existente à jornada profissional.

---

## 6. Governança operacional

O Pipeline Pro deve prever responsabilidade por módulo, não apenas por anúncio.

### Responsável principal
Pode ser:
- corretor designado pelo atendimento;
- corretor do rodízio interno;
- corretor que captou diretamente.

Ele conduz o fluxo.

### Responsável por módulo
Pode ser:
- suporte documental;
- administrativo;
- coordenador;
- especialista em condomínio;
- vistoriador;
- outro corretor convidado.

Cada responsável edita apenas seu módulo.

### Supervisão
Podem consultar e cobrar, conforme papel:
- dono da imobiliária;
- sócio;
- coordenador;
- secretaria;
- administrativo autorizado.

### Participantes convidados
Podem visualizar o todo e contribuir no escopo autorizado.

### Corretores externos ao processo
Não acessam pipeline confidencial.

Veem apenas:
- Anúncio Placeholder;
- sinais mínimos;
- informações públicas/operacionais liberadas.

### Proprietário
Não acessa processo interno.

Recebe apenas proposta/apresentação final.

---

## 7. Prazos e urgência

O controle operacional nasce quando o atendimento registra o processo, designa responsável ou agenda vistoria.

Não necessariamente começa na primeira ligação.

Regras conceituais:
- corretor designado pode aceitar, recusar ou renegociar horário;
- se recusar, processo pode ir para próximo profissional do rodízio;
- se reagendar, prazo recalcula a partir do novo horário;
- levantamento patrimonial pode ter SLA de até 12h após vistoria;
- atendimento/captação pode ter 24h para movimentar;
- etapas podem ter contadores e sinalização de urgência.

---

## 8. Progresso, autosave e não se aplica

O preenchimento deve ser flexível.

Regras:
- módulos podem ser preenchidos fora de ordem;
- autosave futuro deve permitir uso em campo, celular ou escritório;
- campos irrelevantes devem ter opção "não se aplica";
- "não se aplica" não deve prejudicar progresso;
- módulo pode ser encerrado por impossibilidade justificada;
- conclusão parcial justificada não deve travar o fluxo;
- inteligência só deve liberar com maturidade mínima ou encerramento formal dos essenciais.

---

## 9. Levantamentos automáticos Hurby

No Diagnóstico/Risco ou em módulo acoplado à Inteligência Estratégica, prever motores automáticos.

Possibilidades futuras:
- média interna do ecossistema Hurby;
- média externa via OLX, ZAP, Viva Real e outros portais quando integrados;
- média do portfólio da agência;
- média do portfólio do corretor;
- tempo médio de vida de anúncios por perfil/faixa de preço;
- indicadores de liquidez;
- indicadores de agressividade de preço;
- ferramentas internas de pesquisa de mercado;
- automações/motores de coleta e comparação.

---

## 10. Comissão e rateio

Não implementar percentuais agora.

A visão futura é que participação em captação, venda, módulos ou colaboração possa afetar rateio.

Mas isso pertence a módulos futuros:
- configuração da agência;
- comissão;
- contratos;
- financeiro;
- regras comerciais.

O Pipeline Pro deve apenas prever acoplagem futura.

---

## 11. Estado atual implementado

Rotas criadas/evoluídas:

- `/operations/pipeline`
- `/operations/pipeline/[step]`
- `/operations/pipeline/atendimento`
- `/operations/pipeline/levantamento`
- `/operations/pipeline/diagnostico`
- `/operations/pipeline/estrategia`
- `/operations/pipeline/proposta`
- `/operations/pipeline/publicacao`
- `/operations/pipeline/acompanhamento`

Páginas tocadas:

- `src/app/broker/page.tsx`
- `src/app/operations/pipeline/page.tsx`
- `src/app/operations/pipeline/[step]/page.tsx`
- `src/app/operations/properties/list/page.tsx`

Arquivo auxiliar criado:
- `ui-component-glossary.html`

---

## 12. O que ainda não existe

Ainda não existe:

- backend do Pipeline Pro;
- tabela própria de pipeline;
- progresso real salvo;
- Anúncio Placeholder real no banco;
- integração real com listingId;
- autosave;
- permissões reais por módulo;
- cálculo real de prazos;
- bloqueio/liberação real de etapas;
- inteligência automática;
- proposta gerada;
- publicação parametrizada real;
- integração com Leads, Contratos, Comunicador, Financeiro ou Comissão.

---

## 13. Diretriz para próxima fase

Antes de conectar backend:

1. Mapear schema atual de properties/listings/assets.
2. Mapear services existentes.
3. Mapear relacionamento com clients.
4. Verificar RLS.
5. Decidir se Pipeline Pro terá tabela própria ou se começa com metadata controlado.
6. Evitar duplicar anúncio.
7. Preservar separação:
   - anúncio básico;
   - anúncio profissional;
   - placeholder;
   - pipeline;
   - dossiê;
   - publicação.
8. Não criar migration sem auditoria.
9. Não conectar salvamento real antes de revisar contrato de dados.

---

## 14. Diretriz para Codex

Codex pode:
- corrigir acentuação;
- refinar layout;
- melhorar responsividade;
- organizar componentes;
- melhorar microcopy;
- melhorar visual dos cards, badges, botões e painéis.

Codex não deve:
- criar migration;
- alterar schema;
- alterar RLS;
- alterar RPC;
- alterar services;
- alterar contrato de dados;
- transformar Pipeline Pro em ficha longa;
- remover notas de orientação;
- misturar Dossiê, Pipeline, Análise e Publicação como se fossem a mesma coisa.

---
