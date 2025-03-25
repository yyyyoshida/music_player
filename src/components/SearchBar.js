import React, { useState } from 'react';

const SearchBar = () => {
  return (
    <div className="search-bar">
      <input className="search-input" type="text" id="js-search-input" placeholder="検索" />
      <button id="js-search-button" className="search-button">
        <img src="img/検索用の虫眼鏡アイコン 7.png" alt="" />
      </button>
    </div>
  );
};

export default SearchBar;
