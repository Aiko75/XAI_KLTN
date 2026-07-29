-- schema.sql
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Drop tables if they already exist (caution: this deletes data)
-- DROP TABLE IF EXISTS survey_logs;
-- DROP TABLE IF EXISTS response_logs;
-- DROP TABLE IF EXISTS users;

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    student_code VARCHAR(100),
    group_assigned CHAR(1) NOT NULL CHECK(group_assigned IN ('A', 'B', 'C')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    feedback TEXT
);

-- 2. Create response_logs table
CREATE TABLE IF NOT EXISTS response_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    scenario_id INT NOT NULL CHECK(scenario_id >= 1),
    user_decision VARCHAR(50) NOT NULL CHECK(user_decision IN ('agree', 'reject')),
    time_spent_seconds DOUBLE PRECISION NOT NULL CHECK(time_spent_seconds >= 0),
    is_correct_on_error_case BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_response FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Create survey_logs table
CREATE TABLE IF NOT EXISTS survey_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    question_key VARCHAR(100) NOT NULL,
    score INT NOT NULL CHECK(score BETWEEN 1 AND 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_survey FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
