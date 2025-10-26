let socket;
let game;
let currentPlayerId;
let playerName = 'Player';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'gameContainer',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#2d5016'
};

let players = {};
let npcs = {};
let cars = {};
let bullets;
let cursors;
let wasd;
let player;
let otherPlayers;
let npcGroup;
let carGroup;
let mapLayer;
let buildings;
let playerInCar = false;
let currentCar = null;

// New weapon system variables
let currentWeapon = 'pistol';
let ownedWeapons = ['pistol'];
let weaponStats = {};
let lastShot = 0;
let isReloading = false;
let isShooting = false;
let playerMoney = 500;
let playerHealth = 100;
let playerArmor = 0;

// Mini-map
let miniMap = null;

// Chat variables
let chatOpen = false;

document.getElementById('startBtn').addEventListener('click', () => {
    // Get player name
    const nameInput = document.getElementById('playerNameInput');
    if (nameInput && nameInput.value.trim()) {
        playerName = nameInput.value.trim();
    }
    
    // Check for saved game
    const savedData = saveSystem.loadProgress();
    if (savedData) {
        playerName = savedData.playerName || playerName;
        playerMoney = savedData.money || 500;
        ownedWeapons = savedData.ownedWeapons || ['pistol'];
    }
    
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    game = new Phaser.Game(config);
    connectToServer();
    setupUI();
    
    // Enable auto-save every 30 seconds
    saveSystem.enableAutoSave(() => {
        if (players[currentPlayerId]) {
            return {
                playerName: playerName,
                money: playerMoney,
                kills: players[currentPlayerId].kills || 0,
                deaths: players[currentPlayerId].deaths || 0,
                ownedWeapons: ownedWeapons,
                weapons: weaponStats,
                armor: playerArmor
            };
        }
        return null;
    });
});

// Setup all UI event listeners
function setupUI() {
    // Chat system
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatOpen) {
            sendChat();
        }
    });
    
    chatSend.addEventListener('click', sendChat);
    
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 't' && !chatOpen && document.activeElement !== chatInput) {
            openChat();
            e.preventDefault();
        }
    });
    
    // Shop system
    document.getElementById('shopBtn').addEventListener('click', toggleShop);
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('shopModal').style.display = 'none';
    });
    
    // Shop items
    document.querySelectorAll('.shop-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const itemName = item.dataset.item;
            
            if (type === 'weapon') {
                socket.emit('shopPurchase', { type: 'weapon', item: itemName });
            } else if (type === 'ammo') {
                socket.emit('shopPurchase', { type: 'ammo', weapon: currentWeapon });
            } else {
                socket.emit('shopPurchase', { type: type });
            }
        });
    });
    
    // Weapon slots
    document.querySelectorAll('.weapon-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const weapon = slot.dataset.weapon;
            if (ownedWeapons.includes(weapon)) {
                switchWeapon(weapon);
            }
        });
    });
}

// Chat functions
function openChat() {
    chatOpen = true;
    const chatInput = document.getElementById('chatInput');
    chatInput.focus();
    chatInput.placeholder = 'Type message...';
}

function sendChat() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message && socket) {
        socket.emit('chatMessage', message);
        chatInput.value = '';
    }
    
    chatInput.blur();
    chatInput.placeholder = 'Press T to chat...';
    chatOpen = false;
}

