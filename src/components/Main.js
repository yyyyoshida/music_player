import React from 'react';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';

const Main = () => {
  return (
    <div className="container">
      <main>
        <ThumbnailPreview />
        <section className="player">
          <div className="video-info">
            <h2 id="js-video-title">動画タイトル</h2>
            <p id="js-video-description">動画の説明がここに入ります。</p>
          </div>

          {/* <!-- 動画（仮） --> */}
          <div className="video-container">
            {/* <!-- <iframe id="js-video-player" src="https://www.youtube.com/embed/example" frameborder="0" allowfullscreen></iframe> --> */}
          </div>

          {/* <!-- プレイヤーコントロール --> */}
          <PlayerControls />
          <div className="video-container">
            <div id="js-video-player"></div>
          </div>
          {/* <!-- <img id="bg-img" src="path/to/background.jpg" alt="Background Image"> -->
					<!-- <img id="js-cover" src="path/to/default-cover.jpg" alt="Cover Image"> --> */}
          <h1 id="js-music-title">曲名がここに表示されます</h1>
          <div id="js-player-progress">0:00</div>
          <button id="js-prev-button">前の曲</button>
          <button id="js-next-button">次の曲</button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Main;
