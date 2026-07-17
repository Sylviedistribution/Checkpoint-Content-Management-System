import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canModerate = ['admin', 'editor'].includes(user.role);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Edu<span>CMS</span></div>
        <nav className="nav">
          <NavLink to="/" end>Tableau de bord</NavLink>
          <NavLink to="/posts">Articles</NavLink>
          {canModerate && <NavLink to="/categories">Catégories</NavLink>}
          <NavLink to="/tags">Tags</NavLink>
          {canModerate && <NavLink to="/comments">Modération</NavLink>}
          <NavLink to="/media">Médias</NavLink>
          {canModerate && <NavLink to="/users">Utilisateurs</NavLink>}
        </nav>
        <div className="whoami">
          <b>{user.username}</b>
          <span className={`badge ${user.role}`}>{user.role}</span>
        </div>
        <button className="ghost" style={{ color: '#c3cbd5', borderColor: '#ffffff2a' }}
          onClick={() => { logout(); navigate('/login'); }}>
          Se déconnecter
        </button>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
