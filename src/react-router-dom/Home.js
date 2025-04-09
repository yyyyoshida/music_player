import React, { useEffect, useState, useContext } from 'react';
import { usePlayerContext } from '../components/PlayerContext';
import { SearchContext } from '../components/SearchContext';

const Home = ({ token }) => {
  const [tracks, setTracks] = useState([]);
  const { playerTrack, isStreaming, trackId } = usePlayerContext();
  const { setIsTrackSet } = useContext(SearchContext);

  const fetchRecentlyPlayedTracks = async (token) => {
    let url = 'https://api.spotify.com/v1/me/player/recently-played?limit=30';
    // const afterTimestamp = 1484811043508;
    // url += `&after=${afterTimestamp}`;
    if (!token) {
      console.error('アクセストークンがありません');
      return;
    }

    try {
      // const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // レスポンスの確認
      // console.log(data.items[0].track.name);
      // console.log('HHHHHHHHHH', data.items[0].track.album);
      // console.log('HHHHHHHHHH', data.items[0].track.album.images[0].url);
      // console.log('HHHHHHHHHH', data.items[0].track.album.images);
      // console.log('HHHHHHH00000HHH', data);
      // console.log('HHHHHHHHHH', data.items[3].track.artists[0].name);

      setTracks(data.items);
      // if (data.items?.track?.length) {
      // } else {
      // }
    } catch (err) {
      console.error('再生履歴取れなかった', err);
    }
  };

  useEffect(() => {
    // console.log('harooooo');
    if (token) {
      fetchRecentlyPlayedTracks(token);
      // console.log('ここだあああ', tracks.items);
    }
  }, [token]);

  console.log(trackId);

  return (
    <div className="home">
      <h1 className="home__title">ホーム</h1>
      <p className="home__text">最近再生した曲一覧</p>
      <ul className="home__track-list">
        {Array.isArray(tracks) && tracks.length > 0 ? (
          tracks.map((track) => {
            // const isCurrentTrack = trackId === track.id;
            // const isCurrentTrack = trackId === track.track.id - track.played_at;
            const isCurrentTrack = trackId === track.track.id;
            const isTrackPlaying = isCurrentTrack && isStreaming;
            const isClicked = isCurrentTrack;
            return (
              <li
                key={`${track.track.id}-${track.played_at}`}
                className="home__track-item"
                onClick={() => {
                  playerTrack(track.track.uri);
                  setIsTrackSet(true);
                }}
              >
                {/* <div className="home__track-cover-art-wrapper" style={{ filter: isTrackPlaying ? 'brightness(50%)' : '' }}> */}
                <div className="home__track-cover-art-wrapper">
                  <img
                    src={track.track.album.images[1].url}
                    alt={track.track.name}
                    width="188"
                    className="home__track-cover-art"
                    // style={{ filter: isTrackPlaying ? 'brightness(50%)' : '' }}
                    style={{ filter: isClicked ? 'brightness(50%)' : '' }}
                  />
                  <button className="home__track-play-button" style={{ visibility: isTrackPlaying ? 'hidden' : 'visible' }}>
                    <img src="img/play.png" className="home__track-play-button-icon" />
                  </button>
                  <button className="home__track-add-button">
                    <img src="img/plus.png" className="home__track-add-button-icon" />
                  </button>
                  <div className={`equalizer ${isTrackPlaying ? '' : 'hidden'}`}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                </div>
                <div className="home__track-info">
                  <div className="home__track-name">{track.track.name}</div>
                  <div className="home__track-artist">{track.track.artists[0].name}</div>
                </div>
              </li>
            );
          })
        ) : (
          <p>最近の再生履歴はありません。</p>
        )}
      </ul>
    </div>
  );
};

export default Home;
