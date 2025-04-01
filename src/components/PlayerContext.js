import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { SearchContext } from './SearchContext';

const PlayerContext = createContext();

export const PlayerProvider = ({ children, token }) => {
  const { isToken } = useContext(SearchContext);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isToken && token) return;

    // Spotify SDK の初期化
    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: 'MyMusicPlayer',
        getOAuthToken: (cb) => cb(token),
        volume: 0.3,
      });

      playerInstance.addListener('ready', ({ device_id }) => {
        if (device_id) {
          console.log('🎵 Player is ready! Device ID:', device_id);
          setDeviceId(device_id);
        } else {
          console.error('Device ID is missing');
        }
      });

      playerInstance.addListener('player_state_changed', (state) => {
        setIsPlaying(!state.paused);
      });

      playerInstance.connect();

      setPlayer(playerInstance);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
    // }, [token]);
  }, []);

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

  function playerTrack(trackUri) {
    if (!deviceId) {
      console.error('❌ デバイス ID が取得できてない！');
      return;
    }
    const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    const data = {
      uris: [trackUri],
      offset: {
        position: 0,
      },
      position_ms: 0,
    };

    fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      // .then((response) => response.json())
      .then((data) => console.log('再生結果:', data)) // 再生結果をログに表示
      .catch((error) => console.error('❌ 再生エラー:', error));
  }

  function updateVolume(volume) {
    if (!player) return;
    player.setVolume(volume);
  }

  function seekTo(seekTime) {
    if (!player) return;
    player.seek(seekTime);
  }

  useEffect(() => {
    if (!player) return;

    player.addListener('player_state_changed', ({ position, duration }) => {
      setPosition((position / duration) * 100);
      setDuration(duration);
    });

    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (!state) return;
        setPosition((state.position / state.duration) * 100);
      });
    }, 200);

    return () => {
      clearInterval(interval);
      player.removeListener('player_state_changed');
    };
  }, [player]);

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        togglePlayPause,
        currentSongIndex,
        player,
        playerTrack,
        updateVolume,
        seekTo,
        duration,
        position,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);
