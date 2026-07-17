import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

export default function Tags() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const canDelete = user.role === 'admin';

  const load = () => api.get('/tags').then(({ data }) => setItems(data.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/tags', { name });
    setName(''); load();
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce tag ?')) return;
    await api.delete(`/tags/${id}`);
    load();
  };

  return (
    <>
      <div className="page-head"><h1>Tags</h1></div>
      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={create} className="row" style={{ alignItems: 'flex-end' }}>
          <div><label>Nouveau tag</label><input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></div>
          <div style={{ flex: '0 0 auto' }}><button type="submit">Créer</button></div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Nom</th><th>Slug</th><th>Utilisations</th><th></th></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.tag_id}>
                <td><b>{t.name}</b></td>
                <td className="muted">#{t.slug}</td>
                <td>{t.post_count}</td>
                <td>{canDelete && <button className="danger small" onClick={() => remove(t.tag_id)}>Supprimer</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
