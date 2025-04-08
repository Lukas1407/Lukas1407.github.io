document.addEventListener("DOMContentLoaded", () => {
    // Bildschirm-Elemente
    const titleScreen = document.getElementById("titleScreen");
    const startButton = document.getElementById("startButton");
    const configScreen = document.getElementById("configScreen");
    const configForm = document.getElementById("configForm");
    const errorMessage = document.getElementById("errorMessage");
    const gameScreen = document.getElementById("gameScreen");
    const roleDisplay = document.getElementById("roleDisplay");
    const settingsMenu = document.getElementById("settingsMenu");
    const settingsIcon = document.getElementById("settingsIcon");
  
    // Elemente des Einstellungen-Modals
    const predefinedRadio = document.getElementById("predefinedRadio");
    const customRadio = document.getElementById("customRadio");
    const predefinedSection = document.getElementById("predefinedSection");
    const customSection = document.getElementById("customSection");
    const customWordsArea = document.getElementById("customWords");
  
    // Vordefinierte Wortlisten
    const predefinedWordLists = {
      orte: ["Schule", "Krankenhaus", "Flughafen", "Bahnhof", "Supermarkt", "Zoo", "Museum", "Restaurant", "Strand", "Bibliothek"],
      tiere: ["Hund", "Katze", "Vogel", "Fisch", "Kuh", "Schwein", "Pferd", "Schaf", "Huhn", "Maus"],
      berufe: ["Arzt", "Lehrer", "Bäcker", "Polizist", "Feuerwehrmann", "Mechaniker", "Koch", "Verkäufer", "Gärtner", "Friseur"],
      farben: ["Rot", "Blau", "Grün", "Gelb", "Schwarz", "Weiß", "Orange", "Lila", "Braun", "Grau"],
      körperteile: ["Hand", "Fuß", "Kopf", "Arm", "Bein", "Auge", "Ohr", "Nase", "Mund", "Rücken"],
      kleidung: ["Hose", "Hemd", "Jacke", "Schuhe", "Mütze", "Kleid", "Pullover", "Rock", "T-Shirt", "Schal"],
      möbel: ["Stuhl", "Tisch", "Bett", "Schrank", "Sofa", "Lampe", "Regal", "Spiegel", "Teppich", "Kommode"],
      wetter: ["Regen", "Sonne", "Wind", "Schnee", "Sturm", "Nebel", "Hitze", "Kälte", "Donner", "Blitz"],
      verkehrsmittel: ["Auto", "Fahrrad", "Bus", "Zug", "Flugzeug", "Schiff", "Straßenbahn", "Motorrad", "Taxi", "Roller"]
    };
  
    // Spielvariablen
    let totalPlayers = 0;
    let numberOfSpies = 0;
    let secretWord = "";
    let roles = []; // Array zum Speichern von "agent" oder "spy"
    let currentPlayerIndex = 0;
    let phase = "waiting"; // Mögliche Phasen: "waiting", "reveal", "finished"
  
    // Eigene Wörter aus localStorage laden (falls vorhanden)
    const savedCustomWords = localStorage.getItem("customWordsList");
    if (savedCustomWords !== null) {
      customWordsArea.value = savedCustomWords;
    }
  
    // Wechsel vom Titelseite zum Konfigurationsbildschirm
    startButton.addEventListener("click", () => {
      titleScreen.classList.add("hidden");
      configScreen.classList.remove("hidden");
    });
  
    // Behandlung der Formularübermittlung des Konfigurationsbildschirms zum Spielstart
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      errorMessage.textContent = "";
  
      totalPlayers = parseInt(document.getElementById("totalPlayers").value);
      numberOfSpies = parseInt(document.getElementById("numberOfSpies").value);
  
      if (numberOfSpies >= totalPlayers) {
        errorMessage.textContent = "Die Anzahl der Spione muss kleiner sein als die Gesamtzahl der Spieler.";
        return;
      }
  
      // Erstelle die Wortliste basierend auf den Einstellungen
      let wordList = [];
      if (predefinedRadio.checked) {
        // Alle ausgewählten Themen-Checkboxen sammeln
        const topicCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
        if (topicCheckboxes.length === 0) {
          errorMessage.textContent = "Bitte wähle mindestens ein Thema aus.";
          return;
        }
        // Wörter aus allen ausgewählten vordefinierten Themen kombinieren
        topicCheckboxes.forEach(chk => {
          const topic = chk.value;
          wordList = wordList.concat(predefinedWordLists[topic]);
        });
      } else if (customRadio.checked) {
        let customWords = customWordsArea.value.split(",")
          .map(word => word.trim())
          .filter(word => word);
        if (customWords.length === 0) {
          errorMessage.textContent = "Bitte gib mindestens ein eigenes Wort ein.";
          return;
        }
        wordList = customWords;
        // Eigene Wörter speichern, damit sie in zukünftigen Sitzungen erhalten bleiben
        localStorage.setItem("customWordsList", customWordsArea.value);
      }
  
      // Zufälliges Geheimwort aus der erstellten Wortliste auswählen
      secretWord = wordList[Math.floor(Math.random() * wordList.length)];
  
      // Rollen generieren und das Array mischen
      roles = generateRoles(totalPlayers, numberOfSpies);
      currentPlayerIndex = 0;
      phase = "waiting";
  
      // Bildschirme wechseln: Konfigurationsbildschirm ausblenden, Spielbildschirm anzeigen
      configScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      showWaitingState();
    });
  
    // Der gesamte Spielbildschirm reagiert auf Klick, um das Spiel fortzusetzen
    gameScreen.addEventListener("click", () => {
      if (phase === "waiting") {
        revealRole();
      } else if (phase === "reveal") {
        currentPlayerIndex++;
        if (currentPlayerIndex < totalPlayers) {
          showWaitingState();
        } else {
          phase = "finished";
          roleDisplay.textContent = "Alle Spieler haben ihre Rollen gesehen. Viel Spaß beim Spielen!";
        }
      } else if (phase === "finished") {
        location.reload();
      }
    });
  
    // Funktion zur Generierung eines gemischten Rollenarrays
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
  
    // Fisher-Yates-Mischalgorithmus
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    // Den Wartezustand für den aktuellen Spieler anzeigen
    function showWaitingState() {
      phase = "waiting";
      roleDisplay.innerHTML = `
        <div style="font-size: 2rem;">Spieler ${currentPlayerIndex + 1}</div>
        <div style="margin-top: 1rem; font-size: 1.5rem;">Tippe irgendwo, um deine Rolle zu sehen</div>
      `;
    }
  
    // Die Rolle des aktuellen Spielers anzeigen
    function revealRole() {
      phase = "reveal";
      const role = roles[currentPlayerIndex];
      if (role === "agent") {
        roleDisplay.innerHTML = `
          <div style="font-size: 2.5rem;">Agent</div>
          <div style="margin-top: 1rem; font-size: 1.8rem;">Geheimwort: ${secretWord}</div>
          <div style="margin-top: 1rem; font-size: 1rem;">Tippe irgendwo für den nächsten Spieler</div>
        `;
      } else {
        roleDisplay.innerHTML = `
          <div style="font-size: 2.5rem;">Spion</div>
          <div style="margin-top: 1rem; font-size: 1.8rem;">(Kein Wort)</div>
          <div style="margin-top: 1rem; font-size: 1rem;">Tippe irgendwo für den nächsten Spieler</div>
        `;
      }
    }
  
    // Schaltet das Einstellungen-Modal um, wenn auf das Einstellungen-Symbol geklickt wird
    settingsIcon.addEventListener("click", () => {
      settingsMenu.classList.toggle("hidden");
    });
  
    // Umschalten zwischen den Abschnitten für vordefinierte Wörter und eigene Wörter
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
  