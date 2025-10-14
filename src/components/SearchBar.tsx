import { useRef, useEffect } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import useTokenStore from "../store/tokenStore";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSpotifyAPI } from "../utils/spotifyAuth";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const SearchBar = () => {
  const { setQuery, setSearchResults, setHasSearchError, query } = useSearchContext();
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const token = useTokenStore((state) => state.token);
  const queryRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token || location.pathname !== "/search-result" || !queryRef.current) return;

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

  function handleSearchError(logValue: unknown) {
    console.error("検索結果の取得に失敗: ", logValue as number | Error);
    setHasSearchError(true);
    setSearchResults([]);
    showMessage("searchFailed");
  }

  async function handleSearch() {
    const queryText = queryRef.current?.value;
    if (!queryText || queryText === query) return;

    setQuery(queryText);
    localStorage.setItem("searchQuery", queryText);
    navigate(`/search-result?query=${encodeURIComponent(queryText)}`);

    try {
      const encodedQuery = encodeURIComponent(queryText);
      const response = await fetchSpotifyAPI(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=50`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        handleSearchError(response.status);
        return;
      }

      if (data.tracks?.items?.length) {
        setSearchResults(data.tracks.items);
        setHasSearchError(false);
      } else {
        setSearchResults([]);
        setHasSearchError(true);
      }
    } catch (error) {
      handleSearchError(error);
    }
  }

  function clearSearchText() {
    if (!queryRef.current) return;
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
