CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female'),
    biography TEXT
);

CREATE TABLE user_languages (
    user_id INT,
    language_id INT,
    PRIMARY KEY (user_id, language_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE
);

CREATE TABLE languages (
    language_id INT AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE passwords (
    user_id INT PRIMARY KEY,
    user_login VARCHAR(100),
    user_password VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

--Вставка в users
INSERT IGNORE INTO users (full_name, phone, email, date_of_birth, gender, biography) values (?, ?, ?, ?, ?, ?)

--Вставка в user_languages
INSERT IGNORE INTO user_languages (user_id, language_id) values (?, ?)

--Вставка в passwords
INSERT IGNORE INTO passwords (user_id, user_login, user_password) values (?, ?, ?)