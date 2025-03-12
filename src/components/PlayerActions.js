import React from 'react';
import ShuffleButton from './ShuffleButton';
import PlayButton from './PlayButton';
import PrevNextButton from './PrevNextButton';
import ParentComponent from './ParentComponent';
import RepeatButton from './RepeatButton';

const PlayerActions = () => {
  return (
    <div id="js-actions" className="player-controls__actions">
      <ShuffleButton />
      <PrevNextButton type="prev" />
      <PlayButton />
      <PrevNextButton type="next" />
      <RepeatButton />
    </div>
  );
};

export default PlayerActions;
