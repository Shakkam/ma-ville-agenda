'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { uploadApi } from '@/lib/api/client';
import { compressImage } from '@/lib/utils/compressImage';

interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image trop volumineuse (max 10 Mo)');
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const name = file.type === 'image/gif' ? file.name : 'image.jpg';
      const url = await uploadApi.uploadImage(compressed, name);
      onChange(url);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Échec de l\'upload');
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  if (value) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Aperçu"
          style={{
            width: '100%',
            maxHeight: 220,
            objectFit: 'cover',
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            display: 'block',
          }}
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ✕ Retirer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? '#2d93c4' : '#cbd5e0'}`,
          borderRadius: 8,
          padding: '32px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          backgroundColor: dragging ? 'rgba(45,147,196,0.06)' : '#fafbfc',
          transition: 'all 0.15s ease',
        }}
      >
        {uploading ? (
          <p style={{ margin: 0, color: '#2d93c4', fontWeight: 600 }}>⏳ Envoi en cours…</p>
        ) : (
          <>
            <p style={{ margin: '0 0 4px', fontSize: 32 }}>🖼️</p>
            <p style={{ margin: '0 0 4px', color: '#212121', fontWeight: 600 }}>
              Glissez une image ici
            </p>
            <p style={{ margin: 0, color: '#757575', fontSize: 13 }}>
              ou cliquez pour parcourir — JPEG, PNG, WebP, GIF (max 10 Mo)
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      {error && (
        <p style={{ color: '#f44336', fontSize: 13, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
