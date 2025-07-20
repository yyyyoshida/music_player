import { useContext, useRef, useEffect } from "react";
import { SearchContext } from "../contexts/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchWithRefresh } from "../utils/spotifyAuth";

const SearchBar = ({ token }) => {
  const { setQuery, setSearchResults, setHasSearchError, query } = useContext(SearchContext);
  const queryRef = useRef("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token || location.pathname !== "/search-result") return;

    const savedQuery = localStorage.getItem("searchQuery") || "";

    queryRef.current.value = savedQuery;

    handleSearch();
  }, [token]);

  // async function handleSearch() {
  //   if (!queryRef.current.value || queryRef.current.value === query) return;

  //   setQuery(queryRef.current.value);
  //   localStorage.setItem("searchQuery", queryRef.current.value);
  //   navigate(`/search-result?query=${encodeURIComponent(queryRef.current.value)}`);

  //   console.log(token);
  //   if (!token) {
  //     console.error("アクセストークンが無効です。再度ログインしてください。");

  //     return;
  //   }

  //   try {
  //     const encodedQuery = encodeURIComponent(queryRef.current.value); // クエリをURLエンコード
  //     const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=50`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`, // トークンをヘッダーに含める
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("APIからのエラー:", errorText);
  //       throw new Error("Spotify APIからの応答がありません");
  //     }

  //     const data = await response.json();

  //     if (data.tracks?.items?.length) {
  //       setSearchResults(data.tracks.items);
  //       setHasSearchError(false);
  //     } else {
  //       setSearchResults([]);
  //       setHasSearchError(true);
  //     }
  //     // setQuery('');
  //   } catch (err) {
  //     setHasSearchError(true);
  //     setSearchResults([]);
  //   }
  // }
  async function handleSearch() {
    const queryText = queryRef.current.value;
    if (!queryText || queryText === query) return;

    setQuery(queryText);
    localStorage.setItem("searchQuery", queryText);
    navigate(`/search-result?query=${encodeURIComponent(queryText)}`);

    try {
      const encodedQuery = encodeURIComponent(queryText);
      const response = await fetchWithRefresh(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=50`, {
        method: "GET",
      });

      const data = await response.json();

      if (data.tracks?.items?.length) {
        setSearchResults(data.tracks.items);
        setHasSearchError(false);
      } else {
        setSearchResults([]);
        setHasSearchError(true);
      }
    } catch (err) {
      setHasSearchError(true);
      setSearchResults([]);
    }
  }

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
    </>
  );
};

export default SearchBar;
