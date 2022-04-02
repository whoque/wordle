import "./App.scss";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import Box from "./components/Box/Box";
import { Dictionary } from "./dictionary";
import { useEffect, useState } from "react";

const KEYS = {
  UsedWords: "UsedWords_Wordle_by_hawk",
  ActiveWord: "ActiveWord_Wordle_by_hawk",
};

function App() {
  const [word, setWord] = useState(null);
  const [letterPressed, setLetterPressed] = useState();

  const getAndSetWord = () => {
    const item = Dictionary[Math.floor(Math.random() * Dictionary.length)];
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
    if (activeWord) {
      setWord(activeWord);
    } else {
      getAndSetWord();
    }
  }, []);

  const onKeyPress = (button) => {
    setLetterPressed({ letter: button });
  };

  return (
    <div className="App">
      <Box letterPressed={letterPressed} actualWord={word?.toUpperCase()} />
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
          "{enter}": "return",
          "{bksp}": "⌫",
          "{default}": "ABC",
        }}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}

export default App;
