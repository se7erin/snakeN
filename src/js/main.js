import '../css/style.css';
import * as THREE from 'three';
import { Game } from './game.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';

let game;
let audioManager;
let uiManager;

// Initialize the game when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create managers
    audioManager = new AudioManager();
    uiManager = new UIManager();
    
    // Setup UI event listeners
    document.getElementById('start-game').addEventListener('click', () => {
        // Initialize audio context on user interaction
        audioManager.init();
        startGame();
    });
    
    document.getElementById('restart-game').addEventListener('click', () => {
        // Make sure to fully recreate the game on restart
        if (game) {
            game.cleanup(); // Clean up the old game instance
        }
        startGame();
    });
    
    document.getElementById('next-level').addEventListener('click', () => {
        if (game) {
            game.cleanup(); // Clean up the old game instance
        }
        startGame();
    });
    
    // Show the main menu initially
    uiManager.showMenu();
});

function startGame() {
    // Hide all screens and show the HUD
    uiManager.hideAllScreens();
    uiManager.showHUD();
    
    // Create and initialize the game
    game = new Game(uiManager, audioManager);
    game.init();
    game.start();
}
