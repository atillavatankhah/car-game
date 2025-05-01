// Game configuration
const config = {
    initialGameSpeed: 3,
    maxGameSpeed: 8,
    coinValue: 25,
    obstacleSpawnRate: 0.01,
    coinSpawnRate: 0.04,
    powerUpSpawnRate: 0.005,
    invincibilityDuration: 2000,
    carPrice: 500
};

// Available cars
const cars = [
    { id: 1, name: 'Classic Racer', price: 0, speed: 5, handling: 5, img: 'car1.svg', owned: true },
    { id: 2, name: 'Speed Demon', price: 500, speed: 6, handling: 5, img: 'car1.svg', owned: false },
    { id: 3, name: 'Tank Runner', price: 1000, speed: 5, handling: 7, img: 'car1.svg', owned: false },
    { id: 4, name: 'Lightning', price: 1500, speed: 7, handling: 6, img: 'car1.svg', owned: false },
    { id: 5, name: 'Balanced Pro', price: 2000, speed: 7, handling: 7, img: 'car1.svg', owned: false },
    { id: 6, name: 'Luxury Cruiser', price: 2500, speed: 6, handling: 8, img: 'car1.svg', owned: false },
    { id: 7, name: 'Drift King', price: 3000, speed: 8, handling: 8, img: 'car1.svg', owned: false },
    { id: 8, name: 'Monster Machine', price: 3500, speed: 8, handling: 9, img: 'car1.svg', owned: false },
    { id: 9, name: 'Stealth Runner', price: 4000, speed: 9, handling: 9, img: 'car1.svg', owned: false },
    { id: 10, name: 'Ultimate Beast', price: 5000, speed: 10, handling: 10, img: 'car1.svg', owned: false }
];

// Sound effects with better volume control
const sounds = {
    background: new Audio('background.mp3'),
    coin: new Audio('coin.mp3'),
    crash: new Audio('crash.mp3'),
    purchase: new Audio('purchase.mp3'),
    powerUp: new Audio('powerup.mp3')
};

// Set volume for all sounds
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
});

// Game state
let gameState = {
    score: 0,
    coins: 0,
    hearts: 3,
    currentCar: cars[0],
    isPlaying: false,
    isMuted: false,
    isPaused: false,
    isInvincible: false,
    gameSpeed: config.initialGameSpeed,
    distanceTraveled: 0
};

// DOM Elements
const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const garage = document.getElementById('garage');
const garageBtn = document.getElementById('garageBtn');
const muteBtn = document.getElementById('muteBtn');
const scoreCount = document.getElementById('scoreCount');
const coinCount = document.getElementById('coinCount');
const carGrid = document.getElementById('carGrid');

// Initialize game
function initGame() {
    setupEventListeners();
    createCarGrid();
    updateHUD();
    showStartScreen();
}

// Event Listeners
function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyUp);
    garageBtn.addEventListener('click', toggleGarage);
    muteBtn.addEventListener('click', toggleSound);
    document.querySelector('.close-button').addEventListener('click', toggleGarage);
    
    // Add pause functionality
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
    });
}

// Key state tracking for smooth movement
const keyState = {
    ArrowLeft: false,
    ArrowRight: false
};

function handleKeyPress(e) {
    if (gameState.isPaused) return;
    
    keyState[e.key] = true;
    
    // Start game on any key press if not playing
    if (!gameState.isPlaying && e.key !== 'p' && e.key !== 'P') {
        startGame();
    }
}

function handleKeyUp(e) {
    keyState[e.key] = false;
}

// Game Loop with smooth movement
function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Handle continuous movement
    updatePlayerPosition();
    
    // Update game speed based on distance
    gameState.distanceTraveled += gameState.gameSpeed;
    gameState.gameSpeed = Math.min(
        config.maxGameSpeed,
        config.initialGameSpeed + (Math.floor(gameState.distanceTraveled / 1000) * 0.2)
    );

    // Spawn game elements
    if (Math.random() < config.obstacleSpawnRate) spawnObstacle();
    if (Math.random() < config.coinSpawnRate) spawnCoin();
    if (Math.random() < config.powerUpSpawnRate) spawnPowerUp();

    // Move elements
    moveElements('.obstacle');
    moveElements('.coin');
    moveElements('.power-up');

    // Check collisions
    checkCollisions();

    // Update score and HUD
    gameState.score += gameState.gameSpeed;
    updateHUD();

    requestAnimationFrame(gameLoop);
}

