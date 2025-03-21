CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(15),
    emailAddress VARCHAR(255),
    birthDate DATE,
    sex ENUM('male', 'female'),
    biography TEXT
);

CREATE TABLE user_languages (
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

CREATE TABLE jwt_keys (
    userId INT PRIMARY KEY,
    jwtKey VARCHAR(51),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE languages (
    languageId INT AUTO_INCREMENT PRIMARY KEY,
    languageName VARCHAR(100) NOT NULL UNIQUE
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

--Удалить все таблицы (кроме languages)
drop table user_languages;
drop table passwords;
drop table jwt_keys;
drop table users;

--Вставка в users
INSERT IGNORE INTO users 
    (fullName, phoneNumber, emailAddress, birthDate, sex, biography) 
values (?, ?, ?, ?, ?, ?)

--Вставка в user_languages
INSERT IGNORE INTO user_languages 
    (userId, languageId) 
values (?, ?)

--Вставка в passwords
INSERT IGNORE INTO passwords 
    (userId, userLogin, userPassword) 
values (?, ?, ?)

--Вставка в jwt_keys
INSERT IGNORE INTO jwt_keys 
    (userId, jwtKey) 
values (?, ?)

--Взять ключ пользователя
SELECT jwtKey FROM 
    jwt_keys 
where userId = (?)

--Взять айди по логину
SELECT userId FROM 
    passwords 
where userLogin = (?)

--Взять секретный ключ по логину
SELECT jwtKey FROM (
    passwords JOIN jwt_keys ON passwords.userId = jwt_keys.userId
) 
WHERE userLogin = (?)

--Взять пароль по логину
SELECT userPassword FROM 
    passwords 
WHERE userLogin = (?)

--Получить данные
SELECT * FROM 
    users 
WHERE userId=(?)

--Обновить данные
UPDATE users SET 
    fullName=?, phoneNumber=?, emailAddress=?, birthDate=?, sex=?, biography=? 
WHERE userId = ?