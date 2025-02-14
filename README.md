# Dev-Mind-Speed-Game-API

A Node.js-based API for a mathematical speed game where players can test their calculation skills through various questions.

## Stack

- Node.js
- Express.js
- Sequelize ORM
- XAMPP For MySQL
- jest/supertest

## Features

- Every player have his own game.
- The game id will not change every question if the user name does not change.
- Every game have many questions 
- If you request a new question the previous question will be skipped
- Questions work by following the priorities in the calculations

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- XAMPP
- npm
- Postman

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Navigate to the source directory:
```bash
cd src
```

3. Install dependencies:
```bash
npm install
```

4. Create a .env file in the src directory with the following content:
```bash
SERVER_PORT=8000
NODE_ENV=development
```

## Running the Application

1. Start XAMPP and ensure MySQL service is running

2. Start the server:
```bash
SERVER_PORT=8000
NODE_ENV=development
```

- The API will be available at http://localhost:8000

## Testing

1. To run tests, modify the .env file:
```bash
NODE_ENV=test
```

2. Stop the running server (if any)

3. Execute tests:
```bash
npm test
```

## Here is the API endpoints

### 1. **POST [/game](http://localhost:8000/game/start)**
- **Description**: Creates a new game for the player.
- **Request JSON**: 
  ```json
  {
    "playerName": "player1"
  }
  ```

### 2. **POST [/game/:game_id/submit](http://localhost:8000/game/:game_id/submit)**
- **Description**: Submit the answer for the question.
- **Request JSON**: 
  ```json
  {
    "answer": 123
  }
  ```

### 3. **POST [/game/:game_id/status](http://localhost:8000/game/:game_id/status)**
- **Description**: Fetches the current status of a game based on the game ID