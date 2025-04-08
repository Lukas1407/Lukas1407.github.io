document.addEventListener("DOMContentLoaded", () => {
    // Screen Elements
    const titleScreen = document.getElementById("titleScreen");
    const startButton = document.getElementById("startButton");
    const configScreen = document.getElementById("configScreen");
    const configForm = document.getElementById("configForm");
    const errorMessage = document.getElementById("errorMessage");
    const gameScreen = document.getElementById("gameScreen");
    const roleDisplay = document.getElementById("roleDisplay");
    const settingsMenu = document.getElementById("settingsMenu");
    const settingsIcon = document.getElementById("settingsIcon");
  
    // Settings Modal Elements
    const predefinedRadio = document.getElementById("predefinedRadio");
    const customRadio = document.getElementById("customRadio");
    const predefinedSection = document.getElementById("predefinedSection");
    const customSection = document.getElementById("customSection");
    const customWordsArea = document.getElementById("customWords");
  
    // Predefined word lists
    const predefinedWordLists = {
        orte: ["Schule", "Krankenhaus", "Flughafen", "Bahnhof", "Supermarkt", "Zoo", "Museum", "Restaurant", "Strand", "Bibliothek"],
        tiere: ["Hund", "Katze", "Vogel", "Fisch", "Kuh", "Schwein", "Pferd", "Schaf", "Huhn", "Maus"],
        berufe: ["Arzt", "Lehrer", "Bäcker", "Polizist", "Feuerwehrmann", "Mechaniker", "Koch", "Verkäufer", "Gärtner", "Friseur"],
        essen: ["Brot", "Milch", "Käse", "Apfel", "Reis", "Nudeln", "Fleisch", "Wurst", "Ei", "Kartoffel"],
        farben: ["Rot", "Blau", "Grün", "Gelb", "Schwarz", "Weiß", "Orange", "Lila", "Braun", "Grau"],
        körperteile: ["Hand", "Fuß", "Kopf", "Arm", "Bein", "Auge", "Ohr", "Nase", "Mund", "Rücken"],
        kleidung: ["Hose", "Hemd", "Jacke", "Schuhe", "Mütze", "Kleid", "Pullover", "Rock", "T-Shirt", "Schal"],
        möbel: ["Stuhl", "Tisch", "Bett", "Schrank", "Sofa", "Lampe", "Regal", "Spiegel", "Teppich", "Kommode"],
        wetter: ["Regen", "Sonne", "Wind", "Schnee", "Sturm", "Nebel", "Hitze", "Kälte", "Donner", "Blitz"],
        verkehrsmittel: ["Auto", "Fahrrad", "Bus", "Zug", "Flugzeug", "Schiff", "Straßenbahn", "Motorrad", "Taxi", "Roller"]  
    };
  
    // Game Variables
    let totalPlayers = 0;
    let numberOfSpies = 0;
    let secretWord = "";
    let roles = []; // Array to store "agent" or "spy"
    let currentPlayerIndex = 0;
    let phase = "waiting"; // Phases: "waiting", "reveal", "finished"
  
    // Transition from Title Screen to Config Screen
    startButton.addEventListener("click", () => {
      titleScreen.classList.add("hidden");
      configScreen.classList.remove("hidden");
    });
  
    // Handle configuration form submission to start the game
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      errorMessage.textContent = "";
  
      totalPlayers = parseInt(document.getElementById("totalPlayers").value);
      numberOfSpies = parseInt(document.getElementById("numberOfSpies").value);
  
      if (numberOfSpies >= totalPlayers) {
        errorMessage.textContent = "Number of spies must be less than total players.";
        return;
      }
  
      // Build the word list based on settings
      let wordList = [];
      if (predefinedRadio.checked) {
        // Collect all checked topics
        const topicCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
        if (topicCheckboxes.length === 0) {
          errorMessage.textContent = "Please select at least one topic.";
          return;
        }
        // Combine words from all selected predefined topics
        topicCheckboxes.forEach(chk => {
          const topic = chk.value;
          wordList = wordList.concat(predefinedWordLists[topic]);
        });
      } else if (customRadio.checked) {
        let customWords = customWordsArea.value.split(",")
          .map(word => word.trim())
          .filter(word => word);
        if (customWords.length === 0) {
          errorMessage.textContent = "Please enter at least one custom word.";
          return;
        }
        wordList = customWords;
      }
  
      // Randomly select a secret word from the chosen list
      secretWord = wordList[Math.floor(Math.random() * wordList.length)];
  
      // Generate roles and shuffle the array
      roles = generateRoles(totalPlayers, numberOfSpies);
      currentPlayerIndex = 0;
      phase = "waiting";
  
      // Switch screens: hide config, show game screen
      configScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      showWaitingState();
    });
  
    // The entire game screen is clickable to advance the game
    gameScreen.addEventListener("click", () => {
      if (phase === "waiting") {
        revealRole();
      } else if (phase === "reveal") {
        currentPlayerIndex++;
        if (currentPlayerIndex < totalPlayers) {
          showWaitingState();
        } else {
          phase = "finished";
          roleDisplay.textContent = "All players have seen their roles. Enjoy your game!";
        }
      } else if (phase === "finished") {
        location.reload();
      }
    });
  
    // Generate a shuffled roles array
    function generateRoles(total, spies) {
      let arr = [];
      for (let i = 0; i < spies; i++) {
        arr.push("spy");
      }
      for (let i = spies; i < total; i++) {
        arr.push("agent");
      }
      return shuffleArray(arr);
    }
  
    // Fisher-Yates shuffle
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    // Show waiting state for the current player's turn
    function showWaitingState() {
      phase = "waiting";
      roleDisplay.innerHTML = `
        <div style="font-size: 2rem;">Player ${currentPlayerIndex + 1}</div>
        <div style="margin-top: 1rem; font-size: 1.5rem;">Tap anywhere to see your role</div>
      `;
    }
  
    // Reveal the current player's role
    function revealRole() {
      phase = "reveal";
      const role = roles[currentPlayerIndex];
      if (role === "agent") {
        roleDisplay.innerHTML = `
          <div style="font-size: 2.5rem;">Agent</div>
          <div style="margin-top: 1rem; font-size: 1.8rem;">Secret Word: ${secretWord}</div>
          <div style="margin-top: 1rem; font-size: 1rem;">Tap anywhere for next player</div>
        `;
      } else {
        roleDisplay.innerHTML = `
          <div style="font-size: 2.5rem;">Spy</div>
          <div style="margin-top: 1rem; font-size: 1.8rem;">(No word)</div>
          <div style="margin-top: 1rem; font-size: 1rem;">Tap anywhere for next player</div>
        `;
      }
    }
  
    // Toggle the settings modal when the settings icon is clicked
    settingsIcon.addEventListener("click", () => {
      settingsMenu.classList.toggle("hidden");
    });
  
    // Toggle between predefined and custom word sections
    predefinedRadio.addEventListener("change", () => {
      if (predefinedRadio.checked) {
        predefinedSection.classList.remove("hidden");
        customSection.classList.add("hidden");
      }
    });
  
    customRadio.addEventListener("change", () => {
      if (customRadio.checked) {
        customSection.classList.remove("hidden");
        predefinedSection.classList.add("hidden");
      }
    });
  });
  