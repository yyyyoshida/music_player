import React from 'react';
import ShuffleButton from './ShuffleButton';
import PlayButton from './PlayButton';
import PrevNextButton from './PrevNextButton';
import ParentComponent from './ParentComponent';

const PlayerActions = () => {
  return (
    <div id="js-actions" className="player-controls__actions">
      <ShuffleButton />
      <PrevNextButton type="prev" />
      <PlayButton />
      <PrevNextButton type="next" />
      <button id="js-repeat-button" className="player-controls__button player-controls__button--repeat">
        <img id="js-repeat-icon" src="img/リピート.png" alt="" />
      </button>
    </div>
  );
};

export default PlayerActions;
