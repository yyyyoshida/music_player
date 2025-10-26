interface BaseTrack {
  addedAt?: string;
  albumImage: string;
  artist: string;
  duration_ms: number;
  id?: string;
  playlistRef?: string | null;
  title: string;
}

export interface SpotifyTrack extends BaseTrack {
  source: "spotify";
  trackId: string;
  trackUri: string;
}

export interface LocalTrack extends BaseTrack {
  source: "local";
  albumImagePath: string;
  audioPath: string;
  audioURL: string;
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

export type TrackObject = SpotifyTrack | LocalTrack | fromSearchResultTrackObject;
