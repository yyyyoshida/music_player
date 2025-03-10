import React from 'react';
import ProgressBar from './ProgressBar';
import TrackInfo from './TrackInfo';
import PlayerActions from './PlayerActions';
import PlayerOptions from './PlayerOptions';
import { PlayerProvider } from './PlayerContext';

const PlayerControls = () => {
  return (
    <div id="js-player-controls" className="player-controls">
      <ProgressBar />
      <div className="player-controls__info">
        <PlayerProvider>
          <TrackInfo />
          {/* isPlayingを使いまわすため */}
          <PlayerActions />
        </PlayerProvider>
        <PlayerOptions />
      </div>
    </div>
  );
};

export default PlayerControls;
