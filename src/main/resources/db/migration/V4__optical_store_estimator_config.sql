INSERT INTO permission (name, description)
VALUES ('optical_store_config', 'Manage optical store estimator configuration');

CREATE TABLE optical_store_config (
    id BIGINT NOT NULL,
    eye_exam_price DECIMAL(10, 2) NOT NULL,
    exam_discount_with_complete_glasses DECIMAL(10, 2) NOT NULL,
    outside_prescription_discount DECIMAL(10, 2) NOT NULL,
    lens_discount_without_insurance DECIMAL(10, 2) NOT NULL,
    pof_charge DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_optical_store_config_eye_exam_price
        CHECK (eye_exam_price >= 0),
    CONSTRAINT chk_optical_store_config_exam_discount
        CHECK (exam_discount_with_complete_glasses >= 0),
    CONSTRAINT chk_optical_store_config_outside_discount
        CHECK (outside_prescription_discount >= 0),
    CONSTRAINT chk_optical_store_config_lens_discount
        CHECK (lens_discount_without_insurance >= 0),
    CONSTRAINT chk_optical_store_config_pof_charge
        CHECK (pof_charge >= 0)
);

CREATE TABLE optical_frame_discount_option (
    id BIGINT AUTO_INCREMENT,
    config_id BIGINT NOT NULL,
    sort_number INT NOT NULL,
    percent DECIMAL(5, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_optical_frame_discount_percent
        CHECK (percent BETWEEN 0 AND 100),
    CONSTRAINT fk_optical_frame_discount_config
        FOREIGN KEY (config_id) REFERENCES optical_store_config (id)
        ON DELETE CASCADE
);

CREATE TABLE optical_lens_option_charge (
    id BIGINT AUTO_INCREMENT,
    config_id BIGINT NOT NULL,
    sort_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    charge DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_optical_lens_option_charge
        CHECK (charge >= 0),
    CONSTRAINT fk_optical_lens_option_charge_config
        FOREIGN KEY (config_id) REFERENCES optical_store_config (id)
        ON DELETE CASCADE
);

CREATE TABLE optical_lens_price (
    id BIGINT AUTO_INCREMENT,
    config_id BIGINT NOT NULL,
    sort_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_optical_lens_price
        CHECK (price >= 0),
    CONSTRAINT fk_optical_lens_price_config
        FOREIGN KEY (config_id) REFERENCES optical_store_config (id)
        ON DELETE CASCADE
);

INSERT INTO optical_store_config (
    id,
    eye_exam_price,
    exam_discount_with_complete_glasses,
    outside_prescription_discount,
    lens_discount_without_insurance,
    pof_charge
)
VALUES (1, 95.00, 85.00, 45.00, 100.00, 40.00);

INSERT INTO optical_frame_discount_option (config_id, sort_number, percent)
VALUES (1, 1, 10.00),
       (1, 2, 20.00),
       (1, 3, 30.00);

INSERT INTO optical_lens_option_charge (config_id, sort_number, name, charge)
VALUES (1, 1, 'Regular', 0.00),
       (1, 2, 'Rimless', 49.99),
       (1, 3, 'Extra large frame', 39.99),
       (1, 4, 'Safety lens', 49.99);

INSERT INTO optical_lens_price (config_id, sort_number, name, price)
VALUES (1, 1, 'Single Vision - CR39 Plastic', 219.99),
       (1, 2, 'Single Vision - Poly HD', 249.99),
       (1, 3, 'Single Vision - Poly Plus Aspheric HD', 269.99),
       (1, 4, 'Single Vision - Hi Index Ultra HD 1.67', 319.99),
       (1, 5, 'Single Vision - Hi Index Ultra HD 1.74 Without Cyl', 369.99),
       (1, 6, 'Single Vision - Hi Index Ultra HD 1.74 With Cyl', 469.99),
       (1, 7, 'Bifocal With Line - CR39 Plastic', 339.99),
       (1, 8, 'Bifocal With Line - Poly HD', 359.99),
       (1, 9, 'Bifocal With Line - Poly Plus Aspheric HD', 379.99),
       (1, 10, 'Bifocal With Line - Hi Index Ultra HD 1.67', 419.99),
       (1, 11, 'Bifocal With Line - Hi Index Ultra HD 1.74 Without Cyl', 469.99),
       (1, 12, 'Bifocal With Line - Hi Index Ultra HD 1.74 With Cyl', 539.99),
       (1, 13, 'Blended Bifocal No Line - CR39 Plastic', 389.99),
       (1, 14, 'Blended Bifocal No Line - Poly HD', 409.99),
       (1, 15, 'Blended Bifocal No Line - Poly Plus Aspheric HD', 429.99),
       (1, 16, 'Blended Bifocal No Line - Hi Index Ultra HD 1.67', 469.99),
       (1, 17, 'Blended Bifocal No Line - Hi Index Ultra HD 1.74 Without Cyl', 519.99),
       (1, 18, 'Blended Bifocal No Line - Hi Index Ultra HD 1.74 With Cyl', 589.99),
       (1, 19, 'Standard Progressive No Line - CR39 Plastic', 359.99),
       (1, 20, 'Standard Progressive No Line - Poly HD', 379.99),
       (1, 21, 'Standard Progressive No Line - Poly Plus Aspheric HD', 399.99),
       (1, 22, 'Standard Progressive No Line - Hi Index Ultra HD 1.67', 439.99),
       (1, 23, 'Standard Progressive No Line - Hi Index Ultra HD 1.74 Without Cyl', 489.99),
       (1, 24, 'Standard Progressive No Line - Hi Index Ultra HD 1.74 With Cyl', 589.99),
       (1, 25, 'Advanced Progressive No Line - Optimized Add-on', 49.99),
       (1, 26, 'Advanced Progressive No Line - Customized Add-on', 59.99),
       (1, 27, 'Advanced Progressive No Line - Personalized Add-on', 69.99);
