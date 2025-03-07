import React, { useState, useEffect, useRef } from 'react';
import { music, songs, playSong } from './PlayMusic';
import Bar from './Bar';
import CurrentTime from './CurrentTime';

const ProgressBar = () => {
  return (
    <>
      <div className="player-controls__progress" id="js-player-progress">
        <CurrentTime />
        <Bar ParentClassName="player-controls__progress" type="progress" value="0" />
        <span id="js-duration" className="player-controls__duration">
          0:00
        </span>
      </div>
    </>
  );
};
export default ProgressBar;
