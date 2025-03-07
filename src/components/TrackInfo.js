import React from 'react';

const TrackInfo = () => {
  return (
    <>
      <div id="js-track-info" className="player-controls__track-info">
        <figure className="player-controls__track">
          <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
            <img id="js-track-thumbnail" src="img/写真アイコン4.png" alt="サムネイル" className="player-controls__track-thumbnail" />
            <div id="js-track-thumbnail-transition" className="player-controls__track-thumbnail-transition"></div>
          </div>
          <figcaption id="js-track-meta" className="player-controls__track-meta">
            <p className="player-controls__title">曲のタイトルああああaiueo</p>
            <p className="player-controls__artist">アーティスト・作者</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};

export default TrackInfo;
