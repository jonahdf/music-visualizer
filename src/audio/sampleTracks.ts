import type { SampleTrack } from '../types';

// Public domain and CC-BY recordings via Wikimedia Commons
// All served with Access-Control-Allow-Origin: * — safe to fetch() cross-origin
export const SAMPLE_TRACKS: SampleTrack[] = [
  {
    id: 'beethoven-moonlight-3',
    title: 'Moonlight Sonata, 3rd Movement',
    artist: 'Ludwig van Beethoven',
    genre: 'Classical',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Beethoven_Moonlight_3rd_movement.ogg',
  },
  {
    id: 'grieg-hall-mountain-king',
    title: 'In the Hall of the Mountain King',
    artist: 'Edvard Grieg',
    genre: 'Orchestral',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Musopen_-_In_the_Hall_Of_The_Mountain_King.ogg',
  },
  {
    id: 'joplin-maple-leaf-rag',
    title: 'Maple Leaf Rag',
    artist: 'Scott Joplin',
    genre: 'Ragtime',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Maple_leaf_rag_-_played_by_Scott_Joplin_1916_V2.ogg',
  },
  {
    id: 'odjb-jazz-me-blues',
    title: 'Jazz Me Blues',
    artist: 'Original Dixieland Jass Band',
    genre: 'Jazz',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/62/OriginalDixielandJassBand-JazzMeBlues.ogg',
  },
  {
    id: 'bessie-smith-downhearted-blues',
    title: 'Downhearted Blues',
    artist: 'Bessie Smith',
    genre: 'Blues',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bessie_Smith_-_Downhearted_Blues_(1923).ogg',
  },
  {
    id: 'broke-for-free-night-owl',
    title: 'Night Owl',
    artist: 'Broke For Free',
    genre: 'Electronic',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Broke_For_Free_-_01_-_Night_Owl.ogg',
  },
  {
    id: 'blueneck-lilitu',
    title: 'Lilitu',
    artist: 'Blueneck',
    genre: 'Post-Rock',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Blueneck_-_Lilitu_%28post-rock%29.ogg',
  },
];
