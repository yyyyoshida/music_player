import React, { useContext } from 'react';
import SearchResultList from './SearchResultList';
import { SearchContext } from './SearchContext';

const SearchResult = () => {
  const { query } = useContext(SearchContext);
  return (
    <section className="search-result">
      <div className="search-result__header">
        <h2 className="search-result__title">{`${query}の検索結果`}</h2>
        <div className="search-result__header-info">
          <div className="search-result__header-rank">#</div>
          <p className="search-result__header-title">タイトル</p>
          <img className="search-result__header-duration" src="img/clock.png"></img>
        </div>
      </div>
      <SearchResultList />
    </section>
  );
};

export default SearchResult;
