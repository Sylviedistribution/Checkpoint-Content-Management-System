import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

export default function Comments() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending');

  const load = useCallback(() => {
    api.get('/comments', { params: { status, limit: 50 } })
      .then(({ data }) => setItems(data.data));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, newStatus) => {
    await api.patch(`/comments/${id}/status`, { status: newStatus });
    load();
  };

  return (
    <>
      <div className="page-head"><h1>Modération des commentaires</h1></div>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="spam">Spam</option>
          <option value="trash">Corbeille</option>
        </select>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Auteur</th><th>Commentaire</th><th>Article</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.comment_id}>
                <td><b>{c.username || 'anonyme'}</b></td>
                <td style={{ maxWidth: 380 }}>{c.content}</td>
                <td className="muted">{c.post_title}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {status !== 'approved' && <button className="small" onClick={() => moderate(c.comment_id, 'approved')}>Approuver</button>}{' '}
                  {status !== 'spam' && <button className="ghost small" onClick={() => moderate(c.comment_id, 'spam')}>Spam</button>}{' '}
                  {status !== 'trash' && <button className="danger small" onClick={() => moderate(c.comment_id, 'trash')}>Corbeille</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="4" className="muted">Rien à modérer ici.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
