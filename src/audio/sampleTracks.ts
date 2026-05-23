import type { SampleTrack } from '../types';

// Public domain recordings via Wikimedia Commons (CC0 / public domain performance)
// All served with Access-Control-Allow-Origin: * — safe to fetch() cross-origin
export const SAMPLE_TRACKS: SampleTrack[] = [
  {
    id: 'chopin-nocturne-9-2',
    title: 'Nocturne Op. 9 No. 2',
    artist: 'Frédéric Chopin',
    genre: 'Romantic Piano',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Chopin_Nocturne_Op_9_No_2.ogg',
  },
  {
    id: 'grieg-hall-mountain-king',
    title: 'In the Hall of the Mountain King',
    artist: 'Edvard Grieg',
    genre: 'Orchestral',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Musopen_-_In_the_Hall_Of_The_Mountain_King.ogg',
  },
  {
    id: 'beethoven-moonlight-3',
    title: 'Moonlight Sonata, 3rd Movement',
    artist: 'Ludwig van Beethoven',
    genre: 'Classical Piano',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Beethoven_Moonlight_3rd_movement.ogg',
  },
  {
    id: 'bach-fugue-bwv543',
    title: 'Fugue in A minor, BWV 543',
    artist: 'Johann Sebastian Bach',
    genre: 'Baroque Organ',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/BWV_543-fugue.ogg',
  },
];
