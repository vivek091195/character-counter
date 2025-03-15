const AVG_WORD_LENGTH = 5;
const AVG_READING_TIME = 250; // 250 words / min
const MAX_ALLOWED_LETTER_DENSITIES = 5;

let currentText = "";
let previousText = "";
let excludeSpaces = false;
let characterLimit = 0;
let totalCharactersInput;
let wordCountInput;
let sentenceCountInput;
let readingTimeValue;
let limitReachedErrorElement;
const letterDensityMap = new Map();

document.addEventListener("DOMContentLoaded", function () {
  initializeEventHandlers();
});

function calculateTotalCharacters(text, excludeSpaces = false) {
  return excludeSpaces ? text.replace(/\s+/gi, "").length : text.length;
}

function calculateTotalWords(text) {
  return text.split(/[\s\n]+/).length;
}

function calculateTotalSentences(text) {
  return text.split(/[?.!]+/).filter((word) => word.trim().length).length;
}

function calculateReadingTime(text) {
  const totalCharacters = calculateTotalCharacters(text, excludeSpaces);
  const averageWords = Math.floor(totalCharacters / AVG_WORD_LENGTH);
  return Math.ceil(averageWords / AVG_READING_TIME);
}

function padWith(value, count) {
  return value.padStart(count, 0);
}

function createAndAppendLetterDensityElement() {
  const letterDensitySection = document.getElementById(
    "letter-density-section"
  );

  const letterDensityWrapper = document.createElement("div");
  letterDensityWrapper.classList.add("letter-density-wrapper");

  const letterElement = document.createElement("p");
  letterElement.classList.add("letter");

  const progressElement = document.createElement("div");
  progressElement.classList.add("progress");

  const runningProgress = document.createElement("div");
  runningProgress.classList.add("running-progress");

  const densityValue = document.createElement("p");
  densityValue.classList.add("density-value");

  progressElement.appendChild(runningProgress);
  letterDensityWrapper.appendChild(letterElement);
  letterDensityWrapper.appendChild(progressElement);
  letterDensityWrapper.appendChild(densityValue);

  letterDensitySection.appendChild(letterDensityWrapper);

  return letterDensityWrapper;
}

function showSeeMoreButton() {
  let seeMoreButton = document.getElementById("see-more-button");
  if (!seeMoreButton) {
    seeMoreButton = document.createElement("button");
    seeMoreButton.id = "see-more-button";
    seeMoreButton.textContent = "See more";
    seeMoreButton.classList.add("see-more-button");

    seeMoreButton.addEventListener("click", function () {
      revealAllLetterDensityWrappers();
    });

    const letterDensitySection = document.getElementById(
      "letter-density-section"
    );
    letterDensitySection.appendChild(seeMoreButton);
  } else {
    seeMoreButton.style.display = "block";
  }
}

function showSeeLessButton() {
  let seeLessButton = document.getElementById("see-less-button");
  if (!seeLessButton) {
    seeLessButton = document.createElement("button");
    seeLessButton.id = "see-less-button";
    seeLessButton.textContent = "See less";
    seeLessButton.classList.add("see-more-button");

    seeLessButton.addEventListener("click", function () {
      updateLetterDensityView();
    });

    const letterDensitySection = document.getElementById(
      "letter-density-section"
    );
    letterDensitySection.appendChild(seeLessButton);
  } else {
    seeLessButton.style.display = "block";
  }
}

function hideSeeMoreButton() {
  const seeMoreButton = document.getElementById("see-more-button");
  if (seeMoreButton) {
    seeMoreButton.style.display = "none";
  }
}

function hideSeeLessButton() {
  const seeLessButton = document.getElementById("see-less-button");
  if (seeLessButton) {
    seeLessButton.style.display = "none";
  }
}

function revealAllLetterDensityWrappers() {
  const letterDensityWrappers = Array.from(
    document.getElementsByClassName("letter-density-wrapper")
  );

  letterDensityWrappers.forEach((wrapper) => {
    wrapper.style.display = "flex";
  });

  hideSeeMoreButton();
  showSeeLessButton();
}

function updateLetterDensityView() {
  const totalLetters = Array.from(letterDensityMap.values()).reduce(
    (acc, curr) => acc + curr,
    0
  );

  const letterDensityMapArray = Array.from(letterDensityMap.entries());
  letterDensityMapArray.sort((first, second) => second[1] - first[1]);

  const letterDensityWrappers = Array.from(
    document.getElementsByClassName("letter-density-wrapper")
  );

  letterDensityMapArray.forEach(([character, count], index) => {
    let letterWrapperElement;
    if (index < letterDensityWrappers.length) {
      letterWrapperElement = letterDensityWrappers[index];
    } else {
      letterWrapperElement = createAndAppendLetterDensityElement();
    }

    const percentValue = (count / totalLetters) * 100;
    letterWrapperElement.querySelector(".letter").textContent =
      character.toUpperCase();
    letterWrapperElement.querySelector(
      ".density-value"
    ).textContent = `${count} (${percentValue.toFixed(2)}%)`;
    letterWrapperElement.querySelector(
      ".running-progress"
    ).style.width = `${percentValue}%`;

    if (index >= MAX_ALLOWED_LETTER_DENSITIES) {
      letterWrapperElement.style.display = "none";
    } else {
      letterWrapperElement.style.display = "flex";
    }
  });

  console.log(letterDensityMap);

  if (letterDensityMapArray.length >= MAX_ALLOWED_LETTER_DENSITIES) {
    showSeeMoreButton();
    hideSeeLessButton();
  } else {
    hideSeeMoreButton();
    hideSeeLessButton();
  }
}

