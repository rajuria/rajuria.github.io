const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gravity = 0.5;
const bounceFactor = 0.5;
const friction = 0.98;
const fruits = [];

const gameOverHeight = 80; // pixels from top
let isGameOver = false;

let score = 0;

const nextCanvas = document.getElementById("nextFruitCanvas");
const nextCtx = nextCanvas.getContext("2d");

let nextFruitType = Math.floor(Math.random() * 3);

const mergeSound = new Audio("sounds/merge.mp3");
const bounceSound = new Audio("sounds/bounce.mp3");

const fruitTypes = [
  { name: "cherry", emoji: "🍒", radius: 30, color: "crimson", points: 5 },
  { name: "orange", emoji: "🍊", radius: 36, color: "orange", points: 10 },
  { name: "apple", emoji: "🍎", radius: 42, color: "red", points: 20 },
  { name: "melon", emoji: "🍈", radius: 48, color: "green", points: 40 },
  { name: "grape", emoji: "🍇", radius: 54, color: "purple", points: 80 },
  { name: "peach", emoji: "🍑", radius: 60, color: "salmon", points: 160 },
  { name: "pineapple", emoji: "🍍", radius: 66, color: "goldenrod", points: 320 },
  { name: "watermelon", emoji: "🍉", radius: 72, color: "darkgreen", points: 640 }
];


canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;

  const fruitDef = fruitTypes[nextFruitType];

  fruits.push({
    x: x,
    y: 50,
    radius: fruitDef.radius,
    vy: 0,
    vx: 0,
    type: nextFruitType,
    color: fruitDef.color,
    merged: false
  });

  // Choose next fruit and update preview
  nextFruitType = Math.floor(Math.random() * 2); // Adjust range as needed
  drawNextFruit();
});

function drawNextFruit() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextCtx.font = "48px serif";
  nextCtx.textAlign = "center";
  nextCtx.textBaseline = "middle";
  nextCtx.fillText(fruitTypes[nextFruitType].emoji, nextCanvas.width / 2, nextCanvas.height / 2);
}



function updateFruits() {
  // Reset merge flags each frame
  for (let fruit of fruits) {
    fruit.merged = false;
  }

  for (let i = 0; i < fruits.length; i++) {
    const fruit = fruits[i];

    // Apply gravity
    fruit.vy += gravity;
    fruit.y += fruit.vy;
    fruit.x += fruit.vx;

    // Wall collisions
    if (fruit.x - fruit.radius < 0) {
      fruit.x = fruit.radius;
      fruit.vx *= -bounceFactor;
    }
    if (fruit.x + fruit.radius > canvas.width) {
      fruit.x = canvas.width - fruit.radius;
      fruit.vx *= -bounceFactor;
    }

    // Floor collision
    if (fruit.y + fruit.radius > canvas.height) {
  fruit.y = canvas.height - fruit.radius;
  fruit.vy *= -bounceFactor;
  fruit.vx *= friction;

  bounceSound.currentTime = 0;
  bounceSound.play();
}


    // Fruit-to-fruit collisions
    for (let j = i + 1; j < fruits.length; j++) {
      const other = fruits[j];
      const dx = fruit.x - other.x;
      const dy = fruit.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = fruit.radius + other.radius;

      if (dist < minDist) {
        // Check for merging condition
        if (
          fruit.type === other.type &&
          !fruit.merged &&
          !other.merged
        ) {
          const nextType = fruit.type + 1;
          if (nextType < fruitTypes.length) {
            const midX = (fruit.x + other.x) / 2;
            const midY = (fruit.y + other.y) / 2;

            fruits.push({
              x: midX,
              y: midY,
              radius: fruitTypes[nextType].radius,
              vy: -5,
              vx: (Math.random() - 0.5) * 2,
              type: nextType,
              color: fruitTypes[nextType].color,
              merged: false
            });
          }

          fruit.merged = true;
          other.merged = true;

          score += fruitTypes[nextType].points;
          document.getElementById("scoreDisplay").textContent = `Score: ${score}`;
          mergeSound.currentTime = 0;
          mergeSound.play();


          // Remove both fruits
          fruits.splice(j, 1);
          fruits.splice(i, 1);
          i--; // adjust index after removal
          break;
        } else {
          // Simple bounce response
          const angle = Math.atan2(dy, dx);
          const overlap = minDist - dist;

          const moveX = Math.cos(angle) * overlap / 2;
          const moveY = Math.sin(angle) * overlap / 2;

          fruit.x += moveX;
          fruit.y += moveY;
          other.x -= moveX;
          other.y -= moveY;

          const bounceX = Math.cos(angle) * bounceFactor;
          const bounceY = Math.sin(angle) * bounceFactor;

          fruit.vx += bounceX;
          fruit.vy += bounceY;
          other.vx -= bounceX;
          other.vy -= bounceY;
        }
      }
    }
  }
}


function drawFruits() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let fruit of fruits) {
    ctx.font = `${fruit.radius * 2}px serif`;

    // Glow effect
    ctx.shadowColor = fruit.color;
    ctx.shadowBlur = 10;

    ctx.fillText(fruitTypes[fruit.type].emoji, fruit.x, fruit.y);

    // Reset shadow after drawing
    ctx.shadowBlur = 0;
    
  }
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFruits();
  document.getElementById("restartBtn").style.display = "inline-block";
  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
  if (isGameOver) {
    drawGameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateFruits();
  drawFruits();
  requestAnimationFrame(gameLoop);
}

document.getElementById("restartBtn").addEventListener("click", () => {
  fruits.length = 0;
  score = 0;
  isGameOver = false;
  document.getElementById("scoreDisplay").textContent = "Score: 0";
  document.getElementById("restartBtn").style.display = "none";
  gameLoop();
});

gameLoop();
