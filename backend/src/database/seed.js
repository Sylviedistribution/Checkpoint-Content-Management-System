// Initial data: users (properly hashed passwords), categories, tags, sample posts
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash('Admin123!', 10);

    const users = await client.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES
        ('admin',  'admin@educms.com',  $1, 'Admin',  'User', 'admin',  true, true),
        ('editor', 'editor@educms.com', $1, 'Editor', 'User', 'editor', true, true),
        ('author', 'author@educms.com', $1, 'Author', 'User', 'author', true, true)
       ON CONFLICT (email) DO NOTHING
       RETURNING user_id`, [hash]);

    await client.query(
      `INSERT INTO categories (name, slug, description, display_order) VALUES
        ('Computer Science', 'computer-science', 'Articles about computer science topics', 1),
        ('Programming', 'programming', 'Programming tutorials and guides', 2),
        ('Web Development', 'web-development', 'Web development resources', 3),
        ('Data Science', 'data-science', 'Data science and analytics', 4),
        ('Artificial Intelligence', 'artificial-intelligence', 'AI and machine learning topics', 5)
       ON CONFLICT (slug) DO NOTHING`);

    await client.query(
      `INSERT INTO tags (name, slug) VALUES
        ('JavaScript','javascript'),('Python','python'),('React','react'),
        ('Node.js','nodejs'),('Machine Learning','machine-learning'),
        ('Tutorial','tutorial'),('Beginner','beginner'),('Advanced','advanced')
       ON CONFLICT (slug) DO NOTHING`);

    const adminId = users.rows.length ? users.rows[0].user_id : 1;
    await client.query(
      `INSERT INTO posts (title, slug, content, excerpt, author_id, category_id, status, published_at, is_featured, reading_time)
       VALUES
        ('Getting Started with React.js','getting-started-with-react',
         '<h2>Introduction to React</h2><p>React is a popular JavaScript library for building user interfaces...</p>',
         'Learn the basics of React.js', $1, 3, 'published', CURRENT_TIMESTAMP, true, 10),
        ('Python for Data Science','python-for-data-science',
         '<h2>Why Python?</h2><p>Python has become the go-to language for data science...</p>',
         'Discover why Python is essential for data science', $1, 4, 'published', CURRENT_TIMESTAMP, false, 15)
       ON CONFLICT (slug) DO NOTHING`, [adminId]);

    await client.query(
      `INSERT INTO post_tags (post_id, tag_id)
       SELECT p.post_id, t.tag_id FROM posts p, tags t
       WHERE (p.slug = 'getting-started-with-react' AND t.slug IN ('javascript','react','tutorial'))
          OR (p.slug = 'python-for-data-science' AND t.slug IN ('python','machine-learning','tutorial'))
       ON CONFLICT DO NOTHING`);

    await client.query('COMMIT');
    console.log('Seed done. Test accounts: admin@educms.com / editor@ / author@ — password: Admin123!');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
})();
