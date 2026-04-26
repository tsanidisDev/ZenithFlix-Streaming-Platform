'use client';

import { useEffect, useRef } from 'react';
import type { StreamingContent } from '../../types/content';
import styles from './ContentModal.module.css';

interface Props {
  item: StreamingContent;
  onClose: () => void;
}

export default function ContentModal({ item, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    closeBtnRef.current?.focus();

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus trap
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, video, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const rating = parseFloat(String(item.rating)).toFixed(1);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          &#10005;
        </button>

        {item.thumbnail_url ? (
          <div className={styles.poster}>
            <img src={item.thumbnail_url} alt={`${item.title} poster`} />
          </div>
        ) : (
          <div className={styles.posterFallback} aria-hidden="true">
            <span>{item.title[0]}</span>
          </div>
        )}

        <div className={styles.info}>
          <h2 id="modal-title" className={styles.infoTitle}>
            {item.title}
          </h2>
          <div className={styles.meta}>
            <span className={styles.year}>{item.release_year}</span>
            <span className={styles.genre}>{item.genre}</span>
            <span className={styles.rating}>&#9733; {rating}</span>
            <span className={styles.badge}>{item.content_type}</span>
          </div>
          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
        </div>

        <div className={styles.video}>
          {item.video_url ? (
            <video
              className={styles.videoPlayer}
              controls
              preload="metadata"
              aria-label={`Watch ${item.title}`}
            >
              <source src={item.video_url} />
              Your browser does not support the video element.
            </video>
          ) : (
            <div
              className={styles.videoEmpty}
              role="img"
              aria-label="No video available for this title"
            >
              <span>&#9654;</span>
              <p>No video available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
