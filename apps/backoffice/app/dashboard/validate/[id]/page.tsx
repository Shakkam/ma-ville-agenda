'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { eventApi } from '@/lib/api/client';
import type { Event } from '@/lib/types';
import styles from './page.module.css';

export default function ValidateEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventApi.getById(id);
        setEvent(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load event';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await eventApi.validate(id);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate event';
      setError(message);
    } finally {
      setValidating(false);
    }
  };

  const handleReject = async () => {
    setValidating(true);
    try {
      await eventApi.reject(id);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject event';
      setError(message);
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <div className={styles.container}>
            <Link href="/dashboard" className={styles.back}>
              ← Retour
            </Link>
            <h1>Validation d'événement</h1>
          </div>
        </header>
        <main className={styles.main}>
          <p>Chargement...</p>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <div className={styles.container}>
            <Link href="/dashboard" className={styles.back}>
              ← Retour
            </Link>
            <h1>Validation d'événement</h1>
          </div>
        </header>
        <main className={styles.main}>
          <p className={styles.error}>{error || 'Événement non trouvé'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/dashboard" className={styles.back}>
            ← Retour
          </Link>
          <h1>Validation d'événement</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            {error && <div className={styles.alertError}>{error}</div>}

            <h2>{event.title}</h2>

            <div className={styles.meta}>
              <div>
                <strong>Catégorie:</strong> {event.category}
              </div>
              <div>
                <strong>Lieu:</strong> {event.location}
              </div>
              <div>
                <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <section className={styles.section}>
              <h3>Description</h3>
              <p>{event.description}</p>
            </section>

            {event.imageUrl && (
              <section className={styles.section}>
                <h3>Image</h3>
                <img src={event.imageUrl} alt={event.title} className={styles.image} />
              </section>
            )}

            {event.externalUrl && (
              <section className={styles.section}>
                <h3>Lien externe</h3>
                <a href={event.externalUrl} target="_blank" rel="noopener noreferrer">
                  {event.externalUrl}
                </a>
              </section>
            )}

            <div className={styles.actions}>
              <button
                onClick={handleValidate}
                className={styles.btnValidate}
                disabled={validating}
              >
                {validating ? 'Traitement...' : '✅ Valider et publier'}
              </button>
              <button
                onClick={handleReject}
                className={styles.btnReject}
                disabled={validating}
              >
                {validating ? 'Traitement...' : '❌ Rejeter'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
