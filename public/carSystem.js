// Enhanced Car System with 2-Player Support
class CarSystem {
    constructor() {
        this.cars = {};
        this.carCapacity = {
            car: 2,      // Standard car: 2 players
            car2: 2,     // Sedan: 2 players
            car3: 4      // SUV: 4 players
        };
    }
    
    // Car physics settings
    getCarPhysics(carType = 'car') {
        return {
            maxSpeed: 350,
            acceleration: 0.5,
            deceleration: 0.9,
            turnSpeed: 0.06,
            driftFactor: 0.95,
            brakePower: 0.85
        };
    }
    
    // Check if car has available seats
    hasAvailableSeats(carId, currentOccupants) {
        const car = this.cars[carId];
        if (!car) return false;
        
        const carType = car.type || 'car';
        const capacity = this.carCapacity[carType] || 2;
        return currentOccupants.length < capacity;
    }
    
    // Add player to car
    addPlayerToCar(carId, playerId, isDriver = false) {
        if (!this.cars[carId]) {
            this.cars[carId] = {
                driver: null,
                passengers: [],
                type: 'car'
            };
        }
        
        if (isDriver) {
            this.cars[carId].driver = playerId;
        } else {
            this.cars[carId].passengers.push(playerId);
        }
        
        return true;
    }
    
    // Remove player from car
    removePlayerFromCar(carId, playerId) {
        const car = this.cars[carId];
        if (!car) return false;
        
        if (car.driver === playerId) {
            car.driver = null;
            // Promote passenger to driver if available
            if (car.passengers.length > 0) {
                car.driver = car.passengers.shift();
            }
        } else {
            car.passengers = car.passengers.filter(p => p !== playerId);
        }
        
        return true;
    }
    
    // Get all occupants
    getOccupants(carId) {
        const car = this.cars[carId];
        if (!car) return [];
        
        const occupants = car.passengers.slice();
        if (car.driver) {
            occupants.unshift(car.driver);
        }
        return occupants;
    }
    
    // Check if player is driver
    isDriver(carId, playerId) {
        const car = this.cars[carId];
        return car && car.driver === playerId;
    }
}

// Create global instance
const carSystem = new CarSystem();
