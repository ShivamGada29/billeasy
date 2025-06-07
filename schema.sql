CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL
);

-- CREATE TABLE reviews (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     book_id INT NOT NULL,
--     review VARCHAR(500),
--     rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
--     FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
-- );

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    review VARCHAR(500),
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    UNIQUE (book_id, user_id), -- Ensures a user can only review a book once
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);