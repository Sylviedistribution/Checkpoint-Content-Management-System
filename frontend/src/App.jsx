import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Posts from './pages/Posts.jsx';
import PostEditor from './pages/PostEditor.jsx';
import Categories from './pages/Categories.jsx';
import Tags from './pages/Tags.jsx';
import Comments from './pages/Comments.jsx';
import Media from './pages/Media.jsx';
import Users from './pages/Users.jsx';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected roles={['admin','editor','author']}><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:id/edit" element={<PostEditor />} />
        <Route path="categories" element={<Protected roles={['admin','editor']}><Categories /></Protected>} />
        <Route path="tags" element={<Tags />} />
        <Route path="comments" element={<Protected roles={['admin','editor']}><Comments /></Protected>} />
        <Route path="media" element={<Media />} />
        <Route path="users" element={<Protected roles={['admin','editor']}><Users /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
