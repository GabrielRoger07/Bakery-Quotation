# Bakery Quotation

## Overview do Projeto
SaaS B2B para gestão de cotações de compra em empresas. Empresas criam cotações com produtos e convidam fornecedores para dar lances; Suporte a leilão reverso em tempo real (WebSocket/STOMP) e geração de relatórios PDF.

## Tecnologias
- **Frontend:** React 19 + Vite + Tailwind CSS v4 (via `@theme` no CSS)
- **Backend:** Spring Boot 3.5.6 · Java 21 (REST). Fetch via `useFetch`.
- **DB:** MySQL 8.0 · Flyway para migrations → @docs/database-schema.md

## Autenticação
- **Empresa** `POST /api/v1/companies/login` (email + senha) → retorna `accessToken` + `refreshToken` no body; o frontend armazena `accessToken` em cookie (`secure`, `sameSite: Strict`).
- **Fornecedor** `POST /api/v1/suppliers/login/{companyCnpj}` (whatsapp + senha) → retorna `accessToken` + `refreshToken`; frontend armazena `supplierAccessToken` e `supplierCompanyCnpj` em cookies.
- Senhas de fornecedor são geradas automaticamente (8 chars) no cadastro.
- O frontend envia `Authorization: Bearer {token}` em toda requisição via `useFetch`; o backend nunca lê cookies diretamente.
- Token inválido/expirado retorna 403 → `useFetch` remove o cookie e redireciona para o login.
- `PrivateRoute` valida a expiração do JWT no frontend (via `jwtDecode`) antes de renderizar rotas protegidas.
- Expiração: empresa access=24h / refresh=7d · fornecedor access=2h / refresh=4h. Ainda não há endpoint de refresh implementado.
- WebSocket (STOMP) autentica via `connectHeaders` com o mesmo Bearer token; usa `accessToken` fixo (não o contexto do `useFetch`).

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

## Ressalvas do projeto
- **Dois papéis de usuário com auth separada:** empresa usa `accessToken`; fornecedor usa `supplierAccessToken`. Os dois contextos nunca se misturam — rotas, cookies e navbars são completamente distintos.
- **Datas são `Instant` (UTC) em toda a fronteira backend/frontend** — o backend persiste e trafega `Instant`; o frontend exibe via `formatDateTime`. Nunca converter no backend para exibição.
- **Leilão reverso em tempo real via WebSocket** — cotações do tipo leilão usam STOMP/SockJS; alterações de preço são pushed, não polled.