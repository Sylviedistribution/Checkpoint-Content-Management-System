const { query, transaction } = require('../config/database');
const { calculateReadingTime, extractExcerpt } = require('../utils/helpers');

const BASE_SELECT = `
  SELECT p.*, u.username AS author_username,
         u.first_name AS author_first_name, u.last_name AS author_last_name,
         c.name AS category_name, c.slug AS category_slug,
         COALESCE(json_agg(DISTINCT jsonb_build_object('tag_id', t.tag_id, 'name', t.name, 'slug', t.slug))
                  FILTER (WHERE t.tag_id IS NOT NULL), '[]') AS tags
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.user_id
  LEFT JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN post_tags pt ON p.post_id = pt.post_id
  LEFT JOIN tags t ON pt.tag_id = t.tag_id`;

const GROUP_BY = 'GROUP BY p.post_id, u.username, u.first_name, u.last_name, c.name, c.slug';

const Post = {
  async create(data, authorId) {
    return transaction(async (client) => {
      const {
        title, slug, content, excerpt, category_id, status = 'draft',
        featured_image, meta_title, meta_description, meta_keywords,
        is_featured = false, allow_comments = true, tags = []
      } = data;

      const publishedAt = status === 'published' ? new Date() : null;
      const result = await client.query(
        `INSERT INTO posts (title, slug, content, excerpt, author_id, category_id, status,
           featured_image, published_at, meta_title, meta_description, meta_keywords,
           is_featured, allow_comments, reading_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [title, slug, content, excerpt || extractExcerpt(content), authorId,
         category_id || null, status, featured_image || null, publishedAt,
         meta_title || title, meta_description || null, meta_keywords || null,
         is_featured, allow_comments, calculateReadingTime(content)]
      );
      const post = result.rows[0];
      if (tags.length) {
        for (const tagId of tags) {
          await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [post.post_id, tagId]
          );
        }
      }
      return post;
    });
  },

  async findAll({ limit, offset, status, category_id, tag, author_id, search, featured, orderBy = 'created_at' }) {
    const params = [];
    const where = [];
    if (status) { params.push(status); where.push(`p.status = $${params.length}`); }
    if (category_id) { params.push(category_id); where.push(`p.category_id = $${params.length}`); }
    if (author_id) { params.push(author_id); where.push(`p.author_id = $${params.length}`); }
    if (featured !== undefined) { params.push(featured); where.push(`p.is_featured = $${params.length}`); }
    if (tag) {
      params.push(tag);
      where.push(`p.post_id IN (SELECT pt2.post_id FROM post_tags pt2 JOIN tags t2 ON pt2.tag_id = t2.tag_id WHERE t2.slug = $${params.length})`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const allowedOrder = { created_at: 'p.created_at', published_at: 'p.published_at', view_count: 'p.view_count', title: 'p.title' };
    const orderSql = allowedOrder[orderBy] || 'p.created_at';

    const total = await query(`SELECT COUNT(*) FROM posts p ${whereSql}`, params);
    params.push(limit, offset);
    const result = await query(
      `${BASE_SELECT} ${whereSql} ${GROUP_BY}
       ORDER BY ${orderSql} DESC NULLS LAST LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { posts: result.rows, total: parseInt(total.rows[0].count) };
  },

  async findById(id) {
    const result = await query(`${BASE_SELECT} WHERE p.post_id = $1 ${GROUP_BY}`, [id]);
    return result.rows[0] || null;
  },

  async findBySlug(slug) {
    const result = await query(`${BASE_SELECT} WHERE p.slug = $1 ${GROUP_BY}`, [slug]);
    return result.rows[0] || null;
  },

  async slugExists(slug) {
    const result = await query('SELECT 1 FROM posts WHERE slug = $1', [slug]);
    return result.rowCount > 0;
  },

  async update(id, data) {
    return transaction(async (client) => {
      const allowed = ['title', 'slug', 'content', 'excerpt', 'category_id', 'status',
        'featured_image', 'meta_title', 'meta_description', 'meta_keywords',
        'is_featured', 'allow_comments'];
      const sets = [];
      const params = [];
      for (const key of allowed) {
        if (data[key] !== undefined) {
          params.push(data[key]);
          sets.push(`${key} = $${params.length}`);
        }
      }
      if (data.content !== undefined) {
        params.push(calculateReadingTime(data.content));
        sets.push(`reading_time = $${params.length}`);
      }
      if (data.status === 'published') {
        sets.push(`published_at = COALESCE(published_at, CURRENT_TIMESTAMP)`);
      }
      if (sets.length) {
        params.push(id);
        await client.query(`UPDATE posts SET ${sets.join(', ')} WHERE post_id = $${params.length}`, params);
      }
      if (data.tags !== undefined) {
        await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);
        for (const tagId of data.tags) {
          await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, tagId]
          );
        }
      }
      const result = await client.query('SELECT * FROM posts WHERE post_id = $1', [id]);
      return result.rows[0] || null;
    });
  },

  async incrementViews(id) {
    await query('UPDATE posts SET view_count = view_count + 1 WHERE post_id = $1', [id]);
  },

  async remove(id) {
    const result = await query('DELETE FROM posts WHERE post_id = $1 RETURNING post_id', [id]);
    return result.rowCount > 0;
  },

  async getStatistics() {
    const result = await query(`
      SELECT
        COUNT(*)::int AS total_posts,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts,
        COALESCE(SUM(view_count), 0)::int AS total_views
      FROM posts`);
    return result.rows[0];
  }
};

module.exports = Post;
