import "./App.scss";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import Box from "./components/Box/Box";
import { Dictionary } from "./dictionary";
import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import Popup, { TEMPLATE } from "./components/Popup/Popup";
import { Dictionary2 } from "./Diction";

export const KEYS = {
  UsedWords: "UsedWords_Wordle_by_hawk1",
  ActiveWord: "ActiveWord_Wordle_by_hawk1",
  GameState: "GameState_Wordle_by_hawk1",
};

function App() {
  const [word, setWord] = useState(null);
  const [letterPressed, setLetterPressed] = useState();
  const [savedGame, setSavedGame] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [popupTemp, setPopupTemp] = useState();

  const getAndSetWord = () => {
    const item = Dictionary2[Math.floor(Math.random() * Dictionary2.length)];
    const usedWords = JSON.parse(localStorage.getItem(KEYS.UsedWords));
    if (usedWords) {
      if (usedWords.indexOf(item) > -1) {
        getAndSetWord();
      } else {
        setWord(item);
        localStorage.setItem(KEYS.ActiveWord, item);
      }
    } else {
      setWord(item);
      localStorage.setItem(KEYS.ActiveWord, item);
    }
  };

  useEffect(() => {
    const activeWord = localStorage.getItem(KEYS.ActiveWord);
    const gameState = JSON.parse(localStorage.getItem(KEYS.GameState));
    if (gameState) {
      setSavedGame(gameState);
    }
    if (activeWord) {
      setWord(activeWord);
    } else {
      getAndSetWord();
    }
  }, []);

  const onKeyPress = (button) => {
    setLetterPressed({ letter: button });
  };

  const showPopupHandler = (template) => {
    if (template === TEMPLATE.WINNER) {
      setTimeout(() => {
        setShowPopup(true);
      }, 1500);
    } else {
      setShowPopup(true);
    }
    setPopupTemp(template);
  };

  const hidePopupHandler = () => {
    setShowPopup(false);
  };

  const renderDisplay = () => {
    if (word) {
      return (
        <div className={"App " + (showPopup ? " blurApp" : "")}>
          <Header showPopupHandler={showPopupHandler} />
          <Box
            letterPressed={letterPressed}
            actualWord={word?.toUpperCase()}
            savedState={savedGame}
            showPopupHandler={showPopupHandler}
          />
          <Keyboard
            theme="hg-theme-default hg-theme-ios"
            layout={{
              default: [
                "Q W E R T Y U I O P",
                "A S D F G H J K L",
                "{enter} Z X C V B N M {bksp}",
              ],
            }}
            display={{
              "{enter}": "RETURN",
              "{bksp}": "CLEAR",
              "{default}": "ABC",
            }}
            onKeyPress={onKeyPress}
          />
        </div>
      );
    }
  };

  return (
    <div className="wrapper">
      {renderDisplay()}{" "}
      {showPopup ? (
        <Popup
          hidePopupHandler={hidePopupHandler}
          inputTemplate={popupTemp}
          word={word}
        />
      ) : null}{" "}
    </div>
  );
}

export default App;
