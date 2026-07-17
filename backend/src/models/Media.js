const { query } = require('../config/database');

const Media = {
  async create(data) {
    const { filename, original_name, file_path, file_type, file_size, mime_type,
      uploaded_by, alt_text, caption } = data;
    const result = await query(
      `INSERT INTO media (filename, original_name, file_path, file_type, file_size,
        mime_type, uploaded_by, alt_text, caption)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [filename, original_name, file_path, file_type || null, file_size || null,
       mime_type || null, uploaded_by, alt_text || null, caption || null]
    );
    return result.rows[0];
  },

  async findAll({ limit, offset, file_type }) {
    const params = [];
    let whereSql = '';
    if (file_type) { params.push(file_type); whereSql = `WHERE file_type = $${params.length}`; }
    const total = await query(`SELECT COUNT(*) FROM media ${whereSql}`, params);
    params.push(limit, offset);
    const result = await query(
      `SELECT m.*, u.username AS uploaded_by_username
       FROM media m LEFT JOIN users u ON m.uploaded_by = u.user_id
       ${whereSql} ORDER BY m.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { media: result.rows, total: parseInt(total.rows[0].count) };
  },

  async findById(id) {
    const result = await query('SELECT * FROM media WHERE media_id = $1', [id]);
    return result.rows[0] || null;
  },

  async remove(id) {
    const result = await query('DELETE FROM media WHERE media_id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
};

module.exports = Media;
