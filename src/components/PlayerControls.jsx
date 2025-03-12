import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import TrackInfo from './TrackInfo';
import PlayerActions from './PlayerActions';
import PlayerOptions from './PlayerOptions';
import { PlayerProvider } from './PlayerContext';
import { RepeatProvider } from './RepeatContext';

const PlayerControls = () => {
  // const [isRepeat, setIsRepeat] = useState(false);

  return (
    <div id="js-player-controls" className="player-controls">
      {/* isPlayingを使いまわすため */}
      <PlayerProvider>
        <RepeatProvider>
          <ProgressBar />
          <div className="player-controls__info">
            <TrackInfo />
            <PlayerActions />
            <PlayerOptions />
          </div>
        </RepeatProvider>
      </PlayerProvider>
    </div>
  );
};

export default PlayerControls;
