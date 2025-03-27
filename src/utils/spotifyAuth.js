const CLIENT_ID = 'a97251d0ab5e40c7bc41a3997e166e2d'; // あなたのクライアントID
const CLIENT_SECRET = '56318a7b9973426cbbfa2abcbf864ca0'; // あなたのクライアントシークレット
const REFRESH_TOKEN = window.localStorage.getItem('refresh_token'); // ローカルストレージからリフレッシュトークンを取得

const getNewAccessToken = async () => {
  const refreshToken = window.localStorage.getItem('refresh_token');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    window.localStorage.setItem('access_token', data.access_token); // 新しいトークンを保存
    return data.access_token;
  }
  throw new Error('アクセストークンの更新に失敗しました');
};
export { getNewAccessToken }; // 他のファイルで利用できるようにエクスポート
