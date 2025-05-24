const TrackListSkeleton = ({ count = 11 }) => {
  return (
    <ul className="skeleton-track-list">
      {Array(count)
        .fill()
        .map((_, i) => (
          <li key={i} className="skeleton-track-list__item">
            <div className="skeleton-track-list__item-left ">
              <span className="skeleton-track-list__item-left-count"></span>
            </div>
            <div className="skeleton-track-list__item-cover skeleton"></div>

            <div className="skeleton-track-list__item-info">
              <p className="skeleton-track-list__item-title skeleton skeleton--text"></p>
              <p className="skeleton-track-list__item-artist skeleton skeleton--text short"></p>
            </div>
            <div className="skeleton-track-list__item-right skeleton skeleton--text very-short"></div>
          </li>
        ))}
    </ul>
  );
};

export default TrackListSkeleton;
