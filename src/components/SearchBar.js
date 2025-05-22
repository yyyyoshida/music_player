import { useState, useContext, useRef } from "react";
import { SearchContext } from "../contexts/SearchContext";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ token }) => {
  const { setQuery, setSearchResults } = useContext(SearchContext);
  const queryRef = useRef("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (queryRef.current === "") return;
    console.log("検索する値", queryRef.current.value);
    setQuery(queryRef.current.value);

    // navigate(`/search-result?query=${encodeURIComponent(query)}`);
    navigate(`/search-result?query=${encodeURIComponent(queryRef.current)}`);

    console.log(token);
    if (!token) {
      setError("アクセストークンが無効です。再度ログインしてください。");
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(queryRef.current.value); // クエリをURLエンコード
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=50`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // トークンをヘッダーに含める
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("APIからのエラー:", errorText);
        throw new Error("Spotify APIからの応答がありません");
      }

      const data = await response.json();

      if (data.tracks?.items?.length) {
        setSearchResults(data.tracks.items);
        setError(null); // エラー状態をクリア
      } else {
        setSearchResults([]);
        setError("検索結果が見つかりませんでした。");
      }
      // setQuery(''); // 検索完了後に入力をクリア
    } catch (err) {
      console.error("検索に失敗しました:", err);
      setError("検索に失敗しました。もう一度お試しください。");
      setSearchResults([]);
    } finally {
    }
  };

  function clearSearchText() {
    queryRef.current.value = "";
    queryRef.current?.focus();
  }

  return (
    <>
      <div className="search-bar">
        <img className="search-bar__search-icon" src="/img/検索用の虫眼鏡アイコン 7.png" alt="" />
        <input className="search-bar__input" type="text" ref={queryRef} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="検索" />
        <button className="search-bar__clear-button" onClick={clearSearchText}>
          <img className="search-bar__clear-icon" src="/img/x.png"></img>
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </>
  );
};

export default SearchBar;
