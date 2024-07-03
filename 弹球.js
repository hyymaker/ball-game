const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏参数
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const blockSize = 20; // 正方形方块的尺寸
let paddleWidth = 100; // 长方形方块的初始宽度
const paddleHeight = 20; // 长方形方块的高度
let ballRadius = 7; // 小球的半径
let paddleX = (canvasWidth - paddleWidth) / 2; // 长方形方块的初始位置
let ballX = paddleX + paddleWidth / 2; // 小球的初始位置
let ballY = canvasHeight - paddleHeight - ballRadius; // 小球的初始位置
let ballDX = 2; // 小球的水平速度
let ballDY = -2; // 小球的垂直速度
let isBallMoving = false; // 小球是否移动
let balls = [{ x: ballX, y: ballY, dx: ballDX, dy: ballDY }]; // 小球数组，支持多球

// 菱形道具参数
const powerUpSize = 15;
const powerUpTypes = [
    { color: 'yellow', effect: 'paddleIncrease' },
    { color: 'orange', effect: 'ballIncrease' },
    { color: 'green', effect: 'ballDecrease' },
    { color: 'red', effect: 'ballSplit' }
];
const powerUps = [];

// 随机生成正方形方块的位置和数量
function generateBlocks() {
    const blocks = [];
    const numBlocks = Math.floor(Math.random() * 20) + 30; // 生成30到50个方块
    for (let i = 0; i < numBlocks; i++) {
        const x = Math.random() * (canvasWidth - blockSize);
        const y = Math.random() * (canvasHeight / 2 - blockSize);
        blocks.push({ x, y });
    }
    return blocks;
}

let blocks = generateBlocks();

// 绘制函数
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制正方形方块
    for (let block of blocks) {
        ctx.fillStyle = '#0095DD';
        ctx.fillRect(block.x, block.y, blockSize, blockSize);
    }

    // 绘制长方形方块
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);

    // 绘制小球
    for (let ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
    }

    // 绘制菱形道具
    for (let powerUp of powerUps) {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.moveTo(powerUp.x, powerUp.y - powerUpSize / 2);
        ctx.lineTo(powerUp.x + powerUpSize / 2, powerUp.y);
        ctx.lineTo(powerUp.x, powerUp.y + powerUpSize / 2);
        ctx.lineTo(powerUp.x - powerUpSize / 2, powerUp.y);
        ctx.closePath();
        ctx.fill();
    }

    // 更新小球位置
    if (isBallMoving) {
        for (let ball of balls) {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // 检查边界碰撞
            if (ball.x + ballRadius > canvasWidth || ball.x - ballRadius < 0) {
                ball.dx = -ball.dx;
            }
            if (ball.y - ballRadius < 0) {
                ball.dy = -ball.dy;
            } else if (ball.y + ballRadius > canvasHeight) {
                // 小球掉出屏幕，重新设置位置
                isBallMoving = false;
                ball.x = paddleX + paddleWidth / 2;
                ball.y = canvasHeight - paddleHeight - ballRadius;
                ball.dx = 2;
                ball.dy = -2;
                balls = [{ x: ball.x, y: ball.y, dx: ball.dx, dy: ball.dy }]; // 重置小球数组
            }

            // 检查与长方形方块碰撞
            if (ball.y + ballRadius > canvasHeight - paddleHeight && ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            }

            // 检查与正方形方块碰撞
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                if (
                    ball.x > block.x &&
                    ball.x < block.x + blockSize &&
                    ball.y > block.y &&
                    ball.y < block.y + blockSize
                ) {
                    blocks.splice(i, 1); // 移除碰撞的方块
                    ball.dy = -ball.dy;

                    // 随机生成菱形道具
                    if (Math.random() < 0.3) { // 30%几率生成道具
                        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                        powerUps.push({ x: block.x + blockSize / 2, y: block.y + blockSize / 2, color: powerUpType.color, effect: powerUpType.effect });
                    }
                    break;
                }
            }
        }
    }

    // 更新菱形道具位置
    for (let i = 0; i < powerUps.length; i++) {
        const powerUp = powerUps[i];
        powerUp.y += 2; // 道具向下移动

        // 检查道具与长方形方块碰撞
        if (powerUp.y + powerUpSize / 2 > canvasHeight - paddleHeight &&
            powerUp.x > paddleX && powerUp.x < paddleX + paddleWidth) {
            applyPowerUp(powerUp.effect);
            powerUps.splice(i, 1); // 移除已使用的道具
        } else if (powerUp.y > canvasHeight) {
            powerUps.splice(i, 1); // 移除掉出屏幕的道具
        }
    }

    requestAnimationFrame(draw);
}

// 处理鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvasWidth) {
        paddleX = relativeX - paddleWidth / 2;
        if (!isBallMoving) {
            for (let ball of balls) {
                ball.x = paddleX + paddleWidth / 2;
            }
        }
    }
});

// 处理鼠标点击事件
canvas.addEventListener('click', () => {
    if (!isBallMoving) {
        isBallMoving = true;
    }
});

// 应用菱形道具效果
function applyPowerUp(effect) {
    switch (effect) {
        case 'paddleIncrease':
            paddleWidth += 20;
            break;
        case 'ballIncrease':
            ballRadius *= 1.5;
            break;
        case 'ballDecrease':
            ballRadius *= 0.7;
            break;
        case 'ballSplit':
            const newBalls = [];
            for (let ball of balls) {
                newBalls.push({ x: ball.x, y: ball.y, dx: ball.dx, dy: ball.dy });
                newBalls.push({ x: ball.x, y: ball.y, dx: -ball.dx, dy: ball.dy });
                newBalls.push({ x: ball.x, y: ball.y, dx: ball.dx, dy: -ball.dy });
            }
            balls = newBalls;
            break;
    }
}

// 开始游戏
draw();
