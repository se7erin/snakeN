import * as THREE from 'three';

export class Snake {
    constructor(scene, gridSystem) {
        this.scene = scene;
        this.gridSystem = gridSystem;
        this.segments = [];
        this.direction = 'right'; // Default direction
        this.nextDirection = 'right';
        this.moveTime = 0.2; // Seconds between movements (speed)
        this.timeSinceLastMove = 0;
        
        // Colors for snake segments
        this.headColor = 0x4CAF50; // Green for head
        this.bodyColor = 0x388E3C; // Darker green for body
    }
    
    init() {
        // Clear any existing segments
        this.clearSegments();
        
        // Create initial snake (3 segments)
        this.createSegment({ x: 2, y: 0, z: 2 }, true); // Head
        this.createSegment({ x: 1, y: 0, z: 2 }); // Body
        this.createSegment({ x: 0, y: 0, z: 2 }); // Tail
        
        // Reset direction
        this.direction = 'right';
        this.nextDirection = 'right';
    }
    
    createSegment(position, isHead = false) {
        // Create a cube geometry for the segment
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshStandardMaterial({ 
            color: isHead ? this.headColor : this.bodyColor,
            roughness: 0.5,
            metalness: 0.5
        });
        
        const segment = new THREE.Mesh(geometry, material);
        
        // Convert grid position to world position
        const worldPos = this.gridSystem.gridToWorld(position);
        segment.position.set(worldPos.x, worldPos.y, worldPos.z);
        
        // Add to scene and segments array
        this.scene.add(segment);
        
        // Store both the mesh and the grid position
        this.segments.push({
            mesh: segment,
            position: { ...position }
        });
    }
    
    update(delta) {
        // Accumulate time since last move
        this.timeSinceLastMove += delta;
        
        // Move snake if enough time has passed
        if (this.timeSinceLastMove >= this.moveTime) {
            this.move();
            this.timeSinceLastMove = 0;
        }
    }
    
    move() {
        // Update direction from next direction (set by user input)
        this.direction = this.nextDirection;
        
        // Get current head position
        const head = this.segments[0];
        const newHeadPosition = { ...head.position };
        
        // Calculate new head position based on direction
        switch (this.direction) {
            case 'up':
                newHeadPosition.z -= 1;
                break;
            case 'down':
                newHeadPosition.z += 1;
                break;
            case 'left':
                newHeadPosition.x -= 1;
                break;
            case 'right':
                newHeadPosition.x += 1;
                break;
        }
        
        // Move all segments (each segment takes the position of the segment in front of it)
        for (let i = this.segments.length - 1; i > 0; i--) {
            const segment = this.segments[i];
            const prevSegment = this.segments[i - 1];
            
            // Update grid position
            segment.position.x = prevSegment.position.x;
            segment.position.y = prevSegment.position.y;
            segment.position.z = prevSegment.position.z;
            
            // Update world position
            const worldPos = this.gridSystem.gridToWorld(segment.position);
            segment.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
        }
        
        // Update head position
        head.position.x = newHeadPosition.x;
        head.position.y = newHeadPosition.y;
        head.position.z = newHeadPosition.z;
        
        // Update head world position
        const worldPos = this.gridSystem.gridToWorld(head.position);
        head.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
    }
    
    grow() {
        // Add a new segment at the position of the last segment
        const lastSegment = this.segments[this.segments.length - 1];
        this.createSegment({ ...lastSegment.position });
    }
    
    setDirection(newDirection) {
        // Prevent 180-degree turns (can't turn directly back on yourself)
        if (
            (this.direction === 'up' && newDirection === 'down') ||
            (this.direction === 'down' && newDirection === 'up') ||
            (this.direction === 'left' && newDirection === 'right') ||
            (this.direction === 'right' && newDirection === 'left')
        ) {
            return;
        }
        
        this.nextDirection = newDirection;
    }
    
    getHeadPosition() {
        return { ...this.segments[0].position };
    }
    
    checkSelfCollision() {
        const headPos = this.getHeadPosition();
        
        // Start from index 1 to skip the head
        for (let i = 1; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (
                segment.position.x === headPos.x &&
                segment.position.z === headPos.z
            ) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    getLength() {
        return this.segments.length;
    }
    
    clearSegments() {
        // Remove all segments from the scene
        for (const segment of this.segments) {
            this.scene.remove(segment.mesh);
            segment.mesh.geometry.dispose();
            segment.mesh.material.dispose();
        }
        
        // Clear the segments array
        this.segments = [];
    }
}
