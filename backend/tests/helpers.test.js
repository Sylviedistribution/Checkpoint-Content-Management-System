const {
  generateSlug, paginate, getPaginationMeta,
  calculateReadingTime, extractExcerpt
} = require('../src/utils/helpers');

describe('helpers', () => {
  test('generateSlug produit un slug URL-safe', () => {
    expect(generateSlug('Héllo World! (test)')).toBe('hello-world-test');
  });

  test('paginate borne les valeurs', () => {
    expect(paginate(0, 500)).toEqual({ page: 1, limit: 100, offset: 0 });
    expect(paginate(3, 10)).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  test('getPaginationMeta calcule les pages', () => {
    const meta = getPaginationMeta(45, 2, 10);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(true);
  });

  test('calculateReadingTime minimum 1 minute', () => {
    expect(calculateReadingTime('court texte')).toBe(1);
    expect(calculateReadingTime('mot '.repeat(600))).toBe(3);
  });

  test('extractExcerpt retire le HTML et tronque', () => {
    const html = '<p>' + 'a'.repeat(300) + '</p>';
    const excerpt = extractExcerpt(html, 50);
    expect(excerpt.length).toBeLessThanOrEqual(53);
    expect(excerpt).not.toContain('<p>');
  });
});
