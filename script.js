const canvas = document.getElementById("board")
const ctx = canvas.getContext("2d")
const scoreEl = document.getElementById("score")
const startBtn = document.getElementById("start")
const pauseBtn = document.getElementById("pause")
const resetBtn = document.getElementById("reset")
const tile = 20
const cols = canvas.width / tile
const rows = canvas.height / tile
let snake
let dir
let nextDir
let food
let running = false
let score = 0
let last = 0
let acc = 0
let step = 120
let obstacle
let star
let cleared = false
let gameOver = false
let blinkRemaining = 0
let blinkTick = 0
let blinkOn = true
const bgImg = new Image()
bgImg.src = "image_0.png"
let bgReady = false
bgImg.onload = () => { bgReady = true }

const bgm = new Audio("정우의 전략.mp3")
bgm.loop = true
bgm.volume = 0.4

function init() {
  const x = Math.floor(Math.random() * cols)
  const y = Math.floor(Math.random() * rows)
  snake = [{ x, y }]
  dir = { x: 1, y: 0 }
  nextDir = { x: 1, y: 0 }
  score = 0
  cleared = false
  gameOver = false
  scoreEl.textContent = String(score)
  food = spawnFood()
  obstacle = spawnObstacle()
  star = spawnStar()
}

function spawnFood() {
  while (true) {
    const x = Math.floor(Math.random() * cols)
    const y = Math.floor(Math.random() * rows)
    if (!snake.some(s => s.x === x && s.y === y) && (!obstacle || (obstacle.x !== x || obstacle.y !== y)) && (!star || (star.x !== x || star.y !== y))) return { x, y }
  }
}

function spawnObstacle() {
  while (true) {
    const x = Math.floor(Math.random() * cols)
    const y = Math.floor(Math.random() * rows)
    if (!snake.some(s => s.x === x && s.y === y) && (!food || (food.x !== x || food.y !== y)) && (!star || (star.x !== x || star.y !== y))) return { x, y }
  }
}

function spawnStar() {
  while (true) {
    const x = Math.floor(Math.random() * cols)
    const y = Math.floor(Math.random() * rows)
    if (!snake.some(s => s.x === x && s.y === y) && (!food || (food.x !== x || food.y !== y)) && (!obstacle || (obstacle.x !== x || obstacle.y !== y))) return { x, y }
  }
}

function update() {
  if (nextDir.x === -dir.x && nextDir.y === -dir.y) nextDir = dir
  dir = nextDir
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
    running = false
    gameOver = true
    bgm.pause()
    return
  }
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    running = false
    gameOver = true
    bgm.pause()
    return
  }
  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    score += 1
    scoreEl.textContent = String(score)
    food = spawnFood()
    blinkRemaining = 300
    if (step > 60 && score % 5 === 0) step -= 5
  } else {
    snake.pop()
  }

  if (head.x === obstacle.x && head.y === obstacle.y) {
    score = Math.max(0, score - 10)
    scoreEl.textContent = String(score)
    obstacle = spawnObstacle()
  }

  if (head.x === star.x && head.y === star.y) {
    score += 50
    scoreEl.textContent = String(score)
    star = spawnStar()
  }

  if (score >= 300) {
    cleared = true
    running = false
    bgm.pause()
  }
}

function drawCell(x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * tile, y * tile, tile, tile)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (bgReady) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
  } else {
    ctx.fillStyle = "#0c1030"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  drawCell(food.x, food.y, "#f44336")
  drawCell(obstacle.x, obstacle.y, "#7e57c2")
  drawStar(star.x, star.y, "#ffd54f")
  if (!(running && blinkRemaining > 0 && !blinkOn)) {
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i]
      const c = i === 0 ? "#29b6f6" : "#42a5f5"
      drawCell(s.x, s.y, c)
    }
  }
  if (!running) {
    ctx.fillStyle = "rgba(0,0,0,0.4)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#f6f7fb"
    ctx.font = "bold 20px system-ui"
    ctx.textAlign = "center"
    if (cleared) {
      ctx.fillText("게임 클리어! 리셋으로 재시작", canvas.width / 2, canvas.height / 2)
    } else if (gameOver) {
      ctx.fillText("게임 오버! 리셋으로 재시작", canvas.width / 2, canvas.height / 2)
    } else {
      ctx.fillText("스페이스바 또는 시작 버튼", canvas.width / 2, canvas.height / 2)
    }
  }
}

function loop(ts) {
  if (!last) last = ts
  const dt = ts - last
  last = ts
  if (running) {
    acc += dt
    while (acc >= step) {
      update()
      acc -= step
    }
  }
  if (blinkRemaining > 0) {
    blinkTick += dt
    while (blinkTick >= 80) {
      blinkOn = !blinkOn
      blinkTick -= 80
      blinkRemaining -= 80
    }
    if (blinkRemaining <= 0) {
      blinkRemaining = 0
      blinkTick = 0
      blinkOn = true
    }
  }
  draw()
  requestAnimationFrame(loop)
}

function start() {
  if (!running) {
    running = true
    bgm.play()
  }
}

function pause() {
  running = false
  bgm.pause()
}

function reset() {
  running = false
  acc = 0
  step = 120
  last = 0
  blinkRemaining = 0
  blinkTick = 0
  blinkOn = true
  init()
  running = true
  try {
    bgm.currentTime = 0
    bgm.play()
  } catch {}
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dir.y !== 1) nextDir = { x: 0, y: -1 }
  else if (e.key === "ArrowDown" && dir.y !== -1) nextDir = { x: 0, y: 1 }
  else if (e.key === "ArrowLeft" && dir.x !== 1) nextDir = { x: -1, y: 0 }
  else if (e.key === "ArrowRight" && dir.x !== -1) nextDir = { x: 1, y: 0 }
  else if (e.code === "Space") {
    if (gameOver || cleared) reset()
    else start()
  }
})

startBtn.addEventListener("click", start)
pauseBtn.addEventListener("click", pause)
resetBtn.addEventListener("click", reset)

init()
requestAnimationFrame(loop)

function drawStar(x, y, color) {
  const cx = x * tile + tile / 2
  const cy = y * tile + tile / 2
  const R = tile * 0.45
  const r = R * 0.5
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + i * (Math.PI / 5)
    const rad = i % 2 === 0 ? R : r
    const px = cx + Math.cos(ang) * rad
    const py = cy + Math.sin(ang) * rad
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}
