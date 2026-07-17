const { query } = require('../config/database');

const Category = {
  async create({ name, slug, description, parent_id, display_order = 0 }) {
    const result = await query(
      `INSERT INTO categories (name, slug, description, parent_id, display_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, slug, description || null, parent_id || null, display_order]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await query(`
      SELECT c.*, COUNT(p.post_id) FILTER (WHERE p.status = 'published')::int AS post_count
      FROM categories c
      LEFT JOIN posts p ON p.category_id = c.category_id
      WHERE c.is_active = true
      GROUP BY c.category_id
      ORDER BY c.display_order, c.name`);
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM categories WHERE category_id = $1', [id]);
    return result.rows[0] || null;
  },

  async slugExists(slug) {
    const result = await query('SELECT 1 FROM categories WHERE slug = $1', [slug]);
    return result.rowCount > 0;
  },

  async update(id, fields) {
    const allowed = ['name', 'slug', 'description', 'parent_id', 'display_order', 'is_active'];
    const sets = [];
    const params = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        params.push(fields[key]);
        sets.push(`${key} = $${params.length}`);
      }
    }
    if (!sets.length) return this.findById(id);
    params.push(id);
    const result = await query(
      `UPDATE categories SET ${sets.join(', ')} WHERE category_id = $${params.length} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async remove(id) {
    const result = await query('DELETE FROM categories WHERE category_id = $1 RETURNING category_id', [id]);
    return result.rowCount > 0;
  }
};

module.exports = Category;