function updatePlayerPosition() {
    const playerRect = player.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    const moveSpeed = 5 * gameState.currentCar.handling;
    let currentLeft = parseFloat(player.style.left) || gameAreaRect.width / 2;

    if (keyState.ArrowLeft && playerRect.left > gameAreaRect.left + 10) {
        currentLeft -= moveSpeed;
    }
    if (keyState.ArrowRight && playerRect.right < gameAreaRect.right - 10) {
        currentLeft += moveSpeed;
    }

    player.style.left = `${currentLeft}px`;
}

// Spawn game elements
function spawnObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.left = `${Math.random() * (gameArea.offsetWidth - 50)}px`;
    obstacle.style.top = '-80px';
    
    // Random obstacle types
    const type = Math.floor(Math.random() * 3) + 1;
    obstacle.style.backgroundImage = `url('obstacle${type}.svg')`;
    
    gameArea.appendChild(obstacle);
}

function spawnCoin() {
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    coin.style.top = '-30px';
    gameArea.appendChild(coin);
}

function spawnPowerUp() {
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    powerUp.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    powerUp.style.top = '-30px';
    gameArea.appendChild(powerUp);
}

// Move elements with smooth animation
function moveElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        const top = parseFloat(element.style.top) || 0;
        element.style.top = `${top + gameState.gameSpeed}px`;
        
        if (top > gameArea.offsetHeight) {
            element.remove();
        }
    });
}

// Collision detection with improved accuracy
function checkCollisions() {
    const playerRect = player.getBoundingClientRect();

    // Check obstacle collisions
    if (!gameState.isInvincible) {
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (isColliding(playerRect, obstacleRect)) {
                handleCollision(obstacle);
            }
        });
    }

    // Check coin collisions
    document.querySelectorAll('.coin').forEach(coin => {
        const coinRect = coin.getBoundingClientRect();
        if (isColliding(playerRect, coinRect)) {
            collectCoin(coin);
        }
    });

    // Check power-up collisions
    document.querySelectorAll('.power-up').forEach(powerUp => {
        const powerUpRect = powerUp.getBoundingClientRect();
        if (isColliding(playerRect, powerUpRect)) {
            collectPowerUp(powerUp);
        }
    });
}

function isColliding(rect1, rect2) {
    const buffer = 5; // Collision buffer for better feel
    return !(rect1.right - buffer < rect2.left + buffer || 
             rect1.left + buffer > rect2.right - buffer || 
             rect1.bottom - buffer < rect2.top + buffer || 
             rect1.top + buffer > rect2.bottom - buffer);
}

// Handle collisions
function handleCollision(obstacle) {
    playSound('crash');
    gameState.hearts--;
    obstacle.remove();
    showEffect('crash', obstacle.style.left, obstacle.style.top);
    
    // Flash player on hit
    player.classList.add('hit');
    setTimeout(() => player.classList.remove('hit'), 500);

    if (gameState.hearts <= 0) {
        endGame();
    } else {
        // Brief invincibility after hit
        gameState.isInvincible = true;
        player.classList.add('invincible');
        setTimeout(() => {
            gameState.isInvincible = false;
            player.classList.remove('invincible');
        }, 1500);
    }

    updateHUD();
}

function collectCoin(coin) {
    playSound('coin');
    gameState.coins += config.coinValue;
    coin.remove();
    showEffect('coin', coin.style.left, coin.style.top);
    updateHUD();
}

function collectPowerUp(powerUp) {
    playSound('powerUp');
    gameState.isInvincible = true;
    player.classList.add('invincible');
    powerUp.remove();
    showEffect('power-up', powerUp.style.left, powerUp.style.top);
    
    setTimeout(() => {
        gameState.isInvincible = false;
        player.classList.remove('invincible');
    }, config.invincibilityDuration);
}

// Game state management
function startGame() {
    gameState.isPlaying = true;
    gameState.gameSpeed = config.initialGameSpeed;
    gameState.score = 0;
    gameState.hearts = 3;
    gameState.distanceTraveled = 0;
    hideStartScreen();
    playBackgroundMusic();
    gameLoop();
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    if (!gameState.isPaused) {
        gameLoop();
    }
    document.getElementById('pauseScreen').style.display = 
        gameState.isPaused ? 'flex' : 'none';
}