function addChatMessage(data) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message' + (data.type === 'system' ? ' system' : '');
    msgDiv.textContent = data.type === 'system' ? 
        data.message : 
        `Player: ${data.message}`;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    while (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

// Shop functions
function toggleShop() {
    const modal = document.getElementById('shopModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        updateShopMoney();
    }
}

function updateShopMoney() {
    document.getElementById('shopMoney').textContent = '$' + playerMoney;
}

// Weapon functions
function switchWeapon(weaponName) {
    if (ownedWeapons.includes(weaponName)) {
        currentWeapon = weaponName;
        if (socket) socket.emit('switchWeapon', weaponName);
        updateWeaponUI();
        updateWeaponSlots();
    }
}

function reloadWeapon() {
    if (!isReloading && socket && weaponStats[currentWeapon]) {
        const weapon = weaponStats[currentWeapon];
        if (weapon.magAmmo < WEAPONS[currentWeapon].magSize && weapon.ammo > 0) {
            isReloading = true;
            socket.emit('reloadWeapon');
            
            // Play reload sound
            if (typeof soundManager !== 'undefined') {
                soundManager.playReload();
            }
            
            setTimeout(() => {
                isReloading = false;
            }, WEAPONS[currentWeapon].reloadTime);
        }
    }
}

function updateWeaponUI() {
    const weaponNameEl = document.getElementById('weaponName');
    const magAmmoEl = document.getElementById('magAmmo');
    const reserveAmmoEl = document.getElementById('reserveAmmo');
    
    if (weaponNameEl && WEAPONS[currentWeapon]) {
        weaponNameEl.textContent = WEAPONS[currentWeapon].icon + ' ' + WEAPONS[currentWeapon].name.toUpperCase();
    }
    
    if (weaponStats[currentWeapon]) {
        if (magAmmoEl) magAmmoEl.textContent = weaponStats[currentWeapon].magAmmo || 0;
        if (reserveAmmoEl) reserveAmmoEl.textContent = weaponStats[currentWeapon].ammo || 0;
    }
}

function updateWeaponSlots() {
    document.querySelectorAll('.weapon-slot').forEach(slot => {
        const weapon = slot.dataset.weapon;
        if (ownedWeapons.includes(weapon)) {
            slot.classList.remove('locked');
            if (weapon === currentWeapon) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        } else {
            slot.classList.add('locked');
            slot.classList.remove('active');
        }
    });
}

function updateMoneyDisplay() {
    const moneyEl = document.getElementById('money');
    if (moneyEl) {
        moneyEl.textContent = '$' + playerMoney;
    }
    updateShopMoney();
}

function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#6bcf7f' : '#ff6b6b'};
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

function connectToServer() {
    // Ensure we connect to the correct server URL
    const serverUrl = window.location.origin;
    socket = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 10000,
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('✅ Connected to server:', socket.id);
        showNotification('Connected to server!', 'success');
        updateConnectionStatus(true);
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        showNotification('Disconnected from server', 'error');
        updateConnectionStatus(false);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        showNotification('Connection failed. Retrying...', 'error');
        updateConnectionStatus(false);
    });

    socket.on('init', (data) => {
        currentPlayerId = data.id;
        players = data.players;
        npcs = data.npcs;
        cars = data.cars;
        
        // Send player name to server
        if (playerName) {
            socket.emit('updateName', playerName);
        }
        
        // Initialize player data
        if (players[currentPlayerId]) {
            const playerData = players[currentPlayerId];
            playerMoney = playerData.money || 500;
            playerHealth = playerData.health || 100;
            playerArmor = playerData.armor || 0;
            currentWeapon = playerData.currentWeapon || 'pistol';
            ownedWeapons = playerData.ownedWeapons || ['pistol'];
            weaponStats = playerData.weapons || { pistol: { ammo: 100, magAmmo: 12 } };
        }
        
        // Load chat history
        if (data.chatHistory) {
            data.chatHistory.forEach(msg => addChatMessage(msg));
        }
        
        updateWeaponUI();
        updateWeaponSlots();
        updateMoneyDisplay();
    });

    socket.on('gameState', (data) => {
        Object.keys(data.players).forEach(id => {
            players[id] = data.players[id];
        });
        
        Object.keys(data.cars).forEach(id => {
            if (cars[id]) {
                cars[id] = data.cars[id];
            }
        });
    });

    socket.on('playerJoined', (playerData) => {
        players[playerData.id] = playerData;
    });

    socket.on('playerLeft', (playerId) => {
        if (otherPlayers && otherPlayers.getChildren()) {
            otherPlayers.getChildren().forEach(p => {
                if (p.playerId === playerId) {
                    p.nameText.destroy();
                    p.destroy();
                }
            });
        }
        delete players[playerId];
        updatePlayerCount();
    });

    socket.on('playerShot', (data) => {
        if (game && game.scene.scenes[0]) {
            createBullet(game.scene.scenes[0], data);
        }
    });

    socket.on('playerKilled', (data) => {
        if (data.killedId === currentPlayerId) {
            if (player) {
                player.x = data.spawnX;
                player.y = data.spawnY;
                playerInCar = false;
                currentCar = null;
            }
        }
        if (game && game.scene.scenes[0]) {
            createExplosion(game.scene.scenes[0], data.spawnX, data.spawnY);
        }
    });

    socket.on('playerHit', (data) => {
        if (data.playerId === currentPlayerId) {
            updateHUD();
            if (game && game.scene.scenes[0] && player) {
                createHitEffect(game.scene.scenes[0], player.x, player.y);
                game.scene.scenes[0].cameras.main.shake(100, 0.005);
            }
        }
    });

    socket.on('npcKilled', (npcId) => {
        if (npcGroup && npcs[npcId]) {
            npcGroup.getChildren().forEach(npc => {
                if (npc.npcId === npcId) {
                    npc.destroy();
                }
            });
            delete npcs[npcId];
        }
    });

    socket.on('npcUpdate', (updatedNpcs) => {
        npcs = updatedNpcs;
    });

    socket.on('playerEnteredCar', (data) => {
        if (data.playerId === currentPlayerId) {
            playerInCar = true;
            currentCar = data.carId;
        }
    });

    socket.on('playerExitedCar', (data) => {
        if (data.playerId === currentPlayerId) {
            playerInCar = false;
            currentCar = null;
        }
    });

    socket.on('carDestroyed', (carId) => {
        if (carGroup && cars[carId]) {
            carGroup.getChildren().forEach(car => {
                if (car.carId === carId) {
                    createExplosion(game.scene.scenes[0], car.x, car.y);
                    car.destroy();
                }
            });
            delete cars[carId];
        }
        if (currentCar === carId) {
            playerInCar = false;
            currentCar = null;
        }
    });
    
    // New socket events for weapons, shop, and chat
    socket.on('chatMessage', (data) => {
        addChatMessage(data);
    });
    
    socket.on('weaponSwitched', (weaponName) => {
        currentWeapon = weaponName;
        updateWeaponUI();
        updateWeaponSlots();
    });
    
    socket.on('reloadComplete', (data) => {
        isReloading = false;
        if (weaponStats[data.weapon]) {
            weaponStats[data.weapon].magAmmo = data.magAmmo;
            weaponStats[data.weapon].ammo = data.ammo;
        }
        updateWeaponUI();
        showNotification('Reloaded!', 'success');
    });
    
    socket.on('outOfAmmo', () => {
        showNotification('Out of ammo! Press R to reload', 'error');
    });
    
    socket.on('purchaseSuccess', (data) => {
        if (data.item !== 'ammo' && data.item !== 'health' && data.item !== 'armor') {
            ownedWeapons.push(data.item);
            weaponStats[data.item] = {
                ammo: WEAPONS[data.item].maxAmmo,
                magAmmo: WEAPONS[data.item].magSize
            };
            updateWeaponSlots();
        }
        playerMoney = data.money;
        updateMoneyDisplay();
        showNotification('Purchase successful!', 'success');
        
        // Play purchase sound
        if (typeof soundManager !== 'undefined') {
            soundManager.playPurchase();
        }
        
        // Update weapon stats if ammo purchased
        if (data.item === 'ammo' && data.weapon && weaponStats[data.weapon]) {
            weaponStats[data.weapon].ammo = players[currentPlayerId].weapons[data.weapon].ammo;
            updateWeaponUI();
        }
    });
    
    socket.on('purchaseFailed', (reason) => {
        showNotification(reason, 'error');
    });
}

