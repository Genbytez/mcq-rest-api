-- role
insert into role (code, name, is_active, is_deleted)
values ('SUPER_ADMIN', 'Super Admin', true, false);

-- institute
insert into institute (code, name, is_active, is_deleted)
values ('INS001', 'Main Institute', true, false);

-- role_id = SUPER_ADMIN role id, institute_id = institute id
insert into user_account (institute_id, role_id, reg_no, full_name, email, mobile,password_hash, status, is_active, is_deleted)
values (1, 1, null, 'Platform Super Admin', 'mk@genbytez.com', '9791268174','$2b$10$0Lh0dNj7X08HBoKjqh7ECe121WuedJhbW.4IznHiZmWNz1eTbZgKG', 'ACTIVE', true, false);
