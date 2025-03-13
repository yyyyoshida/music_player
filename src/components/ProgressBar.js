import React, { useState, useEffect, useRef } from 'react';
import { music, songs, playSong } from './PlayMusic';
import Bar from './Bar';
import CurrentTime from './CurrentTime';
import Duration from './Duration';

const ProgressBar = ({ isRepeat, setIsRepeat }) => {
  return (
    <>
      <div className="player-controls__progress" id="js-player-progress">
        <CurrentTime />
        <Bar ParentClassName="player-controls__progress" type="progress" value="0" isRepeat={isRepeat} setIsRepeat={setIsRepeat} />
        <Duration />
      </div>
    </>
  );
};
export default ProgressBar;