function preload() {
    this.load.image('player', 'assets/player.svg');
    this.load.image('car', 'assets/car.svg');
    this.load.image('car2', 'assets/car2.svg');
    this.load.image('car3', 'assets/car3.svg');
    this.load.image('npc', 'assets/npc.svg');
    this.load.image('building', 'assets/building.svg');
    this.load.image('building1', 'assets/building1.svg');
    this.load.image('building2', 'assets/building2.svg');
    this.load.image('building3', 'assets/building3.svg');
    this.load.image('bullet', 'assets/bullet.svg');
}

function create() {
    this.cameras.main.setBounds(0, 0, 3000, 3000);
    this.physics.world.setBounds(0, 0, 3000, 3000);

    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillRect(0, 0, 3000, 3000);

    graphics.fillStyle(0x4a4a4a, 1);
    for (let x = 0; x < 3000; x += 300) {
        graphics.fillRect(x, 0, 60, 3000);
    }
    for (let y = 0; y < 3000; y += 300) {
        graphics.fillRect(0, y, 3000, 60);
    }

    graphics.lineStyle(4, 0xffff00, 1);
    for (let x = 0; x < 3000; x += 300) {
        graphics.beginPath();
        graphics.moveTo(x + 30, 0);
        graphics.lineTo(x + 30, 3000);
        graphics.strokePath();
    }
    for (let y = 0; y < 3000; y += 300) {
        graphics.beginPath();
        graphics.moveTo(0, y + 30);
        graphics.lineTo(3000, y + 30);
        graphics.strokePath();
    }

    graphics.fillStyle(0x3d5a3d, 1);
    for (let x = 60; x < 3000; x += 300) {
        for (let y = 60; y < 3000; y += 300) {
            graphics.fillRect(x + 10, y + 10, 20, 20);
            graphics.fillRect(x + 210, y + 10, 20, 20);
            graphics.fillRect(x + 10, y + 210, 20, 20);
            graphics.fillRect(x + 210, y + 210, 20, 20);
        }
    }

    buildings = this.physics.add.staticGroup();
    
    const buildingLayout = [
        {x: 120, y: 120, type: 'building1'},
        {x: 420, y: 120, type: 'building2'},
        {x: 720, y: 120, type: 'building3'},
        {x: 1020, y: 120, type: 'building1'},
        {x: 1620, y: 120, type: 'building2'},
        {x: 2220, y: 120, type: 'building3'},
        {x: 2820, y: 120, type: 'building1'},
        
        {x: 120, y: 420, type: 'building2'},
        {x: 420, y: 420, type: 'building1'},
        {x: 1020, y: 420, type: 'building3'},
        {x: 1320, y: 420, type: 'building2'},
        {x: 1920, y: 420, type: 'building1'},
        {x: 2520, y: 420, type: 'building3'},
        
        {x: 120, y: 720, type: 'building3'},
        {x: 720, y: 720, type: 'building1'},
        {x: 1320, y: 720, type: 'building2'},
        {x: 1620, y: 720, type: 'building3'},
        {x: 2220, y: 720, type: 'building1'},
        {x: 2820, y: 720, type: 'building2'},
        
        {x: 420, y: 1020, type: 'building2'},
        {x: 720, y: 1020, type: 'building3'},
        {x: 1020, y: 1020, type: 'building1'},
        {x: 1620, y: 1020, type: 'building2'},
        {x: 2220, y: 1020, type: 'building3'},
        {x: 2520, y: 1020, type: 'building1'},
        
        {x: 120, y: 1320, type: 'building1'},
        {x: 720, y: 1320, type: 'building2'},
        {x: 1320, y: 1320, type: 'building3'},
        {x: 1920, y: 1320, type: 'building1'},
        {x: 2520, y: 1320, type: 'building2'},
        {x: 2820, y: 1320, type: 'building3'},
        
        {x: 420, y: 1620, type: 'building3'},
        {x: 1020, y: 1620, type: 'building1'},
        {x: 1620, y: 1620, type: 'building2'},
        {x: 2220, y: 1620, type: 'building3'},
        {x: 2820, y: 1620, type: 'building1'},
        
        {x: 120, y: 1920, type: 'building2'},
        {x: 420, y: 1920, type: 'building1'},
        {x: 1020, y: 1920, type: 'building3'},
        {x: 1620, y: 1920, type: 'building2'},
        {x: 2220, y: 1920, type: 'building1'},
        {x: 2520, y: 1920, type: 'building3'},
        
        {x: 720, y: 2220, type: 'building1'},
        {x: 1320, y: 2220, type: 'building2'},
        {x: 1920, y: 2220, type: 'building3'},
        {x: 2520, y: 2220, type: 'building1'},
        {x: 2820, y: 2220, type: 'building2'},
        
        {x: 120, y: 2520, type: 'building3'},
        {x: 420, y: 2520, type: 'building1'},
        {x: 1020, y: 2520, type: 'building2'},
        {x: 1620, y: 2520, type: 'building3'},
        {x: 2220, y: 2520, type: 'building1'},
        
        {x: 720, y: 2820, type: 'building2'},
        {x: 1320, y: 2820, type: 'building3'},
        {x: 1920, y: 2820, type: 'building1'},
        {x: 2520, y: 2820, type: 'building2'}
    ];
    
    buildingLayout.forEach(bld => {
        const building = buildings.create(bld.x, bld.y, bld.type);
        building.setScale(1);
        building.refreshBody();
    });

    carGroup = this.physics.add.group();
    const carTypes = ['car', 'car2', 'car3'];
    Object.values(cars).forEach(carData => {
        const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
        const car = carGroup.create(carData.x, carData.y, carType);
        car.carId = carData.id;
        car.setCollideWorldBounds(true);
        car.setScale(0.8);
    });

    npcGroup = this.physics.add.group();
    Object.values(npcs).forEach(npcData => {
        const npc = npcGroup.create(npcData.x, npcData.y, 'npc');
        npc.npcId = npcData.id;
        npc.setCollideWorldBounds(true);
    });

    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    otherPlayers = this.physics.add.group();

    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 500
    });

    this.physics.add.collider(player, buildings);
    this.physics.add.collider(player, carGroup);
    this.physics.add.collider(carGroup, buildings);
    this.physics.add.collider(npcGroup, buildings);

    cursors = this.input.keyboard.createCursorKeys();
    wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        R: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        B: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
        ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
        TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
        THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
        FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
        FIVE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
    };

    this.input.on('pointerdown', (pointer) => {
        if (!chatOpen) shoot(this, pointer);
    });
    
    this.input.on('pointerup', () => {
        isShooting = false;
    });

    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    // Initialize mini-map
    miniMap = new MiniMap(this);

    this.input.keyboard.on('keydown-E', () => {
        handleCarInteraction(this);
    });
    
    this.input.keyboard.on('keydown-R', () => {
        reloadWeapon();
    });
    
    this.input.keyboard.on('keydown-B', () => {
        toggleShop();
    });

    updatePlayerCount();
}

