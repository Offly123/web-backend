CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(15),
    emailAddress VARCHAR(255),
    birthDate DATE,
    sex ENUM('Male', 'Female'),
    biography TEXT
);

CREATE TABLE userLanguages (
    userId INT,
    languageId INT,
    PRIMARY KEY (userId, languageId),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (languageId) REFERENCES languages(languageId) ON DELETE CASCADE
);

CREATE TABLE passwords (
    userId INT PRIMARY KEY,
    userLogin VARCHAR(100),
    userPassword VARCHAR(100),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE jwtKeys (
    userId INT PRIMARY KEY,
    jwtKey VARCHAR(51),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE languages (
    languageId INT AUTO_INCREMENT PRIMARY KEY,
    languageName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE adminPasswords (
    adminLogin VARCHAR(50),
    adminPassword VARCHAR(100)
);

INSERT IGNORE INTO languages (languageId, languageName) values (1,  'Pascal');
INSERT IGNORE INTO languages (languageId, languageName) values (2,  'C');
INSERT IGNORE INTO languages (languageId, languageName) values (3,  'C++');
INSERT IGNORE INTO languages (languageId, languageName) values (4,  'JavaScript');
INSERT IGNORE INTO languages (languageId, languageName) values (5,  'PHP');
INSERT IGNORE INTO languages (languageId, languageName) values (6,  'Python');
INSERT IGNORE INTO languages (languageId, languageName) values (7,  'Java');
INSERT IGNORE INTO languages (languageId, languageName) values (8,  'Haskel');
INSERT IGNORE INTO languages (languageId, languageName) values (9,  'Clojure');
INSERT IGNORE INTO languages (languageId, languageName) values (10, 'Prolog');
INSERT IGNORE INTO languages (languageId, languageName) values (11, 'Scala');
INSERT IGNORE INTO languages (languageId, languageName) values (12, 'Go');

--Очистить все таблицы (кроме languages)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE users;
TRUNCATE userLanguages;
TRUNCATE passwords;
TRUNCATE jwtKeys;
TRUNCATE adminPasswords;

SET FOREIGN_KEY_CHECKS = 1;

--Удалить все таблицы (кроме languages)
DROP TABLE jwtKeys;
DROP TABLE userLanguages;
DROP TABLE passwords;
DROP TABLE users;
DROP TABLE adminPasswords;

--Вставка в users
INSERT IGNORE INTO users 
    (fullName, phoneNumber, emailAddress, birthDate, sex, biography) 
values (?, ?, ?, ?, ?, ?)

--Вставка в userLanguages
INSERT IGNORE INTO userLanguages 
    (userId, languageId) 
values (?, ?)

--Вставка в passwords
INSERT IGNORE INTO passwords 
    (userId, userLogin, userPassword) 
values (?, ?, ?)

--Вставка в jwtKeys
INSERT IGNORE INTO jwtKeys 
    (userId, jwtKey) 
values (?, ?)

--Взять ключ пользователя
SELECT jwtKey FROM 
    jwtKeys 
where userId = (?)

--Взять айди по логину
SELECT userId FROM 
    passwords 
where userLogin = (?)

--Взять секретный ключ по логину
SELECT jwtKey FROM (
    passwords JOIN jwtKeys ON passwords.userId = jwtKeys.userId
) 
WHERE userLogin = (?)

--Взять пароль по логину
SELECT userPassword FROM 
    passwords 
WHERE userLogin = (?)

--Получить данные
SELECT * FROM 
    users 
WHERE userId = (?)



--ОБНОВЛЕНИЕ



--Обновить данные
UPDATE users SET 
    fullName = ?, phoneNumber = ?, emailAddress = ?, birthDate = ?, sex = ?, biography = ? 
WHERE userId = ?

--Удалить языки
DELETE FROM userLanguages 
WHERE userId = ?

--Получить основные данные
SELECT * from users
WHERE userId = ?

--Получить языки
SELECT * from userLanguages
WHERE userid = ?



--АДМИНКА



--Получить логины пользователей и их данные (языки строкой через запятую)
SELECT 
    u.userId, userLogin, 
    fullName, phoneNumber, emailAddress, 
    DATE_FORMAT(birthDate, "%d %m %Y") as birthDate, 
    sex, biography, 
    GROUP_CONCAT(l.languageName) AS languages
FROM users u 
JOIN passwords p ON u.userId = p.userId 
JOIN userLanguages ul ON u.userId = ul.userId
JOIN languages l ON ul.languageId = l.languageId
GROUP BY u.userId, userLogin, fullName, phoneNumber, emailAddress, birthDate, sex, biography


--Получить количество пользователей для каждого языка
SELECT COUNT(userId) AS count, languageName FROM 
    (userLanguages JOIN languages ON userLanguages.languageId = languages.languageId)
GROUP BY userLanguages.languageId
ORDER BY COUNT(userId) DESC;

--Вставить пароль для админа (admin yo)
INSERT IGNORE INTO adminPasswords
    (adminLogin, adminPassword)
values ('admin', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=');

--Получить пароль админа
SELECT adminPassword FROM adminPasswords
WHERE adminLogin = ?

--Удалить все данные пользователя
DELETE u, p, ul, jk FROM users u 
JOIN passwords p ON u.userId = p.userId 
JOIN userLanguages ul ON u.userId = ul.userId
JOIN jwtKeys jk ON u.userId = jk.userId
WHERE u.userId=?

--Удалить админа
delete from adminPasswords where adminLogin='admin';