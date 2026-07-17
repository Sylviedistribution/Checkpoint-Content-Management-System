const { query } = require('../config/database');

const ActivityLog = {
  async log({ user_id, action, entity_type, entity_id, description, ip_address, user_agent }) {
    try {
      await query(
        `INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [user_id || null, action, entity_type || null, entity_id || null,
         description || null, ip_address || null, user_agent || null]
      );
    } catch (err) {
      // Le journal ne doit jamais bloquer une operation metier
      console.error('ActivityLog error:', err.message);
    }
  },

  async findRecent(limit = 20) {
    const result = await query(
      `SELECT a.*, u.username FROM activity_log a
       LEFT JOIN users u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
};

module.exports = ActivityLog;
