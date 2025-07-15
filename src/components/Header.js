import { useContext } from "react";
import SearchBar from "./SearchBar";
import LocalFileImportNav from "./LocalFileImportNav";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

function Header({ token, onSearchResults }) {
  const { showMessage } = useContext(ActionSuccessMessageContext);

  return (
    <header className="sidebar-header">
      <h1 className="sidebar-header__logo">
        <a href="#">音楽プレイヤー</a>
      </h1>
      <div className="sidebar-header__user">
        <img src="/img/favicon.jpg" alt="" className="sidebar-header__user-icon" />
        <p className="sidebar-header__user-name">AA</p>
      </div>
      <SearchBar token={token} onSearchResults={onSearchResults} /> {/* 検索結果を受け取る */}
      <nav className="sidebar-header__nav">
        <ul className="sidebar-header__list">
          <li className="sidebar-header__item">
            <a className="sidebar-header__link" href="/">
              <img src="/img/ホームアイコン (1).png" alt="" className="sidebar-header__item-icon" />
              ホーム
            </a>
          </li>
          <li className="sidebar-header__item">
            <a className="sidebar-header__link" href="/playlist">
              <img src="/img/ソングリストアイコン1 (1).png" alt="" className="sidebar-header__item-icon" />
              プレイリスト
            </a>
          </li>

          <LocalFileImportNav />

          <li
            className="sidebar-header__item"
            onClick={() => {
              showMessage("未実装");
            }}
          >
            <a className="sidebar-header__link" href="#">
              <img src="/img/無料の設定歯車アイコン (1).png" alt="" className="sidebar-header__item-icon" />
              設定
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
