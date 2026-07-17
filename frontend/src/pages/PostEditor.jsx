import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const empty = {
  title: '', content: '', excerpt: '', category_id: '', status: 'draft',
  meta_title: '', meta_description: '', is_featured: false, allow_comments: true, tags: []
};

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canPublish = ['admin', 'editor'].includes(user.role);

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data));
    api.get('/tags').then(({ data }) => setAllTags(data.data));
    if (id) {
      api.get(`/posts/${id}`).then(({ data }) => {
        const p = data.data;
        setForm({
          title: p.title, content: p.content, excerpt: p.excerpt || '',
          category_id: p.category_id || '', status: p.status,
          meta_title: p.meta_title || '', meta_description: p.meta_description || '',
          is_featured: p.is_featured, allow_comments: p.allow_comments,
          tags: (p.tags || []).map((t) => t.tag_id)
        });
      });
    }
  }, [id]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleTag = (tagId) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((t) => t !== tagId) : [...f.tags, tagId]
    }));

  const save = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (id) await api.put(`/posts/${id}`, payload);
      else await api.post('/posts', payload);
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Enregistrement impossible');
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save}>
      <div className="page-head">
        <h1>{id ? "Modifier l'article" : 'Nouvel article'}</h1>
        <button type="submit" disabled={busy}>{busy ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
      {error && <div className="error" style={{ marginBottom: 14 }}>{error}</div>}
      <div className="card">
        <label>Titre</label>
        <input value={form.title} onChange={set('title')} required minLength={3} />

        <label>Contenu (HTML ou Markdown)</label>
        <textarea className="editor" value={form.content} onChange={set('content')} required />

        <label>Extrait <span className="muted">(généré automatiquement si vide)</span></label>
        <textarea rows="2" value={form.excerpt} onChange={set('excerpt')} />

        <div className="row">
          <div>
            <label>Catégorie</label>
            <select value={form.category_id} onChange={set('category_id')}>
              <option value="">— Aucune —</option>
              {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Statut</label>
            <select value={form.status} onChange={set('status')}>
              <option value="draft">Brouillon</option>
              {canPublish && <option value="published">Publié</option>}
              <option value="archived">Archivé</option>
            </select>
            {!canPublish && <div className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
              La publication est validée par un éditeur.
            </div>}
          </div>
        </div>

        <label>Tags</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allTags.map((t) => (
            <button type="button" key={t.tag_id}
              className={form.tags.includes(t.tag_id) ? 'small' : 'ghost small'}
              onClick={() => toggleTag(t.tag_id)}>
              {t.name}
            </button>
          ))}
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <div>
            <label>Titre SEO</label>
            <input value={form.meta_title} onChange={set('meta_title')} />
          </div>
          <div>
            <label>Description SEO</label>
            <input value={form.meta_description} onChange={set('meta_description')} />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
          <label style={{ margin: 0, fontWeight: 400 }}>
            <input type="checkbox" style={{ width: 'auto', marginRight: 6 }}
              checked={form.is_featured} onChange={set('is_featured')} /> Mettre en avant
          </label>
          <label style={{ margin: 0, fontWeight: 400 }}>
            <input type="checkbox" style={{ width: 'auto', marginRight: 6 }}
              checked={form.allow_comments} onChange={set('allow_comments')} /> Autoriser les commentaires
          </label>
        </div>
      </div>
    </form>
  );
}
