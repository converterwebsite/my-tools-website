const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Game variables
let game = {
    running: false,
    score: 0,
    level: 1,
    health: 100,
    ammo: 30,
    enemiesDestroyed: 0,
    difficulty: 'medium',
    powerUps: []
};

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 60,
    speed: 8,
    color: '#00ffff',
    bullets: [],
    lastShot: 0,
    shootDelay: 300,
    hasShield: false
};

// Enemies array
let enemies = [];
let enemyBullets = [];

// Keys object for input
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false
};

// Game settings based on difficulty
const difficultySettings = {
    easy: { enemySpeed: 2, spawnRate: 60, enemyHealth: 1 },
    medium: { enemySpeed: 3, spawnRate: 45, enemyHealth: 2 },
    hard: { enemySpeed: 4, spawnRate: 30, enemyHealth: 3 }
};

// Update stats display
function updateStats() {
    document.getElementById('health').textContent = game.health;
    document.getElementById('score').textContent = game.score;
    document.getElementById('enemies').textContent = game.enemiesDestroyed;
    document.getElementById('ammo').textContent = game.ammo;
    document.getElementById('level').textContent = game.level;
}

// Draw player ship
function drawPlayer() {
    ctx.save();
    ctx.fillStyle = player.color;
    
    // Draw ship body
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw engine glow
    if (game.running) {
        const gradient = ctx.createRadialGradient(
            player.x + player.width / 2, player.y + player.height,
            0,
            player.x + player.width / 2, player.y + player.height,
            20
        );
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x + 15, player.y + player.height, 20, 20);
    }
    
    // Draw shield if active
    if (player.hasShield) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 35, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Create enemy
function createEnemy() {
    const settings = difficultySettings[game.difficulty];
    return {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: settings.enemySpeed,
        health: settings.enemyHealth,
        color: '#ff4444',
        lastShot: 0,
        shootDelay: 1500 + Math.random() * 1000
    };
}

// Draw enemy
function drawEnemy(enemy) {
    ctx.save();
    
    // Draw enemy ship
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 
                enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw enemy details
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw health bar
    if (enemy.health > 1) {
        const healthWidth = enemy.width;
        const healthHeight = 5;
        const healthX = enemy.x;
        const healthY = enemy.y - 10;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(healthX, healthY, healthWidth, healthHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(healthX, healthY, healthWidth * (enemy.health / difficultySettings[game.difficulty].enemyHealth), healthHeight);
    }
    
    ctx.restore();
}

// Create bullet
function createBullet(x, y, isPlayer = true) {
    return {
        x: x,
        y: y,
        width: 5,
        height: 15,
        speed: isPlayer ? -10 : 8,
        color: isPlayer ? '#ffff00' : '#ff4444'
    };
}

// Draw bullet
function drawBullet(bullet) {
    ctx.save();
    ctx.fillStyle = bullet.color;
    
    // Add glow effect
    const gradient = ctx.createRadialGradient(
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        0,
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        10
    );
    gradient.addColorStop(0, bullet.color);
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(bullet.x - 5, bullet.y - 5, bullet.width + 10, bullet.height + 10);
    
    // Draw bullet core
    ctx.fillStyle = bullet.color === '#ffff00' ? '#ffffff' : '#ff0000';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    ctx.restore();
}

// Create power-up
function createPowerUp() {
    const types = ['health', 'ammo', 'rapidFire', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let color, icon;
    switch(type) {
        case 'health': color = '#ff4444'; icon = '❤️'; break;
        case 'ammo': color = '#4488ff'; icon = '⚡'; break;
        case 'rapidFire': color = '#ffff00'; icon = '🔥'; break;
        case 'shield': color = '#00ffff'; icon = '🛡️'; break;
    }
    
    return {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 3,
        type: type,
        color: color,
        icon: icon
    };
}

// Draw power-up
function drawPowerUp(powerUp) {
    ctx.save();
    
    // Draw background
    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.roundRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, 5);
    ctx.fill();
    
    // Draw icon
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerUp.icon, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    
    // Add glow
    ctx.shadowColor = powerUp.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    
    ctx.restore();
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game loop
function gameLoop() {
    if (!game.running) return;
    
    // Clear canvas with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars background
    drawStars();
    
    // Move player
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    // Shoot bullets
    const currentTime = Date.now();
    if (keys[' '] && currentTime - player.lastShot > player.shootDelay && game.ammo > 0) {
        player.bullets.push(createBullet(
            player.x + player.width / 2 - 2.5,
            player.y
        ));
        player.lastShot = currentTime;
        game.ammo--;
        updateStats();
    }
    
    // Spawn enemies
    const settings = difficultySettings[game.difficulty];
    if (Math.random() * settings.spawnRate < 1) {
        enemies.push(createEnemy());
    }
    
    // Spawn power-ups occasionally
    if (Math.random() * 500 < 1) {
        game.powerUps.push(createPowerUp());
    }
    
    // Update and draw bullets
    player.bullets = player.bullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (bullet.y < 0) return false;
        
        drawBullet(bullet);
        return true;
    });
    
    // Update and draw enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Enemy shoots
        if (currentTime - enemy.lastShot > enemy.shootDelay) {
            enemyBullets.push(createBullet(
                enemy.x + enemy.width / 2 - 2.5,
                enemy.y + enemy.height,
                false
            ));
            enemy.lastShot = currentTime;
        }
        
        // Check collision with player bullets
        let hit = false;
        player.bullets = player.bullets.filter(bullet => {
            if (checkCollision(bullet, enemy)) {
                enemy.health--;
                hit = true;
                return false;
            }
            return true;
        });
        
        if (hit && enemy.health <= 0) {
            game.score += 100;
            game.enemiesDestroyed++;
            updateStats();
            
            // Level up every 10 enemies
            if (game.enemiesDestroyed % 10 === 0) {
                game.level++;
                updateStats();
            }
            
            return false;
        }
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            takeDamage(20);
            return false;
        }
        
        if (enemy.y > canvas.height) return false;
        
        drawEnemy(enemy);
        return true;
    });
    
    // Update and draw enemy bullets
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (bullet.y > canvas.height) return false;
        
        // Check collision with player
        if (checkCollision(player, bullet)) {
            takeDamage(10);
            return false;
        }
        
        drawBullet(bullet);
        return true;
    });
    
    // Update and draw power-ups
    game.powerUps = game.powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        
        // Check collision with player
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
    
    // Draw HUD
    drawHUD();
    
    // Check game over
    if (game.health <= 0) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Draw stars background
