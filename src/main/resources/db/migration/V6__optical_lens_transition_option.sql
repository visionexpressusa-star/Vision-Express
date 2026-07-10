CREATE TABLE optical_lens_transition_option (
    id BIGINT AUTO_INCREMENT,
    config_id BIGINT NOT NULL,
    sort_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_optical_lens_transition_option_price CHECK (price >= 0),
    CONSTRAINT fk_optical_lens_transition_option_config FOREIGN KEY (config_id) REFERENCES optical_store_config (id) ON DELETE CASCADE
);

INSERT INTO optical_lens_transition_option (config_id, sort_number, name, price)
VALUES
    (1, 1, 'Regular (Gray/Brown)', 129.99),
    (1, 2, 'Regular (Blue/Green - only for progressive)', 129.99),
    (1, 3, 'Extra Dark (Gray for progressive only)', 169.99);
