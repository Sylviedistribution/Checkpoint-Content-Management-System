const { query } = require('../config/database');

const Comment = {
  async create({ post_id, user_id, parent_id, content, ip_address, user_agent, status = 'pending' }) {
    const result = await query(
      `INSERT INTO comments (post_id, user_id, parent_id, content, ip_address, user_agent, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [post_id, user_id || null, parent_id || null, content, ip_address || null, user_agent || null, status]
    );
    return result.rows[0];
  },

  async findByPost(postId, status = 'approved') {
    const result = await query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.post_id = $1 AND c.status = $2
       ORDER BY c.created_at ASC`,
      [postId, status]
    );
    return result.rows;
  },

  async findAll({ limit, offset, status }) {
    const params = [];
    let whereSql = '';
    if (status) { params.push(status); whereSql = `WHERE c.status = $${params.length}`; }
    const total = await query(`SELECT COUNT(*) FROM comments c ${whereSql}`, params);
    params.push(limit, offset);
    const result = await query(
      `SELECT c.*, u.username, p.title AS post_title
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.user_id
       LEFT JOIN posts p ON c.post_id = p.post_id
       ${whereSql}
       ORDER BY c.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { comments: result.rows, total: parseInt(total.rows[0].count) };
  },

  async findById(id) {
    const result = await query('SELECT * FROM comments WHERE comment_id = $1', [id]);
    return result.rows[0] || null;
  },

  async updateStatus(id, status) {
    const result = await query(
      'UPDATE comments SET status = $1 WHERE comment_id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  },

  async remove(id) {
    const result = await query('DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id', [id]);
    return result.rowCount > 0;
  }
};

module.exports = Comment;
