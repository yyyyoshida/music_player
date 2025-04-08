import React, { useEffect, useState } from 'react';

const Home = ({ token }) => {
  const [tracks, setTracks] = useState([]);

  const fetchRecentlyPlayedTracks = async (token) => {
    if (!token) {
      console.error('アクセストークンがありません');
      return;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // レスポンスの確認
      console.log(data.items[0].track.name);
      console.log('HHHHHHHHHH', data.items[0].track.album);
      console.log('HHHHHHHHHH', data.items[0].track.album.images[0].url);
      console.log('HHHHHHHHHH', data.items[0].track.album.images[0]);
      console.log('HHHHHHH00000HHH', data);
      console.log('HHHHHHHHHH', data.items[3].track.artists[0].name);

      setTracks(data.items);
      // if (data.items?.track?.length) {
      // } else {
      // }
    } catch (err) {
      console.error('やば！再生履歴取れなかった😢', err);
    }
  };

  useEffect(() => {
    console.log('harooooo');
    if (token) {
      fetchRecentlyPlayedTracks(token);
      // console.log('ここだあああ', tracks.items);
    }
  }, [token]);

  return (
    <div>
      <h1>最近再生したトラック</h1>
      <ul className="home__track-list">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            // <li key={track.track.id} className="home__track-item">
            <li key={`${track.track.id}-${Date.now()}`} className="home__track-item">
              <div className="home__track-cover-art-wrapper">
                <img src={track.track.album.images[0].url} alt={track.track.name} width="188" className="home__track-cover-art" />
                <button className="home__track-play-button">
                  <img src="img/play.png" className="home__track-play-button-icon"></img>
                </button>
                <button className="home__track-add-button">
                  <img src="img/plus.png" className="home__track-add-button-icon"></img>
                </button>
              </div>
              <div className="home__track-info">
                <div className="home__track-name">{track.track.name}</div>
                <div className="home__track-artist">{track.track.artists[0].name}</div>
              </div>
            </li>
          ))
        ) : (
          <p>最近の再生履歴はありません。</p>
        )}
      </ul>
    </div>
  );
};

export default Home;
