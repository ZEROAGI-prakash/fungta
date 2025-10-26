// Mini-map system for GTA 2D
class MiniMap {
    constructor(scene) {
        this.scene = scene;
        this.size = 200;
        this.x = window.innerWidth - this.size - 20;
        this.y = 20;
        this.scale = 3000 / this.size; // World size / minimap size
        this.graphics = null;
        this.container = null;
        this.init();
    }
    
    init() {
        // Create container for minimap
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, this.size, this.size, 0x000000, 0.7);
        bg.setOrigin(0, 0);
        this.container.add(bg);
        
        // Border
        const border = this.scene.add.rectangle(0, 0, this.size, this.size);
        border.setStrokeStyle(3, 0x4ecdc4);
        border.setOrigin(0, 0);
        this.container.add(border);
        
        // Create graphics for dynamic elements
        this.graphics = this.scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(1001);
        
        // Title
        const title = this.scene.add.text(this.size / 2, -15, 'MAP', {
            fontSize: '14px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#4ecdc4'
        });
        title.setOrigin(0.5, 0);
        this.container.add(title);
    }
    
    worldToMinimap(worldX, worldY) {
        return {
            x: this.x + (worldX / this.scale),
            y: this.y + (worldY / this.scale)
        };
    }
    
    update(player, players, npcs, cars, buildings) {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        // Draw buildings
        if (buildings && buildings.getChildren) {
            this.graphics.fillStyle(0x64748b, 0.8);
            buildings.getChildren().forEach(building => {
                const pos = this.worldToMinimap(building.x, building.y);
                this.graphics.fillRect(pos.x - 2, pos.y - 2, 4, 4);
            });
        }
        
        // Draw cars
        if (cars) {
            this.graphics.fillStyle(0xfbbf24, 0.9);
            Object.values(cars).forEach(car => {
                const pos = this.worldToMinimap(car.x, car.y);
                this.graphics.fillRect(pos.x - 1.5, pos.y - 1.5, 3, 3);
            });
        }
        
        // Draw NPCs
        if (npcs) {
            this.graphics.fillStyle(0xff6b6b, 0.7);
            Object.values(npcs).forEach(npc => {
                const pos = this.worldToMinimap(npc.x, npc.y);
                this.graphics.fillCircle(pos.x, pos.y, 2);
            });
        }
        
        // Draw other players
        if (players) {
            this.graphics.fillStyle(0xffd93d, 0.9);
            Object.values(players).forEach(p => {
                if (p.id !== player.playerId) {
                    const pos = this.worldToMinimap(p.x, p.y);
                    this.graphics.fillCircle(pos.x, pos.y, 2.5);
                }
            });
        }
        
        // Draw player (always on top)
        if (player) {
            const playerPos = this.worldToMinimap(player.x, player.y);
            
            // Player triangle (direction indicator)
            this.graphics.fillStyle(0x4ecdc4, 1);
            this.graphics.fillTriangle(
                playerPos.x, playerPos.y - 4,
                playerPos.x - 3, playerPos.y + 3,
                playerPos.x + 3, playerPos.y + 3
            );
            
            // Rotate based on player rotation
            // Note: Implement rotation if needed
        }
    }
    
    setVisible(visible) {
        if (this.container) {
            this.container.setVisible(visible);
        }
        if (this.graphics) {
            this.graphics.setVisible(visible);
        }
    }
    
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
