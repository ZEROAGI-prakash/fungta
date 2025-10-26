// Save/Load Progress System for GTA 2D
class SaveSystem {
    constructor() {
        this.saveKey = 'gta2d_save';
    }
    
    // Save player progress
    saveProgress(data) {
        const saveData = {
            playerName: data.playerName || 'Player',
            money: data.money || 500,
            kills: data.kills || 0,
            deaths: data.deaths || 0,
            ownedWeapons: data.ownedWeapons || ['pistol'],
            weapons: data.weapons || {},
            armor: data.armor || 0,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('✅ Progress saved:', saveData);
            return true;
        } catch (error) {
            console.error('❌ Save failed:', error);
            return false;
        }
    }
    
    // Load player progress
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                const data = JSON.parse(saved);
                console.log('✅ Progress loaded:', data);
                return data;
            }
            return null;
        } catch (error) {
            console.error('❌ Load failed:', error);
            return null;
        }
    }
    
    // Check if save exists
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    // Delete save
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Save deleted');
    }
    
    // Auto-save every 30 seconds
    enableAutoSave(getData) {
        setInterval(() => {
            const data = getData();
            if (data) {
                this.saveProgress(data);
                console.log('💾 Auto-saved');
            }
        }, 30000); // 30 seconds
    }
}

// Create global instance
const saveSystem = new SaveSystem();
