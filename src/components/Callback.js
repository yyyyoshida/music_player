import React, { useEffect } from 'react';

const Callback = () => {
  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');

    if (token) {
      localStorage.setItem('access_token', token); // アクセストークンをlocalStorageに保存
      // window.location.href = '/home'; // メインページに遷移
    } else {
      console.error('アクセストークンの取得に失敗しました');
    }
  }, []);

  return <div>ログイン中...</div>;
};

export default Callback;
