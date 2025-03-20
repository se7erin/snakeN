import * as THREE from 'three';
import { Snake } from './snake.js';
import { Level } from './level.js';
import { GridSystem } from './gridSystem.js';

export class Game {
    constructor(uiManager, audioManager) {
        this.uiManager = uiManager;
        this.audioManager = audioManager;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.snake = null;
        this.level = null;
        this.gridSystem = null;
        this.score = 0;
        this.currentLevel = 1;
        this.isGameOver = false;
        this.isLevelComplete = false;
        this.specialItemActive = false;
        this.exitDoorUnlocked = false;
        this.animationFrameId = null;
    }

    init() {
        // Create the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Setup shadow properties
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Create camera with fixed position
        this.camera = new THREE.PerspectiveCamera(
            60, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        // Position camera to view the entire game area from above
        this.camera.position.set(0, 30, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Create grid system
        this.gridSystem = new GridSystem(20, 20, 1); // 20x20 grid with 1 unit cell size
        
        // Create level
        this.level = new Level(this.scene, this.gridSystem, this.currentLevel);
        
        // Create snake
        this.snake = new Snake(this.scene, this.gridSystem);
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Setup keyboard controls
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    start() {
        // Reset game state
        this.score = 0;
        this.isGameOver = false;
        this.isLevelComplete = false;
        this.specialItemActive = false;
        this.exitDoorUnlocked = false;
        
        // Initialize level
        this.level.load();
        
        // Initialize snake
        this.snake.init();
        
        // Set snake reference in level for collision detection and food spawning
        this.level.setSnake(this.snake);
        
        // Spawn initial food
        this.level.spawnFood();
        
        // Update UI
        this.uiManager.updateScore(this.score);
        this.uiManager.updateLevel(this.currentLevel);
        
        // Start game loop
        this.animate();
    }
    
    animate() {
        if (this.isGameOver || this.isLevelComplete) return;
        
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        
        // Update snake (movement happens here)
        this.snake.update(delta);
        
        // Check for collisions and update game state
        this.checkCollisions();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    checkCollisions() {
        const snakeHeadPosition = this.snake.getHeadPosition();
        
        // Check collision with walls or obstacles
        if (this.level.checkCollision(snakeHeadPosition)) {
            this.gameOver();
            return;
        }
        
        // Check collision with snake's own body
        if (this.snake.checkSelfCollision()) {
            this.gameOver();
            return;
        }
        
        // Check collision with food
        if (this.level.checkFoodCollision(snakeHeadPosition)) {
            // Snake grows
            this.snake.grow();
            
            // Increase score
            this.score += 10;
            this.uiManager.updateScore(this.score);
            
            // Play sound
            this.audioManager.playSound('eat');
            
            // Remove food and spawn new one
            this.level.removeFood();
            this.level.spawnFood();
            
            // Check if special item should appear
            if (this.snake.getLength() >= 5 && !this.specialItemActive && !this.exitDoorUnlocked) {
                this.level.spawnSpecialItem();
                this.specialItemActive = true;
            }
        }
        
        // Check collision with special item
        if (this.specialItemActive && this.level.checkSpecialItemCollision(snakeHeadPosition)) {
            // Unlock exit door
            this.level.unlockExitDoor();
            this.exitDoorUnlocked = true;
            this.specialItemActive = false;
            
            // Play sound
            this.audioManager.playSound('unlock');
            
            // Remove special item
            this.level.removeSpecialItem();
        }
        
        // Check collision with exit door (if unlocked)
        if (this.exitDoorUnlocked && this.level.checkExitDoorCollision(snakeHeadPosition)) {
            this.completeLevel();
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.audioManager.playSound('gameover');
        this.uiManager.showGameOver(this.score);
        
        // Cancel animation frame to stop the game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    completeLevel() {
        this.isLevelComplete = true;
        this.audioManager.playSound('levelcomplete');
        this.uiManager.showLevelComplete();
        
        // Cancel animation frame to stop the game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // In a full version, this would prepare for the next level
        // For the alpha, we just restart
        this.currentLevel = 1;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onKeyDown(event) {
        if (this.isGameOver || this.isLevelComplete) return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.snake.setDirection('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.snake.setDirection('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.snake.setDirection('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.snake.setDirection('right');
                break;
        }
    }
    
    cleanup() {
        // Cancel any pending animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Clean up level elements
        if (this.level) {
            this.level.clear();
        }
        
        // Clean up snake segments
        if (this.snake) {
            this.snake.clearSegments();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        
        // Remove renderer from DOM
        if (this.renderer && this.renderer.domElement) {
            const container = document.getElementById('game-container');
            if (container && container.contains(this.renderer.domElement)) {
                container.removeChild(this.renderer.domElement);
            }
        }
        
        // Dispose of Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        // Clear scene
        if (this.scene) {
            this.disposeScene(this.scene);
            this.scene = null;
        }
        
        // Reset game state
        this.camera = null;
        this.snake = null;
        this.level = null;
        this.gridSystem = null;
        this.isGameOver = false;
        this.isLevelComplete = false;
    }
    
    disposeScene(scene) {
        scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}
