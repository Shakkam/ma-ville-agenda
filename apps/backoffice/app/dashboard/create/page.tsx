'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventApi } from '@/lib/api/client';
import type { EventCategory, CreateEventInput } from '@/lib/types';
import { ImageDropzone } from '@/components/ImageDropzone';
import styles from './page.module.css';

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'CULTURE',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: EventCategory[] = ['CULTURE', 'SPORT', 'ANIMATION', 'COMMERCE', 'AUTRE'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // <input type="datetime-local"> yields "YYYY-MM-DDTHH:mm" which fails the
      // API's strict ISO 8601 validation — convert to a full ISO string (with Z).
      const payload: CreateEventInput = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        // Drop empty optional URL fields so they don't fail url() validation.
        imageUrl: formData.imageUrl || undefined,
        externalUrl: formData.externalUrl || undefined,
      };
      await eventApi.create(payload);
      router.push('/dashboard');
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      const message = apiMessage || (err instanceof Error ? err.message : 'Échec de la création');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/dashboard" className={styles.back}>
            ← Retour
          </Link>
          <h1>Créer un nouvel événement</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="title">Titre *</label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Festival Jazz à Léognan"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Décrivez l'événement en détail..."
              />
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="category">Catégorie *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="location">Lieu *</label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Espace Culturel Georges Brassens"
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="startDate">Date & heure de début *</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="endDate">Date & heure de fin *</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="externalUrl">Lien externe (optionnel)</label>
              <input
                id="externalUrl"
                name="externalUrl"
                type="url"
                value={formData.externalUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className={styles.field}>
              <label>Image (optionnel)</label>
              <ImageDropzone
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? 'Création...' : '✅ Créer l\'événement'}
              </button>
              <Link href="/dashboard" className={styles.btnCancel}>
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
