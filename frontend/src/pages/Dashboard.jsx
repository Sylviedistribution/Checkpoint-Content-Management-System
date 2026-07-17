import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Erreur de chargement'));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!stats) return <p className="muted">Chargement des statistiques...</p>;

  return (
    <>
      <div className="page-head"><h1>Tableau de bord</h1></div>
      <div className="stat-grid">
        <div className="card stat"><div className="n">{stats.posts.total_posts}</div><div className="l">Articles</div></div>
        <div className="card stat"><div className="n">{stats.posts.published}</div><div className="l">Publiés</div></div>
        <div className="card stat"><div className="n">{stats.posts.total_views}</div><div className="l">Vues totales</div></div>
        <div className="card stat"><div className="n">{stats.users.total}</div><div className="l">Utilisateurs</div></div>
        <div className="card stat" style={{ borderLeftColor: 'var(--amber)' }}>
          <div className="n">{stats.comments.pending}</div><div className="l">Commentaires en attente</div>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Activité récente</h3>
        {stats.recent_activity.length === 0 && <p className="muted">Aucune activité pour le moment.</p>}
        <table>
          <tbody>
            {stats.recent_activity.map((a) => (
              <tr key={a.log_id}>
                <td><b>{a.username || 'système'}</b></td>
                <td>{a.action.replace(/_/g, ' ')}</td>
                <td className="muted">{a.description || ''}</td>
                <td className="muted">{new Date(a.created_at).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
