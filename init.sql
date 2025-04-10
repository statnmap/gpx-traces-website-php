-- Create a table for the Article entity
CREATE TABLE IF NOT EXISTS article (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);

-- Insert test data into the article table
INSERT INTO article (title, content) VALUES
('Hello World', 'This is the first blog post!'),
('Another Post', 'This is another example of a blog post.');
