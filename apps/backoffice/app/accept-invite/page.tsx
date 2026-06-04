'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

function AcceptInviteForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const { acceptInvite } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await acceptInvite(token, password);
      router.push('/dashboard');
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Lien invalide ou expiré';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={cardStyle}>
        <h1 style={titleStyle}>Lien invalide</h1>
        <p style={{ color: '#757575', textAlign: 'center' }}>
          Ce lien d&apos;invitation est incomplet. Demandez un nouveau lien à votre administrateur.
        </p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h1 style={titleStyle}>Ma Ville Agenda</h1>
      <p style={subtitleStyle}>Choisissez votre mot de passe pour activer votre compte</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {error && <div style={errorBox}>{error}</div>}

        <div style={fieldStyle}>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Au moins 8 caractères" required minLength={8} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label>Confirmer le mot de passe</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Activation…' : 'Activer mon compte'}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div style={containerStyle}>
      <Suspense fallback={<div style={cardStyle}><p>Chargement…</p></div>}>
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #2d93c4 0%, #1e6a95 100%)',
};
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 40, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: 400 };
const titleStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, color: '#2d93c4', textAlign: 'center', marginBottom: 8 };
const subtitleStyle: React.CSSProperties = { fontSize: 14, color: '#757575', textAlign: 'center', marginBottom: 32 };
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: '#212121' };
const inputStyle: React.CSSProperties = { padding: 12, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 14 };
const buttonStyle: React.CSSProperties = { backgroundColor: '#2d93c4', color: '#fff', padding: 12, border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8 };
const errorBox: React.CSSProperties = { backgroundColor: 'rgba(244,67,54,0.1)', color: '#f44336', padding: 12, borderRadius: 6, fontSize: 14, borderLeft: '4px solid #f44336' };
