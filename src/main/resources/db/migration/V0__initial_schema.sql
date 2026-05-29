CREATE TABLE `role` (
    id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_name (name)
);

CREATE TABLE permission (
    id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_permission_name (name)
);

CREATE TABLE `user` (
    id BIGINT AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_username (username),
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES `role` (id)
);

CREATE TABLE user_permission (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_user_permission_user
        FOREIGN KEY (user_id) REFERENCES `user` (id),
    CONSTRAINT fk_user_permission_permission
        FOREIGN KEY (permission_id) REFERENCES permission (id)
);

CREATE TABLE intake_form (
    id BIGINT AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_retinal_imaging_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_doing_eyeglasses BOOLEAN NOT NULL DEFAULT FALSE,
    is_doing_contact_lens BOOLEAN NOT NULL DEFAULT FALSE,
    has_insurance BOOLEAN NOT NULL DEFAULT FALSE,
    is_aided BOOLEAN NOT NULL,
    pd_left DECIMAL(3, 1) NOT NULL,
    pd_right DECIMAL(3, 1) NOT NULL,
    va_right TEXT NOT NULL,
    va_left TEXT NOT NULL,
    va_both TEXT NOT NULL,
    insurance_name TEXT,
    notes TEXT,
    created_by TEXT,
    created_on DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE prescription (
    id BIGINT AUTO_INCREMENT,
    intake_form_id BIGINT NOT NULL,
    nct_righ DECIMAL(3, 1),
    nct_left DECIMAL(3, 1),
    od_sph TEXT,
    od_cyl TEXT,
    od_axis TEXT,
    od_add TEXT,
    od_remarks INT,
    os_sph TEXT,
    os_cyl TEXT,
    os_axis TEXT,
    os_add TEXT,
    os_remarks INT,
    ou_remarks INT,
    c_od_sph TEXT,
    c_od_cyl TEXT,
    c_od_axis TEXT,
    c_od_add TEXT,
    c_od_bc TEXT,
    c_od_dia TEXT,
    c_od_lens_mo TEXT,
    c_os_sph TEXT,
    c_os_cyl TEXT,
    c_os_axis TEXT,
    c_os_add TEXT,
    c_os_bc TEXT,
    c_os_dia TEXT,
    c_os_lens_mo TEXT,
    prescribed_by TEXT,
    prescribed_on DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT chk_prescription_od_remarks
        CHECK (od_remarks BETWEEN 20 AND 80),
    CONSTRAINT chk_prescription_os_remarks
        CHECK (os_remarks BETWEEN 20 AND 80),
    CONSTRAINT chk_prescription_ou_remarks
        CHECK (ou_remarks BETWEEN 20 AND 80),
    CONSTRAINT fk_prescription_intake_form
        FOREIGN KEY (intake_form_id) REFERENCES intake_form (id)
);

CREATE TABLE lens_recommendation (
    id BIGINT AUTO_INCREMENT,
    prescription_id BIGINT NOT NULL,
    is_sv BOOLEAN NOT NULL DEFAULT FALSE,
    is_bifocal BOOLEAN NOT NULL DEFAULT FALSE,
    is_blended_bifocal BOOLEAN NOT NULL DEFAULT FALSE,
    is_progressive BOOLEAN NOT NULL DEFAULT FALSE,
    is_plastic BOOLEAN NOT NULL DEFAULT FALSE,
    is_poly BOOLEAN NOT NULL DEFAULT FALSE,
    is_poly_aspheric BOOLEAN NOT NULL DEFAULT FALSE,
    is_high_index_160 BOOLEAN NOT NULL DEFAULT FALSE,
    is_high_index_167 BOOLEAN NOT NULL DEFAULT FALSE,
    is_ultra_hi_index_174 BOOLEAN NOT NULL DEFAULT FALSE,
    is_sc_uv_ar BOOLEAN NOT NULL DEFAULT FALSE,
    is_blue_shield BOOLEAN NOT NULL DEFAULT FALSE,
    is_transition BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT fk_lens_recommendation_prescription
        FOREIGN KEY (prescription_id) REFERENCES prescription (id)
);

CREATE TABLE checklist_items (
    id BIGINT AUTO_INCREMENT,
    sort_number INT NOT NULL,
    checklist_item TEXT NOT NULL,
    PRIMARY KEY (id)
);
