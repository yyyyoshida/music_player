import React from 'react';
import { ImVolumeMute2, ImVolumeMute, ImVolumeLow, ImVolumeMedium, ImVolumeHigh } from 'react-icons/im';

const VolumeIcon = ({ volume, isMuted }) => {
  let IconComponent;
  let iconClassName = 'player-controls__button--volume-icon';

  if (isMuted || volume === 0) {
    IconComponent = ImVolumeMute2;
  } else if (volume < 30) {
    IconComponent = ImVolumeLow;
  } else if (volume < 70) {
    IconComponent = ImVolumeMedium;
  } else {
    IconComponent = ImVolumeHigh;
    iconClassName = 'player-controls__button--volume-icon-high';
  }

  return (
    <>
      <IconComponent size={17} className={iconClassName} />
    </>
  );
};

export default VolumeIcon;
