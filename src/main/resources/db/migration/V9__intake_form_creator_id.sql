ALTER TABLE intake_form ADD COLUMN created_by_user_id BIGINT NULL;

-- Only assign legacy forms when the recorded name identifies one account.
UPDATE intake_form i
JOIN (
    SELECT display_name, MIN(id) AS user_id
    FROM `user`
    GROUP BY display_name
    HAVING COUNT(*) = 1
) creator ON BINARY creator.display_name = BINARY i.created_by
SET i.created_by_user_id = creator.user_id;

ALTER TABLE intake_form
    ADD CONSTRAINT fk_intake_form_creator FOREIGN KEY (created_by_user_id) REFERENCES `user` (id);
