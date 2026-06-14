CREATE TABLE referral_source (
    id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_referral_source_name (name)
);

INSERT INTO referral_source (name)
VALUES ('Walk-In/MiTienda'),
       ('Friend or Family'),
       ('Google'),
       ('Vision Express Website'),
       ('Facebook'),
       ('Instagram'),
       ('Other');

ALTER TABLE intake_form
    ADD COLUMN referral_source_id BIGINT;

UPDATE intake_form
SET referral_source_id = (
    SELECT id
    FROM referral_source
    WHERE name = 'Walk-In/MiTienda'
);

ALTER TABLE intake_form
    MODIFY referral_source_id BIGINT NOT NULL,
    DROP COLUMN notes,
    ADD CONSTRAINT fk_intake_form_referral_source
        FOREIGN KEY (referral_source_id) REFERENCES referral_source (id);
