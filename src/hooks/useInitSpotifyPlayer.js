import { useEffect } from "react";
import usePlayerStore from "../store/playerStore";

const useInitSpotifyPlayer = () => {
  const initPlayer = usePlayerStore((state) => state.initPlayer);

  useEffect(() => {
    let instance;

    (async () => {
      instance = await initPlayer();
    })();

    return () => {
      if (instance?.disconnect) instance.disconnect();
    };
  }, []);
};

export default useInitSpotifyPlayer;
