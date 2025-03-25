import React, { useState } from 'react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState([]);

  const hadleSearch = async () => {
    // if (!query) return;
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('expires_at');
    console.log('現在のアクセストークン:', token);
    console.log('アクセストークンの有効期限:', expiresAt);

    if (!token) {
      console.error('アクセストークンがありません。');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`エラー: ${response.status}`);
      }

      const data = await response.json();
      setTrack(data.tracks.items); // 取得した曲を state に保存
    } catch (error) {
      console.error('検索に失敗:', error);
    }
  };
  // };

  return (
    <div className="search-bar">
      <input
        className="search-input"
        type="text"
        id="js-search-input"
        placeholder="検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button id="js-search-button" className="search-button" onClick={hadleSearch}>
        <img src="img/検索用の虫眼鏡アイコン 7.png" alt="" />
      </button>
    </div>
  );
};

export default SearchBar;

// import React, { useState } from 'react';

// const SearchBar = () => {
//   const [query, setQuery] = useState('');
//   const [tracks, setTracks] = useState([]); // ✅ 検索結果を保存する state

//   const handleSearch = async () => {
//     const token = localStorage.getItem('access_token');
//     const expiresAt = localStorage.getItem('expires_at');

//     console.log('現在のアクセストークン:', token);
//     console.log('アクセストークンの有効期限:', expiresAt);

//     // トークンがない、またはトークンの有効期限が切れている場合
//     if (!token || Date.now() > expiresAt) {
//       alert('アクセストークンが無効です。再ログインしてください。');
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('expires_at');
//       // ログインページにリダイレクト
//       window.location.href = 'YOUR_SPOTIFY_LOGIN_URL'; // ここに実際のSpotifyのログインURLを挿入
//       return;
//     }

//     try {
//       const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`エラー: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('取得したデータ:', data);
//       setTracks(data.tracks.items);
//     } catch (error) {
//       console.error('検索に失敗:', error);
//     }
//   };

//   return (
//     <div className="search-bar">
//       <input className="search-input" type="text" placeholder="曲を検索" value={query} onChange={(e) => setQuery(e.target.value)} />
//       <button className="search-button" onClick={handleSearch}>
//         検索
//       </button>

//       {/* ✅ 検索結果を表示 */}
//       <ul className="search-results">
//         {tracks.map((track) => (
//           <li key={track.id} className="search-item">
//             <img src={track.album.images[0]?.url} alt={track.name} width="50" />
//             <div>
//               <strong>{track.name}</strong>
//               <p>{track.artists.map((artist) => artist.name).join(', ')}</p>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SearchBar;
