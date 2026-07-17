const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const SAFE_FIELDS = `user_id, username, email, first_name, last_name, role, bio,
  avatar, created_at, updated_at, last_login, is_active, email_verified`;

const User = {
  async create({ username, email, password, first_name, last_name, role = 'subscriber' }) {
    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${SAFE_FIELDS}`,
      [username, email, hash, first_name || null, last_name || null, role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(`SELECT ${SAFE_FIELDS} FROM users WHERE user_id = $1`, [id]);
    return result.rows[0] || null;
  },

  async findAll({ limit, offset, role, search }) {
    const params = [];
    const where = [];
    if (role) { params.push(role); where.push(`role = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(username ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*) FROM users ${whereSql}`, params);
    params.push(limit, offset);
    const result = await query(
      `SELECT ${SAFE_FIELDS} FROM users ${whereSql}
       ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { users: result.rows, total: parseInt(total.rows[0].count) };
  },

  async update(id, fields) {
    const allowed = ['first_name', 'last_name', 'bio', 'avatar', 'role', 'is_active', 'email'];
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
      `UPDATE users SET ${sets.join(', ')} WHERE user_id = $${params.length} RETURNING ${SAFE_FIELDS}`,
      params
    );
    return result.rows[0] || null;
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    await query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [hash, id]);
  },

  async updateLastLogin(id) {
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [id]);
  },

  async remove(id) {
    const result = await query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);
    return result.rowCount > 0;
  },

  comparePassword: (plain, hash) => bcrypt.compare(plain, hash)
};

module.exports = User;
