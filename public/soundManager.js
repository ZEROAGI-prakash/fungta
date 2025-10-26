// Sound Manager for GTA 2D
class SoundManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.enabled = true;
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    // Generate gun shot sound
    playGunshot(weaponType = 'pistol') {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Different sounds for different weapons
        const weaponConfig = {
            pistol: { freq: 200, decay: 0.1, volume: 0.3 },
            shotgun: { freq: 150, decay: 0.2, volume: 0.5 },
            smg: { freq: 250, decay: 0.05, volume: 0.2 },
            rifle: { freq: 220, decay: 0.08, volume: 0.35 },
            sniper: { freq: 180, decay: 0.15, volume: 0.6 }
        };
        
        const config = weaponConfig[weaponType] || weaponConfig.pistol;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(config.freq, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + config.decay);
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        gainNode.gain.setValueAtTime(config.volume * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.decay);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + config.decay);
    }
    
    // Generate explosion sound
    playExplosion() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Create explosion using noise
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        
        gainNode.gain.setValueAtTime(0.7 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.5);
    }
    
    // Generate car engine sound
    playCarEngine() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, now);
        oscillator.frequency.linearRampToValueAtTime(120, now + 0.3);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }
    
    // Play reload sound
    playReload() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Click sound
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.frequency.value = 800;
        gain1.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.05);
        
        // Slide sound
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(400, now + 0.1);
        osc2.frequency.linearRampToValueAtTime(200, now + 0.3);
        
        gain2.gain.setValueAtTime(0.15 * this.masterVolume, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.3);
    }
    
    // Play hit sound
    playHit() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
    
    // Play purchase sound
    playPurchase() {
        if (!this.enabled || !this.audioContext) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        [440, 554, 659].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15 * this.masterVolume, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.15);
        });
    }
    
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Create global instance
const soundManager = new SoundManager();
