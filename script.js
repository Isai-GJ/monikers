// Variables de estado del juego
let allWords = [];
let gameDeck = [];
let guessedCardsThisRound = [];
let passedCardsThisTurn = [];
let currentCard = null;

let teams = [];
let currentTeamIndex = 0;
let currentRound = 1;

let timer;
let timeLeft;
let isTurnEnding = false;
let turnDuration = 60; // 1 minuto por defecto

// Elementos del DOM
const screens = {
    mainMenu: document.getElementById('main-menu'),
    teamSetup: document.getElementById('team-setup'),
    deckSetup: document.getElementById('deck-setup'),
    readyScreen: document.getElementById('ready-screen'),
    gameScreen: document.getElementById('game-screen'),
    roundEndScreen: document.getElementById('round-end-screen'),
};

const cardElements = {
    category: document.getElementById('card-category'),
    phrase: document.getElementById('card-phrase'),
    origin: document.getElementById('card-origin'),
};

const timerDisplay = document.getElementById('timer');

// --- SONIDOS ---
const sounds = {
    start: new Audio('sounds/start.wav'),
    tick: new Audio('sounds/clock-tick.mp3'),
    guessed: new Audio('sounds/guessed.wav'),
    passed: new Audio('sounds/passed.mp3'),
    endTurn: new Audio('sounds/boxing-bell.mp3'),
    victory: new Audio('sounds/victory.mp3'),
    click: new Audio('sounds/click.mp3')
};

// --- INICIALIZACIÓN Y CONFIGURACIÓN ---

window.onload = async () => {
    await loadWords();
    setupEventListeners();
};

async function loadWords() {
    try {
        const response = await fetch('words.txt');
        const text = await response.text();
        const lines = text.split('\n');
        let currentCategory = '';
        allWords = [];

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            if (line.startsWith('**') && line.endsWith('**')) {
                // Extrae el nombre de la categoría, quitando los asteriscos y el número inicial.
                // Ej: "**1. Personajes (Fantasía)**" -> "Personajes (Fantasía)"
                currentCategory = line.replace(/\*\*/g, '').replace(/^\d+\.\s*/, '').trim();
            } else {
                const parts = line.match(/^(.*?)\s\((.*)\)$/);
                if (parts) {
                    allWords.push({
                        phrase: parts[1].trim(),
                        origin: parts[2].trim(),
                        category: currentCategory || 'General'
                    });
                }
            }
        }
        console.log(`Cargadas ${allWords.length} palabras.`);
    } catch (error) {
        console.error("No se pudo cargar el archivo words.txt:", error);
        alert("Error al cargar las palabras. Asegúrate de que el archivo words.txt está en el mismo directorio.");
    }
}

function setupEventListeners() {
    document.getElementById('start-game-btn').addEventListener('click', () => {
        playSound('click');
        showScreen('teamSetup');
    });

    document.getElementById('to-deck-setup-btn').addEventListener('click', () => {
        const teamInputs = document.querySelectorAll('#team-inputs input');
        playSound('click');
        teams = Array.from(teamInputs).map((input, index) => ({
            name: input.value || `Equipo ${index + 1}`,
            score: 0
        })).filter(team => team.name.trim() !== '');

        if (teams.length < 2) {
            alert("Se necesitan dos equipos para jugar.");
            return;
        }
        showScreen('deckSetup');
    });

    document.getElementById('create-deck-btn').addEventListener('click', createDeckAndStart);
    document.getElementById('start-turn-btn').addEventListener('click', startTurn);
    document.getElementById('pass-btn').addEventListener('click', passCard);
    document.getElementById('guessed-btn').addEventListener('click', guessedCard);
    document.getElementById('next-round-btn').addEventListener('click', setupNextRound);
}

function createDeckAndStart() {
    playSound('click');
    const deckSize = parseInt(document.getElementById('deck-size-input').value);
    if (isNaN(deckSize) || deckSize < 1 || deckSize > 100) {
        alert("Por favor, introduce un número entre 1 y 100.");
        return;
    }

    // Crear mazo al azar
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    gameDeck = shuffled.slice(0, deckSize);
    
    // Elegir equipo inicial al azar
    currentTeamIndex = Math.floor(Math.random() * teams.length);

    setupNewRound();
}

