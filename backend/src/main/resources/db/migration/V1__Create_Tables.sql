CREATE TABLE company(
	companyCnpj VARCHAR(14) NOT NULL,
    companyName VARCHAR(80) NOT NULL,
    companyEmail VARCHAR(60) NOT NULL,
    companyWhatsappNumber VARCHAR(16) NOT NULL,
    companyPassword VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL,
    CONSTRAINT company_pk PRIMARY KEY(companyCnpj),
    CONSTRAINT company_whatsapp_uk UNIQUE KEY(companyWhatsappNumber),
    CONSTRAINT company_email_uk UNIQUE KEY(companyEmail)
)ENGINE = InnoDb;

CREATE TABLE product(
	productId BIGINT NOT NULL AUTO_INCREMENT,
    productName VARCHAR(60) NOT NULL,
    productBarCodeNumber VARCHAR(13) NOT NULL,
    unitOfMeasure ENUM('L', 'bag', 'balde', 'cx', 'fardo', 'g', 'kg', 'mL', 'mg', 'pct', 'und') NOT NULL,
    companyCnpj VARCHAR(14) NOT NULL,
    CONSTRAINT product_pk PRIMARY KEY(productId),
    CONSTRAINT product_company_fk FOREIGN KEY(companyCnpj) REFERENCES company(companyCnpj)
)ENGINE = InnoDb AUTO_INCREMENT 1;

CREATE TABLE supplier(
	supplierId BIGINT NOT NULL AUTO_INCREMENT,
    supplierName VARCHAR(30) NOT NULL,
    supplierEmail VARCHAR(60),
    supplierWhatsappNumber VARCHAR(16) NOT NULL,
    employerName VARCHAR(65) NOT NULL,
    employerCnpj VARCHAR(14) NOT NULL,
    createdAt DATETIME NOT NULL,
    companyCnpj VARCHAR(14) NOT NULL,
    CONSTRAINT supplier_pk PRIMARY KEY(supplierId),
    CONSTRAINT supplier_companyCnpj_whatsapp_uk UNIQUE KEY(companyCnpj, supplierWhatsappNumber),
    CONSTRAINT supplier_companyCnpj_email_uk UNIQUE KEY(companyCnpj, supplierEmail),
    CONSTRAINT supplier_company_fk FOREIGN KEY(companyCnpj) REFERENCES company(companyCnpj)
)ENGINE = InnoDb AUTO_INCREMENT 1;

CREATE TABLE quotation(
	quotationId BIGINT NOT NULL AUTO_INCREMENT,
    quotationStart DATETIME NOT NULL,
	quotationEnd DATETIME NOT NULL,
    createdAt DATETIME NOT NULL,
    companyCnpj VARCHAR(14) NOT NULL,
    CONSTRAINT quotation_pk PRIMARY KEY(quotationId),
    CONSTRAINT quotation_company_fk FOREIGN KEY(companyCnpj) REFERENCES company(companyCnpj)
)ENGINE = InnoDb AUTO_INCREMENT 1;

CREATE TABLE participation(
	participationId BIGINT NOT NULL AUTO_INCREMENT,
    accessToken VARCHAR(255) NOT NULL,
	supplierId BIGINT NOT NULL,
    quotationId BIGINT NOT NULL,
    CONSTRAINT participation_pk PRIMARY KEY(participationId),
    CONSTRAINT participation_supplierId_quotationId_uk UNIQUE KEY(supplierId, quotationId),
    CONSTRAINT participation_supplier_fk FOREIGN KEY(supplierId) REFERENCES supplier(supplierId),
    CONSTRAINT participation_quotation_fk FOREIGN KEY(quotationId) REFERENCES quotation(quotationId)
)ENGINE = InnoDb AUTO_INCREMENT 1;

CREATE TABLE contain(
	productId BIGINT NOT NULL,
    quotationId BIGINT NOT NULL,
    quantity DECIMAL(6,2) NOT NULL,
    bonusLimit DECIMAL(6,2) NOT NULL,
    CONSTRAINT contain_pk PRIMARY KEY(quotationId, productId),
    CONSTRAINT contain_product_fk FOREIGN KEY(productId) REFERENCES product(productId),
    CONSTRAINT contain_quotation_fk FOREIGN KEY(quotationId) REFERENCES quotation(quotationId)
)ENGINE = InnoDb;

CREATE TABLE bid(
	participationId BIGINT NOT NULL,
    productId BIGINT NOT NULL,
    createdAt DATETIME NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    quantity DECIMAL(6,2) NOT NULL,
    bonus DECIMAL(6,2) NOT NULL,
    CONSTRAINT bid_pk PRIMARY KEY(participationId, productId, createdAt),
    CONSTRAINT bid_participation_fk FOREIGN KEY(participationId) REFERENCES participation(participationId),
    CONSTRAINT bid_product_fk FOREIGN KEY(productId) REFERENCES product(productId)
)ENGINE = InnoDb;