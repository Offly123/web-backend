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

INSERT IGNORE INTO languages (languageId, languageName) values ('Pascal', 1);
INSERT IGNORE INTO languages (languageId, languageName) values ('C', 2);
INSERT IGNORE INTO languages (languageId, languageName) values ('C++', 3);
INSERT IGNORE INTO languages (languageId, languageName) values ('JavaScript', 4);
INSERT IGNORE INTO languages (languageId, languageName) values ('PHP', 5);
INSERT IGNORE INTO languages (languageId, languageName) values ('Python', 6);
INSERT IGNORE INTO languages (languageId, languageName) values ('Java', 7);
INSERT IGNORE INTO languages (languageId, languageName) values ('Haskel', 8);
INSERT IGNORE INTO languages (languageId, languageName) values ('Clojure', 9);
INSERT IGNORE INTO languages (languageId, languageName) values ('Prolog', 10);
INSERT IGNORE INTO languages (languageId, languageName) values ('Scala', 11);
INSERT IGNORE INTO languages (languageId, languageName) values ('Go', 12);

--Очистить все таблицы (кроме languages)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE users;
TRUNCATE userLanguages;
TRUNCATE passwords;
TRUNCATE jwtKeys;
TRUNCATE adminPassword;

SET FOREIGN_KEY_CHECKS = 1;

--Удалить все таблицы (кроме languages)
DROP TABLE jwtKeys;
DROP TABLE userLanguages;
DROP TABLE passwords;
DROP TABLE users;

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

--Вставка в jwtLeys
INSERT IGNORE INTO jwtLeys 
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

--Получить количество пользователей для каждого языка
SELECT COUNT(userId), languageName FROM 
    (userLanguages JOIN languages ON userLanguages.languageId = languages.languageId)
GROUP BY userLanguages.languageId
ORDER BY COUNT(userId) DESC;