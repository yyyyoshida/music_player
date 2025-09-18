import { useRef } from "react";
import usePlayerStore from "../store/playerStore";
import usePlaybackStore from "../store/playbackStore";
import useTrackMoreMenuStore from "../store/trackMoreMenuStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const useTrackItem = (track, index, date, parentRef) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const setIsTrackSet = usePlayerStore((state) => state.setIsTrackSet);

  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentPlayedAt = usePlaybackStore((state) => state.setCurrentPlayedAt);
  const playTrackAtIndex = usePlaybackStore((state) => state.playTrackAtIndex);

  const setTrackMenuPositionTop = useTrackMoreMenuStore((state) => state.setTrackMenuPositionTop);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const buttonRef = useRef(null);
  const isCurrentTrack = currentTrackId === track.id;
  const isActiveTrack = currentTrackId === track.id && isPlaying;
  const POSITION_OFFSET_Y = -60;

  function handleClickTrackItem() {
    if (playDisable) {
      showMessage("tooFrequent");
      return;
    }

    const uri = track.trackUri || track.uri || track.audioURL;

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
