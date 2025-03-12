import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import TrackInfo from './TrackInfo';
import PlayerActions from './PlayerActions';
import PlayerOptions from './PlayerOptions';
import { PlayerProvider } from './PlayerContext';

const PlayerControls = () => {
  const [isRepeat, setIsRepeat] = useState(false);

  return (
    <div id="js-player-controls" className="player-controls">
      {/* isPlayingを使いまわすため */}
      <PlayerProvider>
        <ProgressBar isRepeat={isRepeat} setIsRepeat={setIsRepeat} />
        <div className="player-controls__info">
          <TrackInfo />
          {/* <PlayerActions /> */}
          <PlayerActions isRepeat={isRepeat} setIsRepeat={setIsRepeat} />
          <PlayerOptions />
        </div>
      </PlayerProvider>
    </div>
  );
};

export default PlayerControls;
