let box = document.querySelector(".box")
const ball = document.querySelector(".ball")
let gameRunning = true;
const highScoreDisplay = document.querySelector(".heightscore"); 
let right = 25;
let au = document.querySelector(".au")
// حركة الكرة
let targetRight = parseInt(window.getComputedStyle(ball).getPropertyValue("right")) || 0;
document.addEventListener("keydown", e => {
    let rightpos = parseInt(window.getComputedStyle(ball).getPropertyValue("right")) || 0;
    if (e.key == "ArrowRight" && gameRunning) targetRight = rightpos - right;
    if (e.key == "ArrowLeft" && gameRunning) targetRight = rightpos + right;
});

// --- Animate الكرة بسلاسة ---
function animateBall() {
    let cur = parseFloat(window.getComputedStyle(ball).getPropertyValue("right")) || 0;
    const maxRight = box.offsetWidth - ball.offsetWidth - 20;
    if (targetRight < 0) targetRight = 0;
    if (targetRight > maxRight) targetRight = maxRight;
    const diff = targetRight - cur;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), Math.max(1, Math.abs(diff) * 0.25));
    ball.style.right = cur + step + "px";
    requestAnimationFrame(animateBall);
}
requestAnimationFrame(animateBall);

// الصوت
let audio = document.querySelector(".aud");
audio.volume = 0.1;
audio.playbackRate = 1.5;
audio.currentTime = 20;
au.currentTime = 2;


// السكور
let score = 0;
const scoreDisplay = document.querySelector(".score");
scoreDisplay.textContent = score;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
highScoreDisplay.textContent = highScore;

// تحديث السكور
function updateScore() {
    score++;
    scoreDisplay.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.textContent = highScore;
    }
}

// --- جدران كائنية ---
let wallsArray = [];
let speed = 2;
let spawnTimeoutId = null;

function spawnWall() {
    if (!gameRunning) return;

    let duration = 5;
    let intervalTime = 1500;

    if(score >= 10) { duration = 4.5; intervalTime = 1200; right = 30; audio.playbackRate = 1.8 }
    if(score >= 20) { duration = 3; intervalTime = 1000; audio.playbackRate = 2 }
    if(score >= 30) { duration = 2.5; intervalTime = 700; audio.playbackRate = 2.5 }
    if(score >= 35) { duration = 1.5; intervalTime = 500; audio.playbackRate = 2 }
    if(score >= 40) { duration = 1.5; intervalTime = 300; audio.playbackRate = 3.5 }
    if(score >= 45) { duration = 0.5; intervalTime = 200; audio.playbackRate = 3.5 }

    createWallObject(duration);

    if(gameRunning) spawnTimeoutId = setTimeout(spawnWall, intervalTime);
}

// إنشاء جدار كائن
function createWallObject(duration) {
    if (!gameRunning) return;

    let wallObj = {
        wall: document.createElement("div"),
        hole: document.createElement("div"),
        pos: -50,
        scored: false,
        duration: duration,
        speed: speed
    };
    wallObj.wall.className = "wall";
    wallObj.hole.className = "hole";
    box.appendChild(wallObj.wall);
    box.appendChild(wallObj.hole);

    wallObj.wall.style.animationDuration = duration + "s";
    wallObj.hole.style.animationDuration = duration + "s";

    const holeWidth = wallObj.hole.offsetWidth || 70;
    const padding = 20;
    const maxLeft = Math.max(box.offsetWidth - holeWidth - padding, padding);
    wallObj.hole.style.left = Math.floor(Math.random() * (maxLeft - padding + 1)) + padding + "px";

    wallsArray.push(wallObj);
}

// --- Animate جميع الجدران ---
function animateWalls() {
    if (!gameRunning) return;

    wallsArray.forEach((w, index) => {
        w.pos += w.speed;
        w.wall.style.top = w.pos + "px";
        w.hole.style.top = w.pos + "px";

        // حساب السكور من أول جدار يتجاوز الكرة
        if (!w.scored && w.pos > ball.offsetTop + ball.offsetHeight) {
            w.scored = true;
            updateScore();
        }

        checkCollision(w.wall, w.hole);

        // حذف الجدار بعد خروجه من الصندوق
        if (w.pos > box.offsetHeight + 100) {
            w.wall.remove();
            w.hole.remove();
            wallsArray.splice(index, 1);
        }
    });

    requestAnimationFrame(animateWalls);
}
requestAnimationFrame(animateWalls);
if(gameRunning === true){
    audio.play()
    au.pause()
}

// --- التصادم ---
function checkCollision(wall, hole) {
    if (!gameRunning) return;
    let ballRect = ball.getBoundingClientRect();
    let wallRect = wall.getBoundingClientRect();
    let holeRect = hole.getBoundingClientRect();
    if (ballRect.bottom > wallRect.top && ballRect.top < wallRect.bottom) {
        const insideHole = (ballRect.right > holeRect.left && ballRect.left < holeRect.right);
        if (!insideHole) {
            document.querySelectorAll('.wall, .hole').forEach(el => el.classList.add('paused'));
            audio.pause();
            au.play()
            gameRunning = false;
            showGameOver();

            document.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !gameRunning) location.reload();
            }, { once: true });
        }
    }
}

// --- رسالة الخسارة ---
function showGameOver() {
    let div = document.createElement("div");
    let button = document.createElement("i");
    let p = document.createElement("p");
    p.textContent = "Loees";
    div.appendChild(p);
    div.appendChild(button);
    button.classList.add("fa-solid", "fa-rotate-right");
    div.classList.add("game-over");
    document.body.appendChild(div);
    button.addEventListener("click", () => location.reload());
    document.addEventListener("keydown",(e)=>{
        if(e.key === "Enter" && gameRunning === false){
            location.reload()
        }

    })
}

// --- إطلاق اللعبة ---
spawnWall();
 