function update() {
    if (!player || !socket) return;
    
    // Weapon switching
    if (Phaser.Input.Keyboard.JustDown(wasd.ONE)) switchWeapon('pistol');
    if (Phaser.Input.Keyboard.JustDown(wasd.TWO)) switchWeapon('shotgun');
    if (Phaser.Input.Keyboard.JustDown(wasd.THREE)) switchWeapon('smg');
    if (Phaser.Input.Keyboard.JustDown(wasd.FOUR)) switchWeapon('rifle');
    if (Phaser.Input.Keyboard.JustDown(wasd.FIVE)) switchWeapon('sniper');

    const speed = playerInCar ? 300 : 200;
    const rotationSpeed = playerInCar ? 0.04 : 0.08;

    let velocityX = 0;
    let velocityY = 0;

    if (playerInCar && currentCar && cars[currentCar]) {
        const car = carGroup.getChildren().find(c => c.carId === currentCar);
        if (car) {
            if (wasd.W.isDown || cursors.up.isDown) {
                velocityX = Math.cos(car.rotation) * speed;
                velocityY = Math.sin(car.rotation) * speed;
            } else if (wasd.S.isDown || cursors.down.isDown) {
                velocityX = -Math.cos(car.rotation) * speed * 0.5;
                velocityY = -Math.sin(car.rotation) * speed * 0.5;
            }

            if (wasd.A.isDown || cursors.left.isDown) {
                car.rotation -= rotationSpeed;
            } else if (wasd.D.isDown || cursors.right.isDown) {
                car.rotation += rotationSpeed;
            }

            car.setVelocity(velocityX, velocityY);
            player.x = car.x;
            player.y = car.y;
            player.rotation = car.rotation;
            player.setVisible(false);

            socket.emit('carMove', {
                carId: currentCar,
                x: car.x,
                y: car.y,
                rotation: car.rotation,
                velocityX: velocityX,
                velocityY: velocityY
            });
        }
    } else {
        player.setVisible(true);

        if (wasd.W.isDown || cursors.up.isDown) {
            velocityY = -speed;
        } else if (wasd.S.isDown || cursors.down.isDown) {
            velocityY = speed;
        }

        if (wasd.A.isDown || cursors.left.isDown) {
            velocityX = -speed;
        } else if (wasd.D.isDown || cursors.right.isDown) {
            velocityX = speed;
        }

        player.setVelocity(velocityX, velocityY);

        const pointer = this.input.activePointer;
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, worldPoint.x, worldPoint.y);

        socket.emit('playerMove', {
            x: player.x,
            y: player.y,
            rotation: player.rotation,
            velocityX: velocityX,
            velocityY: velocityY
        });
    }

    Object.keys(players).forEach(id => {
        if (id === currentPlayerId) return;

        const playerData = players[id];
        let otherPlayer = otherPlayers.getChildren().find(p => p.playerId === id);

        if (!otherPlayer) {
            otherPlayer = otherPlayers.create(playerData.x, playerData.y, 'player');
            otherPlayer.playerId = id;
            const displayName = playerData.name || 'Player';
            otherPlayer.nameText = this.add.text(playerData.x, playerData.y - 30, displayName, {
                fontSize: '14px',
                fontWeight: 'bold',
                fill: '#ffd93d',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5);
        } else {
            // Update name if changed
            const displayName = playerData.name || 'Player';
            if (otherPlayer.nameText) {
                otherPlayer.nameText.setText(displayName);
            }
        }

        if (playerData.inCar) {
            otherPlayer.setVisible(false);
            otherPlayer.nameText.setVisible(false);
        } else {
            otherPlayer.setVisible(true);
            otherPlayer.nameText.setVisible(true);
            otherPlayer.x = Phaser.Math.Linear(otherPlayer.x, playerData.x, 0.2);
            otherPlayer.y = Phaser.Math.Linear(otherPlayer.y, playerData.y, 0.2);
            otherPlayer.rotation = playerData.rotation;
            otherPlayer.nameText.setPosition(otherPlayer.x, otherPlayer.y - 35);
        }
    });

    Object.keys(npcs).forEach(id => {
        const npcData = npcs[id];
        let npc = npcGroup.getChildren().find(n => n.npcId === id);

        if (npc) {
            npc.x = Phaser.Math.Linear(npc.x, npcData.x, 0.1);
            npc.y = Phaser.Math.Linear(npc.y, npcData.y, 0.1);
            npc.rotation = npcData.rotation;
        }
    });

    Object.keys(cars).forEach(id => {
        if (id === currentCar) return;

        const carData = cars[id];
        let car = carGroup.getChildren().find(c => c.carId === id);

        if (car) {
            car.x = Phaser.Math.Linear(car.x, carData.x, 0.2);
            car.y = Phaser.Math.Linear(car.y, carData.y, 0.2);
            car.rotation = carData.rotation;
        }
    });
    
    // Update mini-map
    if (miniMap) {
        miniMap.update(player, players, npcs, cars, buildings);
    }
}

