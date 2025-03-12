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

--Вставка в users
INSERT INTO users (full_name, phone, email, date_of_birth, gender, biography) values (?)

--Вставка в user_languages
INSERT INTO user_languages (user_id, language_id) values ?