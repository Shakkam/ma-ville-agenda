'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/client';
import type { ManagedUser, UserRole } from '@/lib/types';

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  MODERATOR: 'Modérateur',
};

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // create form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('MODERATOR');
  const [creating, setCreating] = useState(false);

  useEffect(() => setMounted(true), []);

  const load = async () => {
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      setError(extractError(err, 'Impossible de charger les utilisateurs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role === 'SUPER_ADMIN') load();
    else setLoading(false);
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated) {
    return <Shell><p style={{ padding: 24 }}>Chargement…</p></Shell>;
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <Shell>
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#212121' }}>🔒 Accès réservé au Super Admin</p>
          <Link href="/dashboard" style={{ color: '#2d93c4' }}>← Retour au dashboard</Link>
        </div>
      </Shell>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await usersApi.create(email, password, role);
      setEmail('');
      setPassword('');
      setRole('MODERATOR');
      await load();
    } catch (err) {
      setError(extractError(err, 'Échec de la création'));
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    setError('');
    try {
      await usersApi.updateRole(id, newRole);
      await load();
    } catch (err) {
      setError(extractError(err, 'Échec du changement de rôle'));
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (!window.confirm(`Supprimer l'utilisateur ${userEmail} ?`)) return;
    setError('');
    try {
      await usersApi.remove(id);
      await load();
    } catch (err) {
      setError(extractError(err, 'Échec de la suppression'));
    }
  };

  return (
    <Shell>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' }}>
        {error && <div style={alertStyle}>{error}</div>}

        {/* Create user */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>➕ Créer un utilisateur</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Email" style={{ flex: 2, minWidth: 200 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="modo@exemple.fr" style={inputStyle} />
            </Field>
            <Field label="Mot de passe (min. 8)" style={{ flex: 2, minWidth: 180 }}>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="••••••••" style={inputStyle} />
            </Field>
            <Field label="Rôle" style={{ flex: 1, minWidth: 140 }}>
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={inputStyle}>
                <option value="MODERATOR">Modérateur</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </Field>
            <button type="submit" disabled={creating} style={btnPrimary}>
              {creating ? '…' : 'Créer'}
            </button>
          </form>
        </section>

        {/* List */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>👥 Utilisateurs ({users.length})</h2>
          {loading ? (
            <p>Chargement…</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Rôle</th>
                  <th style={thStyle}>Créé le</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={tdStyle}>
                        {u.email} {isSelf && <span style={{ color: '#757575', fontSize: 12 }}>(vous)</span>}
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          disabled={isSelf}
                          style={{ ...inputStyle, padding: '6px 8px' }}
                          title={isSelf ? 'Vous ne pouvez pas changer votre propre rôle' : ''}
                        >
                          <option value="MODERATOR">{ROLE_LABEL.MODERATOR}</option>
                          <option value="SUPER_ADMIN">{ROLE_LABEL.SUPER_ADMIN}</option>
                        </select>
                      </td>
                      <td style={{ ...tdStyle, color: '#757575', fontSize: 13 }}>
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          disabled={isSelf}
                          style={{ ...btnDanger, opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                          title={isSelf ? 'Vous ne pouvez pas vous supprimer' : ''}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <header style={{ backgroundColor: '#2d93c4', color: '#fff', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>← Retour</Link>
          <h1 style={{ margin: 0, fontSize: 22 }}>Gestion des utilisateurs</h1>
        </div>
      </header>
      <main style={{ padding: '24px 0' }}>{children}</main>
    </div>
  );
}

function Field({ label, style, children }: { label: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{label}</label>
      {children}
    </div>
  );
}

function extractError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : fallback)
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 24,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: 24,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e0e0e0',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  backgroundColor: '#2d93c4',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  height: 40,
};
const btnDanger: React.CSSProperties = {
  backgroundColor: '#fff',
  color: '#f44336',
  border: '1px solid #f44336',
  borderRadius: 6,
  padding: '6px 12px',
  fontWeight: 600,
  fontSize: 13,
};
const thStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 13, color: '#757575' };
const tdStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 14, color: '#212121' };
const alertStyle: React.CSSProperties = {
  backgroundColor: 'rgba(244,67,54,0.1)',
  color: '#f44336',
  padding: 12,
  borderRadius: 6,
  borderLeft: '4px solid #f44336',
  marginBottom: 16,
};
