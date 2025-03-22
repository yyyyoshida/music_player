import React from 'react';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';
import { PlayerProvider } from './PlayerContext';
import { TrackInfoProvider } from './TrackInfoContext';

const Main = () => {
  return (
    <div className="container">
      <maidn>
        <PlayerProvider>
          <TrackInfoProvider>
            <ThumbnailPreview />
            <section className="search-result">
              <h2 className="search-result__title">上位の検索結果</h2>
              <ul className="search-result__list">
                <li></li>
              </ul>
            </section>
            {/* <section className="player">
              <div className="video-info">
                <h2 id="js-video-title">動画タイトル</h2>
                <p id="js-video-description">動画の説明がここに入ります。</p>
              </div>




         
              <div className="video-container">
                <div id="js-video-player"></div>
              </div>

              <h1 id="js-music-title">曲名がここに表示されます</h1>
              <div id="js-player-progress">0:00</div>
              <button id="js-prev-button">前の曲</button>
              <button id="js-next-button">次の曲</button>
            </section> */}
            <PlayerControls />
          </TrackInfoProvider>
        </PlayerProvider>
      </maidn>
      <Footer />
    </div>
  );
};

export default Main;
