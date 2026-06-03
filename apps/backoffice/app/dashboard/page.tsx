'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { eventApi } from '@/lib/api/client';
import type { Event } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventApi.getAll();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return <div style={{ padding: '20px' }}>Chargement...</div>;
  }

  const pendingEvents = events.filter((e) => e.status === 'PENDING');
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED');

  const eventCardLink: React.CSSProperties = {
    display: 'block',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: 'pointer',
  };

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
          <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
            {user?.role === 'SUPER_ADMIN' && (
              <Link href="/dashboard/users" style={{
                display: 'inline-block',
                backgroundColor: 'white',
                color: '#2d93c4',
                border: '1px solid #2d93c4',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                👥 Gérer les utilisateurs
              </Link>
            )}
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
              <h2 style={{ marginTop: 0 }}>⏳ En attente ({pendingEvents.length})</h2>
              {loading ? (
                <p>Chargement...</p>
              ) : pendingEvents.length === 0 ? (
                <p style={{ color: '#757575', fontStyle: 'italic' }}>✅ Aucun événement en attente</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingEvents.map((event) => (
                    <li key={event.id}>
                      <Link href={`/dashboard/events/${event.id}`} style={eventCardLink}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#212121' }}>{event.title}</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#757575' }}>
                          {new Date(event.startDate).toLocaleDateString('fr-FR')} · cliquer pour valider →
                        </p>
                      </Link>
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
              {publishedEvents.length === 0 ? (
                <p style={{ color: '#757575', fontStyle: 'italic' }}>Aucun événement publié</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {publishedEvents.map((event) => (
                    <li key={event.id}>
                      <Link href={`/dashboard/events/${event.id}`} style={eventCardLink}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#212121' }}>{event.title}</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#757575' }}>
                          📅 {new Date(event.startDate).toLocaleDateString('fr-FR')} | 📍 {event.location}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
