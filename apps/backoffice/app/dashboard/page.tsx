'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const { pendingEvents, publishedEvents, loading, fetchAll } = useEventStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAll();
  }, [mounted, isAuthenticated, router, fetchAll]);

  if (!mounted || !isAuthenticated) {
    return <div style={{ padding: '20px' }}>Chargement...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2d93c4',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Ma Ville Agenda - Admin</h1>
          <button
            onClick={logout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          {/* Actions */}
          <div style={{ marginBottom: '32px' }}>
            <Link href="/dashboard/create" style={{
              display: 'inline-block',
              backgroundColor: '#2d93c4',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
            }}>
              ➕ Créer un événement
            </Link>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
            {/* Pending Events */}
            <section style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{ marginTop: 0 }}>⏳ En attente de validation ({pendingEvents.length})</h2>
              {loading ? (
                <p>Chargement...</p>
              ) : pendingEvents.length === 0 ? (
                <p style={{ color: '#757575', fontStyle: 'italic' }}>Aucun événement en attente</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingEvents.map((event) => (
                    <li key={event.id}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                      }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{event.title}</h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#757575' }}>
                            {new Date(event.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Link href={`/dashboard/validate/${event.id}`} style={{
                          display: 'inline-block',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textDecoration: 'none',
                          fontWeight: '500',
                        }}>
                          Voir détails
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Published Events */}
            <section style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{ marginTop: 0 }}>✅ Publiés ({publishedEvents.length})</h2>
              {loading ? (
                <p>Chargement...</p>
              ) : publishedEvents.length === 0 ? (
                <p style={{ color: '#757575', fontStyle: 'italic' }}>Aucun événement publié</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {publishedEvents.slice(0, 5).map((event) => (
                    <li key={event.id}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                      }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{event.title}</h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#757575' }}>
                            {new Date(event.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {publishedEvents.length > 5 && (
                <Link href="/dashboard/events" style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  color: '#2d93c4',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}>
                  Voir tous les événements →
                </Link>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
