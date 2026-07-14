ALTER TABLE lens_recommendation
    ADD COLUMN is_dry_eye_drop BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE lens_recommendation
    DROP COLUMN is_high_index_160;
