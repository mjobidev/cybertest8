// CyberGuard: Defend the Digital Realm - Main Game Logic


class CyberGuardGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'loading';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.badges = 0;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.player = null;
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.questionIndex = 0;
        this.currentQuestion = null;
        this.gamePaused = false;
        this.playerName = ''; // Add player name property
        
        // Progress tracking
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.defeatedEnemies = 0;
        this.enemyTypesDefeated = {
            phishing: 0,
            malware: 0,
            password: 0,
            social: 0
        };
        
        this.baseSpawnInterval = 1200;
        this.spawnInterval = this.baseSpawnInterval;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadingSequence();
        this.updateHeaderAvatar();
        // Check for name in URL parameter first, then load saved name
        this.initializeNameFromURL();
        setTimeout(() => {
            this.loadSavedName();
        }, 100);
    }

    loadSavedName() {
        // Load saved name from localStorage
        const savedName = localStorage.getItem('cyberdefender_username');
        console.log('Loading saved name:', savedName);
        if (savedName) {
            const nameInput = document.getElementById('playerNameInput');
            if (nameInput) {
                nameInput.value = savedName;
                this.playerName = savedName;
                // Make the field read-only if name is already saved
                nameInput.readOnly = true;
                nameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                nameInput.style.color = 'rgba(255, 255, 255, 0.7)';
                nameInput.style.cursor = 'not-allowed';
                console.log('Name loaded and field made read-only');
            }
        }
    }

    initializeNameFromURL() {
        // Check for name in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const nameFromURL = urlParams.get('name');
        
        if (nameFromURL) {
            const validation = this.validatePlayerName(nameFromURL);
            if (validation.valid) {
                this.playerName = validation.name;
                // Save the name to localStorage when it comes from URL parameter
                localStorage.setItem('cyberdefender_username', validation.name);
                console.log('Main game saved name from URL to localStorage:', validation.name);
                
                // Update the input field
                const nameInput = document.getElementById('playerNameInput');
                if (nameInput) {
                    nameInput.value = validation.name;
                    // Make the field read-only since it's pre-filled
                    nameInput.readOnly = true;
                    nameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                    nameInput.style.color = 'rgba(255, 255, 255, 0.7)';
                    nameInput.style.cursor = 'not-allowed';
                }
            }
        }
    }

    saveUserName(name) {
        // Save name to localStorage for persistence
        localStorage.setItem('cyberdefender_username', name);
        console.log('saveUserName called with name:', name);
        
        // Make the input field read-only after saving
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            nameInput.readOnly = true;
            nameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            nameInput.style.color = 'rgba(255, 255, 255, 0.7)';
            nameInput.style.cursor = 'not-allowed';
            console.log('Name field made read-only');
        }
    }

    // Function to reset user name (for admin purposes)
    resetUserName() {
        localStorage.removeItem('cyberdefender_username');
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            nameInput.value = '';
            nameInput.readOnly = false;
            nameInput.style.backgroundColor = '';
            nameInput.style.color = '';
            nameInput.style.cursor = '';
            nameInput.placeholder = 'Your name here...';
        }
        this.playerName = '';
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }

    updateHeaderAvatar() {
        // Update the Me section in header with selected avatar
        const savedAvatar = localStorage.getItem('cyberdefender_avatar');
        if (savedAvatar) {
            const avatar = JSON.parse(savedAvatar);
            
            // Update main header
            const meSection = document.getElementById('meSection');
            if (meSection) {
                const icon = meSection.querySelector('i');
                if (icon) {
                    icon.className = avatar.icon;
                    icon.style.color = avatar.color;
                }
            }
            
            // Update progress page header
            const meSectionProgress = document.getElementById('meSectionProgress');
            if (meSectionProgress) {
                const icon = meSectionProgress.querySelector('i');
                if (icon) {
                    icon.className = avatar.icon;
                    icon.style.color = avatar.color;
                }
            }
        }
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupEventListeners() {
        // Mouse/Touch controls
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));

        // UI Event Listeners
        document.getElementById('startMissionBtn').addEventListener('click', () => this.validateAndStartGame());
        document.getElementById('phishingSimBtn').addEventListener('click', () => this.validateAndStartPhishing());
        document.getElementById('finalCtaBtn').addEventListener('click', () => this.validateAndStartGame());
        document.getElementById('whyCybersecurityBtn').addEventListener('click', () => this.showWhyCybersecurity());
        document.getElementById('closeWhyModalBtn').addEventListener('click', () => this.hideWhyCybersecurity());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('tipsBtn').addEventListener('click', () => this.showTips());
        document.getElementById('closeTipsBtn').addEventListener('click', () => this.hideTips());
        document.getElementById('cyberPageBtn').addEventListener('click', () => this.openCyberPage());
        document.getElementById('certificateBtn').addEventListener('click', () => {
            const playerName = window.game.playerName || '';
            if (playerName) {
                showCertificateModal(playerName);
            } else {
                showCertificateNameModal();
            }
        });
        document.getElementById('downloadChecklistBtn').addEventListener('click', () => this.downloadChecklist());
        document.getElementById('continueBtn').addEventListener('click', () => this.continueGame());
        
        // Name input modal event listeners
        document.getElementById('confirmNameBtn').addEventListener('click', () => this.confirmName());
        document.getElementById('cancelNameBtn').addEventListener('click', () => this.hideNameModal());
        document.getElementById('modalPlayerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmName();
            }
        });
        
        // Name input listener - removed since name should be read-only after setting
        // const nameInput = document.getElementById('playerNameInput');
        // if (nameInput) {
        //     nameInput.addEventListener('input', (e) => {
        //         const name = e.target.value.trim();
        //         if (name) {
        //             this.playerName = name;
        //             this.saveUserName(name); // Save name as user types
        //         }
        //     });
        // }
        
        // Navigation event listeners
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.closest('.nav-link').dataset.section);
            });
        });

        // Rate Experience button
        const rateExperienceBtn = document.getElementById('rateExperienceBtn');
        if (rateExperienceBtn) {
            rateExperienceBtn.addEventListener('click', () => {
                window.location.href = 'rating-experience.html';
            });
        }
    }

    loadingSequence() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('landingPage').classList.remove('hidden');
                this.gameState = 'landing';
            }, 500);
        }, 3000);
    }

    validateAndStartGame() {
        console.log('validateAndStartGame called');
        const nameInput = document.getElementById('playerNameInput');
        console.log('nameInput element:', nameInput);
        console.log('nameInput value:', nameInput ? nameInput.value : 'null');
        const name = nameInput ? nameInput.value.trim() : '';
        console.log('Name from input:', name);
        console.log('Name length:', name.length);
        
        if (!name) {
            console.log('No name provided, showing modal');
            this.showNameModal('game');
            return;
        }
        
        const validation = this.validatePlayerName(name);
        console.log('Validation result:', validation);
        if (!validation.valid) {
            alert(validation.message);
            nameInput.focus();
            return;
        }
        
        this.playerName = validation.name;
        console.log('About to save userName:', validation.name);
        this.saveUserName(validation.name); // Save name to localStorage
        this.startGame();
    }

    validateAndStartPhishing() {
        const nameInput = document.getElementById('playerNameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showNameModal('phishing');
            return;
        }
        
        const validation = this.validatePlayerName(name);
        if (!validation.valid) {
            alert(validation.message);
            nameInput.focus();
            return;
        }
        
        
        this.playerName = validation.name;
        this.saveUserName(validation.name); // Save name to localStorage
        window.location.href = 'phishing-simulation.html?name=' + encodeURIComponent(validation.name);
    }


    

    showNameModal(gameType) {
        const modal = document.getElementById('nameInputModal');
        const modalInput = document.getElementById('modalPlayerNameInput');
        modal.classList.remove('hidden');
        modalInput.focus();
        modal.dataset.gameType = gameType;
    }

    hideNameModal() {
        const modal = document.getElementById('nameInputModal');
        const modalInput = document.getElementById('modalPlayerNameInput');
        modal.classList.add('hidden');
        modalInput.value = '';
    }

    confirmName() {
        console.log('confirmName called');
        const modalInput = document.getElementById('modalPlayerNameInput');
        const name = modalInput.value.trim();
        console.log('Modal name input:', name);
        const modal = document.getElementById('nameInputModal');
        const gameType = modal.dataset.gameType;
        console.log('Game type:', gameType);
        
        if (!name) {
            modalInput.focus();
            return;
        }
        
        this.playerName = name;
        document.getElementById('playerNameInput').value = name;
        this.saveUserName(name); // Save name to localStorage
        this.hideNameModal();
        
        if (gameType === 'game') {
            console.log('Starting game with name:', name);
            this.startGame();
        } else if (gameType === 'phishing') {
            window.location.href = 'phishing-simulation.html?name=' + encodeURIComponent(name);
        }
    }

    startGame() {
        // Hide all overlays/pages
        document.getElementById('landingPage').classList.add('hidden');
        document.getElementById('progressPage').classList.add('hidden');
        document.getElementById('gameOverlay').classList.add('hidden');
        document.getElementById('tipsModal').classList.add('hidden');
        document.getElementById('whyCybersecurityModal').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        // Show game
        document.getElementById('gameContainer').classList.remove('hidden');
        this.gameState = 'playing';
        this.gamePaused = false;
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100, this.playerName);
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.defeatedEnemies = 0;
        this.enemyTypesDefeated = { phishing: 0, malware: 0, password: 0, social: 0 };
        this.enemySpawnTimer = 0;
        this.spawnInterval = this.baseSpawnInterval;
        this.lastTime = 0;
        // Spawn initial enemies immediately
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.spawnEnemy(), i * 300);
        }
        this.gameLoop();
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing' || this.gamePaused) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }

        // Spawn enemies much more frequently
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer > this.spawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        // Update enemies
        for (let index = this.enemies.length - 1; index >= 0; index--) {
            const enemy = this.enemies[index];
            enemy.update(deltaTime);
            
            // Check if enemy hits player
            if (this.checkPlayerCollision(enemy)) {
                this.gameOver();
                return;
            }
            
            // Remove enemies that are off screen
            if (enemy.y > this.canvas.height + 50) {
                this.enemies.splice(index, 1);
                this.loseLife();
            }
        }

        // Update bullets
        for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
            const bullet = this.bullets[bulletIndex];
            bullet.update(deltaTime);
            
            // Remove bullets that are off screen
            if (bullet.y < -10) {
                this.bullets.splice(bulletIndex, 1);
                continue;
            }

            // Check bullet-enemy collisions
            for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                const enemy = this.enemies[enemyIndex];
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += enemy.points;
                    this.defeatedEnemies++;
                    this.enemyTypesDefeated[enemy.type]++;
                    this.createExplosion(enemy.x, enemy.y);
                    
                    // Show encouraging message
                    this.showEncouragingMessage('Great shot! You defeated the ' + enemy.name + '!');
                    
                    // Show question after defeating enemy
                    this.showQuestion();
                    break; // Exit enemy loop since bullet is destroyed
                }
            }
        }

        // Update particles
        for (let index = this.particles.length - 1; index >= 0; index--) {
            const particle = this.particles[index];
            particle.update(deltaTime);
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        }

        // Update HUD
        this.updateHUD();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw player
        if (this.player) {
            this.player.render(this.ctx);
        }

        // Draw enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));

        // Draw bullets
        this.bullets.forEach(bullet => bullet.render(this.ctx));

        // Draw particles
        this.particles.forEach(particle => particle.render(this.ctx));
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    spawnEnemy() {
        // Much more aggressive spawning
        const maxEnemies = 8 + Math.floor(this.level * 1.5);
        
        if (this.enemies.length < maxEnemies) {
            const baseSpeeds = {
                phishing: 0.7,
                malware: 0.9,
                password: 1.2,
                social: 0.6
            };
            const speedBoost = (this.level - 1) * 0.15;
            const enemyTypes = [
                { type: 'phishing', name: 'Phishing Bot', color: '#ff00ff', speed: baseSpeeds.phishing + speedBoost, points: 100, health: 1 },
                { type: 'malware', name: 'Malware Drone', color: '#ff6600', speed: baseSpeeds.malware + speedBoost, points: 150, health: 2 },
                { type: 'password', name: 'Password Cracker', color: '#9900ff', speed: baseSpeeds.password + speedBoost, points: 200, health: 1 },
                { type: 'social', name: 'Social Engineer', color: '#00ff00', speed: baseSpeeds.social + speedBoost, points: 300, health: 3 }
            ];

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const x = Math.random() * (this.canvas.width - 60) + 30;
            
            this.enemies.push(new Enemy(x, -50, enemyType));
            console.log('Spawned enemy:', enemyType.name, 'Total enemies:', this.enemies.length);
        }
    }

    handleMouseMove(e) {
        if (this.player && this.gameState === 'playing' && !this.gamePaused) {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = e.clientX - rect.left;
        }
    }

    handleClick(e) {
        if (this.player && this.gameState === 'playing' && !this.gamePaused) {
            this.shoot();
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.player && this.gameState === 'playing' && !this.gamePaused) {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.player.x = touch.clientX - rect.left;
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.player && this.gameState === 'playing' && !this.gamePaused) {
            this.shoot();
        }
    }

    shoot() {
        if (this.player) {
            this.bullets.push(new Bullet(this.player.x, this.player.y - 20));
        }
    }

    checkCollision(bullet, enemy) {
        const distance = Math.sqrt(
            Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
        );
        return distance < 30;
    }

    checkPlayerCollision(enemy) {
        if (!this.player) return false;
        const distance = Math.sqrt(
            Math.pow(this.player.x - enemy.x, 2) + Math.pow(this.player.y - enemy.y, 2)
        );
        return distance < 25;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverlay').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalBadges').textContent = this.badges;
        
        // Show game over message
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        if (gameOverTitle) {
            gameOverTitle.textContent = 'GAME OVER - You Were Hacked!';
        }
        if (gameOverMessage) {
            gameOverMessage.textContent = 'The robots have breached your defenses! Try again to protect the city from cyber threats!';
        }
    }

    showQuestion() {
        this.gamePaused = true;
        this.currentQuestion = this.getRandomQuestion();
        this.displayQuestion(this.currentQuestion);
    }

    displayQuestion(question) {
        document.getElementById('questionTitle').textContent = question.title;
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('difficultyBadge').textContent = question.difficulty;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectAnswer(index));
            optionsContainer.appendChild(optionElement);
        });
        
        document.getElementById('questionModal').classList.remove('hidden');
    }

    selectAnswer(selectedIndex) {
        const options = document.querySelectorAll('.option');
        const correctIndex = this.currentQuestion.correct;
        
        options.forEach((option, index) => {
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex && index !== correctIndex) {
                option.classList.add('incorrect');
            }
        });
        
        setTimeout(() => {
            this.showAnswer(selectedIndex === correctIndex);
        }, 1000);
    }

    showAnswer(isCorrect) {
        document.getElementById('questionModal').classList.add('hidden');
        
        const resultIcon = document.getElementById('resultIcon');
        const resultHeading = document.getElementById('resultHeading');
        const resultText = document.getElementById('resultText');
        const simpleExplanation = document.getElementById('simpleExplanation');
        const realWorldExample = document.getElementById('realWorldExample');
        
        this.totalQuestions++;
        
        if (isCorrect) {
            resultIcon.className = 'result-icon correct';
            resultIcon.innerHTML = '<i class="fas fa-check"></i>';
            resultHeading.textContent = 'Excellent!';
            resultHeading.style.color = '#00ff00';
            this.score += 500;
            this.badges++;
            this.correctAnswers++;
            
            // Show encouraging message
            this.showEncouragingMessage(this.getRandomEncouragement('correct'));
        } else {
            resultIcon.className = 'result-icon incorrect';
            resultIcon.innerHTML = '<i class="fas fa-times"></i>';
            resultHeading.textContent = 'Keep Learning!';
            resultHeading.style.color = '#ff6600';
            this.loseLife();
            
            // Show encouraging message for wrong answers
            this.showEncouragingMessage(this.getRandomEncouragement('incorrect'));
        }
        
        resultText.textContent = this.currentQuestion.explanation;
        simpleExplanation.textContent = this.currentQuestion.simpleExplanation;
        realWorldExample.textContent = this.currentQuestion.realWorldExample;
        
        document.getElementById('answerModal').classList.remove('hidden');
    }

    showEncouragingMessage(message) {
        // Create temporary encouraging message
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.95);
            color: #000;
            padding: 1.5rem 2.5rem;
            border-radius: 15px;
            font-family: 'Orbitron', monospace;
            font-size: 1.4rem;
            font-weight: bold;
            z-index: 1001;
            animation: fadeInOut 4s ease;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.7);
            border: 2px solid rgba(0, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            cursor: pointer;
            user-select: none;
        `;
        messageDiv.innerHTML = `
            <div>${message}</div>
            <div style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.8;">Click to dismiss</div>
        `;
        
        // Add click to dismiss functionality
        messageDiv.addEventListener('click', () => {
            document.body.removeChild(messageDiv);
        });
        
        // Add hover effect
        messageDiv.addEventListener('mouseenter', () => {
            messageDiv.style.transform = 'translate(-50%, -50%) scale(1.05)';
            messageDiv.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.9)';
        });
        
        messageDiv.addEventListener('mouseleave', () => {
            messageDiv.style.transform = 'translate(-50%, -50%) scale(1)';
            messageDiv.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.7)';
        });
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 4000);
    }

    getRandomEncouragement(type) {
        const playerName = this.playerName || 'Agent';
        
        const correctMessages = [
            `Amazing, ${playerName}! You're getting stronger!`,
            `Perfect, ${playerName}! Your cyber skills are growing!`,
            `Outstanding, ${playerName}! You're becoming a cyber hero!`,
            `Brilliant, ${playerName}! Keep up the great work!`,
            `Fantastic, ${playerName}! You're learning fast!`,
            `Excellent, ${playerName}! Your knowledge is expanding!`,
            `Superb, ${playerName}! You're protecting the digital world!`,
            `Incredible, ${playerName}! You're mastering cybersecurity!`
        ];
        
        const incorrectMessages = [
            `Don't worry, ${playerName}! Every mistake makes you wiser!`,
            `Keep trying, ${playerName}! Learning takes time!`,
            `You're getting closer, ${playerName}! Don't give up!`,
            `Great effort, ${playerName}! You'll get it next time!`,
            `Stay strong, ${playerName}! Every challenge makes you better!`,
            `Keep learning, ${playerName}! You're on the right track!`,
            `Don't be discouraged, ${playerName}! You're improving!`,
            `You've got this, ${playerName}! Keep pushing forward!`
        ];
        
        const messages = type === 'correct' ? correctMessages : incorrectMessages;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    continueGame() {
        document.getElementById('answerModal').classList.add('hidden');
        this.gamePaused = false;
        
        // Check if level should increase
        if (this.badges % 5 === 0) {
            this.level++;
            this.spawnInterval = Math.max(this.baseSpawnInterval - (this.level - 1) * 100, 250);
            this.showLevelUp();
        }
        
        // Restart the game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    showLevelUp() {
        // Create a temporary level up message
        const levelUpDiv = document.createElement('div');
        levelUpDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 0, 0.9);
            color: #000;
            padding: 2rem;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            font-weight: bold;
            z-index: 1001;
            animation: fadeInOut 3s ease;
        `;
        levelUpDiv.textContent = `LEVEL ${this.level}!`;
        document.body.appendChild(levelUpDiv);
        
        setTimeout(() => {
            document.body.removeChild(levelUpDiv);
        }, 3000);
    }

    togglePause() {
        if (this.gamePaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        this.gamePaused = true;
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    resumeGame() {
        this.gamePaused = false;
        document.getElementById('pauseMenu').classList.add('hidden');
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restartGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.badges = 0;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.questionIndex = 0;
        this.gamePaused = false;
        this.spawnInterval = this.baseSpawnInterval;
        
        document.getElementById('gameOverlay').classList.add('hidden');
        this.startGame();
    }

    showMainMenu() {
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('landingPage').classList.remove('hidden');
        this.gameState = 'landing';
    }

    showTips() {
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('tipsModal').classList.remove('hidden');
    }

    hideTips() {
        document.getElementById('tipsModal').classList.add('hidden');
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    showWhyCybersecurity() {
        document.getElementById('whyCybersecurityModal').classList.remove('hidden');
    }

    hideWhyCybersecurity() {
        document.getElementById('whyCybersecurityModal').classList.add('hidden');
    }

    handleNavigation(section) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Handle different sections
        switch(section) {
            case 'home':
                this.showLandingPage();
                break;
            case 'play':
                this.validateAndStartGame();
                break;
            case 'progress':
                this.showProgressPage();
                break;
            case 'resources':
                this.showTips();
                break;
            case 'me':
                // Navigate to character selection page
                window.location.href = 'character-select.html';
                break;
            default:
                this.showLandingPage();
        }
    }

    showLandingPage() {
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('progressPage').classList.add('hidden');
        document.getElementById('landingPage').classList.remove('hidden');
        this.gameState = 'landing';
        // Load saved name when returning to landing page
        console.log('Showing landing page, loading saved name...');
        this.loadSavedName();
    }

    showProgressPage() {
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('landingPage').classList.add('hidden');
        document.getElementById('progressPage').classList.remove('hidden');
        this.updateProgressPage();
    }

    updateProgressPage() {
        // Update metrics
        document.getElementById('progressLevel').textContent = this.level;
        document.getElementById('progressDefeated').textContent = this.defeatedEnemies;
        document.getElementById('progressAccuracy').textContent = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) + '%' : '0%';
        document.getElementById('progressBadges').textContent = this.badges;
        
        // Update progress bars
        const levelProgress = (this.level / 10) * 100;
        document.getElementById('levelProgressBar').style.width = Math.min(levelProgress, 100) + '%';
        document.getElementById('levelProgressText').textContent = this.level + '/10';
        
        const knowledgeProgress = Math.min((this.score / 1000) * 100, 100);
        document.getElementById('knowledgeProgressBar').style.width = knowledgeProgress + '%';
        document.getElementById('knowledgeProgressText').textContent = this.score;
        
        const accuracyProgress = this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
        document.getElementById('accuracyProgressBar').style.width = accuracyProgress + '%';
        document.getElementById('accuracyProgressText').textContent = Math.round(accuracyProgress) + '%';
        
        // Update summary
        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        document.getElementById('totalQuestions').textContent = this.totalQuestions;
        
        // Update badges
        this.updateBadges();
    }

    updateBadges() {
        // Cyber Rookie - Answer 5 questions correctly
        if (this.correctAnswers >= 5) {
            document.getElementById('badge-cyber-rookie').classList.add('earned');
        }
        
        // Cyber Expert - Answer 15 questions correctly
        if (this.correctAnswers >= 15) {
            document.getElementById('badge-cyber-expert').classList.add('earned');
        }
        
        // Phishing Hunter - Defeat 5 phishing bots
        if (this.enemyTypesDefeated.phishing >= 5) {
            document.getElementById('badge-phishing-hunter').classList.add('earned');
        }
        
        // Malware Slayer - Defeat 5 malware drones
        if (this.enemyTypesDefeated.malware >= 5) {
            document.getElementById('badge-malware-slayer').classList.add('earned');
        }
        
        // Password Guardian - Defeat 5 password crackers
        if (this.enemyTypesDefeated.password >= 5) {
            document.getElementById('badge-password-guardian').classList.add('earned');
        }
        
        // Cyber Hero - Reach level 10
        if (this.level >= 10) {
            document.getElementById('badge-cyber-hero').classList.add('earned');
        }
    }

    openCyberPage() {
        window.open('https://careers.thameswater.co.uk/our-roles/digital/', '_blank');
    }

    generateCertificate() {
        const certificate = `
            CYBERGUARD CERTIFICATE OF COMPLETION
            
            This certifies that the player has successfully completed
            the CyberGuard cybersecurity awareness training game.
            
            Final Score: ${this.score}
            Levels Completed: ${this.level}
            Badges Earned: ${this.badges}
            
            Date: ${new Date().toLocaleDateString()}
            
            Congratulations on becoming a Cyber Hero!
        `;
        
        const blob = new Blob([certificate], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cyberguard-certificate.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadChecklist() {
        const checklist = `
            CYBERGUARD SECURITY CHECKLIST
            
            PASSWORD SECURITY:
            □ Use strong, unique passwords for each account
            □ Enable Multi-Factor Authentication (MFA) wherever possible
            □ Never share passwords via email or text
            □ Use a password manager for secure storage
            
            EMAIL SECURITY:
            □ Be suspicious of urgent requests for money or information
            □ Check sender email addresses carefully
            □ Don't click links in suspicious emails
            □ Report phishing attempts to your IT department
            
            DEVICE SECURITY:
            □ Keep software and apps updated
            □ Use antivirus software
            □ Lock your devices with PIN or biometrics
            □ Backup important data regularly
            
            SOCIAL ENGINEERING:
            □ Verify caller identity before sharing information
            □ Be cautious of unsolicited requests
            □ Don't trust caller ID - it can be spoofed
            □ When in doubt, hang up and call back using a known number
        `;
        
        const blob = new Blob([checklist], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cyberguard-checklist.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('badges').textContent = this.badges;
    }

    getRandomQuestion() {
        const questions = [
            {
                title: "Multi-Factor Authentication",
                text: "You receive an email asking you to click a link to verify your account. The email looks official but you're not sure. What should you do?",
                options: [
                    "Click the link immediately to verify your account",
                    "Forward the email to your IT department and don't click the link",
                    "Reply to the email asking for more information",
                    "Ignore the email completely"
                ],
                correct: 1,
                explanation: "Forwarding suspicious emails to IT is the correct action. Never click links in unsolicited emails, even if they look official. IT can investigate and determine if it's legitimate.",
                simpleExplanation: "If you're not sure about an email, ask IT for help. Don't click links you don't trust.",
                realWorldExample: "A company employee received an email that looked like it was from their bank asking to verify their account. Instead of clicking the link, they forwarded it to IT who discovered it was a phishing attempt.",
                difficulty: "Easy"
            },
            {
                title: "Password Security",
                text: "Your coworker asks you to share your work password so they can access a file while you're on vacation. What should you do?",
                options: [
                    "Share your password - they're a trusted coworker",
                    "Refuse and suggest they contact IT for proper access",
                    "Share your password but change it when you return",
                    "Create a temporary password for them"
                ],
                correct: 1,
                explanation: "Never share passwords, even with trusted coworkers. Each person should have their own account and proper access permissions. Contact IT to set up appropriate access.",
                simpleExplanation: "Passwords are like your personal key - don't give them to anyone else, even friends.",
                realWorldExample: "A company had a data breach because an employee shared their password with a coworker. The coworker's computer was later infected with malware, giving hackers access to sensitive data.",
                difficulty: "Easy"
            },
            {
                title: "Phishing Detection",
                text: "You receive an email from 'support@microsft.com' (note the typo) saying your account has been suspended and you need to click a link to restore access. What should you do?",
                options: [
                    "Click the link immediately to restore your account",
                    "Reply to the email asking for more details",
                    "Delete the email and report it as phishing",
                    "Forward the email to all your coworkers to warn them"
                ],
                correct: 2,
                explanation: "This is a classic phishing attempt. The typo in 'microsft.com' is a red flag, and legitimate companies don't suspend accounts without warning. Delete and report phishing emails.",
                simpleExplanation: "Look for spelling mistakes in emails - real companies don't make these errors.",
                realWorldExample: "Microsoft receives thousands of phishing reports daily. They never ask users to click links in emails to restore accounts.",
                difficulty: "Medium"
            },
            {
                title: "Social Engineering",
                text: "Someone calls claiming to be from IT support and asks for your password to fix a computer issue. What should you do?",
                options: [
                    "Give them your password - they're from IT",
                    "Ask for their employee ID and call them back using the official IT number",
                    "Give them a fake password to test them",
                    "Hang up immediately without saying anything"
                ],
                correct: 1,
                explanation: "Always verify the identity of callers, even if they claim to be from IT. Ask for their ID and call back using a known official number. Real IT staff will understand this security practice.",
                simpleExplanation: "If someone calls asking for your password, ask for their name and call them back using a number you know is real.",
                realWorldExample: "A scammer called employees claiming to be from IT support. Several employees gave their passwords, leading to unauthorized access to company systems.",
                difficulty: "Medium"
            },
            {
                title: "Self-Service Password Reset",
                text: "You've forgotten your work password. What's the safest way to reset it?",
                options: [
                    "Ask a coworker to reset it for you",
                    "Use the company's official self-service password reset portal",
                    "Call IT and give them your old password over the phone",
                    "Create a new account with a different email"
                ],
                correct: 1,
                explanation: "Use the company's official self-service password reset system. This ensures proper verification and security. Never share passwords over the phone or ask coworkers for help with password resets.",
                simpleExplanation: "Use the official password reset system - it's the safest way to get back into your account.",
                realWorldExample: "Most companies have secure self-service password reset systems that verify your identity through multiple factors before allowing a password change.",
                difficulty: "Easy"
            },
            {
                title: "Scam Messages",
                text: "You receive a text message saying you've won a $1000 gift card and need to click a link to claim it. What should you do?",
                options: [
                    "Click the link to claim your prize",
                    "Reply to the text asking for more information",
                    "Delete the message - it's likely a scam",
                    "Forward the message to friends to see if they got it too"
                ],
                correct: 2,
                explanation: "If something sounds too good to be true, it probably is. Legitimate companies don't send unsolicited prize notifications via text. Delete scam messages without responding.",
                simpleExplanation: "If you didn't enter a contest, you probably didn't win anything. Delete messages that promise free money.",
                realWorldExample: "Scammers send millions of fake prize notifications daily. They use these to steal personal information or install malware on devices.",
                difficulty: "Easy"
            }
        ];
        
        return questions[Math.floor(Math.random() * questions.length)];
    }

    validatePlayerName(name) {
        // Remove extra spaces and trim
        name = name.trim().replace(/\s+/g, ' ');
        
        // Check if name is too short or too long
        if (name.length < 2 || name.length > 20) {
            return { valid: false, message: "Name must be between 2 and 20 characters." };
        }
        
        // Check if name contains only letters, spaces, and hyphens
        if (!/^[a-zA-Z\s\-]+$/.test(name)) {
            return { valid: false, message: "Name can only contain letters, spaces, and hyphens." };
        }
        
        // Check for offensive words (basic list)
        const offensiveWords = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'test', 'admin', 'user', 'guest', 'anonymous'];
        const lowerName = name.toLowerCase();
        for (const word of offensiveWords) {
            if (lowerName.includes(word)) {
                return { valid: false, message: "Please enter a real name without offensive language." };
            }
        }
        
        // Check if name looks like a real name (at least one letter)
        if (!/[a-zA-Z]/.test(name)) {
            return { valid: false, message: "Please enter a real name." };
        }
        
        return { valid: true, name: name };
    }
}

// Game Classes
class Player {
    constructor(x, y, name = 'Agent') {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.name = name;
    }

    update(deltaTime) {
        // Keep player within canvas bounds
        this.x = Math.max(this.width / 2, Math.min(this.x, window.innerWidth - this.width / 2));
    }

    render(ctx) {
        // Draw cyber agent (person character)
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        
        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillRect(this.x - 6, this.y - 7, 12, 15);
        
        // Arms
        ctx.fillRect(this.x - 12, this.y - 5, 6, 10);
        ctx.fillRect(this.x + 6, this.y - 5, 6, 10);
        
        // Legs
        ctx.fillRect(this.x - 8, this.y + 8, 6, 8);
        ctx.fillRect(this.x + 2, this.y + 8, 6, 8);
        
        // Eyes (glowing)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x - 3, this.y - 18, 2, 2);
        ctx.fillRect(this.x + 1, this.y - 18, 2, 2);
        
        // Cyber armor details
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y - 7);
        ctx.lineTo(this.x + 6, this.y - 7);
        ctx.moveTo(this.x - 6, this.y + 8);
        ctx.lineTo(this.x + 6, this.y + 8);
        ctx.stroke();
        
        // Shield effect
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Label with player name
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 5;
        ctx.fillText(this.name, this.x, this.y - 30);
        
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type.type;
        this.name = type.name;
        this.color = type.color;
        this.speed = type.speed;
        this.points = type.points;
        this.health = type.health;
        this.width = 40;
        this.height = 40;
        this.animationFrame = 0;
    }

    update(deltaTime) {
        // Increase speed based on level
        const levelSpeedMultiplier = 1 + (window.game.level * 0.2);
        
        // Move toward player if player exists
        if (window.game.player) {
            const dx = window.game.player.x - this.x;
            const dy = window.game.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Move toward player with some randomness
                const moveSpeed = this.speed * levelSpeedMultiplier;
                this.x += (dx / distance) * moveSpeed * 0.3; // Horizontal movement
                this.y += moveSpeed; // Vertical movement (faster)
            } else {
                this.y += moveSpeed;
            }
        } else {
            this.y += this.speed * levelSpeedMultiplier;
        }
        
        this.animationFrame += 0.1;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        // Draw enemy based on type
        switch(this.type) {
            case 'phishing':
                this.drawPhishingBot(ctx);
                break;
            case 'malware':
                this.drawMalwareDrone(ctx);
                break;
            case 'password':
                this.drawPasswordCracker(ctx);
                break;
            case 'social':
                this.drawSocialEngineer(ctx);
                break;
        }
        
        ctx.shadowBlur = 0;
    }

    drawPhishingBot(ctx) {
        // Draw advanced phishing robot
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Robot head
        ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
        
        // Robot eyes (scanning)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 8, this.y - 8, 4, 4);
        ctx.fillRect(this.x + 4, this.y - 8, 4, 4);
        
        // Email symbol on chest
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 8, this.y + 2, 16, 8);
        ctx.fillRect(this.x - 4, this.y + 4, 8, 4);
        
        // Robot arms
        ctx.fillRect(this.x - 18, this.y - 5, 6, 10);
        ctx.fillRect(this.x + 12, this.y - 5, 6, 10);
        
        // Scanning antenna
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 12);
        ctx.lineTo(this.x, this.y - 20);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = this.color;
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fillText('PHISHING', this.x, this.y - 30);
        
        ctx.shadowBlur = 0;
    }

    drawMalwareDrone(ctx) {
        // Draw advanced malware robot drone
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Robot body
        ctx.fillRect(this.x - 10, this.y - 8, 20, 16);
        
        // Robot head
        ctx.fillRect(this.x - 8, this.y - 16, 16, 12);
        
        // Robot eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 6, this.y - 14, 3, 3);
        ctx.fillRect(this.x + 3, this.y - 14, 3, 3);
        
        // Virus symbol on chest
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 4, this.y - 4, 8, 8);
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        
        // Rotating propellers (animated)
        const propAngle = this.animationFrame * 4;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        
        // Left propeller
        ctx.save();
        ctx.translate(this.x - 15, this.y);
        ctx.rotate(propAngle);
        ctx.beginPath();
        ctx.moveTo(-1, -10);
        ctx.lineTo(1, 10);
        ctx.stroke();
        ctx.restore();
        
        // Right propeller
        ctx.save();
        ctx.translate(this.x + 15, this.y);
        ctx.rotate(-propAngle);
        ctx.beginPath();
        ctx.moveTo(-1, -10);
        ctx.lineTo(1, 10);
        ctx.stroke();
        ctx.restore();
        
        // Robot arms
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 16, this.y - 3, 6, 6);
        ctx.fillRect(this.x + 10, this.y - 3, 6, 6);
        
        // Label
        ctx.fillStyle = this.color;
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fillText('MALWARE', this.x, this.y - 30);
        
        ctx.shadowBlur = 0;
    }

    drawPasswordCracker(ctx) {
        // Draw advanced password cracker robot
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Robot body
        ctx.fillRect(this.x - 12, this.y - 10, 24, 20);
        
        // Robot head
        ctx.fillRect(this.x - 10, this.y - 20, 20, 14);
        
        // Robot eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 7, this.y - 18, 4, 4);
        ctx.fillRect(this.x + 3, this.y - 18, 4, 4);
        
        // Key symbol on chest
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 8, this.y - 4, 16, 8);
        ctx.fillRect(this.x - 4, this.y - 8, 8, 8);
        
        // Robot arms with tools
        ctx.fillRect(this.x - 18, this.y - 5, 6, 10);
        ctx.fillRect(this.x + 12, this.y - 5, 6, 10);
        
        // Cracking tools
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 18, this.y - 5);
        ctx.lineTo(this.x - 22, this.y - 8);
        ctx.moveTo(this.x + 12, this.y - 5);
        ctx.lineTo(this.x + 16, this.y - 8);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = this.color;
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fillText('CRACKER', this.x, this.y - 30);
        
        ctx.shadowBlur = 0;
    }

    drawSocialEngineer(ctx) {
        // Draw advanced social engineer robot
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Robot body
        ctx.fillRect(this.x - 10, this.y - 8, 20, 16);
        
        // Robot head
        ctx.fillRect(this.x - 8, this.y - 18, 16, 14);
        
        // Robot eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 5, this.y - 16, 3, 3);
        ctx.fillRect(this.x + 2, this.y - 16, 3, 3);
        
        // Manipulation symbol on chest
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 6, this.y - 2, 12, 6);
        ctx.fillRect(this.x - 3, this.y - 5, 6, 6);
        
        // Robot arms
        ctx.fillRect(this.x - 16, this.y - 3, 6, 6);
        ctx.fillRect(this.x + 10, this.y - 3, 6, 6);
        
        // Communication antenna
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 18);
        ctx.lineTo(this.x, this.y - 25);
        ctx.lineTo(this.x + 3, this.y - 25);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = this.color;
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fillText('SOCIAL', this.x, this.y - 30);
        
        ctx.shadowBlur = 0;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 8;
        this.width = 4;
        this.height = 10;
    }

    update(deltaTime) {
        this.y -= this.speed;
    }

    render(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x - 2, this.y, 4, 10);
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1;
        this.decay = 0.02;
        this.color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    render(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.globalAlpha = 1;
    }
}

// Add CSS animation for level up
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

// Add this at the top if not present:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

// Certificate logic
function showCertificateNameModal() {
  const playerName = window.game.playerName || '';
  document.getElementById('certificateNameInput').value = playerName;
  document.getElementById('certificateNameModal').classList.remove('hidden');
}

function showCertificateModal(playerName) {
  document.getElementById('certificatePlayerName').textContent = playerName;
  document.getElementById('certificateYear').textContent = new Date().getFullYear();
  // Update export area
  document.getElementById('certificateExportPlayerName').textContent = playerName;
  document.getElementById('certificateExportYear').textContent = new Date().getFullYear();
  document.getElementById('certificateModal').classList.remove('hidden');
}

function hideCertificateModals() {
  document.getElementById('certificateNameModal').classList.add('hidden');
  document.getElementById('certificateModal').classList.add('hidden');
}

// Event listeners
const certBtn = document.getElementById('certificateBtn');
if (certBtn) {
  certBtn.addEventListener('click', () => {
    const playerName = window.game.playerName || '';
    if (playerName) {
      showCertificateModal(playerName);
    } else {
      showCertificateNameModal();
    }
  });
}

document.getElementById('certificateNameSubmit').onclick = function() {
  const name = document.getElementById('certificateNameInput').value.trim();
  if (name) {
    window.game.playerName = name;
    document.getElementById('playerNameInput').value = name;
    document.getElementById('certificateNameModal').classList.add('hidden');
    showCertificateModal(name);
  } else {
    document.getElementById('certificateNameInput').focus();
  }
};
document.getElementById('closeCertificateBtn').onclick = hideCertificateModals;

// PDF download uses export area
function downloadCertificatePDF() {
  const exportArea = document.getElementById('certificateExportArea');
  exportArea.style.display = 'block';
  window.scrollTo(0, 0);
  const opt = {
    margin: 0,
    filename: 'CyberDefender-Certificate.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(exportArea).save().then(() => {
    exportArea.style.display = 'none';
  });
}
document.getElementById('downloadCertificateBtn').onclick = downloadCertificatePDF;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberGuardGame();
}); 