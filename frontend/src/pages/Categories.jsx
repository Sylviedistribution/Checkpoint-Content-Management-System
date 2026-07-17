import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = () => api.get('/categories').then(({ data }) => setItems(data.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/categories', { name, description });
    setName(''); setDescription(''); load();
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ? Les articles associés perdront leur catégorie.')) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  return (
    <>
      <div className="page-head"><h1>Catégories</h1></div>
      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={create} className="row" style={{ alignItems: 'flex-end' }}>
          <div><label>Nom</label><input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></div>
          <div><label>Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div style={{ flex: '0 0 auto' }}><button type="submit">Créer la catégorie</button></div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Nom</th><th>Slug</th><th>Articles publiés</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.category_id}>
                <td><b>{c.name}</b><div className="muted" style={{ fontSize: '0.8rem' }}>{c.description}</div></td>
                <td className="muted">/{c.slug}</td>
                <td>{c.post_count}</td>
                <td><button className="danger small" onClick={() => remove(c.category_id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
