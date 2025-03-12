import React from 'react';

const ShuffleButton = () => {
  return (
    <button id="js-player-controls" className="player-controls__button player-controls__button--shuffle">
      <img id="js-shuffle-icon" src="img/シャッフル.png" alt=""></img>
      <span className={`tooltip-shuffle tooltip`}>シャッフル：オフ</span>
    </button>
  );
};

export default ShuffleButton;
