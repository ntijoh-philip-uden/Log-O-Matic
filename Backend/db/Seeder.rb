# Import required stuff
require 'sqlite3';
require 'bcrypt';

# Seeder class
class Seeder
  def self.seed!
    db = SQLite3::Database.new('db/log-o-matic.db');

    ###############################
    # Drop all tables if existing #
    ###############################
    
    # Users
    db.execute 'DROP TABLE IF EXISTS users';
    
    # Logs
    db.execute 'DROP TABLE IF EXISTS logs';
    
    # Questions
    db.execute 'DROP TABLE IF EXISTS questions';
    
    # Comments
    db.execute 'DROP TABLE IF EXISTS comments';    

    ##############################
    # Create all required tables #
    ##############################
    
    # Users
    db.execute 'CREATE TABLE users (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "username" VARCHAR(255) NOT NULL,
                "password" VARCHAR(255) NOT NULL,
                "email" VARCHAR(255) UNIQUE NOT NULL,
                "role" INTEGER NOT NULL)';

    # Logs
    db.execute 'CREATE TABLE logs (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "student_id" INTEGER NOT NULL,
                "question_id" INTEGER NOT NULL,
                "answer" TEXT,
                "timestamp" DEFAULT CURRENT_TIMESTAMP)';

    # Questions
    db.execute 'CREATE TABLE questions (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "question" TEXT NOT NULL)';

    # Comments
    db.execute 'CREATE TABLE comments (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "log_id" INTEGER NOT NULL,
                "user_id" INTEGER NOT NULL,
                "comment" TEXT NOT NULL)';

    ##################################
    # Seed all tables with some data #
    ##################################
    
    # Users
    encrypted_password1 = BCrypt::Password.create("a");
    db.execute('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', ["a", encrypted_password1, "a.a@gmail.com", 1]);

    encrypted_password2 = BCrypt::Password.create("b");
    db.execute('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', ["b", encrypted_password2, "b.b@gmail.com", 2]);

    encrypted_password3 = BCrypt::Password.create("c");
    db.execute('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', ["c", encrypted_password3, "c.c@gmail.com", 3]);

    # Logs
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [1, 1, "1 lorem"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [1, 2, "1 lorem ipsum"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [1, 3, "1 lorem ipsum banan"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [1, 4, "1 lorem ipsum banan kaka"]);

    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [2, 1, "2 lorem"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [2, 2, "2 lorem ipsum"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [2, 3, "2 lorem ipsum banan"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [2, 4, "2 lorem ipsum banan kaka"]);

    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [3, 1, "3 lorem"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [3, 2, "3 lorem ipsum"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [3, 3, "3 lorem ipsum banan"]);
    db.execute('INSERT INTO logs (student_id, question_id, answer) VALUES (?, ?, ?)', [3, 4, "3 lorem ipsum banan kaka"]);

    # Questions
    db.execute('INSERT INTO questions (question) VALUES (?)', ["Vad har du gjort under dagen?"]);
    db.execute('INSERT INTO questions (question) VALUES (?)', ["Vad har du lärt dig?"]);
    db.execute('INSERT INTO questions (question) VALUES (?)', ["Vad förstod du inte / Vilka frågor har du inte fått svar på?"]);
    db.execute('INSERT INTO questions (question) VALUES (?)', ["Vad vill du lära dig mer om?"]);
    
    # Comments
    db.execute('INSERT INTO comments (log_id, user_id, comment) VALUES (?, ?, ?)', [1, 2, "1 lorem"]);
    db.execute('INSERT INTO comments (log_id, user_id, comment) VALUES (?, ?, ?)', [2, 2, "2 lorem"]);
    db.execute('INSERT INTO comments (log_id, user_id, comment) VALUES (?, ?, ?)', [3, 2, "3 lorem"]);
  end
end