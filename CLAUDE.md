# Bakery Quotation

## Overview do Projeto
SaaS B2B para gestão de cotações de compra em empresas. Empresas criam cotações com produtos e convidam fornecedores para dar lances; Suporte a leilão reverso em tempo real (WebSocket/STOMP) e geração de relatórios PDF.

## Tecnologias
- **Frontend:** React 19 + Vite + Tailwind CSS v4 (via `@theme` no CSS); Fetch via `useFetch`
- **Backend:** Spring Boot 3.5.6 · Java 21 (REST)
- **DB:** MySQL 8.0 · Flyway para migrations → @docs/database/database-schema.md

## Autenticação
- **Empresa** `POST /api/v1/companies/login` → armazena `accessToken` em cookie `"accessToken"`.
- **Fornecedor** `POST /api/v1/suppliers/login/{companyCnpj}` → armazena `supplierAccessToken` em cookie `"supplierAccessToken"`.
- `useFetch` injeta `Authorization: Bearer {token}` em toda requisição; backend nunca lê cookies.
- Token inválido/expirado retorna 403 → `useFetch` remove o cookie e redireciona para o login.

> Detalhes de expiração, refresh e auth WebSocket: @docs/architecture.md

## Comandos Chave
Frontend (pasta /frontend):
- `npm run dev`     # dev server na porta 3000
- `npm run build`   # build de produção
- `npm run lint`    # ESLint

Backend (pasta /backend):
- `./mvnw spring-boot:run`              # sobe o servidor local (perfil dev)
- `./mvnw clean package -DskipTests`    # gera o JAR

Docker (raiz do projeto)
- `docker-compose up`                       # stack completa (perfil prod)
- `docker-compose -f docker-compose.yml -f docker-compose.override.yml up`  # dev (porta MySQL 3307)

## Documentação
- Arquitetura, fluxos e componentes: @docs/architecture.md
- Endpoints da API: @docs/backend/api-reference.md
- Schema do banco: @docs/database/database-schema.md

## Ressalvas do projeto
- **Dois papéis de usuário com auth separada:** empresa usa `accessToken`; fornecedor usa `supplierAccessToken`. Os dois contextos nunca se misturam — rotas, cookies e navbars são completamente distintos.
- **Datas são `Instant` (UTC) em toda a fronteira backend/frontend** — o backend persiste e trafega `Instant`; o frontend exibe via `formatDateTime`. Nunca converter no backend para exibição.
- **Leilão reverso em tempo real via WebSocket** — cotações do tipo leilão usam STOMP/SockJS; alterações de preço são pushed, não polled.