function shoot(scene, pointer) {
    if (!player || !socket || !socket.connected || chatOpen) return;
    if (isReloading) return;
    
    const weapon = WEAPONS[currentWeapon];
    if (!weapon) return;
    
    const now = Date.now();
    if (now - lastShot < weapon.fireRate) return;
    
    // Check ammo
    if (!weaponStats[currentWeapon] || weaponStats[currentWeapon].magAmmo <= 0) {
        showNotification('Out of ammo! Press R to reload', 'error');
        return;
    }
    
    lastShot = now;
    isShooting = true;
    
    const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    let angle = Phaser.Math.Angle.Between(player.x, player.y, worldPoint.x, worldPoint.y);
    
    // Add spread for weapons
    if (weapon.spread > 0) {
        angle += (Math.random() - 0.5) * weapon.spread;
    }
    
    const bulletSpeed = weapon.bulletSpeed;
    const velocityX = Math.cos(angle) * bulletSpeed;
    const velocityY = Math.sin(angle) * bulletSpeed;

    createMuzzleFlash(scene, player.x, player.y, angle);
    
    // Play gunshot sound
    if (typeof soundManager !== 'undefined') {
        soundManager.playGunshot(currentWeapon);
    }

    socket.emit('playerShoot', {
        x: player.x,
        y: player.y,
        rotation: angle,
        velocityX: velocityX,
        velocityY: velocityY
    });
    
    // Decrease local ammo for immediate feedback
    weaponStats[currentWeapon].magAmmo--;
    updateWeaponUI();
    
    // Handle automatic weapons
    if (weapon.automatic && isShooting) {
        setTimeout(() => {
            if (isShooting) {
                shoot(scene, pointer);
            }
        }, weapon.fireRate);
    }
}

