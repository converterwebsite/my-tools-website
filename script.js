// Game Configuration
const CONFIG = {
    // Game Settings
    INITIAL_TIME: 60,
    INITIAL_BUBBLES: 50,
    INITIAL_SCORE: 0,
    INITIAL_LEVEL: 1,
    
    // Bubble Settings
    BUBBLE_RADIUS: 35,
    BUBBLE_SPEED: 15,
    MAX_ANGLE: 60,
    
    // Scoring
    BASE_POINTS: 100,
    COMBO_MULTIPLIER: 1.5,
    WORD_BONUS: 500,
    TIME_BONUS: 10,
    
    // Game Colors
    COLORS: {
        A: ['#ff6b6b', '#ff3838'],
        B: ['#ff9f43', '#ff8a33'],
        C: ['#ffe66d', '#ffd93d'],
        D: ['#1dd1a1', '#10ac84'],
        E: ['#54a0ff', '#2e86de'],
        F: ['#9b59b6', '#8e44ad'],
        G: ['#ff9ff3', '#f368e0'],
        H: ['#00cec9', '#00b894'],
        I: ['#fd79a8', '#e84393'],
        J: ['#fdcb6e', '#fdcb6e'],
        K: ['#a29bfe', '#6c5ce7'],
        L: ['#81ecec', '#00cec9'],
        M: ['#fab1a0', '#e17055'],
        N: ['#74b9ff', '#0984e3'],
        O: ['#55efc4', '#00b894'],
        P: ['#ffeaa7', '#fdcb6e'],
        Q: ['#a29bfe', '#6c5ce7'],
        R: ['#fd79a8', '#e84393'],
        S: ['#dfe6e9', '#b2bec3'],
        T: ['#81ecec', '#00cec9'],
        U: ['#55efc4', '#00b894'],
        V: ['#74b9ff', '#0984e3'],
        W: ['#ffeaa7', '#fdcb6e'],
        X: ['#fab1a0', '#e17055'],
        Y: ['#a29bfe', '#6c5ce7'],
        Z: ['#ff6b6b', '#ff3838']
    },
    
    // Difficulty Settings
    DIFFICULTY: {
        easy: { speed: 1, timeBonus: 20 },
        medium: { speed: 1.5, timeBonus: 15 },
        hard: { speed: 2, timeBonus: 10 }
    }
};

// Game State
class GameState {
    constructor() {
        this.score = CONFIG.INITIAL_SCORE;
        this.level = CONFIG.INITIAL_LEVEL;
        this.timeLeft = CONFIG.INITIAL_TIME;
        this.bubblesLeft = CONFIG.INITIAL_BUBBLES;
        this.gameActive = false;
        this.gamePaused = false;
        this.difficulty = 'easy';
        
        // Game Elements
        this.currentAngle = 0;
        this.currentPower = 100;
        this.currentLetter = 'A';
        this.nextLetters = ['B', 'C', 'D'];
        this.bubbles = [];
        this.shootingBubble = null;
        this.timerInterval = null;
        
        // Statistics
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.bubblesPopped = 0;
        this.wordsFormed = 0;
        this.comboCount = 0;
        
        // DOM Elements
        this.initElements();
        this.initEventListeners();
        this.createStars();
        this.showWelcomeModal();
    }
    