function drawStars() {
    if (!game.stars) {
        game.stars = [];
        for (let i = 0; i < 100; i++) {
            game.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    ctx.fillStyle = '#ffffff';
    game.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw HUD
function drawHUD() {
    ctx.save();
    
    // Score display
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${game.score}`, 20, 30);
    
    // Health bar
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthBarX = canvas.width - healthBarWidth - 20;
    const healthBarY = 20;
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(healthBarX, healthBarY, (game.health / 100) * healthBarWidth, healthBarHeight);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`HEALTH: ${game.health}%`, healthBarX, healthBarY + 15);
    
    ctx.restore();
}

// Take damage
function takeDamage(amount) {
    if (player.hasShield) {
        player.hasShield = false;
        return;
    }
    
    game.health -= amount;
    if (game.health < 0) game.health = 0;
    updateStats();
    
    // Visual feedback
    canvas.style.boxShadow = '0 0 30px red';
    setTimeout(() => {
        canvas.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
    }, 100);
}

// Apply power-up
function applyPowerUp(type) {
    switch(type) {
        case 'health':
            game.health = Math.min(100, game.health + 25);
            break;
        case 'ammo':
            game.ammo += 50;
            break;
        case 'rapidFire':
            player.shootDelay = 100;
            setTimeout(() => {
                player.shootDelay = 300;
            }, 5000);
            break;
        case 'shield':
            player.hasShield = true;
            setTimeout(() => {
                player.hasShield = false;
            }, 10000);
            break;
    }
    updateStats();
}

// Game over
function gameOver() {
    game.running = false;
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '60px Arial';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(`Enemies Destroyed: ${game.enemiesDestroyed}`, canvas.width / 2, canvas.height / 2 + 70);
    ctx.fillText(`Level Reached: ${game.level}`, canvas.width / 2, canvas.height / 2 + 110);
    
    ctx.font = '20px Arial';
    ctx.fillText('Click Restart to play again', canvas.width / 2, canvas.height / 2 + 160);
    
    ctx.restore();
}

// Initialize game
function initGame() {
    // Reset game state
    game = {
        running: true,
        score: 0,
        level: 1,
        health: 100,
        ammo: 30,
        enemiesDestroyed: 0,
        difficulty: document.getElementById('difficulty').value,
        powerUps: []
    };
    
    // Reset player
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    player.bullets = [];
    player.hasShield = false;
    
    // Clear arrays
    enemies = [];
    enemyBullets = [];
    
    updateStats();
    
    if (game.running) {
        gameLoop();
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Touch controls
document.getElementById('leftBtn').addEventListener('touchstart', () => keys.ArrowLeft = true);
document.getElementById('leftBtn').addEventListener('touchend', () => keys.ArrowLeft = false);
document.getElementById('rightBtn').addEventListener('touchstart', () => keys.ArrowRight = true);
document.getElementById('rightBtn').addEventListener('touchend', () => keys.ArrowRight = false);
document.getElementById('shootBtn').addEventListener('touchstart', () => keys[' '] = true);
document.getElementById('shootBtn').addEventListener('touchend', () => keys[' '] = false);

// Mouse controls for desktop
document.getElementById('leftBtn').addEventListener('mousedown', () => keys.ArrowLeft = true);
document.getElementById('leftBtn').addEventListener('mouseup', () => keys.ArrowLeft = false);
document.getElementById('leftBtn').addEventListener('mouseleave', () => keys.ArrowLeft = false);
document.getElementById('rightBtn').addEventListener('mousedown', () => keys.ArrowRight = true);
document.getElementById('rightBtn').addEventListener('mouseup', () => keys.ArrowRight = false);
document.getElementById('rightBtn').addEventListener('mouseleave', () => keys.ArrowRight = false);
document.getElementById('shootBtn').addEventListener('mousedown', () => keys[' '] = true);
document.getElementById('shootBtn').addEventListener('mouseup', () => keys[' '] = false);
document.getElementById('shootBtn').addEventListener('mouseleave', () => keys[' '] = false);

// Game control buttons
document.getElementById('startBtn').addEventListener('click', () => {
    if (!game.running) {
        game.running = true;
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    game.running = !game.running;
    if (game.running) {
        gameLoop();
    }
});

document.getElementById('restartBtn').addEventListener('click', initGame);

document.getElementById('difficulty').addEventListener('change', function() {
    game.difficulty = this.value;
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    player.x = canvas.width / 2 - 25;
});

// Initialize stats
updateStats();

// Draw initial screen
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.font = '40px Arial';
ctx.fillStyle = '#00ffff';
ctx.textAlign = 'center';
ctx.fillText('SPACE SHOOTER', canvas.width / 2, canvas.height / 2 - 50);
ctx.font = '20px Arial';
ctx.fillStyle = '#ffffff';
ctx.fillText('Click START GAME to begin', canvas.width / 2, canvas.height / 2 + 20);
