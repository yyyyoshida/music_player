const CardListSkeleton = ({ marginTop = "40px" }) => {
  return (
    <ul className="card-list-skeleton" style={{ marginTop }}>
      {Array(21)
        .fill()
        .map((_, i) => (
          <li key={i} className="card-list-skeleton__item">
            <div className="card-list-skeleton__cover skeleton"></div>
            <div className="card-list-skeleton__info">
              <p className="card-list-skeleton__text skeleton skeleton--text short"></p>
              <p className="card-list-skeleton__text-short skeleton skeleton--text short"></p>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default CardListSkeleton;
