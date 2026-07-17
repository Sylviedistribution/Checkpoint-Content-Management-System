const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret_key_for_unit_tests_only_1234';

jest.mock('../src/config/database', () => ({
  query: jest.fn()
}));
const { query } = require('../src/config/database');
const { authenticate, authorize } = require('../src/middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware auth', () => {
  test('rejette sans en-tete Authorization', async () => {
    const res = mockRes();
    await authenticate({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('accepte un token valide pour un compte actif', async () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    query.mockResolvedValue({ rows: [{ user_id: 1, role: 'admin', is_active: true }] });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    await authenticate(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
  });

  test('authorize bloque un role insuffisant', () => {
    const res = mockRes();
    authorize('admin')({ user: { role: 'subscriber' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('authorize laisse passer un role autorise', () => {
    const next = jest.fn();
    authorize('admin', 'editor')({ user: { role: 'editor' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
