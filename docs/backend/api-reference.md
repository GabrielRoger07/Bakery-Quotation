## Índice de recursos
- [Companies](#apiv1companies) — autenticação e gestão de empresas
- [Suppliers](#apiv1suppliers) — fornecedores vinculados a uma empresa
- [Products](#apiv1products) — produtos cadastrados pela empresa
- [Quotations](#apiv1quotations) — cotações (evento principal)
- [Contains](#apiv1contains) — produtos dentro de uma cotação
- [Participations](#apiv1participations) — convites de fornecedores a cotações
- [Bids](#apiv1bids) — lances dos fornecedores

#### `/api/v1/companies`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/register` | público | Criar empresa |
| POST | `/login` | público | Login empresa → retorna accessToken + refreshToken |
| GET | `/` | ADMIN | Listar todas as empresas |
| GET | `/{cnpj}` | ADMIN | Buscar empresa por CNPJ |
| PUT | `/{cnpj}` | ADMIN | Atualizar empresa |
| DELETE | `/{cnpj}` | ADMIN | Remover empresa |

#### `/api/v1/suppliers`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/` | COMPANY | Criar fornecedor |
| POST | `/login/{companyCnpj}` | público | Login fornecedor → retorna supplierAccessToken + refreshToken |
| GET | `/` | ADMIN | Listar todos |
| GET | `/{id}` | COMPANY | Buscar por ID |
| GET | `/company` | COMPANY | Listar fornecedores da empresa autenticada (paginado) |
| PUT | `/{id}` | COMPANY | Atualizar fornecedor |
| DELETE | `/{id}` | ADMIN | Remover fornecedor |

#### `/api/v1/products`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/` | COMPANY | Criar produto |
| GET | `/` | ADMIN | Listar todos |
| GET | `/{id}` | COMPANY | Buscar por ID |
| GET | `/company` | COMPANY | Listar produtos da empresa (paginado, com filtros) |
| PUT | `/{id}` | COMPANY | Atualizar produto |
| DELETE | `/{id}` | ADMIN | Remover produto |

#### `/api/v1/quotations`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/` | COMPANY | Criar cotação |
| GET | `/` | ADMIN | Listar todas |
| GET | `/{id}` | COMPANY/SUPPLIER | Buscar cotação por ID |
| GET | `/company` | COMPANY | Listar cotações da empresa (paginado) |
| GET | `/{id}/report` | COMPANY | Gerar relatório PDF da cotação |
| PUT | `/{id}` | COMPANY | Atualizar cotação |
| DELETE | `/{id}` | COMPANY | Remover cotação |

#### `/api/v1/contains`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/` | COMPANY | Adicionar produto à cotação |
| POST | `/batch` | COMPANY | Adicionar vários produtos (batch) |
| GET | `/` | ADMIN | Listar todos |
| GET | `/{quotationId}` | COMPANY/SUPPLIER | Listar produtos de uma cotação |
| GET | `/{quotationId}/{productId}` | COMPANY | Buscar item específico |
| PUT | `/batch` | COMPANY | Atualizar vários itens (batch) |
| DELETE | `/{quotationId}/{productId}` | COMPANY | Remover produto da cotação |

#### `/api/v1/participations`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/` | COMPANY | Convidar fornecedor |
| POST | `/batch` | COMPANY | Convidar vários fornecedores (batch) |
| GET | `/` | ADMIN | Listar todas |
| GET | `/{id}` | COMPANY/SUPPLIER | Buscar por ID |
| GET | `/quotations/{quotationId}` | COMPANY | Listar participações de uma cotação |
| GET | `/{quotationId}/{supplierId}` | COMPANY/SUPPLIER | Buscar participação específica |
| GET | `/supplier` | SUPPLIER | Listar cotações do fornecedor autenticado (paginado) |
| GET | `/{id}/report` | COMPANY | Gerar relatório PDF por fornecedor |
| PUT | `/batch` | COMPANY | Atualizar participações em batch |
| DELETE | `/{id}` | COMPANY | Remover participação |

#### `/api/v1/bids`
| Método | Path | Acesso | Descrição |
|---|---|---|---|
| POST | `/` | SUPPLIER | Enviar lance |
| POST | `/batch` | SUPPLIER | Enviar múltiplos lances (batch) |
| GET | `/` | ADMIN | Listar todos |
| GET | `/{participationId}/{productId}` | COMPANY/SUPPLIER | Buscar lance específico |
| GET | `/lowest?quotationId=&productId=` | COMPANY/SUPPLIER | Menor lance para produto/cotação |
| GET | `/quotations/{quotationId}` | COMPANY | Todos os lances de uma cotação |
| GET | `/participations/{participationId}` | COMPANY/SUPPLIER | Lances de uma participação |
| DELETE | `/{participationId}/{productId}` | SUPPLIER | Remover lance |

## Rotas públicas

`/api/v1/companies/login`, `/api/v1/companies/register`, `/api/v1/suppliers/login/**`, `/ws/**`