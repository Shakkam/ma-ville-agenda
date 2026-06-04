'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/client';
import type { ManagedUser, UserRole, InviteResult } from '@/lib/types';

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

  // invite form
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('MODERATOR');
  const [inviting, setInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCopied(false);
    setInviting(true);
    try {
      const result = await usersApi.invite(email, role);
      setLastInvite(result);
      setEmail('');
      setRole('MODERATOR');
      await load();
    } catch (err) {
      setError(extractError(err, 'Échec de l\'invitation'));
    } finally {
      setInviting(false);
    }
  };

  const copyLink = async () => {
    if (!lastInvite) return;
    try {
      await navigator.clipboard.writeText(lastInvite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; the link is visible to copy manually */
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

  const handleDelete = async (id: string, userEmail: string, isInvited: boolean) => {
    const verb = isInvited ? 'Révoquer l\'invitation de' : 'Supprimer l\'utilisateur';
    if (!window.confirm(`${verb} ${userEmail} ?`)) return;
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

        {/* Invite */}
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>✉️ Inviter un utilisateur</h2>
          <p style={{ marginTop: 0, color: '#757575', fontSize: 14 }}>
            L&apos;invité reçoit un lien pour choisir lui-même son mot de passe et activer son compte.
          </p>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Email" style={{ flex: 2, minWidth: 220 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="modo@exemple.fr" style={inputStyle} />
            </Field>
            <Field label="Rôle" style={{ flex: 1, minWidth: 140 }}>
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={inputStyle}>
                <option value="MODERATOR">Modérateur</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </Field>
            <button type="submit" disabled={inviting} style={btnPrimary}>
              {inviting ? '…' : 'Inviter'}
            </button>
          </form>

          {lastInvite && (
            <div style={inviteResultStyle}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#2d6a2d' }}>
                ✅ Invitation créée pour {lastInvite.user.email}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#555' }}>
                {lastInvite.emailSent
                  ? 'Un email a été envoyé avec le lien d\'activation.'
                  : 'Email non configuré — copiez le lien ci-dessous et envoyez-le à la personne :'}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input readOnly value={lastInvite.inviteUrl} style={{ ...inputStyle, flex: 1, fontSize: 12 }} onFocus={(e) => e.target.select()} />
                <button type="button" onClick={copyLink} style={btnSecondary}>{copied ? 'Copié ✓' : 'Copier'}</button>
              </div>
            </div>
          )}
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
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  const isInvited = u.status === 'INVITED';
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
                        >
                          <option value="MODERATOR">{ROLE_LABEL.MODERATOR}</option>
                          <option value="SUPER_ADMIN">{ROLE_LABEL.SUPER_ADMIN}</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <span style={isInvited ? badgeInvited : badgeActive}>
                          {isInvited ? 'Invité' : 'Actif'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleDelete(u.id, u.email, isInvited)}
                          disabled={isSelf}
                          style={{ ...btnDanger, opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                        >
                          {isInvited ? 'Révoquer' : 'Supprimer'}
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

const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' };
const btnPrimary: React.CSSProperties = { backgroundColor: '#2d93c4', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', height: 40 };
const btnSecondary: React.CSSProperties = { backgroundColor: '#2d93c4', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnDanger: React.CSSProperties = { backgroundColor: '#fff', color: '#f44336', border: '1px solid #f44336', borderRadius: 6, padding: '6px 12px', fontWeight: 600, fontSize: 13 };
const thStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 13, color: '#757575' };
const tdStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 14, color: '#212121' };
const badgeActive: React.CSSProperties = { background: 'rgba(76,175,80,0.15)', color: '#2e7d32', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 };
const badgeInvited: React.CSSProperties = { background: 'rgba(255,152,0,0.15)', color: '#e65100', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 };
const inviteResultStyle: React.CSSProperties = { marginTop: 16, padding: 16, background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 8 };
const alertStyle: React.CSSProperties = { backgroundColor: 'rgba(244,67,54,0.1)', color: '#f44336', padding: 12, borderRadius: 6, borderLeft: '4px solid #f44336', marginBottom: 16 };
