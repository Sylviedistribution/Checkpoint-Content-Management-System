const { query } = require('../config/database');
const Post = require('../models/Post');
const ActivityLog = require('../models/ActivityLog');
const { successResponse } = require('../utils/helpers');

exports.getStats = async (req, res, next) => {
  try {
    const [posts, users, comments, activity] = await Promise.all([
      Post.getStatistics(),
      query(`SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS new_this_month
             FROM users`),
      query(`SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
             FROM comments`),
      ActivityLog.findRecent(10)
    ]);
    res.json(successResponse({
      posts,
      users: users.rows[0],
      comments: comments.rows[0],
      recent_activity: activity
    }));
  } catch (err) { next(err); }
};
