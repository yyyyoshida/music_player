import React, { useState, useContext } from 'react';
import { SearchContext } from './SearchContext';

const SearchBar = ({ token }) => {
  const [query, setQuery] = useState('');
  const { setSearchResults } = useContext(SearchContext);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query) return;

    console.log(token);
    if (!token) {
      setError('アクセストークンが無効です。再度ログインしてください。');
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(query); // クエリをURLエンコード
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=track`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // トークンをヘッダーに含める
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('APIからのエラー:', errorText);
        throw new Error('Spotify APIからの応答がありません');
      }

      const data = await response.json();

      if (data.tracks?.items?.length) {
        setSearchResults(data.tracks.items);
        setError(null); // エラー状態をクリア
      } else {
        setSearchResults([]);
        setError('検索結果が見つかりませんでした。');
      }
      // setQuery(''); // 検索完了後に入力をクリア
    } catch (err) {
      console.error('検索に失敗しました:', err);
      setError('検索に失敗しました。もう一度お試しください。');
      setSearchResults([]);
    }
  };

  function clearSearchText() {
    setQuery('');
  }

  return (
    <>
      <div className="search-bar">
        <img className="search-bar__icon--search" src="img/検索用の虫眼鏡アイコン 7.png" alt="" />
        <input
          className="search-bar__input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="検索"
        />
        <button className="search-bar__button--clear" onClick={clearSearchText}>
          <img className="search-bar__icon--clear" src="img/x.png"></img>
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </>
  );
};

export default SearchBar;
