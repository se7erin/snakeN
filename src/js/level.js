import * as THREE from 'three';

export class Level {
    constructor(scene, gridSystem, levelNumber) {
        this.scene = scene;
        this.gridSystem = gridSystem;
        this.levelNumber = levelNumber;
        
        this.walls = [];
        this.obstacles = [];
        this.foodItem = null;
        this.specialItem = null;
        this.exitDoor = null;
        this.floor = null;
        this.snake = null;
        
        // Colors
        this.floorColor = 0x795548; // Brown
        this.wallColor = 0x607D8B; // Blue-grey
        this.foodColor = 0xFF5722; // Deep orange
        this.specialItemColor = 0xFFC107; // Amber
        this.exitDoorColor = 0xF44336; // Red (locked)
        this.exitDoorUnlockedColor = 0x4CAF50; // Green (unlocked)
    }
    
    load() {
        // Clear any existing level elements
        this.clear();
        
        // Create floor
        this.createFloor();
        
        // Create walls around the perimeter
        this.createWalls();
        
        // Add obstacles (for more complex levels, currently not used in alpha)
        if (this.levelNumber > 1) {
            this.createObstacles();
        }
        
        // Create exit door (initially locked)
        this.createExitDoor();
    }
    
    createFloor() {
        const width = this.gridSystem.width * this.gridSystem.cellSize;
        const height = this.gridSystem.height * this.gridSystem.cellSize;
        
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.floorColor,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.rotation.x = Math.PI / 2; // Rotate to be horizontal
        this.floor.position.y = -0.5; // Slightly below grid level
        this.floor.receiveShadow = true;
        
        this.scene.add(this.floor);
    }
    