// --- LÓGICA DE RONDAS Y TURNOS ---

function setupNewRound() {
    document.getElementById('round-title').innerText = `Ronda ${currentRound}`;
    // Para la ronda 1, el mazo es el que se acaba de crear. Para las siguientes, se reutilizan las cartas.
    if (currentRound > 1) {
        gameDeck = [...guessedCardsThisRound];
    }
    guessedCardsThisRound = [];
    showReadyScreen();
}

function showReadyScreen() {
    updateReadyScreen();
    setGameButtonsDisabled(false); // Asegurarse de que los botones estén activos para el nuevo turno
    showScreen('readyScreen');
}

function startTurn() {
    playSound('start');
    isTurnEnding = false;
    passedCardsThisTurn = [];
    showScreen('gameScreen');
    updateLiveScores();
    nextCard();
    startTimer();
}

function endTurn() {
    if (isTurnEnding) return; // Prevenir múltiples llamadas
    isTurnEnding = true;
    stopSound('tick'); // Detener el sonido del reloj
    clearInterval(timer);

    // Devolver la carta actual (si existe) y las pasadas al mazo de la ronda
    if (currentCard) {
        gameDeck.push(currentCard);
        currentCard = null; // Limpiar para evitar duplicados
    }
    gameDeck.push(...passedCardsThisTurn);
    console.log(`Fin del turno. Quedan ${gameDeck.length} cartas en el mazo de la ronda.`);

    if (gameDeck.length === 0) {
        endRound();
    } else {
        // Pasar al siguiente equipo
        currentTeamIndex = (currentTeamIndex + 1) % teams.length;
        showReadyScreen();
    }
}

function endRound() {
    currentRound++;
    if (currentRound > 3) {
        showFinalScores();
    } else {
        // Mostrar puntuaciones y preparar la siguiente ronda
        const scoreSummary = document.getElementById('score-summary');
        scoreSummary.innerHTML = '<h3>Puntuaciones</h3>' + teams.map(t => `<p>${t.name}: ${t.score}</p>`).join('');
        document.getElementById('next-round-btn').innerText = `Comenzar Ronda ${currentRound}`;
        showScreen('roundEndScreen');
    }
}

function setupNextRound() {
    playSound('click');
    // La lógica de las reglas ahora está en updateReadyScreen(), llamada por showReadyScreen()
    
    // Reutilizar las cartas adivinadas para la siguiente ronda
    gameDeck = [...guessedCardsThisRound];
    guessedCardsThisRound = [];

    // Pasar al siguiente equipo para que no empiece el mismo que terminó la ronda anterior.
    currentTeamIndex = (currentTeamIndex + 1) % teams.length;
    
    showReadyScreen();
}

function updateReadyScreen() {
    const roundTitleEl = document.getElementById('round-title');
    const roundRulesEl = document.getElementById('round-rules');
    let rulesText = '';

    roundTitleEl.innerText = `Ronda ${currentRound}`;

    switch (currentRound) {
        case 1:
            rulesText = "<b>¡Todo se vale!</b><br>Puedes usar pistas, sonidos y gestos. La única restricción es no decir ninguna palabra de la frase ni deletrearla.";
            break;
        case 2:
            rulesText = "<b>Una sola palabra.</b><br>Solo puedes decir una única palabra como pista. Nada más.";
            break;
        case 3:
            rulesText = "<b>¡Solo mímica!</b><br>No puedes emitir ningún sonido. Describe la carta usando únicamente gestos y actuación.";
            break;
    }
    roundRulesEl.innerHTML = `<p>${rulesText}</p>`;
    document.getElementById('current-team-turn').innerText = `Turno de: ${teams[currentTeamIndex].name}`;
}

