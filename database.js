import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function createTable() {
    const [rows] = await pool.query(
        `CREATE TABLE reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            book_id INT NOT NULL,
            review VARCHAR(500),
            rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );`
    )

    return rows
}

export async function getBooks({ author = null, genre = null, limit = 10, offset = 0 }) {
    let query = `SELECT * FROM BOOKS WHERE 1=1`;
    const params = [];

    if (author) {
        query += ` AND author LIKE ?`;
        params.push(`%${author}%`);
    }

    if (genre) {
        query += ` AND genre LIKE ?`;
        params.push(`%${genre}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
    
    // const [rows] = await pool.query(
    //     `SELECT * FROM BOOKS;`
    // )

    // return rows
}

export async function getBook(id) {
    const [[book]] = await pool.query(
        `SELECT 
            b.*, 
            COALESCE(AVG(r.rating), 0) AS average_rating
        FROM BOOKS b
        LEFT JOIN REVIEWS r ON b.id = r.book_id
        WHERE b.id = ?
        GROUP BY b.id;`,
        [id]
    );

    const [reviews] = await pool.query(
        `SELECT review, rating, user_id
         FROM REVIEWS
         WHERE book_id = ?;`,
         [id]
    );

    return { ...book, reviews };
}

export async function postBooks(name, author, genre) {
    const [rows] = await pool.query(
        `
        INSERT INTO books (name, author, genre)
        VALUES (?, ?, ?)
        `
    , [name, author, genre])

    return rows
}

export async function postReviews(book_id, review, rating, user_id) {
    const [existingReview] = await pool.query(
        'SELECT * FROM reviews WHERE book_id = ? AND user_id = ?;',
        [book_id, user_id]
    );

    if (existingReview.length > 0) {
        const error = new Error('You have already reviewed this book.');
        error.code = 400; // Add a custom code property
        throw error;
    }

    // Insert the new review
    const [result] = await pool.query(
        `
        INSERT INTO reviews (book_id, user_id, review, rating)
        VALUES (?, ?, ?, ?);
        `,
        [book_id, user_id, review, rating]
    );


    // --------
    // const [rows] = await pool.query(
    //     `
    //     INSERT INTO review (book_id, review, rating)
    //     VALUES (?, ?, ?)
    //     `
    // , [book_id, review, rating])

    return result
}

export async function updateReviews(id, fieldsToUpdate, user_id) {
    const updates = [];
    const values = [];

    // Dynamically construct the query based on provided fields
    if (fieldsToUpdate.review !== undefined) {
        updates.push('review = ?');
        values.push(fieldsToUpdate.review);
    }
    if (fieldsToUpdate.rating !== undefined) {
        updates.push('rating = ?');
        values.push(fieldsToUpdate.rating);
    }

    // If no fields are provided, throw an error
    if (updates.length === 0) {
        throw new Error('No fields to update');
    }

    // Add the review ID and user ID to the values array
    values.push(id, user_id);

    // Construct the SQL query
    const query = `
        UPDATE reviews
        SET ${updates.join(', ')}
        WHERE id = ? AND user_id = ?;
    `;

    // Execute the query
    const [result] = await pool.query(query, values);
    return result;
}

export async function deleteReviews(id, user_id) {
    const [rows] = await pool.query(
        `
        DELETE FROM reviews
        WHERE id = ? AND user_id = ?;
        `,
        [id, user_id]
    );

    return rows;
}

export async function searchBooks({name = null, author = null}) {
    let query = `SELECT * FROM BOOKS WHERE 1=1`;
    const params = [];

    if (author) {
        query += ` AND author LIKE ?`;
        params.push(`%${author}%`);
    }

    if (name) {
        query += ` AND name LIKE ?`;
        params.push(`%${name}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows;
}