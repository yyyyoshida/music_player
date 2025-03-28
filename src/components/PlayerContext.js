// import React, { createContext, useState, useContext } from 'react';

// const PlayerContext = createContext();

// export const PlayerProvider = ({ children }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentSongIndex, setCurrentSongIndex] = useState(0);
//   console.log(window.Spotify);

//   const togglePlayPause = () => {
//     setIsPlaying((prev) => !prev);
//   };

//   return (
//     <PlayerContext.Provider value={{ isPlaying, togglePlayPause, currentSongIndex, setCurrentSongIndex }}>
//       {children}
//     </PlayerContext.Provider>
//   );
// };

// export const usePlayerContext = () => useContext(PlayerContext);

// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { Player } from 'spotify-web-playback-sdk';

// const PlayerContext = createContext();

// export const PlayerProvider = ({ children, token }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentSongIndex, setCurrentSongIndex] = useState(0);
//   const [player, setPlayer] = useState(null);

//   useEffect(() => {
//     if (token) {
//       const playerInstance = new Spotify.Player({
//         name: 'MyMusicPlayer',
//         getOAuthToken: (cb) => {
//           cd(token);
//         },
//         volume: 0.3,
//       });
//       playerInstance.addListener('ready', ({ device_id }) => {
//         console.log('Player is ready with device ID:', device_id);
//         playerInstance.connect();
//       });

//       playerInstance.addListener('player_state_changed', (state) => {
//         if (state) {
//           setIsPlaying(state.paused);
//         }
//       });

//       playerInstance.addListener('authentication_error', ({ message }) => {
//         console.error(message);
//       });

//       playerInstance.addListener('initialization_error', ({ message }) => {
//         console.error(message);
//       });

//       setPlayer(playerInstance); // プレイヤーインスタンスをstateにセット
//     }

//     return () => {
//       if (player) {
//         player.disconnect(); // クリーンアップ時に接続を解除
//       }
//     };
//   }, [token]);

//   const togglePlayPause = () => {
//     if (player) {
//       player.togglePlay().then(() => {
//         setIsPlaying((prev) => !prev);
//       });
//     }
//   };

//   return (
//     <PlayerContext.Provider value={{ isPlaying, togglePlayPause, currentSongIndex, setCurrentSongIndex, player }}>
//       {children}
//     </PlayerContext.Provider>
//   );
// };

// export const usePlayerContext = () => useContext(PlayerContext);

//////////////////////////////////////////////////////////////
import React, { createContext, useState, useContext, useEffect } from 'react';
import { SearchContext } from './SearchContext';

const PlayerContext = createContext();

export const PlayerProvider = ({ children, token }) => {
  const { isToken } = useContext(SearchContext);

  window.onSpotifyWebPlaybackSDKReady = () => {
    console.log(window.Spotify); // ここでSpotifyが定義されるはず
    // ログに表示されてるし、できとるやん
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  // useEffect(() => {
  //   // Spotify SDKが準備できたタイミングで初期化する
  //   window.onSpotifyWebPlaybackSDKReady = () => {
  //     if (isToken && token) {
  //       // if (token) {
  //       const playerInstance = new window.Spotify.Player({
  //         name: 'MyMusicPlayer',
  //         getOAuthToken: (cb) => {
  //           cb(token); // トークンを渡して認証
  //         },
  //         volume: 0.5, // 初期音量
  //       });

  //       playerInstance.addListener('ready', ({ device_id }) => {
  //         console.log('Player is ready with device ID:', device_id);
  //         playerInstance.connect();
  //         setDeviceId(device_id);
  //       });

  //       playerInstance.addListener('player_state_changed', (state) => {
  //         if (state) {
  //           setIsPlaying(state.paused);
  //         }
  //       });

  //       playerInstance.addListener('authentication_error', ({ message }) => {
  //         console.error(message);
  //       });

  //       playerInstance.addListener('initialization_error', ({ message }) => {
  //         console.error(message);
  //       });

  //       setPlayer(playerInstance); // プレイヤーインスタンスをstateにセット
  //     }
  //   };

  //   // クリーンアップ処理（アンマウント時にプレイヤーを切断）

  //   return () => {
  //     if (player) {
  //       player.disconnect();
  //     }
  //   };
  // }, [token]);

  useEffect(() => {
    if (!token) return;

    // Spotify SDK の初期化
    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: 'MyMusicPlayer',
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      playerInstance.addListener('ready', ({ device_id }) => {
        console.log('🎵 Player is ready! Device ID:', device_id);
        setDeviceId(device_id);
      });

      playerInstance.addListener('player_state_changed', (state) => {
        setIsPlaying(!state.paused);
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };
  }, [token]);

  const togglePlayPause = () => {
    if (!player) {
      alert('Player is not initialized yer!');
      return;
    }

    if (player) {
      player.togglePlay().then(() => {
        setIsPlaying((prev) => !prev);
      });
    }
  };

  const playerTrack = (trackUri) => {
    if (!deviceId) {
      alert('✖ デバイス ID が正しく取得できていない');
      return;
    }
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [trackUri] }),
    }).catch((error) => console.error('❌ 再生エラー:', error));
  };

  return (
    <PlayerContext.Provider value={{ isPlaying, togglePlayPause, currentSongIndex, setCurrentSongIndex, player, playerTrack }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);