    initElements() {
        // Game Stats
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.timerElement = document.getElementById('timer');
        this.bubblesElement = document.getElementById('bubbles');
        
        // Game Controls
        this.angleValue = document.getElementById('angleValue');
        this.powerValue = document.getElementById('powerValue');
        this.powerFill = document.getElementById('powerFill');
        this.currentLetterElement = document.getElementById('currentLetter');
        
        // Game Board
        this.gameBoard = document.getElementById('gameBoard');
        this.bubblesContainer = document.getElementById('bubblesContainer');
        this.gunBarrel = document.getElementById('gunBarrel');
        this.aimLine = document.getElementById('aimLine');
        
        // Buttons
        this.shootBtn = document.getElementById('shootBtn');
        this.aimLeftBtn = document.getElementById('aimLeft');
        this.aimRightBtn = document.getElementById('aimRight');
        this.changeBubbleBtn = document.getElementById('changeBubble');
        this.powerUpBtn = document.getElementById('powerUp');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Modals
        this.welcomeModal = document.getElementById('welcomeModal');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.levelCompleteModal = document.getElementById('levelCompleteModal');
        
        // Modal Buttons
        this.startGameBtn = document.getElementById('startGameBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        
        // Next Bubbles
        this.nextBubbleElements = [
            document.getElementById('nextBubble1'),
            document.getElementById('nextBubble2'),
            document.getElementById('nextBubble3')
        ];
        
        // Message Display
        this.messageDisplay = document.getElementById('messageDisplay');
        
        // Particles Container
        this.particlesContainer = document.getElementById('particlesContainer');
    }
    
    initEventListeners() {
        // Game Controls
        this.shootBtn.addEventListener('click', () => this.shootBubble());
        this.aimLeftBtn.addEventListener('click', () => this.rotateGun(-5));
        this.aimRightBtn.addEventListener('click', () => this.rotateGun(5));
        this.changeBubbleBtn.addEventListener('click', () => this.changeCurrentBubble());
        this.powerUpBtn.addEventListener('click', () => this.activatePowerUp());
        this.restartBtn.addEventListener('click', () => this.restartLevel());
        
        // Header Controls
        document.getElementById('soundBtn').addEventListener('click', this.toggleSound);
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('fullscreenBtn').addEventListener('click', this.toggleFullscreen);
        
        // Modal Controls
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.mainMenuBtn.addEventListener('click', () => this.showWelcomeModal());
        this.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        
        // Difficulty Selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
            });
        });
        
        // Mouse Controls
        this.gameBoard.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.gameBoard.addEventListener('click', (e) => {
            if (e.target === this.gameBoard || e.target.classList.contains('bubbles-container')) {
                this.shootBubble();
            }
        });
        
        // Keyboard Controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Touch Controls for Mobile
        this.gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.gameBoard.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    }
    
    // ===== GAME INITIALIZATION =====
    createStars() {
        const starsContainer = document.querySelector('.stars');
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = star.style.height = Math.random() * 3 + 1 + 'px';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.opacity = Math.random() * 0.5 + 0.2;
            star.style.animationDuration = Math.random() * 3 + 2 + 's';
            star.style.animationDelay = Math.random() * 5 + 's';
            starsContainer.appendChild(star);
        }
    }
    
    showWelcomeModal() {
        this.gameActive = false;
        this.welcomeModal.classList.add('active');
        this.gameOverModal.classList.remove('active');
        this.levelCompleteModal.classList.remove('active');
    }
    
    startGame() {
        this.resetGame();
        this.welcomeModal.classList.remove('active');
        this.gameActive = true;
        this.createInitialBubbles();
        this.updateUI();
        this.startTimer();
        this.showMessage('Game Started! Good Luck!', 'info');
    }
    
    resetGame() {
        this.score = CONFIG.INITIAL_SCORE;
        this.level = CONFIG.INITIAL_LEVEL;
        this.timeLeft = CONFIG.INITIAL_TIME;
        this.bubblesLeft = CONFIG.INITIAL_BUBBLES;
        
        this.currentAngle = 0;
        this.currentPower = 100;
        this.currentLetter = this.getRandomLetter();
        this.nextLetters = [this.getRandomLetter(), this.getRandomLetter(), this.getRandomLetter()];
        
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.bubblesPopped = 0;
        this.wordsFormed = 0;
        this.comboCount = 0;
        
        // Clear bubbles
        this.bubblesContainer.innerHTML = '';
        this.bubbles = [];
        
        // Reset gun position
        this.gunBarrel.style.transform = 'translateX(-50%) rotate(0deg)';
        this.updateAimLine();
        
        // Update UI
        this.updateUI();
    }
    
    // ===== GAME LOGIC =====
    rotateGun(angle) {
        if (!this.gameActive || this.gamePaused) return;
        
        this.currentAngle += angle;
        this.currentAngle = Math.max(-CONFIG.MAX_ANGLE, Math.min(CONFIG.MAX_ANGLE, this.currentAngle));
        
        this.gunBarrel.style.transform = `translateX(-50%) rotate(${this.currentAngle}deg)`;
        this.updateAimLine();
        this.angleValue.textContent = `${this.currentAngle}°`;
    }
    
    updateAimLine() {
        const angleRad = (this.currentAngle * Math.PI) / 180;
        const length = 400;
        
        this.aimLine.style.height = `${length}px`;
        this.aimLine.style.transform = `translateX(-50%) rotate(${this.currentAngle}deg)`;
    }
    
    shootBubble() {
        if (!this.gameActive || this.gamePaused || this.bubblesLeft <= 0 || this.shootingBubble) return;
        
        this.shotsFired++;
        this.bubblesLeft--;
        
        // Create shooting bubble
        const bubble = document.createElement('div');
        bubble.className = 'bubble shooting';
        bubble.setAttribute('data-letter', this.currentLetter);
        
        const bubbleLetter = document.createElement('span');
        bubbleLetter.className = 'bubble-letter';
        bubbleLetter.textContent = this.currentLetter;
        bubble.appendChild(bubbleLetter);
        
        // Position at gun tip
        const gunRect = this.gunBarrel.getBoundingClientRect();
        const gameBoardRect = this.gameBoard.getBoundingClientRect();
        
        const startX = gunRect.left + gunRect.width / 2 - gameBoardRect.left;
        const startY = gunRect.top - gameBoardRect.top;
        
        bubble.style.left = `${startX}px`;
        bubble.style.top = `${startY}px`;
        bubble.style.background = this.getBubbleGradient(this.currentLetter);
        
        this.bubblesContainer.appendChild(bubble);
        this.shootingBubble = bubble;
        
        // Create shooting particles
        this.createParticles(startX, startY, this.currentLetter, 10, 'shoot');
        
        // Calculate trajectory
        const angleRad = (this.currentAngle * Math.PI) / 180;
        const speed = CONFIG.BUBBLE_SPEED * CONFIG.DIFFICULTY[this.difficulty].speed;
        
        const shootBubble = () => {
            const currentX = parseFloat(bubble.style.left);
            const currentY = parseFloat(bubble.style.top);
            
            const newX = currentX + Math.sin(angleRad) * speed;
            const newY = currentY + Math.cos(angleRad) * speed * -1;
            
            bubble.style.left = `${newX}px`;
            bubble.style.top = `${newY}px`;
            
            // Check boundaries
            if (newX < 0 || newX > gameBoardRect.width || newY < 0) {
                this.attachBubble(bubble, newX, newY);
                return;
            }
            
            // Check collision
            const collision = this.checkCollision(bubble, newX, newY);
            if (collision) {
                this.handleCollision(bubble, collision);
                return;
            }
            
            // Continue animation
            if (this.gameActive && !this.gamePaused) {
                requestAnimationFrame(shootBubble);
            }
        };
        
        requestAnimationFrame(shootBubble);
        this.updateUI();
    }
    
    checkCollision(bubble, x, y) {
        const bubbleSize = CONFIG.BUBBLE_RADIUS * 2;
        
        for (const existingBubble of this.bubbles) {
            const distance = Math.sqrt(
                Math.pow(x - existingBubble.x, 2) + Math.pow(y - existingBubble.y, 2)
            );
            
            if (distance < bubbleSize) {
                return existingBubble;
            }
        }
        
        // Check wall collisions
        if (x < bubbleSize || x > this.gameBoard.clientWidth - bubbleSize) {
            return { x, y, isWall: true };
        }
        
        return null;
    }
    
    handleCollision(bubble, target) {
        // Remove shooting animation
        bubble.classList.remove('shooting');
        
        let attachX, attachY;
        
        if (target.isWall) {
            // Bounce off wall
            this.currentAngle = -this.currentAngle;
            this.gunBarrel.style.transform = `translateX(-50%) rotate(${this.currentAngle}deg)`;
            this.updateAimLine();
            this.angleValue.textContent = `${this.currentAngle}°`;
            bubble.remove();
            this.shootingBubble = null;
            return;
        } else {
            // Attach to existing bubble
            attachX = target.x;
            attachY = target.y;
            
            // Calculate exact attachment position
            const angle = Math.atan2(target.y - parseFloat(bubble.style.top), target.x - parseFloat(bubble.style.left));
            attachX = target.x - Math.cos(angle) * CONFIG.BUBBLE_RADIUS * 2;
            attachY = target.y - Math.sin(angle) * CONFIG.BUBBLE_RADIUS * 2;
        }
        
        // Create attached bubble
        const attachedBubble = {
            element: bubble,
            letter: this.currentLetter,
            x: attachX,
            y: attachY,
            neighbors: []
        };
        
        this.bubbles.push(attachedBubble);
        
        // Position bubble
        bubble.style.left = `${attachX - CONFIG.BUBBLE_RADIUS}px`;
        bubble.style.top = `${attachY - CONFIG.BUBBLE_RADIUS}px`;
        bubble.style.position = 'absolute';
        bubble.style.animation = 'none';
        
        // Add click event
        bubble.addEventListener('click', () => this.popBubble(attachedBubble));
        
        // Check for matches
        this.checkForMatches(attachedBubble);
        
        // Update current bubble
        this.currentLetter = this.nextLetters.shift();
        this.nextLetters.push(this.getRandomLetter());
        
        this.shootingBubble = null;
        this.updateUI();
        
        // Check level complete
        if (this.bubblesLeft <= 0) {
            setTimeout(() => this.checkLevelComplete(), 500);
        }
    }
    
    attachBubble(bubble, x, y) {
        if (!bubble) {
            bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.setAttribute('data-letter', this.currentLetter);
            
            const bubbleLetter = document.createElement('span');
            bubbleLetter.className = 'bubble-letter';
            bubbleLetter.textContent = this.currentLetter;
            bubble.appendChild(bubbleLetter);
            
            bubble.style.background = this.getBubbleGradient(this.currentLetter);
            this.bubblesContainer.appendChild(bubble);
        }
        
        const attachedBubble = {
            element: bubble,
            letter: this.currentLetter,
            x: x,
            y: y,
            neighbors: []
        };
        
        this.bubbles.push(attachedBubble);
        
        bubble.style.left = `${x - CONFIG.BUBBLE_RADIUS}px`;
        bubble.style.top = `${y - CONFIG.BUBBLE_RADIUS}px`;
        bubble.style.position = 'absolute';
        
        bubble.addEventListener('click', () => this.popBubble(attachedBubble));
        
        // Check for matches
        this.checkForMatches(attachedBubble);
        
        // Update current bubble
        this.currentLetter = this.nextLetters.shift();
        this.nextLetters.push(this.getRandomLetter());
        
        this.shootingBubble = null;
        this.updateUI();
    }
    
    checkForMatches(startBubble) {
        const visited = new Set();
        const matches = [];
        const letter = startBubble.letter;
        
        const findMatches = (bubble) => {
            if (!bubble || visited.has(bubble) || bubble.letter !== letter) return;
            
            visited.add(bubble);
            matches.push(bubble);
            
            // Find neighbors
            const neighbors = this.bubbles.filter(b => 
                !visited.has(b) &&
                Math.sqrt(Math.pow(b.x - bubble.x, 2) + Math.pow(b.y - bubble.y, 2)) < CONFIG.BUBBLE_RADIUS * 2.2
            );
            
            neighbors.forEach(neighbor => findMatches(neighbor));
        };
        
        findMatches(startBubble);
        
        if (matches.length >= 3) {
            this.popBubbles(matches);
            this.checkWordFormation(matches);
        }
    }
    
    popBubbles(bubbles) {
        const points = Math.floor(bubbles.length * CONFIG.BASE_POINTS * (1 + this.comboCount * 0.5));
        this.score += points;
        this.shotsHit += bubbles.length;
        this.bubblesPopped += bubbles.length;
        this.comboCount++;
        
        // Show score popup
        this.showScorePopup(bubbles[0].x, bubbles[0].y, points);
        
        // Pop each bubble with delay
        bubbles.forEach((bubble, index) => {
            setTimeout(() => {
                this.popBubble(bubble, true);
            }, index * 100);
        });
        
        // Show combo message
        if (this.comboCount > 1) {
            this.showMessage(`COMBO x${this.comboCount}! +${points} points`, 'combo');
        }
        
        this.updateUI();
    }
    
    popBubble(bubble, isMatch = false) {
        if (!bubble.element) return;
        
        const x = bubble.x;
        const y = bubble.y;
        const letter = bubble.letter;
        
        // Create explosion particles
        this.createParticles(x, y, letter, 20, 'explosion');
        
        // Remove bubble
        bubble.element.remove();
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
            this.bubbles.splice(index, 1);
        }
        
        if (!isMatch) {
            this.score += CONFIG.BASE_POINTS;
            this.bubblesPopped++;
            this.updateUI();
        }
        
        // Check level complete
        if (this.bubbles.length === 0) {
            setTimeout(() => this.checkLevelComplete(), 500);
        }
    }
    
    checkWordFormation(bubbles) {
        // Sort bubbles by x position
        const sorted = [...bubbles].sort((a, b) => a.x - b.x);
        const word = sorted.map(b => b.letter).join('');
        
        // Common 3-letter words
        const words = ['CAT', 'DOG', 'BAT', 'BALL', 'CAR', 'SUN', 'MOON', 'STAR', 'TREE', 'FISH'];
        
        if (words.includes(word)) {
            const bonus = CONFIG.WORD_BONUS * this.level;
            this.score += bonus;
            this.wordsFormed++;
            
            this.showWordBonus(        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 40, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw spaceship
    ctx.fillStyle = '#00ffff';
    
    // Ship body
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 20, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine glow
    if (game.running) {
        const gradient = ctx.createRadialGradient(
            player.x + player.width / 2, player.y + player.height,
            0,
            player.x + player.width / 2, player.y + player.height,
            30
        );
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x + 10, player.y + player.height, 30, 40);
    }
    
    ctx.restore();
}

// Create enemy
function createEnemy() {
    const settings = difficultySettings[game.difficulty];
    return {
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 40 + Math.random() * 20,
        height: 40 + Math.random() * 20,
        speed: settings.enemySpeed + Math.random() * 1,
        health: settings.enemyHealth,
        color: `hsl(${Math.random() * 60 + 0}, 100%, 50%)`,
        lastShot: 0,
        shootDelay: settings.enemyShootRate
    };
}

// Draw enemy
function drawEnemy(enemy) {
    ctx.save();
    
    // Enemy ship
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy details
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Create bullet
function createBullet(x, y, isPlayer = true) {
    return {
        x: x,
        y: y,
        width: 6,
        height: 20,
        speed: isPlayer ? -12 : 7,
        color: isPlayer ? '#ffff00' : '#ff4444'
    };
}

// Draw bullet
function drawBullet(bullet) {
    ctx.save();
    
    // Bullet glow
    const gradient = ctx.createRadialGradient(
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        0,
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        15
    );
    gradient.addColorStop(0, bullet.color);
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(bullet.x - 7, bullet.y - 7, bullet.width + 14, bullet.height + 14);
    
    // Bullet core
    ctx.fillStyle = bullet.color === '#ffff00' ? '#ffffff' : '#ff0000';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    ctx.restore();
}

// Create power-up
function createPowerUp() {
    const types = ['health', 'ammo', 'rapidFire', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let color;
    switch(type) {
        case 'health': color = '#ff4444'; break;
        case 'ammo': color = '#4488ff'; break;
        case 'rapidFire': color = '#ffff00'; break;
        case 'shield': color = '#00ffff'; break;
    }
    
    return {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 35,
        height: 35,
        speed: 3,
        type: type,
        color: color
    };
}

// Draw power-up
function drawPowerUp(powerUp) {
    ctx.save();
    
    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.roundRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, 8);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let symbol;
    switch(powerUp.type) {
        case 'health': symbol = '❤️'; break;
        case 'ammo': symbol = '⚡'; break;
        case 'rapidFire': symbol = '🔥'; break;
        case 'shield': symbol = '🛡️'; break;
    }
    
    ctx.fillText(symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    
    ctx.restore();
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update HUD
function updateHUD() {
    document.getElementById('health').textContent = game.health;
    document.getElementById('score').textContent = game.score;
    document.getElementById('ammo').textContent = game.ammo;
    document.getElementById('level').textContent = game.level;
}

// Take damage
function takeDamage(amount) {
    if (player.hasShield) return;
    
    game.health -= amount;
    if (game.health < 0) game.health = 0;
    updateHUD();
    
    // Visual feedback
    canvas.style.boxShadow = '0 0 50px red';
    setTimeout(() => {
        canvas.style.boxShadow = 'none';
    }, 100);
}

// Apply power-up
function applyPowerUp(type) {
    switch(type) {
        case 'health':
            game.health = Math.min(100, game.health + 25);
            break;
        case 'ammo':
            game.ammo += 30;
            break;
        case 'rapidFire':
            player.shootDelay = 100;
            setTimeout(() => {
                player.shootDelay = 300;
            }, 8000);
            break;
        case 'shield':
            player.hasShield = true;
            setTimeout(() => {
                player.hasShield = false;
            }, 10000);
            break;
    }
    updateHUD();
}

// Main game loop
function gameLoop() {
    if (!game.running) return;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawStars();
    
    // Move player
    if ((keys.ArrowLeft || keys.a) && player.x > 10) {
        player.x -= player.speed;
    }
    if ((keys.ArrowRight || keys.d) && player.x < canvas.width - player.width - 10) {
        player.x += player.speed;
    }
    
    // Player shooting
    const currentTime = Date.now();
    if ((keys[' '] || keys.Space) && currentTime - player.lastShot > player.shootDelay && game.ammo > 0) {
        player.bullets.push(createBullet(
            player.x + player.width / 2 - 3,
            player.y
        ));
        player.lastShot = currentTime;
        game.ammo--;
        updateHUD();
    }
    
    // Spawn enemies
    const settings = difficultySettings[game.difficulty];
    if (Math.random() * settings.spawnRate < 1) {
        enemies.push(createEnemy());
    }
    
    // Spawn power-ups occasionally
    if (Math.random() * 400 < 1 && game.score > 500) {
        game.powerUps.push(createPowerUp());
    }
    
    // Update player bullets
    player.bullets = player.bullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (bullet.y < 0) return false;
        
        // Check collision with enemies
        let hitEnemy = false;
        enemies = enemies.filter(enemy => {
            if (checkCollision(bullet, enemy)) {
                enemy.health--;
                if (enemy.health <= 0) {
                    game.score += 100;
                    game.enemiesDestroyed++;
                    
                    // Level up every 500 points
                    if (game.score >= game.level * 500) {
                        game.level++;
                    }
                    
                    updateHUD();
                    return false;
                }
                hitEnemy = true;
            }
            return true;
        });
        
        if (hitEnemy) return false;
        
        drawBullet(bullet);
        return true;
    });
    
    // Update enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Enemy shooting
        if (currentTime - enemy.lastShot > enemy.shootDelay) {
            enemyBullets.push(createBullet(
                enemy.x + enemy.width / 2 - 3,
                enemy.y + enemy.height,
                false
            ));
            enemy.lastShot = currentTime;
        }
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            takeDamage(25);
            return false;
        }
        
        if (enemy.y > canvas.height) return false;
        
        drawEnemy(enemy);
        return true;
    });
    
    // Update enemy bullets
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (bullet.y > canvas.height) return false;
        
        if (checkCollision(player, bullet)) {
            takeDamage(15);
            return false;
        }
        
        drawBullet(bullet);
        return true;
    });
    
    // Update power-ups
    game.powerUps = game.powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        
        if (checkCollision(player, powerUp)) {
            applyPowerUp(powerUp.type);
            return false;
        }
        
        if (powerUp.y > canvas.height) return false;
        
        drawPowerUp(powerUp);
        return true;
    });
    
    // Draw player
    drawPlayer();
    
    // Check game over
    if (game.health <= 0) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Game over function
