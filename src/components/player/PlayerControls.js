import { useRef, useContext } from "react";
import ProgressBar from "./ProgressBar";
import TrackInfo from "../tracks/TrackInfo";
import PlayerActions from "./PlayerActions";
import PlayerOptions from "./PlayerOptions";
// import { RepeatProvider } from './RepeatContext';
import { TrackInfoContext } from "../../contexts/TrackInfoContext";

const PlayerControls = () => {
  const actionsRef = useRef(null);
  const { isVisible } = useContext(TrackInfoContext);

  return (
    // <div className="player-controls">
    <div className={`player-controls ${isVisible ? "thumbnail-expanded has-overlay" : ""}`}>
      {/* isPlayingを使いまわすため */}
      {/* <PlayerProvider> */}
      {/* <RepeatProvider> */}
      <ProgressBar />
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
