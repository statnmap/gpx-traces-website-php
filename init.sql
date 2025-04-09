-- Create a table for Article entity
CREATE TABLE IF NOT EXISTS article (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);

-- Insert the "Hello World" blog post
INSERT INTO article (title, content) VALUES ('Hello World', 'This is the first blog post!');