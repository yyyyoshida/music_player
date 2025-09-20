import { useContext } from "react";
import SearchBar from "./SearchBar";
import LocalFileImportNav from "./LocalFileImportNav";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import { UserContext } from "../contexts/UserContext";

function Header() {
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const { profile } = useContext(UserContext);

  const userIcon = profile?.images[1].url || "/img/dummy-user.jpg";
  const userName = profile?.display_name || "A A";

  return (
    <header className="sidebar-header">
      <h1 className="sidebar-header__logo">
        <a href="#">音楽プレイヤー</a>
      </h1>
      <div className="sidebar-header__user">
        <img src={userIcon} alt="" className="sidebar-header__user-icon" />
        <p className="sidebar-header__user-name">{userName}</p>
      </div>
      <SearchBar />
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