function createMuzzleFlash(scene, x, y, angle) {
    const offsetX = Math.cos(angle) * 25;
    const offsetY = Math.sin(angle) * 25;
    
    const flash = scene.add.circle(x + offsetX, y + offsetY, 8, 0xffff00, 1);
    scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 100,
        onComplete: () => flash.destroy()
    });
}

function createBullet(scene, data) {
    const bullet = bullets.create(data.x, data.y, 'bullet');
    
    if (!bullet) return;
    
    bullet.setVelocity(data.velocityX, data.velocityY);
    bullet.rotation = data.rotation;
    bullet.shooterId = data.playerId;

    if (bullet.shooterId === currentPlayerId) {
        scene.physics.add.overlap(bullet, player, (bullet, playerSprite) => {
            if (bullet.shooterId !== currentPlayerId) {
                // Play hit sound
                if (typeof soundManager !== 'undefined') {
                    soundManager.playHit();
                }
                socket.emit('bulletHit', {
                    targetType: 'player',
                    targetId: currentPlayerId
                });
                bullet.destroy();
            }
        });

        scene.physics.add.overlap(bullet, otherPlayers, (bullet, target) => {
            if (bullet.shooterId !== target.playerId) {
                // Play hit sound
                if (typeof soundManager !== 'undefined') {
                    soundManager.playHit();
                }
                socket.emit('bulletHit', {
                    targetType: 'player',
                    targetId: target.playerId
                });
                bullet.destroy();
            }
        });

        scene.physics.add.overlap(bullet, npcGroup, (bullet, target) => {
            socket.emit('bulletHit', {
                targetType: 'npc',
                targetId: target.npcId
            });
            bullet.destroy();
        });

        scene.physics.add.overlap(bullet, carGroup, (bullet, target) => {
            socket.emit('bulletHit', {
                targetType: 'car',
                targetId: target.carId
            });
            bullet.destroy();
        });

        scene.physics.add.overlap(bullet, buildings, (bullet) => {
            bullet.destroy();
        });
    }

    scene.time.delayedCall(2000, () => {
        if (bullet && bullet.active) {
            bullet.destroy();
        }
    });
}

