import * as THREE from 'three';

export class Snake {
    constructor(scene, gridSystem) {
        this.scene = scene;
        this.gridSystem = gridSystem;
        this.segments = [];
        this.direction = 'right'; // Default direction
        this.nextDirection = 'right';
        this.moveTime = 0.2; // Slightly slower for more visible animation
        this.timeSinceLastMove = 0;
        this.pendingDirectionChange = false;
        this.queuedDirection = null;
        
        // Always be in motion - no stopping between grid positions
        this.isMoving = true;
        this.movementProgress = 0;
        
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
        this.pendingDirectionChange = false;
        this.queuedDirection = null;
        
        // Always be in motion
        this.isMoving = true;
        this.movementProgress = 0;
        
        // Setup initial target positions
        this.calculateNextTargetPositions();
        
        // Store initial positions as previous positions
        this.segments.forEach(segment => {
            segment.previousPosition = { ...segment.position };
        });
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
            position: { ...position },
            targetPosition: { ...position },
            previousPosition: { ...position }
        });
    }
    
    update(delta) {
        // Advance the movement progress
        this.movementProgress += delta / this.moveTime;
        
        // If we've reached or exceeded the target position
        if (this.movementProgress >= 1) {
            // Complete the current movement
            this.completeMovement();
            
            // Apply any pending direction change
            if (this.pendingDirectionChange) {
                this.nextDirection = this.queuedDirection;
                this.pendingDirectionChange = false;
            }
            
            // Calculate new target positions
            this.calculateNextTargetPositions();
            
            // Reset movement progress and continue moving
            this.movementProgress = 0;
        }
        
        // Interpolate positions (happens every frame)
        this.interpolatePositions(this.movementProgress);
    }
    
    calculateNextTargetPositions() {
        // Update direction
        this.direction = this.nextDirection;
        
        // Store current positions as previous positions
        this.segments.forEach(segment => {
            segment.previousPosition = { ...segment.position };
        });
        
        // Calculate new head target position
        const headTargetPosition = { ...this.segments[0].position };
        
        switch (this.direction) {
            case 'up':
                headTargetPosition.z -= 1;
                break;
            case 'down':
                headTargetPosition.z += 1;
                break;
            case 'left':
                headTargetPosition.x -= 1;
                break;
            case 'right':
                headTargetPosition.x += 1;
                break;
        }
        
        // Set target positions (each segment moves to the position of the segment in front)
        for (let i = this.segments.length - 1; i > 0; i--) {
            const segment = this.segments[i];
            const prevSegment = this.segments[i - 1];
            
            segment.targetPosition = { ...prevSegment.position };
        }
        
        // Set head target position
        this.segments[0].targetPosition = headTargetPosition;
    }
    
    completeMovement() {
        // Update actual grid positions to match target positions
        this.segments.forEach(segment => {
            segment.position = { ...segment.targetPosition };
        });
    }
    
    interpolatePositions(t) {
        // Use smooth interpolation with a sine-based easing for more fluid motion
        const smoothT = this.smootherStep(t);
        
        // Update visual positions of all segments
        this.segments.forEach(segment => {
            const worldPrevPos = this.gridSystem.gridToWorld(segment.previousPosition);
            const worldTargetPos = this.gridSystem.gridToWorld(segment.targetPosition);
            
            // Interpolate between previous and target positions
            segment.mesh.position.x = this.lerp(worldPrevPos.x, worldTargetPos.x, smoothT);
            segment.mesh.position.y = this.lerp(worldPrevPos.y, worldTargetPos.y, smoothT);
            segment.mesh.position.z = this.lerp(worldPrevPos.z, worldTargetPos.z, smoothT);
        });
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Smoother and more fluid easing function
    smootherStep(t) {
        // Smoother step provides a more continuous feel
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    // Alternative easing function that simulates a snake-like movement
    snakeEasing(t) {
        // Sine-based easing that starts and ends smoothly
        return 0.5 - 0.5 * Math.cos(Math.PI * t);
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
        
        // Always queue the input
        this.queuedDirection = newDirection;
        this.pendingDirectionChange = true;
        
        // If we're in the first 10% of movement, apply immediately for more responsive feel
        if (this.movementProgress < 0.1) {
            this.nextDirection = newDirection;
            this.pendingDirectionChange = false;
        }
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
