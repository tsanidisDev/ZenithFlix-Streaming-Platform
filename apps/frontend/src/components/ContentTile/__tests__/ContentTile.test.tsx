import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentTile from '../ContentTile';
import type { StreamingContent } from '../../../types/content';

function makeItem(overrides: Partial<StreamingContent> = {}): StreamingContent {
  return {
    id: 2,
    title: 'Pale Frequency',
    description: 'A Scottish radio operator hears transmissions from the future.',
    thumbnailUrl: 'https://example.com/pale.jpg',
    videoUrl: 'https://example.com/pale.mp4',
    contentType: 'series',
    year: 2023,
    genre: ['Sci-Fi', 'Mystery'],
    rating: 9.1,
    duration: null,
    castMembers: ['Margaret Cross'],
    watchProgress: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ContentTile', () => {
  it('renders the title', () => {
    render(<ContentTile item={makeItem()} onClick={vi.fn()} />);
    expect(screen.getByText('Pale Frequency')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<ContentTile item={makeItem()} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('does NOT render a progress bar when watchProgress is 0', () => {
    render(<ContentTile item={makeItem()} onClick={vi.fn()} watchProgress={0} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders a progress bar when watchProgress > 0', () => {
    render(<ContentTile item={makeItem()} onClick={vi.fn()} watchProgress={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });
});
