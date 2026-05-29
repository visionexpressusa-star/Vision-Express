INSERT INTO `role` (name)
VALUES ('ADMIN'),
       ('NON_ADMIN');

INSERT INTO permission (name, description)
VALUES ('users', 'Manage users'),
       ('intake_form', 'Manage intake forms'),
       ('provide_prescription', 'Provide prescriptions'),
       ('inventory_check', 'Perform inventory checks');

INSERT INTO `user` (role_id, username, password, display_name, active)
SELECT id,
       'rsayani',
       '$2y$10$LTwkV/gi8qdLvyrkWFVdHuXlmzTm2Ygjejqan9zoNy8uXyGP3.yIq',
       'Rehman Sayani',
       TRUE
FROM `role`
WHERE name = 'ADMIN';

INSERT INTO checklist_items (sort_number, checklist_item)
VALUES (1, 'Go to Records and Check-off New or Established Patient?'),
       (2, 'Obtained Patient ID & Insurance ID?'),
       (3, 'Scanned Patient ID & Insurance ID?'),
       (4, 'Obtained consent on tablet and imported on Crystal?');