function handleCarInteraction(scene) {
    if (playerInCar) {
        socket.emit('exitCar');
        const car = carGroup.getChildren().find(c => c.carId === currentCar);
        if (car) {
            player.x = car.x + 50;
            player.y = car.y;
        }
    } else {
        const nearestCar = findNearestCar();
        if (nearestCar && Phaser.Math.Distance.Between(player.x, player.y, nearestCar.x, nearestCar.y) < 60) {
            socket.emit('enterCar', nearestCar.carId);
            
            // Play car engine sound
            if (typeof soundManager !== 'undefined') {
                soundManager.playCarEngine();
            }
        }
    }
}

function findNearestCar() {
    let nearest = null;
    let minDistance = Infinity;

    carGroup.getChildren().forEach(car => {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, car.x, car.y);
        if (distance < minDistance && (!cars[car.carId] || !cars[car.carId].driver)) {
            minDistance = distance;
            nearest = car;
        }
    });

    return nearest;
}

function createExplosion(scene, x, y) {
    scene.cameras.main.shake(200, 0.01);

    const explosionCircle = scene.add.circle(x, y, 10, 0xff6600, 1);
    scene.tweens.add({
        targets: explosionCircle,
        radius: 60,
        alpha: 0,
        duration: 400,
        onComplete: () => explosionCircle.destroy()
    });

    const particles = scene.add.particles(x, y, 'bullet', {
        speed: { min: 100, max: 300 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        quantity: 30,
        blendMode: 'ADD',
        tint: [0xff6600, 0xff9900, 0xffcc00]
    });

    scene.time.delayedCall(1000, () => {
        particles.destroy();
    });
}

function createHitEffect(scene, x, y) {
    const hitParticles = scene.add.particles(x, y, 'bullet', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 300,
        quantity: 8,
        blendMode: 'ADD',
        tint: 0xff0000
    });

    scene.time.delayedCall(400, () => {
        hitParticles.destroy();
    });
}

