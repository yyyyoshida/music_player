import ProgressBar from "./ProgressBar";
import CurrentTime from "./CurrentTime";
import Duration from "./Duration";

const ProgressBarWrapper = () => {
  return (
    <>
      <div className="player-controls__progress" id="js-player-progress">
        <CurrentTime />
        <ProgressBar initialValue={0} />
        <Duration />
      </div>
    </>
  );
};
export default ProgressBarWrapper;
