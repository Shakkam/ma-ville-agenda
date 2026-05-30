'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { eventApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import type { Event, EventCategory, EventStatus } from '@/lib/types';

// Same category colors as the mobile app (src/styles/colors.ts)
const CATEGORY_COLOR: Record<EventCategory, string> = {
  CULTURE: '#9c27b0',
  SPORT: '#e91e63',
  ANIMATION: '#ff9800',
  COMMERCE: '#2196f3',
  AUTRE: '#757575',
};

const STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  ARCHIVED: 'Archivé',
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    eventApi
      .getById(id)
      .then(setEvent)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Événement introuvable')
      )
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated, id, router]);

  const runAction = async (action: () => Promise<Event>) => {
    setActing(true);
    setError('');
    try {
      await action();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action échouée');
      setActing(false);
    }
  };

  if (!mounted || loading) {
    return <Shell><p style={{ padding: 24 }}>Chargement…</p></Shell>;
  }

  if (error && !event) {
    return (
      <Shell>
        <p style={{ padding: 24, color: '#f44336' }}>{error}</p>
      </Shell>
    );
  }

  if (!event) return null;

  const categoryColor = CATEGORY_COLOR[event.category];
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const formattedDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const endTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Shell>
      {error && (
        <div style={{ ...alertStyle, margin: '16px auto', maxWidth: 420 }}>{error}</div>
      )}

      {/* ---- Mobile-style detail card (matches apps/mobile/app/event/[id].tsx) ---- */}
      <div style={phoneFrame}>
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt={event.title} style={detailImage} />
        )}

        <div style={{ padding: 24 }}>
          <span style={{ ...categoryBadge, backgroundColor: categoryColor }}>
            {event.category}
          </span>

          <h1 style={detailTitle}>{event.title}</h1>

          <Section title="📅 Date et heure">
            <p style={detailText}>{formattedDate}</p>
            <p style={detailText}>
              {startTime} - {endTime}
            </p>
          </Section>

          <Section title="📍 Lieu">
            <p style={detailText}>{event.location}</p>
          </Section>

          <Section title="📝 Description" last>
            <p style={{ ...detailText, whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </Section>

          {event.externalUrl && (
            <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" style={linkButton}>
              Voir plus d&apos;infos
            </a>
          )}
        </div>
      </div>

      {/* ---- Admin actions (not part of the mobile view) ---- */}
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={statusRow}>
          Statut :{' '}
          <strong style={{ color: categoryColor === undefined ? '#212121' : '#212121' }}>
            {STATUS_LABEL[event.status]}
          </strong>
        </div>

        {event.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{ ...actionBtn, backgroundColor: '#4caf50', color: '#fff' }}
              disabled={acting}
              onClick={() => runAction(() => eventApi.validate(event.id))}
            >
              {acting ? '…' : '✅ Valider et publier'}
            </button>
            <button
              style={{ ...actionBtn, backgroundColor: '#f44336', color: '#fff' }}
              disabled={acting}
              onClick={() => runAction(() => eventApi.reject(event.id))}
            >
              {acting ? '…' : '❌ Rejeter'}
            </button>
          </div>
        )}

        {event.status === 'PUBLISHED' && (
          <button
            style={{ ...actionBtn, backgroundColor: '#fff', color: '#f44336', border: '1px solid #f44336' }}
            disabled={acting}
            onClick={() => runAction(() => eventApi.archive(event.id))}
          >
            {acting ? '…' : '🗄️ Archiver / Dépublier'}
          </button>
        )}

        {(event.status === 'REJECTED' || event.status === 'ARCHIVED') && (
          <button
            style={{ ...actionBtn, backgroundColor: '#4caf50', color: '#fff' }}
            disabled={acting}
            onClick={() => runAction(() => eventApi.validate(event.id))}
          >
            {acting ? '…' : '✅ Republier'}
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <header style={headerStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
            ← Retour
          </Link>
          <h1 style={{ margin: 0, fontSize: 22 }}>Détail de l&apos;événement</h1>
        </div>
      </header>
      <main style={{ padding: '24px 0' }}>{children}</main>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        marginBottom: 24,
        paddingBottom: last ? 0 : 24,
        borderBottom: last ? 'none' : '1px solid #e0e0e0',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#212121' }}>{title}</h3>
      {children}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  backgroundColor: '#2d93c4',
  color: '#fff',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

// Narrow frame to evoke the phone screen the mobile detail renders in
const phoneFrame: React.CSSProperties = {
  maxWidth: 420,
  margin: '0 auto 20px',
  background: '#fff',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
};

const detailImage: React.CSSProperties = {
  width: '100%',
  height: 250,
  objectFit: 'cover',
  display: 'block',
  backgroundColor: '#f8f9fa',
};

const categoryBadge: React.CSSProperties = {
  display: 'inline-block',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  padding: '6px 12px',
  borderRadius: 8,
  marginBottom: 16,
};

const detailTitle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#212121',
  margin: '0 0 24px',
};

const detailText: React.CSSProperties = {
  fontSize: 16,
  color: '#757575',
  lineHeight: 1.5,
  margin: '0 0 8px',
};

const linkButton: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  backgroundColor: '#2d93c4',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  padding: '12px 24px',
  borderRadius: 8,
  textDecoration: 'none',
  marginTop: 24,
};

const statusRow: React.CSSProperties = {
  marginBottom: 16,
  color: '#757575',
  fontSize: 14,
};

const actionBtn: React.CSSProperties = {
  flex: 1,
  width: '100%',
  padding: '12px 24px',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

const alertStyle: React.CSSProperties = {
  backgroundColor: 'rgba(244,67,54,0.1)',
  color: '#f44336',
  padding: 12,
  borderRadius: 6,
  borderLeft: '4px solid #f44336',
  fontSize: 14,
};
