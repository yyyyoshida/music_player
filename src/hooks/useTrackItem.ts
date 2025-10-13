import { useRef } from "react";
import usePlayerStore from "../store/playerStore";
import usePlaybackStore from "../store/playbackStore";
import useTrackMoreMenuStore from "../store/trackMoreMenuStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import type { TrackObject } from "../store/playbackStore";

type UseTrackItemReturn = {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isCurrentTrack: boolean;
  isActiveTrack: boolean;
  handleClickTrackItem: () => void;
  setButtonPosition: () => void;
};

const useTrackItem = (
  track: TrackObject,
  index: number,
  date: string,
  parentRef: React.RefObject<HTMLDivElement | null>
): UseTrackItemReturn => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const setIsTrackSet = usePlayerStore((state) => state.setIsTrackSet);

  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentPlayedAt = usePlaybackStore((state) => state.setCurrentPlayedAt);
  const playTrackAtIndex = usePlaybackStore((state) => state.playTrackAtIndex);

  const setTrackMenuPositionTop = useTrackMoreMenuStore((state) => state.setTrackMenuPositionTop);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const isCurrentTrack = currentTrackId === track.id;
  const isActiveTrack = currentTrackId === track.id && isPlaying;
  const POSITION_OFFSET_Y = -60;

  function handleClickTrackItem() {
    if (playDisable) {
      showMessage("tooFrequent");
      return;
    }

    let uri;

    if ("trackUri" in track) {
      uri = track.trackUri;
    } else if ("uri" in track) {
      uri = track.uri;
    } else if ("audioURL" in track) {
      uri = track.audioURL;
    }

    if (!uri) {
      // showMessage('playFailed'); 後で引数に対応させる
      return;
    }

    if (isCurrentTrack) {
      togglePlayPause();
      return;
    }

    setIsTrackSet(true);
    setCurrentPlayedAt(date);
    playTrackAtIndex(index);
  }

  function setButtonPosition() {
    if (!buttonRef.current || !parentRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const parentRect = parentRef.current.getBoundingClientRect();

    const offset = buttonRect.top - parentRect.top + window.scrollY + POSITION_OFFSET_Y;
    setTrackMenuPositionTop(offset);
  }

  return {
    buttonRef,
    isCurrentTrack,
    isActiveTrack,
    handleClickTrackItem,
    setButtonPosition,
  };
};

export default useTrackItem;
