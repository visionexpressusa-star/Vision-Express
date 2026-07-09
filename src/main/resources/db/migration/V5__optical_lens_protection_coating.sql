CREATE TABLE optical_lens_protection_coating (
    id BIGINT AUTO_INCREMENT,
    config_id BIGINT NOT NULL,
    sort_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_optical_lens_protection_coating_price
        CHECK (price >= 0),
    CONSTRAINT fk_optical_lens_protection_coating_config
        FOREIGN KEY (config_id) REFERENCES optical_store_config (id)
        ON DELETE CASCADE
);

INSERT INTO optical_lens_protection_coating (config_id, sort_number, name, price)
VALUES (1, 1, 'SV - UV/AR/Anti-Scratch', 79.99),
       (1, 2, 'BF/P - UV/AR/Anti-Scratch', 89.99),
       (1, 3, 'SV - Blue Shield + UV/AR/Anti-Scratch', 109.99),
       (1, 4, 'BF/P - Blue Shield + UV/AR/Anti-Scratch', 149.99);
