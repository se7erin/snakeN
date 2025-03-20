Product Requirements Document: Snake 3D
1. Introduction
Snake 3D is a reimagined version of the classic Snake game, built using Three.js to deliver a 3D experience in web browsers. It combines the familiar mechanics of navigating a growing snake with a leveled structure where players progress through rooms, unlocking doors to continue their journey. The game adopts a top-down 2.5D third-person perspective, blending 2D gameplay with 3D visuals for an engaging experience.

2. Game Overview
Genre: Puzzle/Action
Platform: Web browser
Target Audience: Casual gamers, fans of classic arcade games
Perspective: Top-down 2.5D third-person view
3. Gameplay Mechanics
Core Gameplay
Players control a snake that moves continuously on a grid-based plane within a 3D-rendered environment.
The objective is to navigate through a series of rooms (levels), growing the snake and unlocking doors to progress.
Movement and Controls
Controls: Keyboard inputs (arrow keys or WASD) change the snake’s direction (up, down, left, right).
Movement: The snake advances one grid cell at a time in its current direction, with smooth 3D animations.
Growth and Food
Food Items: Scattered across each room, represented as 3D models (e.g., apples).
Growth Mechanic: Eating a food item increases the snake’s length by one segment, added to its tail.
Respawn: Food items are pre-placed or respawn randomly in empty grid cells after being eaten.
Level Progression
Rooms as Levels: Each level is a distinct room with walls, obstacles, and an exit door.
Objective: To unlock the exit door and proceed:
The snake must reach a minimum length specific to the level by eating food.
Upon reaching this length, a special item (e.g., a key or glowing orb) appears in the room.
Eating the special item unlocks the exit door.
The player guides the snake’s head through the unlocked door to transition to the next room.
Transition: When the snake’s head enters the door, the game shifts to the next room, positioning the snake at a designated starting area while retaining its current length.
Obstacles and Failure
Obstacles: Each room features static 3D walls around the perimeter and possibly internal blocks or barriers.
Collision: The game ends if the snake collides with a wall, an obstacle, or its own body.
Game Over: Upon collision, the game restarts from the first room.
Difficulty
Progression: Later levels require a longer minimum length and feature more complex room layouts (e.g., tighter spaces, more obstacles).
Speed: The snake’s movement speed increases slightly with each level to heighten the challenge.
4. User Interface
Heads-Up Display (HUD):
Current score (based on food eaten).
Level number.
Snake’s current length.
Main Menu:
Start game button.
Optional: Sound toggle, controls overview.
Game Over Screen:
Displays final score.
Option to restart the game.
5. Visual and Audio Design
Visuals
Perspective: Top-down 2.5D with a third-person camera positioned above and slightly angled, following the snake’s head.
3D Elements:
Snake: A chain of 3D segments (e.g., cubes or organic shapes) with slithering animations.
Food and Special Items: Distinct 3D models with visual effects (e.g., particles when eaten).
Rooms: Grid-based floors with 3D walls and obstacles; exit door animates (e.g., slides open) when unlocked.
Lighting: Dynamic lighting and shadows to enhance depth.
Style: Simple yet polished 3D graphics leveraging Three.js capabilities.
Audio
Background Music: Looping track suitable for a casual, arcade-style game.
Sound Effects:
Eating food or special item.
Unlocking the door.
Collision/game over.
6. Technical Specifications
Engine: Three.js for 3D rendering in the browser.
Compatibility: Major web browsers (e.g., Chrome, Firefox, Edge).
Performance: Optimized for smooth gameplay on average hardware, targeting 60 FPS.
Gameplay Logic: Grid-based system for movement and collision detection, overlaid with 3D rendering.
Camera: Follows the snake’s head, positioned above with a slight angle for a 2.5D effect.
Input: Keyboard controls (arrow keys or WASD).
7. Additional Features
Score System: Points awarded per food eaten (e.g., 10 points each), with bonus points for completing levels (e.g., 50 points).
Level Design: Multiple predefined levels (e.g., 10–20), each with unique layouts and increasing complexity.
Snake Continuity: The snake’s length persists across rooms, allowing it to “continue growing larger” as players progress.
Checkpoints: Optional for future iterations; initial version restarts from the beginning upon game over.
8. Development Considerations
Grid System: Simplifies movement and collision logic while supporting 3D visuals.
Starting Area: Each room’s entrance must accommodate the snake’s length (e.g., a straight corridor).
Optimization: Use low-poly models and efficient textures to maintain performance in Three.js.
Scalability: Design levels manually initially, with potential for procedural generation in future updates.