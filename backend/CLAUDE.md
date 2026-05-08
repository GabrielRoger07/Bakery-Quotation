# Backend

Spring Boot 3.5.6 · Java 21 · MySQL 8.0 · Flyway · OpenPDF

## Ressalvas

- **Dois perfis Spring:** `dev` (Flyway `update`, DDL automático) e `prod` (Flyway `validate`, schema deve existir). Docker usa `prod` por padrão; `docker-compose.override.yml` usa `dev`.
- **CORS via env:** `CORS_ALLOWED_ORIGINS` aceita múltiplas origens separadas por vírgula. Aplica-se apenas a `/api/**`.
- **WebSocket público:** `/ws/**` não exige autenticação — segurança de negócio está na lógica de participação, não no handshake.
- **`useSSL=false&allowPublicKeyRetrieval=true`** na URL do banco — configuração de dev; ajustar em produção real.
- **PDF usa OpenPDF v1.3.43** — não migrar para iText sem checar licença AGPL.
- **Variáveis de ambiente obrigatórias:** `MYSQL_ROOT_PASSWORD`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`. Ver `.env.example` na raíz

## Estrutura de pacotes

Domain Driven Development - Cada entidade de negócio tem seu próprio pacote com `Controller`, `Service`, `Repository` e `Entity`:
`company`, `product`, `supplier`, `quotation`, `participation`, `bid`, `contain`
Configurações em `config/`: `WebConfig` (CORS), `SecurityConfig` (JWT filter), `TokenConfig`, `AuthConfig`, `WebSocketConfig`.

## Schema do banco

@docs/database/database-schema.md