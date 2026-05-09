# Database Schema

MySQL 8.0 · Flyway migrations em `backend/src/main/resources/db/migration/`
ERD visual em `docs/database/Entity-Relationship_Diagram.png` · Lógico em `docs/database/Logical_Data_Diagram.png`

## Tabelas

### `company`
| Coluna | Tipo | Restrições |
|---|---|---|
| `companyCnpj` | VARCHAR(14) | PK, NOT NULL |
| `companyName` | VARCHAR(80) | NOT NULL |
| `companyEmail` | VARCHAR(60) | NOT NULL, UK (`company_email_uk`) |
| `companyWhatsappNumber` | VARCHAR(16) | NOT NULL, UK (`company_whatsapp_uk`) |
| `companyPassword` | VARCHAR(255) | NOT NULL |
| `createdAt` | DATETIME | NOT NULL |
| `role` | ENUM('ADMIN', 'COMPANY') | NOT NULL — `USER` renomeado para `COMPANY` na V5 |

### `product`
| Coluna | Tipo | Restrições |
|---|---|---|
| `productId` | BIGINT | PK, AUTO_INCREMENT |
| `productName` | VARCHAR(60) | NOT NULL |
| `productBarCodeNumber` | VARCHAR(13) | NOT NULL |
| `productDescription` | VARCHAR(255) | nullable — adicionado na V7 |
| `companyCnpj` | VARCHAR(14) | NOT NULL, FK → `company.companyCnpj` |

### `supplier`
| Coluna | Tipo | Restrições |
|---|---|---|
| `supplierId` | BIGINT | PK, AUTO_INCREMENT |
| `supplierName` | VARCHAR(30) | NOT NULL |
| `supplierEmail` | VARCHAR(60) | nullable, UK composta (`companyCnpj`, `supplierEmail`) |
| `supplierWhatsappNumber` | VARCHAR(16) | NOT NULL, UK composta (`companyCnpj`, `supplierWhatsappNumber`) |
| `supplierPassword` | VARCHAR(255) | NOT NULL — adicionado na V4 |
| `employerName` | VARCHAR(65) | NOT NULL |
| `employerCnpj` | VARCHAR(14) | NOT NULL |
| `createdAt` | DATETIME | NOT NULL |
| `companyCnpj` | VARCHAR(14) | NOT NULL, FK → `company.companyCnpj` |
> UKs compostas garantem unicidade por empresa, não globalmente.

### `quotation`
| Coluna | Tipo | Restrições |
|---|---|---|
| `quotationId` | BIGINT | PK, AUTO_INCREMENT |
| `quotationStart` | DATETIME | NOT NULL |
| `quotationEnd` | DATETIME | NOT NULL |
| `createdAt` | DATETIME | NOT NULL |
| `isAuction` | BOOLEAN | NOT NULL, DEFAULT false — adicionado na V2 |
| `companyCnpj` | VARCHAR(14) | NOT NULL, FK → `company.companyCnpj` |

### `participation`
| Coluna | Tipo | Restrições |
|---|---|---|
| `participationId` | BIGINT | PK, AUTO_INCREMENT |
| `supplierId` | BIGINT | NOT NULL, FK → `supplier.supplierId` |
| `quotationId` | BIGINT | NOT NULL, FK → `quotation.quotationId` |
> UK composta (`supplierId`, `quotationId`) — fornecedor participa de cada cotação no máximo uma vez.

### `contain`
| Coluna | Tipo | Restrições |
|---|---|---|
| `quotationId` | BIGINT | PK composta, FK → `quotation.quotationId` |
| `productId` | BIGINT | PK composta, FK → `product.productId` |
| `quantity` | DECIMAL(6,2) | NOT NULL |
| `bonusLimit` | DECIMAL(6,2) | NOT NULL |
| `brand` | VARCHAR(40) | nullable — adicionado na V9 |

### `bid`
| Coluna | Tipo | Restrições |
|---|---|---|
| `participationId` | BIGINT | PK composta, FK → `participation.participationId` |
| `productId` | BIGINT | PK composta, FK → `product.productId` |
| `createdAt` | DATETIME | PK composta |
| `price` | DECIMAL(7,2) | NOT NULL — precisão ampliada de (6,2) para (7,2) na V8 |
| `quantity` | DECIMAL(6,2) | NOT NULL |
| `bonus` | DECIMAL(6,2) | NOT NULL |
> PK tripla permite histórico completo de lances por participação/produto.

## Histórico de migrations

| Versão | Mudança |
|---|---|
| V1 | Schema inicial |
| V2 | Adição de coluna `isAuction` em `quotation` |
| V3 | Remoção de coluna `accessToken` de `participation` |
| V4 | Adição de coluna `supplierPassword` em `supplier` |
| V5 | Update de ENUM em `company` (`USER` → `COMPANY`) |
| V6 | Remoção de coluna `unitOfMeasure` de `product` |
| V7 | Adição de coluna `productDescription` em `product` |
| V8 | Update de precisão em `price` de `bid` (6,2 → 7,2) |
| V9 | Adição de coluna `brand` em `contain` |