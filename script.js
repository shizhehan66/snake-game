const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let velocity = { x: 1, y: 0 };
let snake = [{ x: 8, y: 8 }];
let food = { x: 12, y: 10 };
let score = 0;
let gameOver = false;
let gameLoopId = null;
let moveQueue = [];

function resetGame() {
  velocity = { x: 1, y: 0 };
  snake = [{ x: 8, y: 8 }];
  food = randomFoodPosition();
  score = 0;
  gameOver = false;
  moveQueue = [];
  scoreEl.textContent = score;
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }
  gameLoopId = requestAnimationFrame(gameLoop);
}

function randomFoodPosition() {
  let position;
  while (true) {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
    const conflict = snake.some(segment => segment.x === position.x && segment.y === position.y);
    if (!conflict) break;
  }
  return position;
}

function draw() {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f97316";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#4ade80" : "#22c55e";
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
}

function update() {
  if (moveQueue.length > 0) {
    const next = moveQueue.shift();
    if (Math.abs(next.x) !== Math.abs(velocity.x) || Math.abs(next.y) !== Math.abs(velocity.y)) {
      velocity = next;
    }
  }

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver = true;
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    food = randomFoodPosition();
  } else {
    snake.pop();
  }
}

let lastFrameTime = 0;
const speed = 8;

function gameLoop(timestamp) {
  if (gameOver) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("游戏结束", canvas.width / 2, canvas.height / 2 - 4);
    ctx.font = "16px sans-serif";
    ctx.fillText("点击重新开始", canvas.width / 2, canvas.height / 2 + 24);
    return;
  }

  if (timestamp - lastFrameTime > 1000 / speed) {
    update();
    draw();
    lastFrameTime = timestamp;
  }

  gameLoopId = requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key;
  let nextVelocity = null;

  if (key === "ArrowUp" || key === "w" || key === "W") nextVelocity = { x: 0, y: -1 };
  if (key === "ArrowDown" || key === "s" || key === "S") nextVelocity = { x: 0, y: 1 };
  if (key === "ArrowLeft" || key === "a" || key === "A") nextVelocity = { x: -1, y: 0 };
  if (key === "ArrowRight" || key === "d" || key === "D") nextVelocity = { x: 1, y: 0 };

  if (nextVelocity) {
    moveQueue.push(nextVelocity);
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

resetGame();
