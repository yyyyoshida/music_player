import React from "react";
import ShuffleButton from "./ShuffleButton";
import PlayButton from "./PlayButton";
import PrevNextButton from "./PrevNextButton";
import ParentComponent from "./ParentComponent";
import RepeatButton from "./RepeatButton";

const PlayerActions = ({ actionsRef }) => {
  return (
    <div ref={actionsRef} className="player-controls__actions">
      <ShuffleButton />
      <PrevNextButton type="prev" />
      <PlayButton />
      <PrevNextButton type="next" />
      <RepeatButton />
      {/* <RepeatButton isRepeat={isRepeat} setIsRepeat={setIsRepeat} /> */}
    </div>
  );
};
// dsdfasd
export default PlayerActions;
