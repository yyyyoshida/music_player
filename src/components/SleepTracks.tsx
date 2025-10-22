import React from "react";
import { pauseIcon, playIcon } from "../assets/icons";

const SleepTracks = () => {
  return (
    <div className="sleep">
      <h1 className="sleep__title">スリープ曲一覧</h1>

      <p className="sleep__text">一時的に非表示にしている曲</p>

      <ul className="sleep__track-list">
        <li className="sleep__track-item">
          <div className="sleep__track-cover-art-wrapper">
            <img className="sleep__track-cover-art" src="/img/テストサムネ６.jpg" alt="" />

            <button className="sleep__track-play-pause-button play-pause-button">
              <img src={playIcon} alt="" className="sleep__track-play-pause-button-icon play-pause-button-icon play-button-icon" />
            </button>
            <button className="sleep__track-restore-button">
              <img src="img/restore.png" className="sleep__track-restore-button-icon" />
            </button>
          </div>

          <div className="sleep__track-info">
            <div className="sleep__track-name">曲のタイトル</div>
            <div className="sleep__track-artist">アーティスト・作者</div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default SleepTracks;
