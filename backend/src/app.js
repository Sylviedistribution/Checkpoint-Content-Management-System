const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // derriere un proxy (Heroku, Render...)

// --- Securite ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
  credentials: true
}));
app.use(rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requetes, reessayez plus tard' }
}));

// --- Parsing & perf ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));

// --- Fichiers statiques (medias) ---
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// --- Documentation Swagger ---
try {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch { /* la doc est optionnelle au demarrage */ }

// --- Routes API ---
const API = `/api/${process.env.API_VERSION || 'v1'}`;
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use(`${API}/auth`, require('./routes/auth'));
app.use(`${API}/posts`, require('./routes/posts'));
app.use(`${API}/categories`, require('./routes/categories'));
app.use(`${API}/tags`, require('./routes/tags'));
app.use(`${API}/comments`, require('./routes/comments'));
app.use(`${API}/media`, require('./routes/media'));
app.use(`${API}/users`, require('./routes/users'));
app.use(`${API}/dashboard`, require('./routes/dashboard'));

// --- Erreurs ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
