import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentModal from '../ContentModal';
import type { StreamingContent } from '../../../types/content';

function makeItem(overrides: Partial<StreamingContent> = {}): StreamingContent {
  return {
    id: 1,
    title: 'Neon Horizon',
    description: 'A rogue AI in a fractured megacity.',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    videoUrl: 'https://example.com/video.mp4',
    contentType: 'movie',
    year: 2087,
    genre: ['Sci-Fi', 'Action'],
    rating: 8.4,
    duration: 118,
    castMembers: ['Aria Chen'],
    watchProgress: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ContentModal', () => {
  it('renders title, year, and description', () => {
    render(<ContentModal item={makeItem()} onClose={vi.fn()} />);
    expect(screen.getByText('Neon Horizon')).toBeInTheDocument();
    expect(screen.getByText('2087')).toBeInTheDocument();
    expect(screen.getByText('A rogue AI in a fractured megacity.')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<ContentModal item={makeItem()} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows "No video available" fallback when videoUrl is null', () => {
    render(<ContentModal item={makeItem({ videoUrl: null })} onClose={vi.fn()} />);
    expect(screen.getByText('No video available')).toBeInTheDocument();
    expect(document.querySelector('video')).not.toBeInTheDocument();
  });

  it('does not render a rating badge when rating is null', () => {
    render(<ContentModal item={makeItem({ rating: null })} onClose={vi.fn()} />);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });
});
