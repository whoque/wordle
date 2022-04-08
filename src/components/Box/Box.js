import { useEffect, useState } from "react";
import { LETTER_COUNT, WORD_COUNT } from "../../constants";
import "./Box.scss";
import cloneDeep from "lodash/cloneDeep";
import { KEYS } from "../../App";
import { TEMPLATE } from "../Popup/Popup";

const ShakeClass = "shake";
const GlowClass = "glow";

const COLOR = {
  NOT_FOUND: "#3a3a3c",
  FOUND_WRONG_SPOT: "#b49f3a",
  FOUND_CORRECT_SPOT: "#538d4e",
};

const WordState = {
  ACTIVE: "ACTTIVE",
  DONE: "DONE",
  NOT_DONE: "NOT_DONE",
};

const LetterState = {
  EMPTY: "EMPTY",
  GREY: "GREY",
  GREEN: "GREEN",
};

const getInitialLettersObj = () => {
  const result = [];
  for (let i = 0; i < LETTER_COUNT; i++) {
    let letterObj = {
      id: i,
      letter: null,
      state: LetterState.EMPTY,
    };
    result.push(letterObj);
  }
  return result;
};

const getInitialWordsObj = () => {
  const result = [];
  for (let i = 0; i < WORD_COUNT; i++) {
    let wordObj = {
      id: i,
      word: getInitialLettersObj(),
      state: i === 0 ? WordState.ACTIVE : WordState.NOT_DONE,
    };
    result.push(wordObj);
  }
  return result;
};

function Box({ letterPressed, actualWord, savedState, showPopupHandler }) {
  const initialState = savedState ? savedState : getInitialWordsObj();

  const [state, setState] = useState(initialState);
  const [activeWord, setActiveWord] = useState();
  const [shakeClass, setShakeClass] = useState("");
  const [glowClass, setGlowClass] = useState("");
  const [actualWordLetterMap, setActualWordLetterMap] = useState({});

  useEffect(() => {
    let map = {};
    for (let i = 0; i < actualWord?.length; i++) {
      let char = actualWord.charAt(i);
      if (map[char]) {
        map[char]++;
      } else {
        map[char] = 1;
      }
    }
    setActualWordLetterMap(map);
  }, [actualWord]);

  useEffect(() => {
    const activeWord = state.find((word) => word.state === WordState.ACTIVE);
    setActiveWord(cloneDeep(activeWord));
  }, [state]);

  useEffect(() => {
    const alpha = letterPressed?.letter;
    if (alpha) {
      const cloneActiveWord = cloneDeep(activeWord);
      if (alpha === "{bksp}") {
        const targetLetterIndex = cloneActiveWord.word.findIndex(
          (item) => item.letter === null
        );
        if (targetLetterIndex > 0) {
          cloneActiveWord.word[targetLetterIndex - 1].letter = null;
        } else if (targetLetterIndex === -1) {
          cloneActiveWord.word[LETTER_COUNT - 1].letter = null;
        }
        setActiveWord(cloneActiveWord);
      } else if (alpha === "{enter}") {
        let word = "";
        cloneActiveWord.word.forEach((element) => {
          if (element.letter) {
            word = word + element.letter;
          }
        });
        if (word.length === LETTER_COUNT) {
          setGlowClass(GlowClass);
          const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
          fetch(url)
            .then((response) => {
              if (response.ok) {
                return response.json();
              }
              throw new Error("Something went wrong");
            })
            .then((data) => {
              setTimeout(() => {
                checkWord(word);
                setGlowClass("");
              }, 700);
            })
            .catch((error) => {
              setTimeout(() => {
                invalidAnimation();
                setGlowClass("");
              }, 700);
            });
        }
      } else {
        const targetLetter = cloneActiveWord.word.find(
          (item) => item.letter === null
        );
        if (targetLetter) {
          targetLetter.letter = alpha;
          setActiveWord(cloneActiveWord);
        }
      }
    }
  }, [letterPressed]);

  const invalidAnimation = () => {
    setShakeClass(ShakeClass);
    setTimeout(() => {
      setShakeClass("");
    }, 1500);
  };

  const getLetterMatchColor = (typedWord) => {
    const actualWordMapClone = cloneDeep(actualWordLetterMap);
    let result = [];
    for (let i = 0; i < LETTER_COUNT; i++) {
      result.push(COLOR.NOT_FOUND);
      if (typedWord[i] === actualWord[i]) {
        result[i] = COLOR.FOUND_CORRECT_SPOT;
        actualWordMapClone[typedWord[i]]--;
      }
    }
    for (let i = 0; i < typedWord?.length; i++) {
      let char = typedWord.charAt(i);
      if (actualWord.includes(char) && actualWordMapClone[char] > 0) {
        result[i] = COLOR.FOUND_WRONG_SPOT;
        actualWordMapClone[char]--;
      }
    }
    return result;
  };

  const setUsedWordsInLS = () => {
    const val = JSON.parse(localStorage.getItem(KEYS.UsedWords));
    if (!val?.length) {
      localStorage.setItem(KEYS.UsedWords, JSON.stringify([actualWord]));
    } else {
      val.push(actualWord);
      localStorage.setItem(KEYS.UsedWords, JSON.stringify(val));
    }
  };

  const clearLS = () => {
    localStorage.removeItem(KEYS.ActiveWord);
    localStorage.removeItem(KEYS.GameState);
  };

  const checkWord = (word) => {
    const cloneState = cloneDeep(state);
    const targetWord = cloneState.find((item) => item.id === activeWord.id);
    if (word === actualWord) {
      console.log("Winner");
      targetWord.word.forEach((element, index) => {
        element.letter = activeWord.word[index].letter;
        element.color = COLOR.FOUND_CORRECT_SPOT;
      });

      setUsedWordsInLS();
      clearLS();
      showPopupHandler(TEMPLATE.WINNER);
      setState(cloneState);
    } else {
      const letterColors = getLetterMatchColor(word);
      targetWord.word.forEach((element, index) => {
        element.letter = activeWord.word[index].letter;
        element.color = letterColors[index];
      });
      targetWord.state = WordState.DONE;
      if (targetWord.id === WORD_COUNT - 1) {
        console.log("You lost !");

        setUsedWordsInLS();
        clearLS();
        showPopupHandler(TEMPLATE.LOSER);
      } else {
        cloneState[targetWord.id + 1].state = WordState.ACTIVE;
        localStorage.setItem(KEYS.GameState, JSON.stringify(cloneState));
        setState(cloneState);
      }
    }
  };

  const renderLetters = (word) => {
    return word.map((letter) => {
      return (
        <div
          key={letter.id}
          className="letter"
          style={{ backgroundColor: letter?.color }}
        >
          {letter.letter}
        </div>
      );
    });
  };

  const renderBoxes = () => {
    return state.map((word) => {
      if (word.state === WordState.ACTIVE) {
        return (
          <div
            key={activeWord.id + "hash"}
            className={`word active-word ${glowClass} ${shakeClass}`}
          >
            {renderLetters(activeWord.word)}
          </div>
        );
      }
      return (
        <div key={word.id} className="word">
          {renderLetters(word.word)}
        </div>
      );
    });
  };

  return <div className="box">{activeWord ? renderBoxes() : null}</div>;
}

export default Box;
