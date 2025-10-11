import type { RefObject } from "react";
import ShuffleButton from "./ShuffleButton";
import PlayButton from "./PlayButton";
import PrevNextButton from "./PrevNextButton";
import RepeatButton from "./RepeatButton";

type PlayerActionsProps = {
  actionsRef: RefObject<HTMLDivElement | null>;
};

const PlayerActions = ({ actionsRef }: PlayerActionsProps) => {
  return (
    <div ref={actionsRef} className="player-controls__actions">
      <ShuffleButton />
      <PrevNextButton type="prev" />
      <PlayButton />
      <PrevNextButton type="next" />
      <RepeatButton />
    </div>
  );
};

export default PlayerActions;
