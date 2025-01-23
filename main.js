let currentRGB;
let score = 0;
let gridSize = 4;
let level = 1;
let consecutiveCorrect = 0;
let health = 3;
let isGameOver = false;
let highScore = localStorage.getItem('colorSenseHighScore') || 0;
let isMuted = localStorage.getItem('colorSenseMuted') === 'true' || false;

const sounds = {
    correct: new Audio('sounds/correct.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    levelUp: new Audio('sounds/levelup.mp3'),
    gameOver: new Audio('sounds/gameover.mp3')
};

function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function setDifficulty(size) {
    document.querySelectorAll('.difficulty button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    gridSize = size;
    resetGame();
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDelay = Math.random() * 3 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function playSound(soundName) {
    if (!isMuted && sounds[soundName]) {
        sounds[soundName].play();
    }
}

function toggleSound() {
    isMuted = !isMuted;
    localStorage.setItem('colorSenseMuted', isMuted);
    document.getElementById('soundToggle').textContent = isMuted ? '🔇' : '🔊';
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('colorSenseHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

function updateProgress() {
    const progress = document.getElementById('progress');
    const progressWidth = (consecutiveCorrect / 5) * 100;
    progress.style.width = progressWidth + '%';
    
    if (consecutiveCorrect >= 5) {
        playSound('levelUp');
        level++;
        consecutiveCorrect = 0;
        document.getElementById('levelBadge').textContent = `Level ${level}`;
        createConfetti();
        progress.style.width = '0%';
        health = Math.min(health + 1, 5);
        updateHealth();
    }
}

function updateHealth() {
    const healthContainer = document.getElementById('health');
    healthContainer.innerHTML = '❤️'.repeat(health);
}

function gameOver() {
    isGameOver = true;
    document.getElementById('gameOver').style.display = 'flex';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    playSound('gameOver');
}

function resetGame() {
    score = 0;
    level = 1;
    consecutiveCorrect = 0;
    health = 3;
    isGameOver = false;
    document.getElementById('score').textContent = '0';
    document.getElementById('levelBadge').textContent = 'Level 1';
    document.getElementById('progress').style.width = '0%';
    document.getElementById('gameOver').style.display = 'none';
    updateHealth();
    startGame();
}

function startGame() {
    if (isGameOver) return;
    
    const colorGrid = document.getElementById('colorGrid');
    const rgbCode = document.getElementById('rgbCode');
    
    colorGrid.setAttribute('data-size', gridSize);
    
    colorGrid.style.gridTemplateColumns = '';
    
    colorGrid.innerHTML = '';
    
    currentRGB = generateRandomColor();
    rgbCode.textContent = currentRGB;
    
    const correctPosition = Math.floor(Math.random() * gridSize);
    
    for (let i = 0; i < gridSize; i++) {
        const box = document.createElement('div');
        box.className = 'color-box';
        
        if (i === correctPosition) {
            box.style.backgroundColor = currentRGB;
        } else {
            box.style.backgroundColor = generateRandomColor();
        }
        
        box.onclick = () => checkAnswer(box);
        colorGrid.appendChild(box);
    }
}

function checkAnswer(box) {
    if (isGameOver) return;
    
    if (box.style.backgroundColor === currentRGB) {
        playSound('correct');
        score += 10;
        consecutiveCorrect++;
        document.getElementById('score').textContent = score;
        updateHighScore();
        box.classList.add('winner');
        updateProgress();
        
        setTimeout(() => {
            box.classList.remove('winner');
            startGame();
        }, 1000);
    } else {
        playSound('wrong');
        score = Math.max(0, score - 5);
        consecutiveCorrect = 0;
        health--;
        updateHealth();
        
        if (health <= 0) {
            playSound('gameOver');
            gameOver();
            return;
        }
        
        document.getElementById('score').textContent = score;
        updateProgress();
        box.style.transform = 'scale(0.95)';
        setTimeout(() => {
            box.style.transform = 'scale(1)';
        }, 200);
    }
}

window.onload = () => {
    resetGame();
};
