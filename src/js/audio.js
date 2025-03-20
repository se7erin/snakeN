export class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicPlaying = false;
        this.soundEnabled = true;
        
        // Create audio context (will be initialized on user interaction)
        this.audioContext = null;
    }
    
    init() {
        // Initialize audio context on first user interaction
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Load sounds
                this.loadSound('eat', 'assets/sounds/eat.mp3');
                this.loadSound('unlock', 'assets/sounds/unlock.mp3');
                this.loadSound('gameover', 'assets/sounds/gameover.mp3');
                this.loadSound('levelcomplete', 'assets/sounds/levelcomplete.mp3');
                
                // Load background music
                this.loadMusic('assets/sounds/background.mp3');
            } catch (error) {
                console.warn('Web Audio API not supported:', error);
            }
        }
    }
    
    loadSound(name, url) {
        try {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then(data => this.audioContext.decodeAudioData(data))
                .then(buffer => {
                    this.sounds[name] = buffer;
                })
                .catch(error => {
                    console.warn(`Error loading sound ${name}: ${error}`);
                    // Create a silent buffer as fallback
                    this.createSilentBuffer(name);
                });
        } catch (error) {
            console.warn(`Error fetching sound ${name}: ${error}`);
            this.createSilentBuffer(name);
        }
    }
    
    createSilentBuffer(name) {
        // Create a short silent buffer as fallback
        const buffer = this.audioContext.createBuffer(2, 22050, 44100);
        this.sounds[name] = buffer;
    }
    
    loadMusic(url) {
        try {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then(data => this.audioContext.decodeAudioData(data))
                .then(buffer => {
                    this.sounds['music'] = buffer;
                    
                    // Auto-play music if enabled
                    if (this.soundEnabled) {
                        this.playMusic();
                    }
                })
                .catch(error => {
                    console.warn(`Error loading background music: ${error}`);
                    // Create a silent buffer as fallback
                    this.createSilentBuffer('music');
                });
        } catch (error) {
            console.warn(`Error fetching background music: ${error}`);
            this.createSilentBuffer('music');
        }
    }
    
    playSound(name) {
        if (!this.soundEnabled || !this.audioContext || !this.sounds[name]) return;
        
        try {
            // Create a sound source
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[name];
            
            // Connect to output
            source.connect(this.audioContext.destination);
            
            // Play the sound
            source.start(0);
        } catch (error) {
            console.warn(`Error playing sound ${name}: ${error}`);
        }
    }
    
    playMusic() {
        if (!this.soundEnabled || !this.audioContext || !this.sounds['music'] || this.musicPlaying) return;
        
        try {
            // Create a sound source
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds['music'];
            source.loop = true;
            
            // Connect to output
            source.connect(this.audioContext.destination);
            
            // Play the music
            source.start(0);
            this.musicPlaying = true;
            
            // Store reference to stop later if needed
            this.musicSource = source;
        } catch (error) {
            console.warn('Error playing background music:', error);
            this.musicPlaying = false;
        }
    }
    
    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (error) {
                console.warn('Error stopping music:', error);
            } finally {
                this.musicPlaying = false;
            }
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        if (!this.soundEnabled) {
            this.stopMusic();
        } else if (!this.musicPlaying && this.sounds['music']) {
            this.playMusic();
        }
        
        return this.soundEnabled;
    }
}