function endGame() {
    gameState.isPlaying = false;
    document.getElementById('gameOver').style.display = 'flex';
    document.getElementById('finalScore').textContent = Math.floor(gameState.score);
    document.getElementById('coinsEarned').textContent = gameState.coins;
}

// UI Management
function showStartScreen() {
    document.getElementById('startScreen').style.display = 'flex';
}

function hideStartScreen() {
    document.getElementById('startScreen').style.display = 'none';
}

function updateHUD() {
    scoreCount.textContent = Math.floor(gameState.score);
    coinCount.textContent = gameState.coins;
    
    const hearts = document.querySelectorAll('.hearts i');
    hearts.forEach((heart, index) => {
        heart.style.color = index < gameState.hearts ? '#ff4757' : '#666';
    });
}

// Garage functionality
function createCarGrid() {
    carGrid.innerHTML = '';
    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = `car-card ${car.owned ? 'owned' : ''} ${car === gameState.currentCar ? 'selected' : ''}`;
        card.innerHTML = `
            <img src="${car.img}" alt="${car.name}">
            <h3>${car.name}</h3>
            <p>Speed: ${car.speed}/10</p>
            <p>Handling: ${car.handling}/10</p>
            ${car.owned ? 
                '<button class="select-btn">Select</button>' : 
                `<button class="buy-btn">Buy (${car.price} coins)</button>`}
        `;
        
        card.querySelector('button').addEventListener('click', () => {
            if (car.owned) {
                selectCar(car);
            } else {
                buyCar(car);
            }
        });
        
        carGrid.appendChild(card);
    });
}

function toggleGarage() {
    garage.style.display = garage.style.display === 'flex' ? 'none' : 'flex';
    if (garage.style.display === 'flex') {
        gameState.isPaused = true;
    } else {
        gameState.isPaused = false;
        if (gameState.isPlaying) gameLoop();
    }
}

function buyCar(car) {
    if (gameState.coins >= car.price) {
        gameState.coins -= car.price;
        car.owned = true;
        playSound('purchase');
        selectCar(car);
        createCarGrid();
        updateHUD();
        
        // Show purchase success effect
        showPurchaseEffect(car.name);
    }
}

function selectCar(car) {
    gameState.currentCar = car;
    player.style.backgroundImage = `url('${car.img}')`;
    createCarGrid();
    
    // Show selection effect
    showSelectionEffect(car.name);
}

// Sound management
function playBackgroundMusic() {
    sounds.background.loop = true;
    if (!gameState.isMuted) {
        sounds.background.play();
    }
}

function playSound(soundName) {
    if (!gameState.isMuted && sounds[soundName]) {
        const sound = sounds[soundName].cloneNode();
        sound.volume = 0.3;
        sound.play();
    }
}

function toggleSound() {
    gameState.isMuted = !gameState.isMuted;
    muteBtn.innerHTML = gameState.isMuted ? 
        '<i class="fas fa-volume-mute"></i>' : 
        '<i class="fas fa-volume-up"></i>';
    
    if (gameState.isMuted) {
        sounds.background.pause();
    } else if (gameState.isPlaying) {
        sounds.background.play();
    }
}

// Visual effects
function showEffect(type, x, y) {
    const effect = document.createElement('div');
    effect.className = 'effect';
    effect.style.left = x;
    effect.style.top = y;
    
    switch(type) {
        case 'coin':
            effect.innerHTML = `+${config.coinValue}`;
            effect.classList.add('coin-effect');
            break;
        case 'crash':
            effect.innerHTML = '💥';
            effect.classList.add('crash-effect');
            break;
        case 'power-up':
            effect.innerHTML = '⭐';
            effect.classList.add('powerup-effect');
            break;
    }
    
    gameArea.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
}

function showPurchaseEffect(carName) {
    const effect = document.createElement('div');
    effect.className = 'purchase-effect';
    effect.textContent = `New Car: ${carName}!`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 2000);
}

function showSelectionEffect(carName) {
    const effect = document.createElement('div');
    effect.className = 'selection-effect';
    effect.textContent = `Selected: ${carName}`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1500);
}

// Start the game
document.addEventListener('DOMContentLoaded', initGame); 