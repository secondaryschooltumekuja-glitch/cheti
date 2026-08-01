-- TUMEKUJA Computer Training Certificate System Database
-- CORRECTED SQL Script - Copy and paste ALL of this code in phpMyAdmin

-- STEP 1: Create the database
CREATE DATABASE IF NOT EXISTS tumekuja_certificates 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- STEP 2: Select/Use the database (VERY IMPORTANT!)
USE tumekuja_certificates;

-- STEP 3: Create the students table
CREATE TABLE IF NOT EXISTS students (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    photo LONGTEXT NULL,
    registration_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- STEP 4: Insert sample data (optional)
INSERT INTO students (student_name, course, teacher_name, registration_date) VALUES
('John Doe', 'Computer Basics', 'Teacher Mary', '2025-01-15'),
('Jane Smith', 'Microsoft Office', 'Teacher John', '2025-01-20'),
('Peter Johnson', 'Web Design', 'Teacher Alice', '2025-01-25');

-- STEP 5: Verify everything was created correctly
SHOW TABLES;
DESCRIBE students;
SELECT * FROM students;

-- Additional useful queries:

-- Count total students
SELECT COUNT(*) as total_students FROM students;

-- Students by course
SELECT course, COUNT(*) as student_count 
FROM students 
GROUP BY course 
ORDER BY student_count DESC;

-- Recent registrations (last 30 days)
SELECT * FROM students 
WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY registration_date DESC;
