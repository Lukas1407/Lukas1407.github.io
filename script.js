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
  // Neues Element: Countdown-Dauer (in Minuten)
  const countdownInput = document.getElementById("countdownTime");

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
  let roles = []; // Array zur Speicherung von "agent" oder "spy"
  let currentPlayerIndex = 0;
  // Mögliche Phasen: "waiting", "reveal", "countdown", "finished"
  let phase = "waiting"; 

  // Countdown-Variablen
  let countdownIntervalId = null;
  let countdownEndTime = 0;

  // Alarmton laden – stelle sicher, dass alarm.mp3 existiert
  const alarmSound = new Audio("alarm.mp3");

  // Wake Lock: verhindert, dass das Gerät in den Standby geht (sofern unterstützt)
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          console.log('Wake Lock freigegeben.');
        });
        console.log('Wake Lock erworben.');
      }
    } catch (err) {
      console.error(`Wake Lock konnte nicht erworben werden: ${err}`);
    }
  }
  function releaseWakeLock() {
    if (wakeLock !== null) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }
  }

  // Lade gespeicherte eigene Wörter aus localStorage (falls vorhanden)
  const savedCustomWords = localStorage.getItem("customWordsList");
  if (savedCustomWords !== null) {
    customWordsArea.value = savedCustomWords;
  }

  // Wechsel von der Titelseite zum Konfigurationsbildschirm
  startButton.addEventListener("click", () => {
    titleScreen.classList.add("hidden");
    configScreen.classList.remove("hidden");
  });

  // Behandlung der Formularübermittlung
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
      // Sammle alle ausgewählten Themen-Checkboxen
      const topicCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
      if (topicCheckboxes.length === 0) {
        errorMessage.textContent = "Bitte wähle mindestens ein Thema aus.";
        return;
      }
      // Kombiniere Wörter aus allen ausgewählten vordefinierten Themen
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
      // Eigene Wörter in localStorage speichern
      localStorage.setItem("customWordsList", customWordsArea.value);
    }

    // Wähle ein zufälliges Geheimwort aus der Wortliste
    secretWord = wordList[Math.floor(Math.random() * wordList.length)];

    // Generiere Rollen und mische das Array
    roles = generateRoles(totalPlayers, numberOfSpies);
    currentPlayerIndex = 0;
    phase = "waiting";

    // Wechsel vom Konfigurations- zum Spielbildschirm
    configScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    showWaitingState();
  });

  // Bei Klick auf den Spielbildschirm fortfahren
  gameScreen.addEventListener("click", () => {
    if (phase === "waiting") {
      revealRole();
    } else if (phase === "reveal") {
      currentPlayerIndex++;
      if (currentPlayerIndex < totalPlayers) {
        showWaitingState();
      } else {
        // Nachdem alle Spieler ihre Rolle gesehen haben: Starte den Countdown
        startCountdown();
      }
    } else if (phase === "countdown") {
      // Während des Countdowns werden Klicks ignoriert.
    } else if (phase === "finished") {
      // In der Endphase passiert nichts; der Neustart erfolgt über andere Mechanismen.
    }
  });

  // Generiere ein gemischtes Rollen-Array
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

  // Zeige den Wartezustand für den aktuellen Spieler an
  function showWaitingState() {
    phase = "waiting";
    roleDisplay.innerHTML = `
      <div style="font-size: 2rem;">Spieler ${currentPlayerIndex + 1}</div>
      <div style="margin-top: 1rem; font-size: 1.5rem;">Tippe irgendwo, um deine Rolle zu sehen</div>
    `;
  }

  // Zeige die Rolle des aktuellen Spielers an
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

  // Starte den Countdown, nachdem alle Spieler ihre Rolle erhalten haben
  async function startCountdown() {
    phase = "countdown";
    // Hole die Countdown-Dauer aus dem Eingabefeld (in Minuten; Standard = 10)
    let countdownMinutes = parseInt(countdownInput.value) || 10;
    const countdownDuration = countdownMinutes * 60 * 1000; // in Millisekunden
  
    // Setze das Countdown-Ende basierend auf der Systemuhr
    countdownEndTime = Date.now() + countdownDuration;
    
    // Versuche, einen Wake Lock zu erhalten, damit das Gerät nicht in den Standby geht
    await requestWakeLock();
    
    // Starte das Intervall zur Aktualisierung des Countdowns (jede Sekunde)
    countdownIntervalId = setInterval(updateCountdown, 1000);
    updateCountdown(); // Sofort aktualisieren
  }
  
  // Aktualisiere den Countdown
  function updateCountdown() {
    const remaining = countdownEndTime - Date.now();
    if (remaining > 0) {
      const minutes = Math.floor(remaining / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      roleDisplay.innerHTML = `
        <div style="font-size: 2rem;">Countdown</div>
        <div style="margin-top: 1rem; font-size: 1.8rem;">${minutes}m ${seconds}s</div>
        <div style="margin-top: 1rem; font-size: 1rem;">Spione gewinnen, wenn der Countdown abläuft!</div>
        <button id="agentsWinButton" style="margin-top: 1rem; padding: 0.5rem 1rem;">Agenten gewinnen</button>
      `;
      document.getElementById("agentsWinButton").addEventListener("click", agentsWin);
    } else {
      clearInterval(countdownIntervalId);
      roleDisplay.innerHTML = `
        <div style="font-size: 2rem;">Zeit abgelaufen!</div>
        <div style="margin-top: 1rem; font-size: 1.8rem;">Spione gewinnen!</div>
      `;
      alarmSound.play().catch((err) => console.error("Fehler beim Abspielen des Alarms:", err));
      releaseWakeLock();
      phase = "finished";
    }
  }
  
  // Funktion für den Fall, dass Agenten gewinnen (wenn auf den Button geklickt wird)
  function agentsWin() {
    clearInterval(countdownIntervalId);
    releaseWakeLock();
    // Statt einen separaten Endbildschirm anzuzeigen, wird die Seite sofort neu geladen
    location.reload();
  }
  
  // Schalte das Einstellungen-Modal um, wenn das Einstellungen-Symbol geklickt wird
  settingsIcon.addEventListener("click", () => {
    settingsMenu.classList.toggle("hidden");
  });
  
  // Umschalten zwischen vordefinierten und eigenen Wörtern
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
