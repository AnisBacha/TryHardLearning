const input = document.getElementById("input-text");
const textElement = document.getElementById("typingtext");
const newTestbutton = document.getElementById("button");
const timerElement = document.getElementById("timer");
const wpmResultElement = document.getElementById("wpm");
const accuracyResultElement = document.getElementById("accuracy");
const randomWordsSelection = document.getElementById("randomWords");
const randomQuotesSelection = document.getElementById("randomQuotes");

let timer = 60;
let totalKeysPressed = 0;
let correctKeysPressed = 0;
let startTime;
let endTime;
let typingIsRunning = false;
let testShouldEnd = false;

// ||| GENERATING THE TEXT TO DISPLAY
const generateRandomWords = async () => {
  const randomWord = await fetch(
    `https://random-word-api.herokuapp.com/word?number=300`
  );
  const jsonRandomWord = await randomWord.json();

  return jsonRandomWord;
};
const generateRandomQuote = async () => {
  const randomQuote = await fetch(
    "https://api.quotable.io/quotes/random?minLength=100",    {
      method: "GET"
    }
  );
  // https://api.api-ninjas.com/v1/quotes?category=business
  //https://github.com/lukePeavey/quotable
  const jsonRandomQuote = await randomQuote.json();
    return jsonRandomQuote;
};

const randomWordsTypingTest = async () => {
  try {
    selectedTypingTypeStyle(randomWordsSelection , randomQuotesSelection);
    const wordsArray = await generateRandomWords();
    text = wordsArray.join(" ");

    paragraphAndInputFunctionality();
    statsFunctionality();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load random words. Please try again later.");
  }
};
const randomQuotesTypingTest = async () => {
  try {
    selectedTypingTypeStyle(randomQuotesSelection , randomWordsSelection);
    const quote = await generateRandomQuote();
    text = quote[0].content;
    console.log(text)
    paragraphAndInputFunctionality();
    statsFunctionality();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load random Quote. Please try again later.");
  }
};
const selectedTypingTypeStyle = (addClass , removeClass) =>{
  addClass.classList.add("selectedTypingType");
  removeClass.classList.remove("selectedTypingType");
}

// ||| DISPLAYING THE GENERATED TEXT
let textType;
window.addEventListener("load" , (event) =>{
  textType = JSON.parse(localStorage.getItem("TextType"));
  console.log(textType);
  textType === "quotes" ? randomQuotesTypingTest() : randomWordsTypingTest();
})

randomWordsSelection.addEventListener("click", (event) => {
  textType = "words"
  localStorage.setItem("TextType" , JSON.stringify(textType));
  window.location.reload();
});
randomQuotesSelection.addEventListener("click", (event) => {
  textType = "quotes";
  localStorage.setItem("TextType" , JSON.stringify(textType));
  window.location.reload();
});

