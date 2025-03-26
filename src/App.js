// import { useState, useEffect } from 'react';
// import Header from './components/Header';
// import Main from './components/Main';
// import Login from './components/Login';

// function App() {
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const hash = window.location.hash;

//     if (hash) {
//       const tokenString = new URLSearchParams(hash.substring(1)).get('access_token');
//       if (tokenString) {
//         setToken(tokenString);
//         window.localStorage.setItem('spotify_token', tokenString);
//         window.location.hash = '';
//       }
//     }

//     const savedToken = window.localStorage.getItem('spotify_token');
//     if (savedToken) {
//       setToken(savedToken);
//     }
//   }, []);
//   return (
//     <>
//       <Header />
//       {token ? <Main token={token} /> : <Login />}
//     </>
//   );
// }

// export default App;

// 再生バーの無駄な再レンダリングを防ぐ

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // ログイン後にURLにアクセストークンが含まれているかを確認
    const hash = window.location.hash;
    if (hash) {
      const tokenString = new URLSearchParams(hash.substring(1)).get('access_token');
      if (tokenString) {
        setToken(tokenString); // トークンをstateに保存
        window.localStorage.setItem('spotify_token', tokenString); // ローカルストレージに保存
        window.location.hash = ''; // URLからアクセストークンを消す
      }
    }

    // ローカルストレージに保存されたトークンがあれば取得
    const savedToken = window.localStorage.getItem('spotify_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <>
      <Header />
      {!token && <Login />}
      <Main token={token} />
    </>
  );
}

export default App;
