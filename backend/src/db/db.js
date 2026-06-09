import mysql from 'mysql2/promise';

const rootConnection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
});

await rootConnection.query(
  'CREATE DATABASE IF NOT EXISTS real_time_chat_app'
);

await rootConnection.end();

export const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'real_time_chat_app',
});

console.log('Database ready');

await connection.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

console.log('users table ready');

await connection.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    senderId VARCHAR(36) NOT NULL,
    receiverId VARCHAR(36) NOT NULL,

    text TEXT,
    image TEXT,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_sender (senderId),
    INDEX idx_receiver (receiverId),

    FOREIGN KEY (senderId) REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (receiverId) REFERENCES users(id)
      ON DELETE CASCADE
  )
`)

console.log('messages table ready');

export const db = connection;
