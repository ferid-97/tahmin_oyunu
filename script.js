// Oyun değişkenleri
let randomNumber, attempts, maxAttempts, minNumber, maxNumber, timer, interval, timeLimit;
let highScore = localStorage.getItem('highScore') || 0;
let guessHistory = [];
let gameActive = false;
let hintUsedThisRound = false;

// Zorluk ayarları
const difficulties = {
  easy:   {min: 1, max: 50, attempts: 12, time: 90},
  medium: {min: 1, max: 100, attempts: 10, time: 60},
  hard:   {min: 1, max: 200, attempts: 7, time: 45}
};

// DOM elementleri
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const resultDiv = document.getElementById('result');
const resetBtn = document.getElementById('resetBtn');
const attemptsLeftSpan = document.getElementById('attemptsLeft');
const highScoreSpan = document.getElementById('highScore');
const guessHistoryList = document.getElementById('guessHistory');
const timerSpan = document.getElementById('timer');
const difficultySelect = document.getElementById('difficultySelect');
const startBtn = document.getElementById('startBtn');
const gameArea = document.getElementById('gameArea');
const desc = document.getElementById('desc');
const hintBtn = document.getElementById('hintBtn');
const hintArea = document.getElementById('hintArea');

// Oyun başlatma fonksiyonu
function startGame() {
  const diff = difficultySelect.value;
  minNumber = difficulties[diff].min;
  maxNumber = difficulties[diff].max;
  maxAttempts = difficulties[diff].attempts;
  timeLimit = difficulties[diff].time;
  randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  attempts = 0;
  guessHistory = [];
  hintUsedThisRound = false;
  gameActive = true;
  desc.textContent = `${minNumber} ile ${maxNumber} arasında bir sayı tuttum.`;
  attemptsLeftSpan.textContent = maxAttempts;
  resultDiv.textContent = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
  hintBtn.disabled = false;
  resetBtn.style.display = "none";
  guessInput.value = "";
  guessInput.min = minNumber;
  guessInput.max = maxNumber;
  guessInput.focus();
  guessHistoryList.innerHTML = "";
  highScoreSpan.textContent = highScore;
  hintArea.textContent = "";
  timerSpan.textContent = `${timeLimit} sn`;
  clearInterval(interval);
  timer = timeLimit;
  interval = setInterval(updateTimer, 1000);
  gameArea.style.display = "block";
}

function updateTimer() {
  timer--;
  timerSpan.textContent = `${timer} sn`;
  if (timer <= 0) {
    timerSpan.textContent = "Süre doldu!";
    resultDiv.textContent = `Süre bitti! Doğru sayı: ${randomNumber}`;
    resultDiv.style.color = "#e74c3c";
    endGame();
  }
}

// Tahmin kontrol fonksiyonu
function checkGuess() {
  if (!gameActive) return;
  const guess = Number(guessInput.value);
  if (guess < minNumber || guess > maxNumber || isNaN(guess)) {
    resultDiv.textContent = `Lütfen ${minNumber} ile ${maxNumber} arasında bir sayı gir.`;
    resultDiv.style.color = "#e74c3c";
    return;
  }

  attempts++;
  let attemptsLeft = maxAttempts - attempts;
  attemptsLeftSpan.textContent = attemptsLeft;
  let li = document.createElement("li");

  if (guess === randomNumber) {
    resultDiv.textContent = `Tebrikler! ${attempts}. denemede doğru tahmin ettin! 🎉`;
    resultDiv.style.color = "#229954";
    li.textContent = `✔️ ${guess} (Doğru)`;
    li.classList.add("correct");
    updateHighScore(attempts);
    endGame();
  } else if (attempts >= maxAttempts) {
    resultDiv.textContent = `Maalesef kaybettin! Doğru sayı: ${randomNumber}`;
    resultDiv.style.color = "#e74c3c";
    li.textContent = `❌ ${guess} (Yanlış)`;
    li.classList.add("fail");
    endGame();
  } else if (guess < randomNumber) {
    resultDiv.textContent = "Daha büyük bir sayı dene!";
    resultDiv.style.color = "#f39c12";
    li.textContent = `⬆️ ${guess}`;
  } else {
    resultDiv.textContent = "Daha küçük bir sayı dene!";
    resultDiv.style.color = "#f39c12";
    li.textContent = `⬇️ ${guess}`;
  }

  guessHistory.push(guess);
  guessHistoryList.appendChild(li);
  guessInput.value = "";
  guessInput.focus();
  hintUsedThisRound = false;
}

// Skor güncelleme
function updateHighScore(score) {
  if (highScore === 0 || score < highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreSpan.textContent = highScore;
  }
}

// Oyun bitince arayüzü güncelle
function endGame() {
  gameActive = false;
  clearInterval(interval);
  guessBtn.disabled = true;
  guessInput.disabled = true;
  hintBtn.disabled = true;
  resetBtn.style.display = "inline-block";
}

// Yeniden başlama fonksiyonu
function resetGame() {
  startGame();
}

// Zorluk değiştiğinde sayı aralığını göster
difficultySelect.addEventListener('change', function () {
  const diff = difficultySelect.value;
  desc.textContent = `${difficulties[diff].min} ile ${difficulties[diff].max} arasında bir sayı tuttum.`;
  guessInput.min = difficulties[diff].min;
  guessInput.max = difficulties[diff].max;
});

// İpucu fonksiyonu
function giveHint() {
  if (!gameActive || hintUsedThisRound || attempts >= maxAttempts) return;
  if (maxAttempts - attempts <= 1) {
    hintArea.textContent = "Son hakkın, ipucu alamazsın!";
    return;
  }
  // 1 hak düşürülür
  attempts++;
  let attemptsLeft = maxAttempts - attempts;
  attemptsLeftSpan.textContent = attemptsLeft;
  hintUsedThisRound = true;

  // İpucu türünü rastgele seç
  let hintType = Math.floor(Math.random() * 2);
  let hintMsg;
  if (hintType === 0) {
    hintMsg = randomNumber % 2 === 0 ? "Sayı ÇİFT." : "Sayı TEK.";
  } else {
    // Aralık ipucu
    let span = Math.floor((maxNumber - minNumber) / 6);
    let lower = Math.max(randomNumber - span, minNumber);
    let upper = Math.min(randomNumber + span, maxNumber);
    hintMsg = `Sayı yaklaşık olarak ${lower} ile ${upper} arasında.`;
  }
  hintArea.textContent = `İpucu: ${hintMsg}`;
  // Eğer kullanıcı son hakkını kullandıysa oyunu bitir
  if (attempts >= maxAttempts) {
    resultDiv.textContent = `Hakların bitti! Doğru sayı: ${randomNumber}`;
    resultDiv.style.color = "#e74c3c";
    endGame();
  }
}

// Event Listenerlar
guessBtn.addEventListener('click', checkGuess);
resetBtn.addEventListener('click', resetGame);
guessInput.addEventListener('keyup', function(e) {
  if (e.key === 'Enter') checkGuess();
});
startBtn.addEventListener('click', startGame);
hintBtn.addEventListener('click', giveHint);

// Sayfa yüklenince default zorluk açıklaması
window.onload = function() {
  const diff = difficultySelect.value;
  desc.textContent = `${difficulties[diff].min} ile ${difficulties[diff].max} arasında bir sayı tuttum.`;
  highScoreSpan.textContent = highScore;
  gameArea.style.display = "none";
};