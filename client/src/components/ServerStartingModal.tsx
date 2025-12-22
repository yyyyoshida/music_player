import { useEffect, useState } from "react";
import LOGIN_URL from "../config/spotifyConfig";
import useTokenStore from "../store/tokenStore";

const ServerStartingModal = () => {
  const isServerStatus = useTokenStore((state) => state.serverStatus);
  const isServerReady = isServerStatus === "ready";

  const handleLogin = () => {
    window.location.href = LOGIN_URL; // Spotifyの認証ページにリダイレクト
  };

  // LoginではなくServerStartingModalとかに名前変える

  return (
    <div className="server-starting-modal modal" style={{ visibility: !isServerReady ? "hidden" : "visible" }}>
      <div className="server-starting-modal__smoke modal-smoke"></div>
      <div className="server-starting-modal__content modal-content">
        {/* {`${isServerStatus}`} */}
        <div className="server-starting-modal__spin-loader spin-loader"></div>
        {/* <h2 className="server-starting-modal__title modal-title">サーバー起動中</h2> */}
        <p className="server-starting-modal__title modal-text">サーバー起動中</p>
      </div>
    </div>
  );
};

export default ServerStartingModal;
