# Snake 3D

A reimagined version of the classic Snake game, built using Three.js to deliver a 3D experience in web browsers. This is the alpha version based on the SRS document.

## Features

- 3D Snake game with top-down 2.5D perspective
- Grid-based movement with smooth 3D animations
- Food collection and snake growth mechanics
- Special item to unlock exit door
- Collision detection with walls and snake's body
- Dynamic camera that follows the snake
- Score tracking and level progression

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. For production build:
   ```
   npm run build
   ```

## Controls

- Use arrow keys or WASD to navigate the snake
- Eat food items (orange spheres) to grow
- Reach a length of 5 to spawn the special item (yellow octahedron)
- Collect the special item to unlock the exit door (turns green when unlocked)
- Guide the snake through the exit door to complete the level

## Project Structure

- `/src`: Source code
  - `/js`: JavaScript files
  - `/css`: CSS stylesheets
- `/assets`: Game assets
  - `/models`: 3D models
  - `/textures`: Texture files
  - `/sounds`: Audio files
- `/dist`: Compiled files (after build)

## Technologies Used

- Three.js for 3D rendering
- Webpack for bundling
- HTML5 and CSS3
- JavaScript (ES6+)
