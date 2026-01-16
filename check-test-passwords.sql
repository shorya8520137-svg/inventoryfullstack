SELECT id, email, password, CHAR_LENGTH(password) as pwd_len 
FROM users 
WHERE id >= 85 AND id <= 90;
