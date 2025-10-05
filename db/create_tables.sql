
-- create_tables.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL, -- student, lecturer, prl, pl, admin
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  faculty_name TEXT,
  class_name TEXT,
  venue TEXT,
  scheduled_time TEXT
);

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id),
  week_of_reporting TEXT,
  date_of_lecture DATE,
  course_name TEXT,
  course_code TEXT,
  lecturer_name TEXT,
  num_present INTEGER,
  total_registered INTEGER,
  topic_taught TEXT,
  learning_outcomes TEXT,
  recommendations TEXT,
  created_at TIMESTAMP DEFAULT now()
);