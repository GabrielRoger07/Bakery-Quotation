# Bakery Quotation — Guia para o Claude

## Project Overview
SaaS B2B para gestão de cotações de compra em empresas. Empresas criam cotações com produtos e convidam fornecedores para dar lances; Suporte a leilão reverso em tempo real (WebSocket/STOMP) e geração de relatórios PDF.

## Stack
- **Frontend:** React 19 + Vite + Tailwind CSS v4 (via `@theme` no CSS)
- **Backend:** Spring Boot 3.5.6 · Java 21 (REST). Fetch via `useFetch`.
- **Autenticação:** JWT em cookie (`accessToken` para empresa, `supplierAccessToken` para fornecedor)
- **DB:** MySQL 8.0 · Flyway para migrations → @docs/database-schema.md

## Key Commands
Frontend (pasta /frontend):
- `npm run dev`     # dev server na porta 3000
- `npm run build`   # build de produção
- `npm run lint`    # ESLint

Frontend (pasta /frontend):
- `./mvnw spring-boot:run`              # sobe o servidor local (perfil dev)
- `./mvnw clean package -DskipTests`    # gera o JAR

Docker (raiz do projeto)
- `docker-compose up`                       # stack completa (perfil prod)
- `docker-compose -f docker-compose.yml -f docker-compose.override.yml up`  # dev (porta MySQL 3307)

## Ressalvas do projeto
- **Dois papéis de usuário com auth separada:** empresa usa `accessToken`; fornecedor usa `supplierAccessToken`. Os dois contextos nunca se misturam — rotas, cookies e navbars são completamente distintos.
- **Datas são `Instant` (UTC) em toda a fronteira backend/frontend** — o backend persiste e trafega `Instant`; o frontend exibe via `formatDateTime`. Nunca converter no backend para exibição.
- **Leilão reverso em tempo real via WebSocket** — cotações do tipo leilão usam STOMP/SockJS; alterações de preço são pushed, não polled.