import "./Popup.scss";
import winnerGif from "../../assets/winner.gif";
import loserGif from "../../assets/loser.gif";
import helpImage from "../../assets/help.png";

export const TEMPLATE = {
  WINNER: "winner",
  LOSER: "loser",
  HELP: "help",
};

function Popup({ hidePopupHandler, inputTemplate, word }) {
  const closeClicked = (refresh = true) => {
    hidePopupHandler();
    if (refresh) {
      window.location.reload(false);
    }
  };
  const renderPopup = () => {
    if (inputTemplate === TEMPLATE.WINNER) {
      return (
        <>
          <div className="winner">
            <img src={winnerGif} alt="loading..." />
            <div className="text">
              The word was <strong className="word">{word}</strong>
            </div>
          </div>
          <button className="closeButton" onClick={closeClicked}>
            Play again
          </button>
        </>
      );
    } else if (inputTemplate === TEMPLATE.LOSER) {
      return (
        <>
          <div className="loser">
            <img src={loserGif} alt="loading..." />
            <div className="text">
              The word was <strong className="word">{word}</strong>
            </div>
          </div>
          <button className="closeButton" onClick={closeClicked}>
            Play again
          </button>
        </>
      );
    } else {
      return (
        <div className="help">
          <img src={helpImage} alt="loading..." />
          <button className="closeButton" onClick={() => closeClicked(false)}>
            Close
          </button>
        </div>
      );
    }
  };
  return <div className="popup stripe">{renderPopup()}</div>;
}

export default Popup;
