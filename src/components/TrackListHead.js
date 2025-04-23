import React from 'react';

const TrackListHead = () => {
  return (
    <div className="track__list-head">
      <div className="track__list-head-index">#</div>
      <p className="track__list-head-title">タイトル</p>
      <img className="track__list-head-duration" src="/img/clock.png"></img>
    </div>
  );
};

export default TrackListHead;
