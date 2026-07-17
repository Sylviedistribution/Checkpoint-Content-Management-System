const slugify = require('slugify');
const crypto = require('crypto');

const generateSlug = (text) =>
  slugify(text, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

const generateUniqueSlug = async (text, existsCallback) => {
  let slug = generateSlug(text);
  if (await existsCallback(slug)) {
    slug = `${slug}-${crypto.randomBytes(4).toString('hex')}`;
  }
  return slug;
};

const paginate = (page = 1, limit = 10) => {
  page = Math.max(parseInt(page) || 1, 1);
  limit = Math.min(Math.max(parseInt(limit) || 10, 1), parseInt(process.env.MAX_PAGE_SIZE) || 100);
  return { page, limit, offset: (page - 1) * limit };
};

const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    currentPage: page, totalPages, totalItems, itemsPerPage: limit,
    hasNextPage: page < totalPages, hasPrevPage: page > 1
  };
};

const successResponse = (data, message = 'Success', meta) => {
  const res = { success: true, message, data };
  if (meta) res.pagination = meta;
  return res;
};

const errorResponse = (message, errors = null) => {
  const res = { success: false, message };
  if (errors) res.errors = errors;
  return res;
};

const calculateReadingTime = (text = '') =>
  Math.max(Math.ceil(text.trim().split(/\s+/).length / 200), 1);

const extractExcerpt = (content = '', length = 200) => {
  const text = content.replace(/<[^>]*>/g, '');
  return text.length <= length ? text : text.substring(0, length).trim() + '...';
};

const generateToken = (length = 32) => crypto.randomBytes(length).toString('hex');

module.exports = {
  generateSlug, generateUniqueSlug, paginate, getPaginationMeta,
  successResponse, errorResponse, calculateReadingTime, extractExcerpt, generateToken
};
