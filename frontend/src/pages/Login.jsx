import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login(email, password);
      if (!['admin', 'editor', 'author'].includes(user.role)) {
        setError("Ce compte n'a pas accès à l'administration.");
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible');
    } finally { setBusy(false); }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Edu<span style={{ color: 'var(--moss)' }}>CMS</span></h1>
        <p className="sub">Espace d'administration</p>
        <label>Adresse email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
