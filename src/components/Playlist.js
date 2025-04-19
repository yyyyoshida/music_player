import React, { useEffect, useState, useRef, useContext } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { PlaylistContext } from './PlaylistContext';
// import CreatePlaylist from './CreatePlaylist';

const Playlist = () => {
  const [playlistCoverArt, setPlaylistCoverArt] = useState('img/playlist-icon1.png');

  const { toggleCreateVisible, handleCreatePlaylist, playlists, setPlaylists } = useContext(PlaylistContext);

  // useEffect(() => {
  //   console.log('はろはろ');
  //   const fetchPlaylists = async () => {
  //     try {
  //       const querySnapshot = await getDocs(collection(db, 'playlists'));
  //       // const fetchedPlaylists = querySnapshot.docs.map((doc) => ({

  //       //   id: doc.id,
  //       //   ...doc.data(),
  //       // }));
  //       // console.log(db);
  //       console.log(querySnapshot);
  //       const fetchedPlaylists = querySnapshot.docs.map((doc) => {
  //         console.log('🎵 doc data:', doc.data()); // ←追加
  //         return {
  //           id: doc.id,
  //           ...doc.data(),
  //         };
  //       });
  //       setPlaylists(fetchedPlaylists);
  //     } catch (error) {
  //       console.error('プレイリストの取得失敗', error);
  //     }
  //   };
  //   fetchPlaylists();
  // }, []);

  // function toggleVisible() {
  //   setIsVisible((prev) => !prev);
  // }

  // const handleCreatePlaylist = async () => {
  //   if (!playlistNameRef.current.value.trim()) {
  //     alert('値を入れろゴラァあ');
  //     return;
  //   }

  //   try {
  //     await addDoc(collection(db, 'playlists'), {
  //       name: playlistNameRef.current.value,
  //       // createAt: serverTimestamp(),
  //     });
  //     console.log('プレイリスト作成成功');
  //     playlistNameRef.current.value = '';
  //     toggleVisible();
  //   } catch (error) {
  //     console.error('作成失敗', error);
  //   }
  // };

  return (
    <div className="playlists-page">
      <h2 className="playlists-page__title">プレイリスト</h2>

      {/* <CreatePlaylist /> */}

      <button className="playlists-page__create-button playlist-create-button" onClick={toggleCreateVisible}>
        ＋ 新規プレイリスト作成
      </button>
      <ul className="playlists-page__list">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="playlists-page__item">
            <div className="playlists-page__item-cover-art-wrapper">
              <img className="playlists-page__item-cover-art" src={playlistCoverArt}></img>
              <div className="playlists-page__item-initial-cover-art"></div>
            </div>
            <div className="playlists-page__item-info">
              <p className="playlists-page__item-name">{playlist.name}</p>
              {/* <p className="playlists-page__item-song-count">{playlist.tracks.length}</p> */}
              <p className="playlists-page__item-song-count">379個の曲</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
