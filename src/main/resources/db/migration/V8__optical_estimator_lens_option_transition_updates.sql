INSERT INTO optical_lens_option_charge (config_id, sort_number, name, charge)
SELECT 1,
       (SELECT COALESCE(MAX(sort_number), 0) + 1 FROM optical_lens_option_charge WHERE config_id = 1),
       'Curve lens (frame)',
       39.99
WHERE NOT EXISTS (
    SELECT 1 FROM optical_lens_option_charge WHERE config_id = 1 AND name = 'Curve lens (frame)'
);

INSERT INTO optical_lens_transition_option (config_id, sort_number, name, price)
SELECT 1,
       (SELECT COALESCE(MAX(sort_number), 0) + 1 FROM optical_lens_transition_option WHERE config_id = 1),
       'Polorized Gray/Brown',
       129.99
WHERE NOT EXISTS (
    SELECT 1 FROM optical_lens_transition_option WHERE config_id = 1 AND name = 'Polorized Gray/Brown'
);

INSERT INTO optical_lens_transition_option (config_id, sort_number, name, price)
SELECT 1,
       (SELECT COALESCE(MAX(sort_number), 0) + 1 FROM optical_lens_transition_option WHERE config_id = 1),
       'Blue/Green',
       149.99
WHERE NOT EXISTS (
    SELECT 1 FROM optical_lens_transition_option WHERE config_id = 1 AND name = 'Blue/Green'
);

INSERT INTO optical_lens_transition_option (config_id, sort_number, name, price)
SELECT 1,
       (SELECT COALESCE(MAX(sort_number), 0) + 1 FROM optical_lens_transition_option WHERE config_id = 1),
       'Solid Color',
       89.99
WHERE NOT EXISTS (
    SELECT 1 FROM optical_lens_transition_option WHERE config_id = 1 AND name = 'Solid Color'
);

INSERT INTO optical_lens_transition_option (config_id, sort_number, name, price)
SELECT 1,
       (SELECT COALESCE(MAX(sort_number), 0) + 1 FROM optical_lens_transition_option WHERE config_id = 1),
       'Gradiant',
       99.99
WHERE NOT EXISTS (
    SELECT 1 FROM optical_lens_transition_option WHERE config_id = 1 AND name = 'Gradiant'
);