    createWalls() {
        const wallHeight = 2;
        const halfWidth = (this.gridSystem.width * this.gridSystem.cellSize) / 2;
        const halfHeight = (this.gridSystem.height * this.gridSystem.cellSize) / 2;
        const wallThickness = 0.5;
        
        const wallGeometry = new THREE.BoxGeometry(1, wallHeight, 1);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: this.wallColor,
            roughness: 0.7,
            metalness: 0.3
        });
        
        // Create walls around the perimeter
        for (let x = 0; x < this.gridSystem.width; x++) {
            // Bottom wall
            this.createWallSegment(x, 0, wallGeometry, wallMaterial);
            
            // Top wall
            this.createWallSegment(x, this.gridSystem.height - 1, wallGeometry, wallMaterial);
        }
        
        for (let z = 0; z < this.gridSystem.height; z++) {
            // Left wall
            this.createWallSegment(0, z, wallGeometry, wallMaterial);
            
            // Right wall
            this.createWallSegment(this.gridSystem.width - 1, z, wallGeometry, wallMaterial);
        }
    }
    
    createWallSegment(x, z, geometry, material) {
        const position = { x, y: 0, z };
        const worldPos = this.gridSystem.gridToWorld(position);
        
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(worldPos.x, worldPos.y, worldPos.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        this.scene.add(wall);
        this.walls.push({ mesh: wall, position });
    }
    
    createObstacles() {
        // For alpha version, no obstacles in the first level
        // This would be implemented for more complex levels
    }
    
    createExitDoor() {
        // Place exit door at the center of the right wall
        const x = this.gridSystem.width - 1;
        const z = Math.floor(this.gridSystem.height / 2);
        const position = { x, y: 0, z };
        const worldPos = this.gridSystem.gridToWorld(position);
        
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.exitDoorColor, // Red when locked
            roughness: 0.5,
            metalness: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        this.exitDoor = {
            mesh: new THREE.Mesh(geometry, material),
            position,
            unlocked: false
        };
        
        this.exitDoor.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
        this.exitDoor.mesh.castShadow = true;
        this.exitDoor.mesh.receiveShadow = true;
        
        this.scene.add(this.exitDoor.mesh);
    }
    
    setSnake(snake) {
        this.snake = snake;
    }
    
    spawnFood() {
        // Find a random empty position
        const position = this.getRandomEmptyPosition();
        
        if (!position) return; // No empty positions available
        
        const worldPos = this.gridSystem.gridToWorld(position);
        
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.foodColor,
            roughness: 0.2,
            metalness: 0.8
        });
        
        const food = new THREE.Mesh(geometry, material);
        food.position.set(worldPos.x, worldPos.y, worldPos.z);
        food.castShadow = true;
        
        this.scene.add(food);
        this.foodItem = { mesh: food, position };
    }
    
    spawnSpecialItem() {
        // Find a random empty position
        const position = this.getRandomEmptyPosition();
        
        if (!position) return; // No empty positions available
        
        const worldPos = this.gridSystem.gridToWorld(position);
        
        const geometry = new THREE.OctahedronGeometry(0.4);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.specialItemColor,
            roughness: 0.2,
            metalness: 0.9,
            emissive: this.specialItemColor,
            emissiveIntensity: 0.5
        });
        
        const specialItem = new THREE.Mesh(geometry, material);
        specialItem.position.set(worldPos.x, worldPos.y, worldPos.z);
        specialItem.castShadow = true;
        
        // Add subtle rotation animation
        this.animate(specialItem);
        
        this.scene.add(specialItem);
        this.specialItem = { mesh: specialItem, position };
    }
    
    animate(mesh) {
        // Add subtle floating and rotation animation to objects
        const animate = () => {
            if (!mesh || !this.scene.children.includes(mesh)) return;
            
            mesh.rotation.y += 0.01;
            mesh.position.y = mesh.position.y + Math.sin(Date.now() * 0.003) * 0.002;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    unlockExitDoor() {
        if (!this.exitDoor) return;
        
        // Change color to green and mark as unlocked
        this.exitDoor.mesh.material.color.set(this.exitDoorUnlockedColor);
        this.exitDoor.unlocked = true;
        
        // Add animation to indicate it's unlocked
        this.animate(this.exitDoor.mesh);
    }
    
    checkCollision(position) {
        // Check collision with walls
        for (const wall of this.walls) {
            if (wall.position.x === position.x && wall.position.z === position.z) {
                return true; // Collision with wall
            }
        }
        
        // Check collision with obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle.position.x === position.x && obstacle.position.z === position.z) {
                return true; // Collision with obstacle
            }
        }
        
        // Out of bounds (should be caught by wall collision, but just in case)
        if (!this.gridSystem.isInBounds(position)) {
            return true;
        }
        
        return false; // No collision
    }
    
    checkFoodCollision(position) {
        if (!this.foodItem) return false;
        
        return (
            this.foodItem.position.x === position.x &&
            this.foodItem.position.z === position.z
        );
    }
    
    checkSpecialItemCollision(position) {
        if (!this.specialItem) return false;
        
        return (
            this.specialItem.position.x === position.x &&
            this.specialItem.position.z === position.z
        );
    }
    
    checkExitDoorCollision(position) {
        if (!this.exitDoor || !this.exitDoor.unlocked) return false;
        
        return (
            this.exitDoor.position.x === position.x &&
            this.exitDoor.position.z === position.z
        );
    }
    
    removeFood() {
        if (this.foodItem) {
            this.scene.remove(this.foodItem.mesh);
            this.foodItem.mesh.geometry.dispose();
            this.foodItem.mesh.material.dispose();
            this.foodItem = null;
        }
    }
    
    removeSpecialItem() {
        if (this.specialItem) {
            this.scene.remove(this.specialItem.mesh);
            this.specialItem.mesh.geometry.dispose();
            this.specialItem.mesh.material.dispose();
            this.specialItem = null;
        }
    }
    
    getRandomEmptyPosition() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const position = this.gridSystem.getRandomPosition();
            
            // Check if position is empty
            if (!this.isPositionOccupied(position)) {
                return position;
            }
            
            attempts++;
        }
        
        console.warn('Could not find an empty position after', maxAttempts, 'attempts');
        return null;
    }
    
    isPositionOccupied(position) {
        // Check walls
        for (const wall of this.walls) {
            if (wall.position.x === position.x && wall.position.z === position.z) {
                return true;
            }
        }
        
        // Check obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle.position.x === position.x && obstacle.position.z === position.z) {
                return true;
            }
        }
        
        // Check food
        if (this.foodItem && this.foodItem.position.x === position.x && this.foodItem.position.z === position.z) {
            return true;
        }
        
        // Check special item
        if (this.specialItem && this.specialItem.position.x === position.x && this.specialItem.position.z === position.z) {
            return true;
        }
        
        // Check exit door
        if (this.exitDoor && this.exitDoor.position.x === position.x && this.exitDoor.position.z === position.z) {
            return true;
        }
        
        // Check snake body
        if (this.snake) {
            for (const segment of this.snake.segments) {
                if (segment.position.x === position.x && segment.position.z === position.z) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    clear() {
        // Remove walls
        for (const wall of this.walls) {
            this.scene.remove(wall.mesh);
            wall.mesh.geometry.dispose();
            wall.mesh.material.dispose();
        }
        this.walls = [];
        
        // Remove obstacles
        for (const obstacle of this.obstacles) {
            this.scene.remove(obstacle.mesh);
            obstacle.mesh.geometry.dispose();
            obstacle.mesh.material.dispose();
        }
        this.obstacles = [];
        
        // Remove food
        this.removeFood();
        
        // Remove special item
        this.removeSpecialItem();
        
        // Remove exit door
        if (this.exitDoor) {
            this.scene.remove(this.exitDoor.mesh);
            this.exitDoor.mesh.geometry.dispose();
            this.exitDoor.mesh.material.dispose();
            this.exitDoor = null;
        }
        
        // Remove floor
        if (this.floor) {
            this.scene.remove(this.floor);
            this.floor.geometry.dispose();
            this.floor.material.dispose();
            this.floor = null;
        }
        
        // Reset snake reference
        this.snake = null;
    }
}
