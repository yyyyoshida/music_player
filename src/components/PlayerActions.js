import React from 'react';
import ShuffleButton from './ShuffleButton';
import PlayButton from './PlayButton';

const PlayerActions = () => {
  return (
    <div id="js-actions" className="player-controls__actions">
      <ShuffleButton />
      <button id="js-prev-button" className="player-controls__button player-controls__button--prev">
        <img src="img/prev-icon.png" alt="" />
      </button>
      <PlayButton />
      {/* <button id="js-play-button" className="player-controls__button player-controls__button--play"></button> */}
      <button id="js-next-button" className="player-controls__button player-controls__button--next">
        <img src="img/next-icon.png" alt="" />
      </button>
      <button id="js-repeat-button" className="player-controls__button player-controls__button--repeat">
        <img id="js-repeat-icon" src="img/リピート.png" alt="" />
      </button>
    </div>
  );
};

export default PlayerActions;
