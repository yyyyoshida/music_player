import React from 'react';

const RepeatButton = () => {
  return (
    <button id="js-repeat-button" className="player-controls__button player-controls__button--repeat">
      <img id="js-repeat-icon" src="img/リピート.png" alt="" />
      <span className={`tooltip-repeat tooltip`}>連続再生：オフ</span>
    </button>
  );
};

export default RepeatButton;
