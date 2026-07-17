import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

export default function Media() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const canDelete = ['admin', 'editor'].includes(user.role);

  const load = () => api.get('/media', { params: { limit: 50 } }).then(({ data }) => setItems(data.data));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/media', fd);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Téléversement impossible');
    }
    e.target.value = '';
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    await api.delete(`/media/${id}`);
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>Bibliothèque de médias</h1>
        <label style={{ margin: 0 }}>
          <input type="file" style={{ display: 'none' }} onChange={upload}
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" />
          <span className="btn" style={{ display: 'inline-block' }}>Téléverser un fichier</span>
        </label>
      </div>
      {error && <div className="error" style={{ marginBottom: 14 }}>{error}</div>}
      <div className="card">
        <table>
          <thead><tr><th>Aperçu</th><th>Fichier</th><th>Type</th><th>Taille</th><th></th></tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.media_id}>
                <td>{m.file_type === 'image'
                  ? <img src={m.file_path} alt={m.alt_text || m.original_name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                  : <span className="badge draft">{m.mime_type}</span>}
                </td>
                <td><b>{m.original_name}</b><div className="muted" style={{ fontSize: '0.8rem' }}>{m.file_path}</div></td>
                <td>{m.mime_type}</td>
                <td>{(m.file_size / 1024).toFixed(0)} Ko</td>
                <td>{canDelete && <button className="danger small" onClick={() => remove(m.media_id)}>Supprimer</button>}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="muted">Aucun média. Téléversez votre premier fichier.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
