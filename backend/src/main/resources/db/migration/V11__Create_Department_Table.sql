CREATE TABLE department(
     departmentId BIGINT NOT NULL AUTO_INCREMENT,
     departmentName VARCHAR(25) NOT NULL,
     companyCnpj VARCHAR(14) NOT NULL,
     CONSTRAINT department_pk PRIMARY KEY(departmentId),
     CONSTRAINT department_departmentName_companyCnpj_uk UNIQUE KEY(departmentName, companyCnpj),
     CONSTRAINT department_company_fk FOREIGN KEY(companyCnpj) REFERENCES company(companyCnpj)
)ENGINE = InnoDb AUTO_INCREMENT 1;

INSERT INTO department(departmentName, companyCnpj) SELECT 'Default', companyCnpj FROM company;

ALTER TABLE product ADD COLUMN departmentId BIGINT;

UPDATE product p JOIN department d ON p.companyCnpj = d.companyCnpj AND d.departmentName = 'Default' SET p.departmentId = d.departmentId;

ALTER TABLE product MODIFY departmentId BIGINT NOT NULL;

ALTER TABLE product ADD CONSTRAINT product_department_fk FOREIGN KEY (departmentId) REFERENCES department(departmentId);