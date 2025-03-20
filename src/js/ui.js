export class UIManager {
    constructor() {
        this.menuElement = document.getElementById('menu');
        this.gameOverElement = document.getElementById('game-over');
        this.levelCompleteElement = document.getElementById('level-complete');
        this.hudElement = document.getElementById('hud');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.finalScoreElement = document.getElementById('final-score');
    }
    
    hideAllScreens() {
        this.menuElement.classList.add('hidden');
        this.gameOverElement.classList.add('hidden');
        this.levelCompleteElement.classList.add('hidden');
        this.hudElement.classList.add('hidden');
    }
    
    showMenu() {
        this.hideAllScreens();
        this.menuElement.classList.remove('hidden');
    }
    
    showGameOver(score) {
        this.hideAllScreens();
        this.finalScoreElement.textContent = score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    showLevelComplete() {
        this.hideAllScreens();
        this.levelCompleteElement.classList.remove('hidden');
    }
    
    showHUD() {
        this.hudElement.classList.remove('hidden');
    }
    
    updateScore(score) {
        this.scoreElement.textContent = `Score: ${score}`;
    }
    
    updateLevel(level) {
        this.levelElement.textContent = `Level: ${level}`;
    }
}
