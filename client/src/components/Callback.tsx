import { useEffect } from "react";
import { STORAGE_KEYS } from "../utils/storageKeys";

const Callback = () => {
  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace("#", "?")).get("access_token");

    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token); // アクセストークンをlocalStorageに保存
      // window.location.href = '/home'; // メインページに遷移
    } else {
      console.error("アクセストークンの取得に失敗しました");
    }
  }, []);

  return <div>ログイン中...</div>;
};

export default Callback;
