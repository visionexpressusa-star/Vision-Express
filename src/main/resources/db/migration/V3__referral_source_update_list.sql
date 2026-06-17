DELETE FROM referral_source where name = 'Other';

INSERT INTO referral_source (name)
VALUES ('VPS Portal'),
       ('EyeMed Portal'),
       ('Spectera Portal'),
       ('Versant Portal'),
       ('Medicare Portal'),
       ('Medicaid Portal'),
       ('Yearly Reminder Call'),
       ('Other');


