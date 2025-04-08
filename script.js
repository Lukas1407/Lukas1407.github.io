document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const configForm = document.getElementById("configForm");
    const gameConfig = document.getElementById("gameConfig");
    const gameArea = document.getElementById("gameArea");
    const instructionsDiv = document.getElementById("instructions");
    const actionButton = document.getElementById("actionButton");
    const errorMessage = document.getElementById("errorMessage");
    
    const toggleSettingsBtn = document.getElementById("toggleSettings");
    const settingsMenu = document.getElementById("settingsMenu");
    const predefinedRadio = document.getElementById("predefinedRadio");
    const customRadio = document.getElementById("customRadio");
    const predefinedSection = document.getElementById("predefinedSection");
    const customSection = document.getElementById("customSection");
    const predefinedListSelect = document.getElementById("predefinedList");
    const customWordsArea = document.getElementById("customWords");
  
    // Game Variables
    let totalPlayers = 0;
    let numberOfSpies = 0;
    let secretWord = "";
    let roles = []; // Array for each player's role ("agent" or "spy")
    let currentPlayerIndex = 0;
    let phase = "waiting"; // Phases: "waiting", "reveal", "finished"
  
    // Predefined word lists.
    const predefinedWordLists = {
      default: ["ocean", "forest", "galaxy", "castle", "spaghetti", "candle", "robot", "pirate", "moon", "dragon"],
      locations: ["Paris", "New York", "Tokyo", "London", "Dubai", "Rome", "Barcelona", "Sydney", "Cairo", "Amsterdam"],
      funny: ["unicorn", "penguin", "ninja", "potato", "giraffe", "zombie", "monster", "dinosaur", "robot", "alien"]
    };
  
    // Toggle settings menu when the button is pressed.
    toggleSettingsBtn.addEventListener("click", () => {
      settingsMenu.classList.toggle("hidden");
    });
  
    // Show/hide custom section based on the selected radio button.
    predefinedRadio.addEventListener("change", function () {
      if (this.checked) {
        predefinedSection.classList.remove("hidden");
        customSection.classList.add("hidden");
      }
    });
  
    customRadio.addEventListener("change", function () {
      if (this.checked) {
        customSection.classList.remove("hidden");
        predefinedSection.classList.add("hidden");
      }
    });
  
    // Handle game configuration form submission.
    configForm.addEventListener("submit", function (e) {
      e.preventDefault();
      errorMessage.textContent = "";
  
      totalPlayers = parseInt(document.getElementById("totalPlayers").value);
      numberOfSpies = parseInt(document.getElementById("numberOfSpies").value);
  
      if (numberOfSpies >= totalPlayers) {
        errorMessage.textContent = "Number of spies must be less than total players.";
        return;
      }
  
      // Determine the word list based on settings.
      let wordList = [];
      if (predefinedRadio.checked) {
        const topic = predefinedListSelect.value;
        wordList = predefinedWordLists[topic];
      } else if (customRadio.checked) {
        // Parse comma-separated custom words.
        let customWords = customWordsArea.value.split(",").map(word => word.trim()).filter(word => word);
        if (customWords.length === 0) {
          errorMessage.textContent = "Please enter at least one custom word.";
          return;
        }
        wordList = customWords;
      }
  
      // Randomly select a secret word from the chosen word list.
      secretWord = wordList[Math.floor(Math.random() * wordList.length)];
  
      // Generate a shuffled roles array.
      roles = generateRoles(totalPlayers, numberOfSpies);
      currentPlayerIndex = 0;
  
      // Hide configuration and settings menu, then show the game area.
      gameConfig.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      gameArea.classList.remove("hidden");
  
      setWaitingState();
    });
  
    // Button click handler based on phase.
    actionButton.addEventListener("click", function () {
      if (phase === "waiting") {
        revealRole();
      } else if (phase === "reveal") {
        currentPlayerIndex++;
        if (currentPlayerIndex < totalPlayers) {
          setWaitingState();
        } else {
          setFinishedState();
        }
      } else if (phase === "finished") {
        location.reload();
      }
    });
  
    // Generate and shuffle roles.
    function generateRoles(total, spies) {
      let rolesArray = [];
      for (let i = 0; i < spies; i++) {
        rolesArray.push("spy");
      }
      for (let i = spies; i < total; i++) {
        rolesArray.push("agent");
      }
      return shuffleArray(rolesArray);
    }
  
    // Fisher-Yates shuffle algorithm.
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    // Prepare waiting state for a player's turn.
    function setWaitingState() {
      phase = "waiting";
      instructionsDiv.textContent = `Player ${currentPlayerIndex + 1}, when you're ready, tap the button to see your role.`;
      actionButton.textContent = "Show Role";
    }
  
    // Reveal the current player's role.
    function revealRole() {
      phase = "reveal";
      const role = roles[currentPlayerIndex];
      if (role === "agent") {
        instructionsDiv.innerHTML = `<strong>Your role:</strong> Agent<br><br><strong>Secret Word:</strong> ${secretWord}`;
      } else {
        instructionsDiv.innerHTML = `<strong>Your role:</strong> Spy`;
      }
      actionButton.textContent = "Next Player";
    }
  
    // Final state once all players have seen their roles.
    function setFinishedState() {
      phase = "finished";
      instructionsDiv.textContent = "All players have seen their roles. Enjoy your game!";
      actionButton.textContent = "Restart Game";
    }
  });
  