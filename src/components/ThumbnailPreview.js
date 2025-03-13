import React from 'react';

export const ThumbnailPreview = () => {
  return (
    <>
      <div id="js-thumbnail-preview" className="thumbnail-preview">
        <div id="js-thumbnail-preview-background" className="thumbnail-preview__background"></div>
        <figure className="thumbnail-preview__content">
          <div className="thumbnail-preview__image-warpper">
            <img id="js-thumbnail-preview-image" className="thumbnail-preview__image" src="img/not-found.jpg" alt="" />
            <div id="js-thumbnail-preview-transition" className="thumbnail-preview__image-transition"></div>
          </div>
          <figcaption className="thumbnail-preview__info">
            <p id="js-thumbnail-preview-title" className="thumbnail-preview__title">
              曲がセットされていません
            </p>
            <p id="js-thumbnail-preview-artist" className="thumbnail-preview__artist"></p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};
export default ThumbnailPreview;
