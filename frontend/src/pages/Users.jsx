import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = ['admin', 'editor', 'author', 'subscriber'];

export default function Users() {
  const { user: me } = useAuth();
  const [items, setItems] = useState([]);
  const isAdmin = me.role === 'admin';

  const load = () => api.get('/users', { params: { limit: 50 } }).then(({ data }) => setItems(data.data));
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    load();
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u.user_id}`, { is_active: !u.is_active });
    load();
  };

  return (
    <>
      <div className="page-head"><h1>Utilisateurs</h1></div>
      <div className="card">
        <table>
          <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Dernière connexion</th><th>Statut</th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.user_id}>
                <td><b>{u.username}</b></td>
                <td className="muted">{u.email}</td>
                <td>
                  {isAdmin && u.user_id !== me.user_id ? (
                    <select value={u.role} onChange={(e) => changeRole(u.user_id, e.target.value)} style={{ maxWidth: 140 }}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : <span className={`badge ${u.role}`}>{u.role}</span>}
                </td>
                <td className="muted">{u.last_login ? new Date(u.last_login).toLocaleString('fr-FR') : 'jamais'}</td>
                <td>
                  {isAdmin && u.user_id !== me.user_id
                    ? <button className={u.is_active ? 'danger small' : 'small'} onClick={() => toggleActive(u)}>
                        {u.is_active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    : <span className={`badge ${u.is_active ? 'approved' : 'trash'}`}>{u.is_active ? 'actif' : 'inactif'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