function updateLetterDensityMapAndView(characters, remove = false) {
  const alphabets = new RegExp(/[a-zA-Z]/);
  for (let i = 0; i < characters.length; i++) {
    const currentCharacter = characters[i].toUpperCase();

    if (!alphabets.test(currentCharacter)) continue;

    if (remove) {
      letterDensityMap.set(
        currentCharacter,
        Math.max(0, letterDensityMap.get(currentCharacter) - 1)
      );
    } else {
      if (!letterDensityMap.has(currentCharacter)) {
        letterDensityMap.set(currentCharacter, 0);
        // createAndAppendLetterDensityElement();
      }
      letterDensityMap.set(
        currentCharacter,
        letterDensityMap.get(currentCharacter) + 1
      );
    }
  }

  updateLetterDensityView();
}

function handleLetterDensityView() {
  const noLetterText = document.getElementById("no-letter-text");
  // when characters are added
  if (currentText.length > previousText.length) {
    const newCharacters = currentText.slice(
      previousText.length,
      currentText.length
    );
    updateLetterDensityMapAndView(newCharacters, false);
  } else {
    // when characters are removed
    const removedCharacters = previousText.slice(
      currentText.length,
      previousText.length
    );
    updateLetterDensityMapAndView(removedCharacters, true);
  }

  previousText = currentText;
  noLetterText.style.display = "none";
}

function themeSwitcherClickHandler() {
  const themeSwitcher = document.getElementById("theme-switcher");
  const appLogo = document.getElementById("app-logo");

  const isDarkTheme = document.body.classList.contains("dark-theme");
  if (isDarkTheme) {
    document.body.classList.remove("dark-theme");
    appLogo.src = "./assets/images/logo-light-theme.svg";
    themeSwitcher.src = "./assets/images/icon-moon.svg";
  } else {
    document.body.classList.add("dark-theme");
    appLogo.src = "./assets/images/logo-dark-theme.svg";
    themeSwitcher.src = "./assets/images/icon-sun.svg";
  }
}

function excludeSpacesChangeHandler(event) {
  excludeSpaces = event.target.checked;
  totalCharactersInput.textContent = calculateTotalCharacters(
    currentText,
    excludeSpaces
  );
}

function characterLimitInputChangeHandler(event) {
  const characterLimitValue = document.getElementById("character-limit-value");
  if (event.target.checked) {
    characterLimitValue.style.display = "inline-block";
  } else {
    characterLimitValue.style.display = "none";
  }
}

function inputAreaChangeHandler(event) {
  totalCharactersInput = document.getElementById("total-characters");
  wordCountInput = document.getElementById("word-count");
  sentenceCountInput = document.getElementById("sentence-count");
  readingTimeValue = document.getElementById("reading-time-value");
  limitReachedErrorElement = document.getElementById("limit-reached-error");

  currentText = event.target.value;

  const totalCharacters = calculateTotalCharacters(currentText, excludeSpaces);
  totalCharactersInput.textContent = padWith(totalCharacters.toString(), 2);
  wordCountInput.textContent = padWith(
    calculateTotalWords(currentText).toString(),
    2
  );
  sentenceCountInput.textContent = padWith(
    calculateTotalSentences(currentText).toString(),
    2
  );
  readingTimeValue.textContent = `<${calculateReadingTime(currentText)}`;

  if (characterLimit > 0 && totalCharacters > characterLimit) {
    const errorWordCount = document.getElementById("error-word-count");
    errorWordCount.textContent = characterLimit;
    limitReachedErrorElement.style.display = "block";
  } else {
    limitReachedErrorElement.style.display = "none";
  }

  handleLetterDensityView(currentText);
}

function initializeEventHandlers() {
  document
    .getElementById("theme-switcher")
    .addEventListener("click", themeSwitcherClickHandler);
  document
    .getElementById("input-area-section")
    .addEventListener("input", inputAreaChangeHandler);
  document
    .getElementById("exclude-spaces")
    .addEventListener("change", excludeSpacesChangeHandler);
  document
    .getElementById("set-character-limit")
    .addEventListener("change", characterLimitInputChangeHandler);
  document
    .getElementById("character-limit-value")
    .addEventListener("input", (event) => {
      characterLimit = event.target.value;
    });
}
