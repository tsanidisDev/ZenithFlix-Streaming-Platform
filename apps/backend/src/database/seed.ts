import 'dotenv/config';
import { AppDataSource } from './data-source.js';
import { StreamingContent } from '../streaming/entities/streaming-content.entity.js';

const seedItems: Partial<StreamingContent>[] = [
  // ── Movies ───────────────────────────────────────────────────────────────
  {
    title: 'Neon Horizon',
    description:
      'In 2087 a rogue AI architect awakens inside the neural grid of a fractured megacity and must navigate corporate espionage, synthetic memories, and her own erased past to prevent a city-wide consciousness collapse.',
    thumbnailUrl: 'https://picsum.photos/seed/z-neon/800/450',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    contentType: 'movie',
    genre: ['Sci-Fi', 'Action'],
    rating: 8.4,
    duration: 118,
    castMembers: ['Aria Chen', 'Marcus Webb', 'Yuki Tanaka'],
  },
  {
    title: 'The Long Descent',
    description:
      'An acclaimed mountaineer discovers a hermit camp deep in the Himalayas. What begins as a survival story slowly unravels into an unsettling meditation on obsession and identity.',
    thumbnailUrl: 'https://picsum.photos/seed/z-descent/800/450',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    contentType: 'movie',
    year: 2023,
    genre: ['Thriller', 'Drama'],
    rating: 7.9,
    duration: 134,
    castMembers: ['Elena Vasquez', 'Simon Park'],
  },
  {
    title: 'Echo Chamber',
    description:
      'A journalist investigating a misinformation network disappears into an underground community of people who have "unplugged". She must decide how far she is willing to go to get the story.',
    thumbnailUrl: 'https://picsum.photos/seed/z-echo/800/450',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    contentType: 'movie',
    year: 2024,
    genre: ['Mystery', 'Thriller'],
    rating: 7.2,
    duration: 102,
    castMembers: ['Dana Kim', 'Richard Okafor'],
  },
  {
    title: 'Orbital',
    description:
      'Twelve strangers wake aboard a derelict space station with no memory of how they arrived. As life support ticks down, they discover one of them put them there.',
    thumbnailUrl: 'https://picsum.photos/seed/z-orbital/800/450',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    contentType: 'movie',
    year: 2025,
    genre: ['Sci-Fi', 'Horror'],
    rating: 8.1,
    duration: 126,
    castMembers: ['James Obi', 'Natasha Reeves', 'Carlos Diaz'],
  },
  {
    title: 'Paper Cuts',
    description:
      'A film editor reconstructing a destroyed documentary begins to suspect the director was murdered — and that the footage holds the proof.',
    thumbnailUrl: 'https://picsum.photos/seed/z-paper/800/450',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    contentType: 'movie',
    year: 2023,
    genre: ['Drama', 'Mystery'],
    rating: 7.6,
    duration: 95,
    castMembers: ['Fiona Hall', 'Tom Osei'],
  },
  {
    title: 'Last Light',
    description:
      'A lighthouse keeper on a remote island receives a distress signal — but every rescue boat they send out vanishes without a trace.',
    thumbnailUrl: 'https://picsum.photos/seed/z-lastlight/800/450',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    contentType: 'movie',
    year: 2022,
    genre: ['Horror', 'Mystery'],
    rating: 7.0,
    duration: 108,
    castMembers: ['Petra Soko', 'Aiden Walsh'],
  },
  {
    title: 'Salt & Iron',
    description:
      'A nomadic blacksmith crosses a post-collapse America, bartering her craft and uncovering a conspiracy of silence that reaches the last standing government.',
    thumbnailUrl: 'https://picsum.photos/seed/z-saltiron/800/450',
    videoUrl: 'https://www.w3schools.com/tags/movie.mp4',
    contentType: 'movie',
    year: 2024,
    genre: ['Action', 'Drama'],
    rating: 8.0,
    duration: 141,
    castMembers: ['Rosa Mendez', 'Oliver Bay'],
  },
  {
    title: 'The Parallel',
    description:
      'A physicist who has spent 20 years trying to prove the multiverse theory finally succeeds — and meets the version of herself that gave up.',
    thumbnailUrl: 'https://picsum.photos/seed/z-parallel/800/450',
    videoUrl: 'https://www.w3schools.com/tags/movie.mp4',
    contentType: 'movie',
    year: 2025,
    genre: ['Sci-Fi', 'Drama'],
    rating: 8.7,
    duration: 129,
    castMembers: ['Nadia Voss', 'Bernard Ruiz'],
  },
  // ── Series ────────────────────────────────────────────────────────────────
  {
    title: 'Pale Frequency',
    description:
      'A rural radio operator in 1970s Scotland begins intercepting transmissions that appear to originate from 40 years in the future — including a warning with her own voice.',
    thumbnailUrl: 'https://picsum.photos/seed/z-pale/800/450',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    contentType: 'series',
    year: 2023,
    genre: ['Sci-Fi', 'Mystery'],
    rating: 9.1,
    duration: null,
    castMembers: ['Margaret Cross', 'Iain Sutherland'],
  },
  {
    title: 'The Cartographer',
    description:
      'A disgraced mapmaker is hired to chart an unmapped continent — only to discover that the territory keeps shifting and the only map that is ever correct is the one she has not drawn yet.',
    thumbnailUrl: 'https://picsum.photos/seed/z-cartog/800/450',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    contentType: 'series',
    year: 2024,
    genre: ['Adventure', 'Drama'],
    rating: 8.7,
    duration: null,
    castMembers: ['Ezra Bloom', 'Amara Diallo'],
  },
  {
    title: 'Cold Archive',
    description:
      'Two retired intelligence analysts reopen a 30-year-old case that was quietly buried by their own agency. The deeper they dig, the clearer it becomes why it was buried.',
    thumbnailUrl: 'https://picsum.photos/seed/z-cold/800/450',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    contentType: 'series',
    year: 2023,
    genre: ['Thriller', 'Drama'],
    rating: 8.3,
    duration: null,
    castMembers: ['Victor Crane', 'Agnes Park'],
  },
  {
    title: 'Between Floors',
    description:
      'Six strangers stuck in a high-rise elevator during a city blackout discover they have more in common than an elevator. An anthology of lives at a crossroads.',
    thumbnailUrl: 'https://picsum.photos/seed/z-floors/800/450',
    videoUrl: null,
    contentType: 'series',
    year: 2022,
    genre: ['Drama'],
    rating: 7.8,
    duration: null,
    castMembers: ['Lia Chen', 'Bernard Ruiz', 'Kate Moore'],
  },
  {
    title: 'Underscore',
    description:
      'A documentary series following four film composers across a single year — each scoring a movie that will make or break their career.',
    thumbnailUrl: 'https://picsum.photos/seed/z-under/800/450',
    videoUrl: null,
    contentType: 'series',
    year: 2024,
    genre: ['Documentary'],
    rating: 8.5,
    duration: null,
    castMembers: [],
  },
  // ── Live ──────────────────────────────────────────────────────────────────
  {
    title: 'ZenithFlix Originals Live Premiere',
    description:
      'The global premiere of Pale Frequency Season 2, streamed live with a cast Q&A moderated by the showrunner.',
    thumbnailUrl: 'https://picsum.photos/seed/z-live1/800/450',
    videoUrl: null,
    contentType: 'live',
    year: 2025,
    genre: ['Event'],
    rating: null,
    duration: 180,
    castMembers: ['Margaret Cross', 'Iain Sutherland'],
  },
  {
    title: 'Deep Focus: Filmmaker Masterclass',
    description:
      'A live three-hour masterclass with award-winning cinematographers discussing craft, technology, and the future of visual storytelling.',
    thumbnailUrl: 'https://picsum.photos/seed/z-master/800/450',
    videoUrl: null,
    contentType: 'live',
    year: 2025,
    genre: ['Documentary', 'Event'],
    rating: null,
    duration: 180,
    castMembers: [],
  },
];

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(StreamingContent);

  console.log('Clearing existing streaming content...');
  await AppDataSource.query('TRUNCATE TABLE streaming_content CASCADE');

  console.log(`Seeding ${seedItems.length} items...`);
  const entities = repo.create(seedItems);
  await repo.save(entities);

  console.log(`\n✓ Seeded ${entities.length} content items\n`);
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
