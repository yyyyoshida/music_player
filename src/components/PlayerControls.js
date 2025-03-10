import React from 'react';
import ProgressBar from './ProgressBar';
import TrackInfo from './TrackInfo';
import PlayerActions from './PlayerActions';
import PlayerOptions from './PlayerOptions';
import { PlayerProvider } from './PlayerContext';

const PlayerControls = () => {
  return (
    <div id="js-player-controls" className="player-controls">
      <PlayerProvider>
        <ProgressBar />
        <div className="player-controls__info">
          <TrackInfo />
          {/* isPlayingを使いまわすため */}
          <PlayerActions />
          <PlayerOptions />
        </div>
      </PlayerProvider>
    </div>
  );
};

export default PlayerControls;
