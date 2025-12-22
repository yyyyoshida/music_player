import LOGIN_URL from "../config/spotifyConfig";

const Login = () => {
  const handleLogin = () => {
    window.location.href = LOGIN_URL; // Spotifyの認証ページにリダイレクト
  };

  return (
    <div className="login modal">
      <div className="login__smoke modal-smoke"></div>
      <div className="login__content modal-content">
        <h2 className="login__title modal-title">ログインが必要です</h2>
        <p className="login__text">
          認証情報の確認を行いましたが、ログインが必要です。
          <br />
          下のボタンを押してSpotifyでログインしてください。
        </p>

        <button className="login__button" onClick={handleLogin}>
          Spotifyでログイン
        </button>
      </div>
    </div>
  );
};

export default Login;
