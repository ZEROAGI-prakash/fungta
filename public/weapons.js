// Client-side weapon configurations (must match server)
const WEAPONS = {
    pistol: {
        name: 'Pistol',
        damage: 20,
        fireRate: 500,
        maxAmmo: 100,
        magSize: 12,
        reloadTime: 1500,
        cost: 0,
        bulletSpeed: 600,
        spread: 0,
        automatic: false,
        icon: '🔫'
    },
    shotgun: {
        name: 'Shotgun',
        damage: 15,
        fireRate: 800,
        maxAmmo: 50,
        magSize: 8,
        reloadTime: 2000,
        cost: 500,
        bulletSpeed: 500,
        spread: 0.3,
        pellets: 5,
        automatic: false,
        icon: '🔫'
    },
    smg: {
        name: 'SMG',
        damage: 12,
        fireRate: 100,
        maxAmmo: 200,
        magSize: 30,
        reloadTime: 1800,
        cost: 800,
        bulletSpeed: 650,
        spread: 0.15,
        automatic: true,
        icon: '🔫'
    },
    rifle: {
        name: 'Assault Rifle',
        damage: 25,
        fireRate: 150,
        maxAmmo: 150,
        magSize: 30,
        reloadTime: 2200,
        cost: 1200,
        bulletSpeed: 700,
        spread: 0.08,
        automatic: true,
        icon: '🔫'
    },
    sniper: {
        name: 'Sniper Rifle',
        damage: 80,
        fireRate: 1500,
        maxAmmo: 40,
        magSize: 5,
        reloadTime: 3000,
        cost: 2000,
        bulletSpeed: 1000,
        spread: 0,
        automatic: false,
        icon: '🔫'
    }
};