// ||| PARAGRAPH AND INPUT ELEMENTS CUSTOMIZATION
const paragraphAndInputFunctionality = () => {
  textElement.textContent = text;
  let words = text.split(" ");
  let lastWordsNonFiltered = [];
  let lastWords = [];
  let lastWordsAreStorred = false;

  /*  IN TEXT ELEMENT, WE WILL SHOW ONLY THREE LINES, WHEN THE USER COMPLETE TYPING THE TWO LINES OF WORDS
  THE FIRST LINE WILL DISAPEAR, AND THE SECOND WILL BE THE FIRST , THE THIRD WILL THE SECOND, A NEW LINE OF WORDS WILL APPEAR
  */
  // WE GET THE LAST WORDS OF EACH LINE TO SCROLL DOWN TO THE NEXT LINE
  function getLastWordIneachLine() {
    // When we limit the text shown it won't get the last words properly So we need to delay it
    textElement.classList.remove("limitTextShown");
    // This will make the height of the textElement consist of the height of one line
    textElement.innerHTML = words[0];
    // Here we get the height of one line
    let height = textElement.clientHeight;
    for (let i = 1; i < words.length; i++) {
      // Now we add the other words to our element
      textElement.innerHTML = textElement.innerHTML + " " + words[i];
      // while we adding the random words to our element, we check if the
      if (textElement.clientHeight > height) {
        //Here We Update the height of textElement and we store the last word in the line.
        height = textElement.clientHeight;
        lastWordsNonFiltered[i - 1] = words[i - 1];
        console.log(lastWordsNonFiltered[i - 1]);
        lastWordsAreStorred = true;
      }
    }
    console.log("------------------");
    lastWords =
      removeUndefinedAndAdjustPositionsWithValues(lastWordsNonFiltered);

    if (lastWordsAreStorred === true) {
      textElement.classList.add("limitTextShown");
      wrapWordsInSpans();
    }
  }

  // WE REMOVE THE UNDIFINED POSITIONS IN THE ARRAY AND ADJUST THE POSITION OF THE LAST WORDS
  function removeUndefinedAndAdjustPositionsWithValues(arr) {
    const positionsWithValues = [];
    const filteredArray = arr.filter((item, index) => {
      if (item !== undefined) {
        positionsWithValues.push(index);
        return true; // Keep the item in the filtered array
      }
      return false; // Remove the undefined item from the filtered array
    });

    return filteredArray;
  }
  // WE WRAP THE WORDS IN SPANS ELEMENT TO STYLE THEM ACCORDING THE INPUT STATE : CORRECT / INCORRECT/ DEFAULT
  function wrapWordsInSpans() {
    textElement.innerHTML = words
      .map((word) => `<span>${word}</span>`)
      .join(" ");
  }

  document.fonts.ready.then(function () {
    getLastWordIneachLine();
  });
  window.onresize = function () {
    window.location.reload();
  };

  let wordIsCorrect = false;
  let spaceBarIsPressed = false;
  let shouldScrollDown = false;
  let wordOrder = 0;
  let letterOrder = 0;
  let lastWordCount = 1;

  input.addEventListener("input", (event) => {
    const typedWord = input.value.trim();
    const wordSpans = textElement.querySelectorAll("span");
    const wordBeingTyped = wordSpans[wordOrder];

    const styleCorrectWord = () => {
      wordBeingTyped.classList.remove("incorrect-word");
      wordBeingTyped.classList.add("correct-word");
    };
    const styleIncorrectWord = () => {
      wordBeingTyped.classList.remove("correct-word");
      wordBeingTyped.classList.add("incorrect-word");
    };
    const defaultWordStyle = () => {
      wordBeingTyped.classList.remove("correct-word");
      wordBeingTyped.classList.remove("incorrect-word");
    };

    if (!typingIsRunning) {
      typingIsRunning = true;
      startTime = Date.now();
      endTime = startTime + 60000;
    }
    totalKeysPressed++;

    // Check if the letters that are being typed are correct
    if (
      typedWord.charAt(letterOrder) === words[wordOrder].charAt(letterOrder)
    ) {
      letterOrder++;
      correctKeysPressed++;
      defaultWordStyle();
    } else if (!spaceBarIsPressed) {
      wordIsCorrect = false;
      styleIncorrectWord();
    }
    // Check if the word that is being typed is correct
    if (typedWord === words[wordOrder]) {
      styleCorrectWord();
      wordIsCorrect = true;
      if (typedWord === lastWords[lastWordCount]) {
        shouldScrollDown = true;
      }
      
    }
    if(typedWord === words[words.length - 1]) {
      testShouldEnd = true;
      console.log(testShouldEnd)
    }
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === " " && wordIsCorrect) {
      correctKeysPressed++;
      wordOrder++;
      letterOrder = 0;
      input.value = "";
      wordIsCorrect = false;
    }
    if (event.key === " ") {
      spaceBarIsPressed = true;
    } else {
      spaceBarIsPressed = false;
    }
    if (event.key === " " && shouldScrollDown) {
      textElement.classList.add("scrollDown");
      scrollDown(textElement, 1.2);
      lastWordCount++;
      shouldScrollDown = false;
      textElement.classList.remove("scrollDown");
    }
  });

  // Scroll vertically to a specific position using em unit
  function scrollDown(element, emValue) {
    // Get the current font size in pixels
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    // Calculate the equivalent pixel value for the em
    const pixelValue = emValue * fontSize;
    console.log(pixelValue);
    // Set scrollTop to the pixel value
    element.scrollTop += pixelValue;
  }
};

// |||  STATS
const statsFunctionality = () => {
  const startTest = () => {
    if (typingIsRunning === true) {
      timer--;
      timerElement.textContent = timer;
    }
    if(timer === 0 || testShouldEnd){
      endTest(timerInterval, wpmInterval);
    }
    
  };
  const endTest = (timerInterval, wpmInterval) => {
      input.disabled = true;
      console.log("test is ended");
      clearInterval(timerInterval);
      clearInterval(wpmInterval);
      calculateAccuracy();
    
  };
  const calculateWpm = () => {
    if (Date.now() >= endTime) {
      return;
    }
    if (Date.now() <= endTime) {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const rawWPM = Math.round(totalKeysPressed / 5 / (elapsedSeconds / 60));
      wpmResultElement.textContent = rawWPM;
    }
  };
  const calculateAccuracy = () => {
    const accuracy = (correctKeysPressed / totalKeysPressed) * 100;
    console.log(correctKeysPressed);
    console.log(totalKeysPressed);
    accuracyResultElement.textContent = Math.round(accuracy);
  };

  const timerInterval = setInterval(startTest, 1000);
  const wpmInterval = setInterval(calculateWpm, 1500);
};

newTestbutton.addEventListener("click", (event) => {
  window.location.reload();
});