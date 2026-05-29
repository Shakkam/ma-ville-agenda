'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const { pendingEvents, publishedEvents, loading, fetchAll } = useEventStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAll();
  }, [isAuthenticated, router, fetchAll]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1>Ma Ville Agenda - Admin</h1>
          <button onClick={logout} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.actions}>
            <Link href="/dashboard/create" className={styles.btnCreate}>
              ➕ Créer un événement
            </Link>
          </div>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2>⏳ En attente de validation ({pendingEvents.length})</h2>
              {loading ? (
                <p>Chargement...</p>
              ) : pendingEvents.length === 0 ? (
                <p className={styles.empty}>Aucun événement en attente</p>
              ) : (
                <ul className={styles.eventList}>
                  {pendingEvents.map((event) => (
                    <li key={event.id}>
                      <div className={styles.eventItem}>
                        <div>
                          <h3>{event.title}</h3>
                          <p>{new Date(event.startDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Link
                          href={`/dashboard/validate/${event.id}`}
                          className={styles.btnValidate}
                        >
                          Voir détails
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.card}>
              <h2>✅ Publiés ({publishedEvents.length})</h2>
              {loading ? (
                <p>Chargement...</p>
              ) : publishedEvents.length === 0 ? (
                <p className={styles.empty}>Aucun événement publié</p>
              ) : (
                <ul className={styles.eventList}>
                  {publishedEvents.slice(0, 5).map((event) => (
                    <li key={event.id}>
                      <div className={styles.eventItem}>
                        <div>
                          <h3>{event.title}</h3>
                          <p>{new Date(event.startDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className={styles.btnEdit}
                        >
                          Gérer
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {publishedEvents.length > 5 && (
                <Link href="/dashboard/events" className={styles.linkMore}>
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
