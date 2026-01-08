import { useState } from "react";
import PlaylistSelectSkeleton from "../skeletonUI/PlaylistSelectSkeleton";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";

import useFetchPlaylists from "../../hooks/useFetchPlaylists";
import { useSkeletonHandler } from "../../hooks/useSkeletonHandler";
import usePlaylistSelectionStore from "../../store/playlistSelectionStore";
import usePlaylistStore from "../../store/playlistStore";
import { FALLBACK_COVER_IMAGE } from "../../assets/icons";
import { getFetchedContentFadeAnimation } from "../../lib/fetchedContentFadeAnimation";
import { handleAddTrackToPlaylist } from "../../features/playlist/playlistActions";

const PlaylistSelection = () => {
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(null);
  const showCreatePlaylistModal = usePlaylistStore.getState().showCreatePlaylistModal;
  const isSelectVisible = usePlaylistSelectionStore((state) => state.isSelectVisible);
  const { openPlaylistSelectModal, closePlaylistSelectModal } = usePlaylistSelectionStore.getState();

  const { playlists, isPlaylistsLoading, isPlaylistsFromCache } = useFetchPlaylists();
  const isPlaylistsEmpty = playlists.length === 0;
  const showSkeleton = useSkeletonHandler({ isDataLoading: isPlaylistsLoading, skipSkeleton: isPlaylistsFromCache });

  async function handleClickPlaylist(playlistId: string) {
    setAddingToPlaylistId(playlistId);
    await handleAddTrackToPlaylist(playlistId);

    setAddingToPlaylistId(null);
  }

  function isAddingToThisPlaylist(playlistId: string) {
    return addingToPlaylistId === playlistId;
  }

  return (
    <div className="playlist-selection modal" style={{ visibility: isSelectVisible ? "visible" : "hidden" }}>
      <div className="playlist-selection__smoke modal-smoke">
        <div className="playlist-selection__content modal-content">
          <button className="playlist-selection__close-button" onClick={closePlaylistSelectModal}>
            <img src="/img/x.png" className="playlist-selection__close-icon button"></img>
          </button>
          <h2 className="playlist-selection__title modal-title">プレイリスト選択</h2>
          <button
            className="playlist-selection__create-button playlist-create-button"
            onClick={() => {
              showCreatePlaylistModal();
              openPlaylistSelectModal();
            }}
          >
            ＋ 新しいプレイリスト作成
          </button>

          <div className="playlists-selection__empty-message-wrapper empty-message-wrapper">
            <p className={`playlists-selection__empty-message  fade-on-loaded ${showSkeleton || !isPlaylistsEmpty ? "" : "fade-in-up"}`}>
              表示できるプレイリストがありません
            </p>
          </div>

          {showSkeleton && <PlaylistSelectSkeleton />}

          <ul className={`playlist-selection__list fade-on-loaded ${getFetchedContentFadeAnimation(showSkeleton, isPlaylistsFromCache)}`}>
            {playlists.map((playlist, i) => {
              const isSingleImage = playlist.albumImages.length <= 3;
              const firstTrackIsFallbackImage = playlist.trackCount === 0 || (isSingleImage && playlist.albumImages[0] === FALLBACK_COVER_IMAGE);

              return (
                <li key={playlist.id} className="playlist-selection__item" onClick={() => handleClickPlaylist(playlist.id)}>
                  <div className={`playlist-selection__item-cover-wrapper `}>
                    <PlaylistCoverImageGrid
                      images={playlist.albumImages}
                      wrapperClassName="playlist-selection__item-cover-img-wrapper"
                      fallbackImgClassName="playlist-selection__coverfallback-img"
                      imgClassName="playlist-selection__item-cover-img"
                    />

                    <div className="playlist-selection__item-initial-cover-img-bg">
                      <img
                        src={FALLBACK_COVER_IMAGE}
                        className="playlist-selection__item-initial-cover-img playlist-initial-cover-img"
                        style={{ display: firstTrackIsFallbackImage ? "block" : "none" }}
                      />
                    </div>
                  </div>
                  <p className="playlist-selection__item-name">{playlist.name}</p>

                  {isAddingToThisPlaylist(playlist.id) && <div className="playlist-selection__item-spin-loader spin-loader"></div>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelection;
