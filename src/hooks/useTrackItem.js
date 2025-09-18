import usePlayerStore from "../store/playerStore";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const useTrackItem = (track, index, date) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const setIsTrackSet = usePlayerStore((state) => state.setIsTrackSet);

  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentPlayedAt = usePlaybackStore((state) => state.setCurrentPlayedAt);
  const playTrackAtIndex = usePlaybackStore((state) => state.playTrackAtIndex);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const isCurrentTrack = currentTrackId === track.id;
  const isActiveTrack = currentTrackId === track.id && isPlaying;

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

  return {
    isCurrentTrack,
    isActiveTrack,
    handleClickTrackItem,
  };
};

export default useTrackItem;