function showFinalScores() {
    playSound('victory');
    const winner = teams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    const scoreSummary = document.getElementById('score-summary');
    scoreSummary.innerHTML = `<h2>¡Fin del Juego!</h2>
                              <h3>Ganador: ${winner.name}</h3>
                              <h4>Puntuaciones Finales</h4>` + 
                              teams.map(t => `<p>${t.name}: ${t.score}</p>`).join('');
    document.getElementById('next-round-btn').innerText = "Jugar de Nuevo";
    document.getElementById('next-round-btn').onclick = () => window.location.reload();
    showScreen('roundEndScreen');
}

// --- LÓGICA DEL TEMPORIZADOR ---

function startTimer() {
    timeLeft = turnDuration;
    timerDisplay.innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft > 0) playSound('tick');

        if (timeLeft <= 0) {
            playSound('endTurn');
            endTurn();
        }
    }, 1000);
}

// --- LÓGICA DE LAS CARTAS ---

function nextCard() {
    // Si todavía hay cartas en el mazo principal del turno, saca una al azar.
    if (gameDeck.length > 0) {
        const cardIndex = Math.floor(Math.random() * gameDeck.length);
        currentCard = gameDeck.splice(cardIndex, 1)[0];
    } 
    // Si el mazo principal está vacío pero hay cartas pasadas, saca la primera que se pasó.
    else if (passedCardsThisTurn.length > 0) {
        console.log("Mostrando cartas pasadas en orden.");
        currentCard = passedCardsThisTurn.shift(); // Saca el primer elemento
    } 
    // Si no hay cartas en ningún lado, el turno termina.
    else {
        playSound('endTurn'); // Suena la campana porque se acabaron las cartas
        endTurn();
        return;
    }
    displayCard(currentCard);
}

function setGameButtonsDisabled(disabled) {
    document.getElementById('pass-btn').disabled = disabled;
    document.getElementById('guessed-btn').disabled = disabled;
}

function displayCard(card) {
    // Reemplaza los asteriscos con etiquetas de cursiva y usa innerHTML
    const formatItalics = (text) => text.replace(/\*(.*?)\*/g, '<i>$1</i>');

    cardElements.category.innerHTML = formatItalics(card.category);
    cardElements.phrase.innerHTML = formatItalics(card.phrase);
    cardElements.origin.innerHTML = formatItalics(card.origin);

    setGameButtonsDisabled(false); // Reactivar botones ahora que la nueva carta está lista
}

function passCard() {
    if (isTurnEnding) return;
    setGameButtonsDisabled(true); // Desactivar botones para prevenir rebote
    if (currentCard) {
        passedCardsThisTurn.push(currentCard);
    }
    playSound('passed');
    // Usamos un pequeño timeout para darle al navegador tiempo de procesar el estado 'disabled'
    setTimeout(nextCard, 50);
}

function guessedCard() {
    if (isTurnEnding) return;
    setGameButtonsDisabled(true); // Desactivar botones para prevenir rebote
    if (currentCard) {
        playSound('guessed');
        teams[currentTeamIndex].score++; // Sumar punto
        updateLiveScores(); // Actualizar marcador en pantalla
        guessedCardsThisRound.push(currentCard);
        console.log(`${teams[currentTeamIndex].name} adivinó. Puntuación: ${teams[currentTeamIndex].score}`);
        currentCard = null; // Limpiar la carta actual para que no se procese de nuevo
    }

    // Usamos un pequeño timeout para darle al navegador tiempo de procesar el estado 'disabled'
    setTimeout(nextCard, 50);
}

function updateLiveScores() {
    const liveScoresEl = document.getElementById('live-scores');
    if (!liveScoresEl) return;

    liveScoresEl.innerHTML = teams.map((team, index) =>
        `<div class="live-score-team ${currentTeamIndex === index ? 'active-turn' : ''}">
            <span class="team-name">${team.name}</span>
            <span class="team-score">${team.score}</span>
        </div>`
    ).join('');
}

function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error(`Error al reproducir ${soundName}:`, error));
    }
}

function stopSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}

// --- UTILIDADES ---

function showScreen(screenId) {
    for (const screen in screens) {
        screens[screen].classList.remove('active');
    }
    screens[screenId].classList.add('active');
}

function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}