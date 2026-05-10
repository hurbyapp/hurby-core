# HURBY — MIGRATION ARCHIVE

Esta pasta contém migrations arquivadas por motivo histórico, técnico ou arquitetural.

As migrations arquivadas aqui NÃO fazem parte do fluxo ativo de banco.

Fluxo ativo:
- /supabase/migrations/

Regras:
- não executar arquivos desta pasta sem nova auditoria
- não mover arquivos daqui de volta para /supabase/migrations sem validação técnica
- não usar como referência canônica se houver migration ativa substituta
- consultar apenas para entender histórico, decisões anteriores e modelos descartados

Motivo do arquivamento:
Algumas migrations foram removidas do fluxo ativo após o realinhamento do core imobiliário operacional, porque representavam modelos antigos, incompletos ou incompatíveis com a nova arquitetura baseada em:

- profile
- portfolio
- portfolio_item
- property_asset
- property_listing
- operational_origin
- contexto operacional

A existência deste arquivo evita que futuros executores confundam migrations arquivadas com migrations ativas.
