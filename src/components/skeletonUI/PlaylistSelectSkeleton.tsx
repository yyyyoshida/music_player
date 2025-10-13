const PlaylistSelectSkeleton = () => {
  return (
    <ul className="playlist-select-skeleton">
      {Array(3)
        .fill(null)
        .map((_, i) => (
          <li key={i} className="playlist-select-skeleton__item">
            <div className="playlist-select-skeleton__item-cover skeleton"></div>
            <p className="playlist-select-skeleton__item-text skeleton skeleton--text short"></p>
          </li>
        ))}
    </ul>
  );
};

export default PlaylistSelectSkeleton;
