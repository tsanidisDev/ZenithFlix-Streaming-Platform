'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { StreamingContent } from '../../types/content';
import styles from './ContentModal.module.css';

interface Props {
  item: StreamingContent;
  onClose: () => void;
  /** Called as the video plays with the current progress percentage (0–100). */
  onProgress?: (contentId: number, progress: number) => void;
}

export default function ContentModal({ item, onClose, onProgress }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stable callback so we don't re-register the listener on every render
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !onProgress || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    onProgress(item.id, pct);
  }, [item.id, onProgress]);

  // Register timeupdate on the video element — this is the correct use of useEffect:
  // attaching an imperative event listener to a DOM node (external system).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [handleTimeUpdate, onProgress]);

  // Focus the close button exactly once on mount — using preventScroll so the
  // panel doesn't jump to top. Kept separate from the focus-trap effect so that
  // a new onClose reference (inline arrow on every parent render) never re-fires
  // this and scrolls the panel back to top.
  useEffect(() => {
    closeBtnRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

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
          last?.focus({ preventScroll: true });
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus({ preventScroll: true });
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const rating = item.rating != null ? parseFloat(String(item.rating)).toFixed(1) : null;

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

        {item.thumbnailUrl ? (
          <div className={styles.poster}>
            <img src={item.thumbnailUrl} alt={`${item.title} poster`} />
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
            <span className={styles.year}>{item.year}</span>
            <span className={styles.genre}>{item.genre?.join(', ')}</span>
            {rating && <span className={styles.rating}>&#9733; {rating}</span>}
            <span className={styles.badge}>{item.contentType}</span>
          </div>
          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
        </div>

        <div className={styles.video}>
          {item.videoUrl ? (
            <video
              ref={videoRef}
              className={styles.videoPlayer}
              controls
              preload="metadata"
              aria-label={`Watch ${item.title}`}
            >
              <source src={item.videoUrl} />
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
