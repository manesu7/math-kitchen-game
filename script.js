// Game State Parameters
let players = [];
let currentPlayerIdx = 0;
let numPlayers = 2;
const winningScore = 300;
let currentCorrectAnswer = "";

// Timer State Variable Control
let timerInterval = null;
const maxTime = 20; // Seconds per turn
let timeLeft = maxTime;
let canAnswer = true;

// Cooking Challenge Database
const pool = [
    {
        title: " Chocolate Chip Cookies",
        base: "Recipe serves 4 people. Uses Cups.",
        challenge: "The original recipe requires <b>1/2 cup</b> of butter for 4 people. You need to feed <b>8 people</b>. How much butter do you need?",
        options: ["1 cup", "1/4 cup", "3/4 cup", "1.5 cups"],
        correct: "1 cup"
    },
    {
        title: " Maple Pancakes",
        base: "Recipe uses Fluid Ounces (fl oz). Local target metric: Milliliters (ml). Rule: 1 fl oz = 30 ml.",
        challenge: "The topping needs <b>3 fl oz</b> of maple syrup. Convert this into local milliliters (ml).",
        options: ["90 ml", "60 ml", "120 ml", "30 ml"],
        correct: "90 ml"
    },
    {
        title: " Italian Pizza Dough",
        base: "Original recipe requires 500 grams of flour to make 2 large pizzas.",
        challenge: "A table orders enough for <b>6 large pizzas</b>. How much flour do you need to calculate?",
        options: ["1500 grams", "1000 grams", "2000 grams", "750 grams"],
        correct: "1500 grams"
    },
    {
        title: " British Velvet Cupcakes",
        base: "Recipe measurement: Ounces (oz). Local target metric: Grams (g). Rule: 1 oz = 28 grams.",
        challenge: "The recipe asks for <b>4 oz</b> of caster sugar. What is that metric weight in grams?",
        options: ["112 grams", "100 grams", "84 grams", "140 grams"],
        correct: "112 grams"
    },
    {
        title: " Mexican Street Tacos",
        base: "Original seasoning scales at 1/4 teaspoon of chili powder per person.",
        challenge: "You are cooking a giant batch for a birthday table of <b>12 kids</b>. How many teaspoons of chili powder is that?",
        options: ["3 teaspoons", "4 teaspoons", "2 teaspoons", "6 teaspoons"],
        correct: "3 teaspoons"
    },
    {
        title: " French Crème Brûlée",
        base: "Recipe calls for 1 cup of heavy cream = 240 milliliters (ml).",
        challenge: "The mini serving variant requires scaling down to exactly <b>1/4 cup</b> of cream. How many ml is that?",
        options: ["60 ml", "120 ml", "80 ml", "40 ml"],
        correct: "60 ml"
    }
];

let activeChallenges = [];

function startGame() {
    numPlayers = parseInt(document.getElementById('player-count').value);
    players = [];
    for(let i = 1; i <= numPlayers; i++) {
        players.push({ id: i, name: "Chef " + i, score: 0 });
    }

    currentPlayerIdx = 0;
    activeChallenges = [...pool];

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    buildScoreboard();
    nextTurn();
}

function buildScoreboard() {
    const board = document.getElementById('scoreboard');
    board.innerHTML = "";
    players.forEach((p, idx) => {
        board.innerHTML += `
            <div class="player-card" id="p-card-${idx}">
                <h3>${p.name}</h3>
                <p class="player-score">${p.score} pts</p>
            </div>
        `;
    });
}

function updateScoreboardHighlights() {
    players.forEach((p, idx) => {
        const card = document.getElementById(`p-card-${idx}`);
        if(idx === currentPlayerIdx) {
            card.classList.add('active-turn');
        } else {
            card.classList.remove('active-turn');
        }
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = maxTime;
    canAnswer = true;

    const timerText = document.getElementById('timer-text');
    const timerBar = document.getElementById('timer-bar');

    timerText.innerText = timeLeft;
    timerBar.style.width = "100%";
    timerBar.style.backgroundColor = "var(--secondary)";

    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.innerText = timeLeft;

        let percentage = (timeLeft / maxTime) * 100;
        timerBar.style.width = percentage + "%";

        if(timeLeft <= 5) {
            timerBar.style.backgroundColor = "var(--primary)";
        } else if(timeLeft <= 10) {
            timerBar.style.backgroundColor = "var(--warning)";
        }

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOutLoss();
        }
    }, 1000);
}

function nextTurn() {
    document.getElementById('feedback').innerText = "";

    let champion = players.find(p => p.score >= winningScore);
    if (champion || activeChallenges.length === 0) {
        endGame();
        return;
    }

    updateScoreboardHighlights();
    document.getElementById('turn-announcement').innerText = `👉 ${players[currentPlayerIdx].name}'s Turn:`;

    let randIndex = Math.floor(Math.random() * activeChallenges.length);
    let currentItem = activeChallenges[randIndex];

    activeChallenges.splice(randIndex, 1);
    if(activeChallenges.length === 0) activeChallenges = [...pool];

    document.getElementById('recipe-title').innerHTML = currentItem.title;
    document.getElementById('recipe-info').innerHTML = `<b>Origin standard:</b> ${currentItem.base}`;
    document.getElementById('math-challenge').innerHTML = currentItem.challenge;

    currentCorrectAnswer = currentItem.correct;

    const optionsBox = document.getElementById('options');
    optionsBox.innerHTML = "";
    currentItem.options.forEach(opt => {
        optionsBox.innerHTML += `<button class="option-btn" onclick="checkAnswer('${opt}')">${opt}</button>`;
    });

    startTimer();
}

function checkAnswer(chosen) {
    if (!canAnswer) return;
    canAnswer = false;
    clearInterval(timerInterval);

    disableOptionButtons();
    const feedback = document.getElementById('feedback');

    if (chosen === currentCorrectAnswer) {
        feedback.style.color = "var(--secondary)";
        feedback.innerText = "🎉 Perfect Conversion! +100 pts";
        players[currentPlayerIdx].score += 100;
    } else {
        feedback.style.color = "var(--primary)";
        feedback.innerText = `❌ Burnt dish! Correct was: ${currentCorrectAnswer}`;
    }

    buildScoreboard();
    triggerNextTurnDelay();
}

function timeOutLoss() {
    canAnswer = false;
    disableOptionButtons();

    const feedback = document.getElementById('feedback');
    feedback.style.color = "var(--primary)";
    feedback.innerText = `⏳ Time's up! The dish burned into charcoal! 💨`;

    triggerNextTurnDelay();
}

function disableOptionButtons() {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
}

function triggerNextTurnDelay() {
    setTimeout(() => {
        currentPlayerIdx = (currentPlayerIdx + 1) % numPlayers;
        nextTurn();
    }, 2500);
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('winner-screen').classList.add('active');

    let winner = players.reduce((max, p) => p.score > max.score ? p : max, players);
    document.getElementById('winner-text').innerText = `${winner.name} won the game with ${winner.score} points! 🌟👨‍🍳`;
}

function resetGame() {
    document.getElementById('winner-screen').classList.remove('active');
    document.getElementById('setup-screen').classList.add('active');
}
