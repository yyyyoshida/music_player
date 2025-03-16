import React, { useState, useRef } from 'react';
import ProgressBar from './ProgressBar';
import TrackInfo from './TrackInfo';
import PlayerActions from './PlayerActions';
import PlayerOptions from './PlayerOptions';
import { PlayerProvider } from './PlayerContext';
import { RepeatProvider } from './RepeatContext';

const PlayerControls = () => {
  const actionsRef = useRef(null);

  return (
    <div className="player-controls">
      {/* isPlayingを使いまわすため */}
      <PlayerProvider>
        <RepeatProvider>
          <ProgressBar />
          <div className="player-controls__info">
            <TrackInfo actionsRef={actionsRef} />
            <PlayerActions actionsRef={actionsRef} />
            <PlayerOptions />
          </div>
        </RepeatProvider>
      </PlayerProvider>
    </div>
  );
};

export default PlayerControls;
