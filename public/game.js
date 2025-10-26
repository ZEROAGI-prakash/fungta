let socket;
let game;
let currentPlayerId;

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

document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    game = new Phaser.Game(config);
    connectToServer();
});

function connectToServer() {
    socket = io();

    socket.on('init', (data) => {
        currentPlayerId = data.id;
        players = data.players;
        npcs = data.npcs;
        cars = data.cars;
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
}

function preload() {
    this.load.image('player', 'data:image/svg+xml;base64,' + btoa('<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect fill="#3498db" width="20" height="32" x="6" y="0"/><circle fill="#f39c12" cx="16" cy="8" r="6"/><rect fill="#2c3e50" width="8" height="4" x="12" y="28"/></svg>'));
    
    this.load.image('car', 'data:image/svg+xml;base64,' + btoa('<svg width="48" height="32" xmlns="http://www.w3.org/2000/svg"><rect fill="#e74c3c" width="48" height="24" x="0" y="4" rx="4"/><rect fill="#34495e" width="12" height="16" x="8" y="8"/><rect fill="#34495e" width="12" height="16" x="28" y="8"/><circle fill="#2c3e50" cx="12" cy="28" r="4"/><circle fill="#2c3e50" cx="36" cy="28" r="4"/></svg>'));
    
    this.load.image('npc', 'data:image/svg+xml;base64,' + btoa('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect fill="#95a5a6" width="16" height="24" x="4" y="0"/><circle fill="#ecf0f1" cx="12" cy="6" r="5"/></svg>'));
    
    this.load.image('building', 'data:image/svg+xml;base64,' + btoa('<svg width="100" height="120" xmlns="http://www.w3.org/2000/svg"><rect fill="#7f8c8d" width="100" height="120"/><rect fill="#34495e" width="20" height="20" x="10" y="10"/><rect fill="#34495e" width="20" height="20" x="40" y="10"/><rect fill="#34495e" width="20" height="20" x="70" y="10"/><rect fill="#34495e" width="20" height="20" x="10" y="40"/><rect fill="#34495e" width="20" height="20" x="40" y="40"/><rect fill="#34495e" width="20" height="20" x="70" y="40"/><rect fill="#34495e" width="20" height="20" x="10" y="70"/><rect fill="#34495e" width="20" height="20" x="40" y="70"/><rect fill="#34495e" width="20" height="20" x="70" y="70"/></svg>'));
    
    this.load.image('bullet', 'data:image/svg+xml;base64,' + btoa('<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg"><circle fill="#ffd93d" cx="4" cy="4" r="4"/></svg>'));
}

function create() {
    this.cameras.main.setBounds(0, 0, 3000, 3000);
    this.physics.world.setBounds(0, 0, 3000, 3000);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillRect(0, 0, 3000, 3000);

    for (let i = 0; i < 3000; i += 100) {
        graphics.lineStyle(2, 0x556b2f, 0.3);
        graphics.beginPath();
        graphics.moveTo(i, 0);
        graphics.lineTo(i, 3000);
        graphics.strokePath();
        graphics.beginPath();
        graphics.moveTo(0, i);
        graphics.lineTo(3000, i);
        graphics.strokePath();
    }

    buildings = this.physics.add.staticGroup();
    const buildingPositions = [
        [200, 200], [400, 200], [600, 200],
        [200, 600], [400, 600], [600, 600],
        [1000, 400], [1200, 400], [1400, 400],
        [1000, 800], [1200, 800], [1400, 800],
        [2000, 500], [2200, 500], [2400, 500],
        [2000, 900], [2200, 900], [2400, 900],
        [800, 1500], [1000, 1500], [1200, 1500],
        [1600, 2000], [1800, 2000], [2000, 2000],
        [400, 2400], [600, 2400], [800, 2400]
    ];

    buildingPositions.forEach(pos => {
        const building = buildings.create(pos[0], pos[1], 'building');
        building.setScale(1);
        building.refreshBody();
    });

    carGroup = this.physics.add.group();
    Object.values(cars).forEach(carData => {
        const car = carGroup.create(carData.x, carData.y, 'car');
        car.carId = carData.id;
        car.setCollideWorldBounds(true);
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
        maxSize: 100
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
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };

    this.input.on('pointerdown', (pointer) => {
        shoot(this, pointer);
    });

    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    this.input.keyboard.on('keydown-E', () => {
        handleCarInteraction(this);
    });

    updatePlayerCount();
}

function update() {
    if (!player || !socket) return;

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
            otherPlayer.nameText = this.add.text(playerData.x, playerData.y - 30, 'Player', {
                fontSize: '12px',
                fill: '#fff',
                backgroundColor: '#000'
            }).setOrigin(0.5);
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
            otherPlayer.nameText.setPosition(otherPlayer.x, otherPlayer.y - 30);
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
}

function shoot(scene, pointer) {
    if (!player) return;

    const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const angle = Phaser.Math.Angle.Between(player.x, player.y, worldPoint.x, worldPoint.y);
    
    const bulletSpeed = 600;
    const velocityX = Math.cos(angle) * bulletSpeed;
    const velocityY = Math.sin(angle) * bulletSpeed;

    createMuzzleFlash(scene, player.x, player.y, angle);

    socket.emit('playerShoot', {
        x: player.x,
        y: player.y,
        rotation: angle,
        velocityX: velocityX,
        velocityY: velocityY
    });
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
    bullet.setVelocity(data.velocityX, data.velocityY);
    bullet.rotation = data.rotation;
    bullet.shooterId = data.playerId;

    if (bullet.shooterId === currentPlayerId) {
        scene.physics.add.overlap(bullet, player, (bullet, playerSprite) => {
            if (bullet.shooterId !== currentPlayerId) {
                socket.emit('bulletHit', {
                    targetType: 'player',
                    targetId: currentPlayerId
                });
                bullet.destroy();
            }
        });

        scene.physics.add.overlap(bullet, otherPlayers, (bullet, target) => {
            if (bullet.shooterId !== target.playerId) {
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
    const kills = document.getElementById('kills');
    const deaths = document.getElementById('deaths');

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

    if (kills) kills.textContent = playerData.kills || 0;
    if (deaths) deaths.textContent = playerData.deaths || 0;
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
