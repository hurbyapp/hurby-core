# HURBY — GLOBAL DEFINITIONS

-------------------------------------
## 📌 VISÃO DO PRODUTO

HURBY é um ecossistema imobiliário com economia interna,
baseado em performance, prioridade e competição entre corretores.

O sistema organiza:
- geração de leads
- atendimento
- gestão de imóveis
- monetização por ação

-------------------------------------
## 💰 ECONOMIA INTERNA

### Moeda

Nome interno: AXE  
Símbolo: ⓐ  

AXE é utilizada para:

- desbloqueio de leads
- impulsionamentos (futuro)
- ações premium
- assinatura

---

### Tipos de crédito

- PAID → comprado com dinheiro real
- BONUS → concedido pela plataforma (expira)
- REWARD → ganho por ação (futuro)
- TRANSFER → recebido de outro usuário

---

### Regras

- consumo prioriza BONUS → depois PAID
- BONUS pode expirar
- PAID não expira
- saldo nunca pode ser negativo
- toda movimentação passa pelo ledger

---

### Ledger

Tabela: wallet_ledger  
Função: fonte da verdade financeira  

Nenhuma operação financeira ocorre fora do ledger.

-------------------------------------
## 🔓 MONETIZAÇÃO

### Unlock de Lead

- custo: 40 AXE
- exclusividade: 24 horas
- apenas 1 corretor por vez
- após expiração, novo corretor pode desbloquear
- quem já desbloqueou mantém acesso

---

### Conceito

"Exclusividade temporária por prioridade"

Quem chega primeiro, atende primeiro.

---

### Funções

- unlock_lead
- get_lead_status

---

### Objetivo do modelo

- gerar urgência
- criar escassez
- estimular frequência
- gerar consumo recorrente

-------------------------------------
## 🧠 LEADS

Lead = oportunidade comercial

Um lead pode:

- pertencer a um imóvel
- ser exibido para múltiplos corretores
- ser desbloqueado mediante pagamento
- possuir status (futuro)

---

### Estados

- available
- locked
- unlocked

---

### Origem

- portal (Cadê Negócio)
- canais do corretor (futuro)

-------------------------------------
## 🏠 PROPERTIES (IMÓVEIS)

Property = ativo do corretor

Função principal:
→ gerar leads

---

### Estrutura mínima

- id
- owner_id
- title
- price
- status
- created_at
- updated_at

---

### Status

- active → disponível
- inactive → pausado
- negotiating → em negociação
- sold → finalizado

---

### Relação

1 property → N leads

-------------------------------------
## 👤 USERS

Auth: auth.users  
Profile: users_profile  

---

### Tipos

- broker → corretor
- agency → imobiliária (futuro)
- owner → administrador da plataforma

---

### Regras

- nunca criar profile sem auth.user
- user_id é a chave central do sistema

-------------------------------------
## 🔐 SEGURANÇA

RLS ativo nas tabelas críticas:

- wallet_ledger
- wallet_balance
- user_subscription
- users_profile
- leads
- properties

---

### Regras

- usuário só acessa seus dados
- operações financeiras só via função
- insert direto proibido

-------------------------------------
## 🧩 ESTRUTURA DO SISTEMA

Frontend (futuro):

/broker
  /properties
  /leads
  /clients
  /marketplace

---

### Fluxo principal

login  
→ /broker  
→ properties  
→ property detail  
→ leads  
→ unlock  

-------------------------------------
## ⚙️ PRINCÍPIOS DE PRODUTO

- não construir antes de validar
- tudo deve gerar valor ou receita
- simplicidade > complexidade
- comportamento > funcionalidade
- dados antes de opinião

-------------------------------------
## 🚫 NÃO FAZER (AGORA)

- CRM completo
- automações pesadas
- IA avançada
- contratos complexos
- dashboards sofisticados

-------------------------------------
## 🎯 FOCO ATUAL

- core de corretores (broker)
- monetização de leads
- core de properties
- validação com usuários reais

-------------------------------------
## ⚠️ REGRA CRÍTICA

O sistema não pode sofrer regressão.

Tudo que envolve:

- ledger
- saldo
- consumo de AXE
- unlock de leads
- RLS

é considerado:

→ núcleo estável e protegido

Qualquer alteração deve ser validada antes.

-------------------------------------