type playlistId = {
  id: string;
};

interface BaseTrack {
  addedAt?: string;
  albumImage: string;
  artist: string;
  duration_ms: number;
  trackId: string;
  id?: string;
  title: string;
}

export interface SpotifyTrack extends BaseTrack {
  source: "spotify";
  trackUri: string;
}

export interface SleepSpotifyTrack extends SpotifyTrack {
  playlistIds: playlistId[];
}

export interface LocalTrack extends BaseTrack {
  source: "local";
  albumImagePath: string;
  audioPath: string;
  audioURL: string;
}

export interface NewLocalTrack extends Omit<BaseTrack, "trackId"> {
  source: "local-upload";
}

type fromSearchResultTrackImages = {
  height: number;
  width: number;
  url: string;
};

export type fromSearchResultTrackObject = {
  id: string;
  uri: string;
  album: {
    images: fromSearchResultTrackImages[];
  };
  name: string;
  artists: {
    name: string;
  }[];
  duration_ms: number;
};

export type TrackObject =
  | SpotifyTrack
  | SleepSpotifyTrack
  | LocalTrack
  | NewLocalTrack
  | fromSearchResultTrackObject;
