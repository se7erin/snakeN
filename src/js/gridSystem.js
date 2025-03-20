export class GridSystem {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        
        // Calculate the grid offset to center it at the origin
        this.offsetX = -((width * cellSize) / 2);
        this.offsetZ = -((height * cellSize) / 2);
    }
    
    // Convert grid coordinates to world coordinates
    gridToWorld(gridPos) {
        return {
            x: this.offsetX + (gridPos.x * this.cellSize) + (this.cellSize / 2),
            y: gridPos.y, // Y position remains the same (height)
            z: this.offsetZ + (gridPos.z * this.cellSize) + (this.cellSize / 2)
        };
    }
    
    // Convert world coordinates to grid coordinates
    worldToGrid(worldPos) {
        return {
            x: Math.floor((worldPos.x - this.offsetX) / this.cellSize),
            y: worldPos.y, // Y position remains the same (height)
            z: Math.floor((worldPos.z - this.offsetZ) / this.cellSize)
        };
    }
    
    // Check if a grid position is within bounds
    isInBounds(gridPos) {
        return (
            gridPos.x >= 0 && 
            gridPos.x < this.width && 
            gridPos.z >= 0 && 
            gridPos.z < this.height
        );
    }
    
    // Get a random empty grid position (for food, special item, etc.)
    getRandomPosition() {
        return {
            x: Math.floor(Math.random() * this.width),
            y: 0, // Always on the ground
            z: Math.floor(Math.random() * this.height)
        };
    }
    
    // Get all grid positions
    getAllPositions() {
        const positions = [];
        
        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.height; z++) {
                positions.push({ x, y: 0, z });
            }
        }
        
        return positions;
    }
}