function updateHUD() {
    if (!currentPlayerId || !players[currentPlayerId]) return;

    const playerData = players[currentPlayerId];
    const healthBar = document.getElementById('healthBar');
    const armorBar = document.getElementById('armorBar');
    const kills = document.getElementById('kills');
    const deaths = document.getElementById('deaths');
    const money = document.getElementById('money');

    if (healthBar) {
        healthBar.style.width = playerData.health + '%';
        if (playerData.health < 30) {
            healthBar.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
        } else if (playerData.health < 60) {
            healthBar.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
        } else {
            healthBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8787)';
        }
    }
    
    if (armorBar) {
        armorBar.style.width = (playerData.armor || 0) + '%';
    }

    if (kills) kills.textContent = playerData.kills || 0;
    if (deaths) deaths.textContent = playerData.deaths || 0;
    if (money) money.textContent = '$' + (playerData.money || 0);
    
    // Update local variables
    playerHealth = playerData.health;
    playerArmor = playerData.armor || 0;
    playerMoney = playerData.money || 0;
    
    // Update weapon stats
    if (playerData.weapons) {
        weaponStats = playerData.weapons;
        updateWeaponUI();
    }
    
    // Update player count
    const playerCountEl = document.getElementById('playerCount');
    if (playerCountEl) {
        const count = Object.keys(players).length;
        playerCountEl.textContent = `Players: ${count}`;
    }
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    if (connected) {
        statusEl.classList.add('connected');
        statusEl.classList.remove('disconnected');
        statusEl.querySelector('.status-text').textContent = 'Connected';
    } else {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusEl.querySelector('.status-text').textContent = 'Disconnected';
    }
}

function updatePlayerCount() {
    const count = Object.keys(players).length;
    const playerCount = document.getElementById('playerCount');
    if (playerCount) {
        playerCount.textContent = `Players: ${count}`;
    }
}

setInterval(() => {
    updateHUD();
    updatePlayerCount();
}, 100);
