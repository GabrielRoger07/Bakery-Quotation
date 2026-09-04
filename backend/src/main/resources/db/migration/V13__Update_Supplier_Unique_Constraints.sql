ALTER TABLE supplier DROP INDEX supplier_companyCnpj_whatsapp_uk;

ALTER TABLE supplier ADD CONSTRAINT supplier_companyCnpj_whatsapp_employerCnpj_uk UNIQUE (companyCnpj, supplierWhatsappNumber, employerCnpj);

ALTER TABLE supplier DROP INDEX supplier_companyCnpj_email_uk;

ALTER TABLE supplier ADD CONSTRAINT supplier_companyCnpj_email_employerCnpj_uk UNIQUE (companyCnpj, supplierEmail, employerCnpj);