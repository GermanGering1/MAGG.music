export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string | null;
  license_type: string;
  user_id: string;
  created_at: string;
  profiles?: { username: string };
}

export interface Playlist {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  cover_url?: string | null;
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  added_at: string;
}