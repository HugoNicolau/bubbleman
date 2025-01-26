const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const zoomLevelElement = document.getElementById("zoomLevel");
const scoreElement = document.getElementById("score");
const gameDurationElement = document.getElementById("game-duration");
const personElement = document.getElementById("person");
const okButton = document.querySelector("button");
const startScreen = document.getElementById("startScreen");

const WORLD_SIZE = 10000;
const HEX_SIZE = 50;
let PLAYER_SIZE = 4;
let zoom = 10;
let score = Math.PI * PLAYER_SIZE * PLAYER_SIZE;
let playerX = WORLD_SIZE / 2;
let playerY = WORLD_SIZE / 2;
let otherBubbles = [];
let startTime = Date.now();
let person = "Player";

okButton.addEventListener("click", handleName);
personElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleName();
  }
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  adjustZoom();
}

function drawHexagon(x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const xPos = x + size * Math.cos(angle);
    const yPos = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

function drawHexGrid(topLeftX, topLeftY, visibleWidth, visibleHeight) {
  const hexHeight = HEX_SIZE * Math.sqrt(3);
  const gridStartX = Math.floor(topLeftX / HEX_SIZE) * HEX_SIZE;
  const gridEndX = gridStartX + visibleWidth + HEX_SIZE;
  const gridStartY = Math.floor(topLeftY / HEX_SIZE) * HEX_SIZE;
  const gridEndY = gridStartY + visibleHeight + HEX_SIZE;

  const startX = Math.floor(topLeftX / (HEX_SIZE * 1.5)) * (HEX_SIZE * 1.5);
  const startY = Math.floor(topLeftY / hexHeight) * hexHeight;
  const endX = startX + visibleWidth + HEX_SIZE;
  const endY = startY + visibleHeight + hexHeight;

  ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
  ctx.lineWidth = 1 / zoom;

  for (let y = startY; y < endY; y += hexHeight) {
    for (let x = startX; x < endX; x += HEX_SIZE * 3) {
      drawHexagon(
        (x - topLeftX) * zoom,
        (y - topLeftY) * zoom,
        HEX_SIZE * zoom
      );
      drawHexagon(
        (x + HEX_SIZE * 1.5 - topLeftX) * zoom,
        (y + hexHeight / 2 - topLeftY) * zoom,
        HEX_SIZE * zoom
      );
    }
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const visibleWidth = canvas.width / zoom;
  const visibleHeight = canvas.height / zoom;

  const topLeftX = playerX - visibleWidth / 2;
  const topLeftY = playerY - visibleHeight / 2;

  drawHexGrid(topLeftX, topLeftY, visibleWidth, visibleHeight);

  ctx.strokeStyle = "#f00";
  ctx.lineWidth = 2 / zoom;
  ctx.strokeRect(
    -topLeftX * zoom,
    -topLeftY * zoom,
    WORLD_SIZE * zoom,
    WORLD_SIZE * zoom
  );

  otherBubbles.forEach((bubble) => {
    ctx.fillStyle = bubble.color;
    ctx.beginPath();
    ctx.arc(
      (bubble.x - topLeftX) * zoom,
      (bubble.y - topLeftY) * zoom,
      bubble.size * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.fillStyle = "#3498db";
  ctx.beginPath();
  ctx.arc(
    (playerX - topLeftX) * zoom,
    (playerY - topLeftY) * zoom,
    PLAYER_SIZE * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText(
    `${person}`,
    (playerX - topLeftX) * zoom,
    (playerY - topLeftY) * zoom
  );
  ctx.fillText(
    playerArea.toFixed(0),
    (playerX - topLeftX) * zoom,
    (playerY - topLeftY) * zoom + 15
  );
}

let playerArea = Math.PI * PLAYER_SIZE * PLAYER_SIZE;
let gameOver = false;
let gameWin = false;

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function checkCollisions() {
  for (let i = otherBubbles.length - 1; i >= 0; i--) {
    const bubble = otherBubbles[i];
    const d = distance(playerX, playerY, bubble.x, bubble.y);
    if (d < PLAYER_SIZE + bubble.size) {
      if (PLAYER_SIZE > bubble.size) {
        const area = Math.PI * bubble.size * bubble.size;
        playerArea += area;
        PLAYER_SIZE = Math.sqrt(playerArea / Math.PI);
        otherBubbles.splice(i, 1);
        if (playerArea > WORLD_SIZE * WORLD_SIZE) {
          gameWin = true;
        }
      } else {
        gameOver = true;
      }
    }
  }
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  ctx.font = "24px Arial";
  ctx.fillText("Press F5 to restart", canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText(
    "Score: " + score.toFixed(0),
    canvas.width / 2,
    canvas.height / 2 + 60
  );
  ctx.fillText(
    "Game Duration: " + (Date.now() - startTime) / 1000 + "s",
    canvas.width / 2,
    canvas.height / 2 + 90
  );
}

function drawGameWin() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
  ctx.font = "24px Arial";
  ctx.fillText("Press F5 to restart", canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText(
    "Score: " + score.toFixed(0),
    canvas.width / 2,
    canvas.height / 2 + 60
  );
  ctx.fillText(
    "Game Duration: " + (Date.now() - startTime) / 1000 + "s",
    canvas.width / 2,
    canvas.height / 2 + 90
  );
}

function gameLoop() {
  if (!gameOver && !gameWin) {
    checkCollisions();
    drawWorld();
    handleScore();
    handleGameDuration();
    requestAnimationFrame(gameLoop);
  } else if (gameOver) {
    drawWorld();
    drawGameOver();
    handleScore();
    return;
  } else if (gameWin) {
    drawWorld();
    drawGameWin();
    handleScore();
    return;
  }
}

function adjustZoom() {
  const minBubbleScreenPercentage = 0.033;
  const maxBubbleScreenPercentage = 0.2;

  const bubbleDiameter = 2 * PLAYER_SIZE;
  const minDimension = Math.min(canvas.width, canvas.height);

  let ratio = bubbleDiameter / minDimension;

  ratio = Math.min(
    maxBubbleScreenPercentage,
    Math.max(minBubbleScreenPercentage, ratio)
  );

  zoom = ratio * (minDimension / bubbleDiameter);

  zoomLevelElement.textContent = `Zoom: ${zoom.toFixed(2)}x`;
}

function handleScore() {
  score = Math.PI * PLAYER_SIZE * PLAYER_SIZE;
  scoreElement.textContent = `Score: ${score.toFixed(0)}`;
  adjustZoom();
}

function handleName() {
  person = personElement.value || "Player";

  if (person !== "Player") {
    personElement.classList.add("hidden");
    okButton.classList.add("hidden");
    startScreen.classList.add("hidden");
  }
}

function handleGameDuration() {
  const currentTime = Date.now();
  const duration = (currentTime - startTime) / 1000;
  gameDurationElement.textContent = `Game Duration: ${duration.toFixed(2)}s`;
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function addRandomBubble() {
  const visibleWidth = canvas.width / zoom;
  const visibleHeight = canvas.height / zoom;
  const size = PLAYER_SIZE * (Math.random() * 0.8 + 0.5);
  let x, y, distance;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    x = playerX + (Math.random() - 0.5) * visibleWidth;
    y = playerY + (Math.random() - 0.5) * visibleHeight;
    distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
    attempts++;
  } while (distance < PLAYER_SIZE + size && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    x = playerX + (Math.random() - 0.5) * visibleWidth;
    y = playerY + (Math.random() - 0.5) * visibleHeight;
  }

  otherBubbles.push({
    x: Math.max(size, Math.min(WORLD_SIZE - size, x)),
    y: Math.max(size, Math.min(WORLD_SIZE - size, y)),
    size: size,
    color: getRandomColor(),
  });
}

let keysPressed = {};
let lastKeyPressed = null;
let moveInterval;

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  lastKeyPressed = e.key;
  if (!moveInterval) {
    moveInterval = setInterval(handleContinuousMovement, 16);
  }
});

document.addEventListener("keyup", (e) => {
  delete keysPressed[e.key];
  if (Object.keys(keysPressed).length === 0) {
    lastKeyPressed = null;
  }
});

function handleContinuousMovement() {
  const speed = 5 / zoom;
  if (
    keysPressed["ArrowUp"] ||
    keysPressed["W"] ||
    keysPressed["w"] ||
    lastKeyPressed === "ArrowUp"
  ) {
    playerY = Math.max(PLAYER_SIZE, playerY - speed);
  }
  if (
    keysPressed["ArrowDown"] ||
    keysPressed["S"] ||
    keysPressed["s"] ||
    lastKeyPressed === "ArrowDown"
  ) {
    playerY = Math.min(WORLD_SIZE - PLAYER_SIZE, playerY + speed);
  }
  if (
    keysPressed["ArrowLeft"] ||
    keysPressed["A"] ||
    keysPressed["a"] ||
    lastKeyPressed === "ArrowLeft"
  ) {
    playerX = Math.max(PLAYER_SIZE, playerX - speed);
  }
  if (
    keysPressed["ArrowRight"] ||
    keysPressed["D"] ||
    keysPressed["d"] ||
    lastKeyPressed === "ArrowRight"
  ) {
    playerX = Math.min(WORLD_SIZE - PLAYER_SIZE, playerX + speed);
  }
}

window.addEventListener("resize", resizeCanvas);
// canvas.addEventListener('wheel', handleWheel);

resizeCanvas();
gameLoop();

setInterval(addRandomBubble, 4500);
