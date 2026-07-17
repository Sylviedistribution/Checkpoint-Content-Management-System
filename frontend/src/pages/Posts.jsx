import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    api.get('/posts', { params: { page, limit: 10, search: search || undefined, status: status || undefined } })
      .then(({ data }) => { setPosts(data.data); setMeta(data.pagination); });
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement cet article ?')) return;
    await api.delete(`/posts/${id}`);
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>Articles</h1>
        <Link to="/posts/new"><button>Nouvel article</button></Link>
      </div>
      <div className="toolbar">
        <input placeholder="Rechercher un titre..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="published">Publiés</option>
          <option value="archived">Archivés</option>
        </select>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Titre</th><th>Auteur</th><th>Catégorie</th><th>Statut</th><th>Vues</th><th></th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.post_id}>
                <td><b>{p.title}</b><div className="muted" style={{ fontSize: '0.8rem' }}>/{p.slug}</div></td>
                <td>{p.author_username}</td>
                <td>{p.category_name || '—'}</td>
                <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                <td>{p.view_count}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link to={`/posts/${p.post_id}/edit`}><button className="ghost small">Modifier</button></Link>{' '}
                  <button className="danger small" onClick={() => remove(p.post_id)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan="6" className="muted">Aucun article. Créez le premier !</td></tr>}
          </tbody>
        </table>
        {meta && meta.totalPages > 1 && (
          <div className="pager">
            <button className="ghost small" disabled={!meta.hasPrevPage} onClick={() => setPage(page - 1)}>Précédent</button>
            <span className="muted">{meta.currentPage} / {meta.totalPages}</span>
            <button className="ghost small" disabled={!meta.hasNextPage} onClick={() => setPage(page + 1)}>Suivant</button>
          </div>
        )}
      </div>
    </>
  );
}
