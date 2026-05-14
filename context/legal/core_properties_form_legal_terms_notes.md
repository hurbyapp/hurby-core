# HURBY — NOTAS JURIDICAS DO CORE_PROPERTIES_FORM_V1

Status: Documento juridico de apoio
Core: CORE_PROPERTIES_FORM_V1
Produto: Anuncio de imovel + Ficha Profissional de Captacao e Avaliacao

-------------------------------------

## 1. Separacao juridica dos fluxos

O fluxo de anuncio e o fluxo de ficha profissional devem ser tratados juridicamente como objetos diferentes.

ANUNCIO:
- peca comercial/publicitaria
- pode ser exibido publicamente
- pode conter fotos publicas
- pode ser indexado em buscadores quando configurado para publicacao
- pode gerar leads e contatos comerciais

FICHA PROFISSIONAL:
- documento tecnico/profissional interno
- nao e anuncio publico
- nao deve ser indexado
- nao deve ser exibido no marketplace
- nao deve ser exposto a parceiros sem filtro
- contem dados sensiveis, avaliacao, estrategia, documentos, entrevista e observacoes privadas

-------------------------------------

## 2. Dados pessoais e LGPD

A ficha profissional pode tratar dados pessoais do proprietario/fornecedor do imovel, incluindo:

- nome
- CPF/CNPJ
- telefone
- WhatsApp
- email
- relacionamento com o imovel
- observacoes de captacao
- preferencias, restricoes ou condicoes comerciais
- informacoes documentais, financeiras ou juridicas relacionadas ao imovel

Finalidade do tratamento:

- identificar o proprietario/fornecedor
- evitar duplicidade cadastral
- vincular o imovel ao cliente correto
- permitir acompanhamento profissional
- gerar historico operacional
- apoiar negociacao, avaliacao, revisao, contrato e eventual defesa juridica

Regra:
CPF/CNPJ deve ser obrigatorio para criacao da ficha profissional, pois a ficha precisa ter lastro de proprietario/fornecedor.

-------------------------------------

## 3. Fotos publicas x fotos tecnicas

Fotos publicas do anuncio:
- pertencem ao fluxo comercial do anuncio
- podem aparecer publicamente
- podem ser usadas em SEO/indexacao
- podem aparecer em marketplace, pagina profissional ou campanhas

Fotos tecnicas da ficha:
- pertencem ao fluxo tecnico/privado
- nao devem ser publicas
- nao devem ser indexadas
- nao devem aparecer para parceiros, publico ou marketplace
- podem conter problemas estruturais, medidores, documentos, chaves, vistorias, acesso, deterioracao ou evidencias tecnicas

Backlog tecnico:
Criar futuramente estrutura separada `property_assessment_media`.

-------------------------------------

## 4. Visibilidade e compartilhamento

A ficha completa deve ficar restrita ao profissional/imobiliaria autorizada.

O proprietario pode ver apenas resumo controlado, quando permitido.
Parceiros podem ver apenas resumo comercial controlado, quando permitido.

Nao expor para parceiros:
- numero exato do imovel
- CPF/CNPJ do proprietario
- telefone
- email
- documentos
- notas privadas
- estrategia interna
- fotos tecnicas
- informacoes sensiveis

Regra comercial de protecao:
Mesmo em contexto de parceria, o endereco exato/numero residencial deve ser ocultado por padrao para reduzir risco de abordagem direta indevida.

-------------------------------------

## 5. Revisao e responsabilidade profissional

Fluxo recomendado:

- draft
- submitted_for_review
- needs_review
- approved
- rejected
- archived

Observacao:
A linguagem voltada ao usuario deve usar "precisa de revisao", nao "precisa de correcao".

Quando o corretor for vinculado a uma imobiliaria/agencia, a ficha pode depender de revisao administrativa.
Quando o corretor for independente, pode ter autonomia maior, mas com registro e rastreabilidade.

-------------------------------------

## 6. Monetizacao

A ficha profissional e um produto adicional do ambiente profissional.

Pode ser:
- teste gratuito
- cobrada por Axe
- vendida avulsa
- vendida em pacote
- incluida em assinatura

Limite de fotos do anuncio:
- ate 22 fotos como limite base
- acima disso, futura monetizacao por pacote, Axe ou assinatura

-------------------------------------

## 7. Termos e subtermos futuros

O juridico deve prever subtermos para:

- anuncio publico de imovel
- ficha profissional de avaliacao
- uso de fotos publicas
- uso de fotos tecnicas
- compartilhamento entre profissionais
- acesso do proprietario ao painel Meu Imovel
- transferencia de anuncio do Marketplace para profissional
- uso de IA/moderacao em descricao, avaliacao e resumo
- retencao de historico para auditoria, seguranca e defesa juridica

Este documento nao substitui termo juridico final.
Ele orienta a construcao dos termos e subtermos oficiais do ecossistema Hurby.