function gameOver() {
    game.running = false;
    
    // Update final stats
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('finalLevel').textContent = game.level;
    document.getElementById('finalEnemies').textContent = game.enemiesDestroyed;
    
    // Show game over screen
    gameOverScreen.style.display = 'flex';
}

// Start game function
function startGame() {
    // Reset game state
    game = {
        running: true,
        score: 0,
        level: 1,
        health: 100,
        ammo: 30,
        enemiesDestroyed: 0,
        difficulty: 'medium',
        powerUps: [],
        stars: game.stars || []
    };
    
    // Reset player
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 100;
    player.bullets = [];
    player.hasShield = false;
    player.shootDelay = 300;
    
    // Clear arrays
    enemies = [];
    enemyBullets = [];
    
    // Initialize stars if not already done
    if (game.stars.length === 0) {
        initStars();
    }
    
    // Update HUD
    updateHUD();
    
    // Hide screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Start game loop
    gameLoop();
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = keys.a = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.ArrowRight = keys.d = true;
    if (e.key === ' ' || e.key === 'Spacebar') keys[' '] = true;
    
    if (e.key === ' ') e.preventDefault(); // Prevent spacebar from scrolling
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = keys.a = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.ArrowRight = keys.d = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys[' '] = false;
});

// Mobile controls
leftBtn.addEventListener('mousedown', () => keys.ArrowLeft = true);
leftBtn.addEventListener('mouseup', () => keys.ArrowLeft = false);
leftBtn.addEventListener('mouseleave', () => keys.ArrowLeft = false);
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.ArrowLeft = true;
});
leftBtn.addEventListener('touchend', () => keys.ArrowLeft = false);

rightBtn.addEventListener('mousedown', () => keys.ArrowRight = true);
rightBtn.addEventListener('mouseup', () => keys.ArrowRight = false);
rightBtn.addEventListener('mouseleave', () => keys.ArrowRight = false);
rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.ArrowRight = true;
});
rightBtn.addEventListener('touchend', () => keys.ArrowRight = false);

shootBtn.addEventListener('mousedown', () => keys[' '] = true);
shootBtn.addEventListener('mouseup', () => keys[' '] = false);
shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys[' '] = true;
});
shootBtn.addEventListener('touchend', () => keys[' '] = false);

// Initialize
initStars();
updateHUD();

// Prevent context menu on right click
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Initialize with start screen visible
startScreen.style.display = 'flex';
gameOverScreen.style.display = 'none';
