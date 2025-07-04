import { useRef, useContext } from "react";
import ProgressBarWrapper from "./ProgressBarWrapper";
import TrackInfo from "../tracks/TrackInfo";
import PlayerActions from "./PlayerActions";
import PlayerOptions from "./PlayerOptions";
import AudioPlayer from "../AudioPlayer";
// import { RepeatProvider } from './RepeatContext';
import { TrackInfoContext } from "../../contexts/TrackInfoContext";

const PlayerControls = () => {
  const actionsRef = useRef(null);
  const { isVisible } = useContext(TrackInfoContext);

  return (
    // <div className="player-controls">
    <div className={`player-controls ${isVisible ? "thumbnail-expanded has-overlay" : ""}`}>
      <AudioPlayer />
      {/* isPlayingを使いまわすため */}
      {/* <PlayerProvider> */}
      {/* <RepeatProvider> */}
      <ProgressBarWrapper />
      <div className="player-controls__info">
        <TrackInfo actionsRef={actionsRef} />
        <PlayerActions actionsRef={actionsRef} />
        <PlayerOptions />
      </div>
      {/* </RepeatProvider> */}
      {/* </PlayerProvider> */}
    </div>
  );
};

export default PlayerControls;
