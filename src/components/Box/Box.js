import { useEffect, useState } from "react";
import { LETTER_COUNT, WORD_COUNT } from "../../constants";
import "./Box.scss";
import cloneDeep from "lodash/cloneDeep";

const COLOR = {
  NOT_FOUND: "grey",
  FOUND_WRONG_SPOT: "yellow",
  FOUND_CORRECT_SPOT: "green",
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

function Box({ letterPressed, actualWord, savedState }) {
  const initialState = savedState ? savedState : getInitialWordsObj();

  const [state, setState] = useState(initialState);
  const [activeWord, setActiveWord] = useState();
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
          // const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
          // fetch(url)
          //   .then((response) => {
          //     if (response.ok) {
          //       return response.json();
          //     }
          //     throw new Error("Something went wrong");
          //   })
          //   .then((data) => {
          //     checkWord(word);
          //   })
          //   .catch((error) => {
          //     console.log("Show No word pop up !");
          //   });
          checkWord(word);
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

  const getLetterMatchColor = (typedWord) => {
    let result = [];
    for (let i = 0; i < LETTER_COUNT; i++) {
      result.push(COLOR.NOT_FOUND);
      if (typedWord[i] === actualWord[i]) {
        result[i] = COLOR.FOUND_CORRECT_SPOT;
        actualWordLetterMap[typedWord[i]]--;
      }
    }
    for (let i = 0; i < typedWord?.length; i++) {
      let char = typedWord.charAt(i);
      if (actualWord.includes(char) && actualWordLetterMap[char] > 0) {
        result[i] = COLOR.FOUND_WRONG_SPOT;
        actualWordLetterMap[char]--;
      }
    }
    return result;
  };

  const checkWord = (word) => {
    if (word === actualWord) {
      console.log("Winner");
      // show pop up
      // localstorage
      // reset
    } else {
      const cloneState = cloneDeep(state);
      const targetWord = cloneState.find((item) => item.id === activeWord.id);
      const letterColors = getLetterMatchColor(word);
      targetWord.word.forEach((element, index) => {
        element.letter = activeWord.word[index].letter;
        element.color = letterColors[index];
      });
      targetWord.state = WordState.DONE;
      if (targetWord.id === WORD_COUNT - 1) {
        console.log("You lost !");
        // show pop up
        // localstorage
        // Reset
      } else {
        cloneState[targetWord.id + 1].state = WordState.ACTIVE;
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
          <div key={activeWord.id + "hash"} className="word">
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
