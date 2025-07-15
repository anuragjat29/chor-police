
let players = [];
let scores = {};
let currentRoles = {};

function startGame() {
  if (players.length === 0) {
    // First time: get names
    let p1 = document.getElementById("player1").value.trim();
    let p2 = document.getElementById("player2").value.trim();
    let p3 = document.getElementById("player3").value.trim();
    let p4 = document.getElementById("player4").value.trim();

    if (!p1 || !p2 || !p3 || !p4) {
      
      
      showNotification("Please enter all 4 player names.", "error");
      return;
    }

    players = [p1, p2, p3, p4];
    scores = { [p1]: 0, [p2]: 0, [p3]: 0, [p4]: 0 };

    
    // Animate transition
    const nameInputArea = document.getElementById("nameInputArea");
    const gameArea = document.getElementById("gameArea");
    
    nameInputArea.style.animation = "slideOutUp 0.5s ease-out forwards";
    setTimeout(() => {
      nameInputArea.style.display = "none";
      gameArea.style.display = "block";
      gameArea.style.animation = "slideInUp 0.8s ease-out";
    }, 500);
  }

  const roles = [1000, 500, 300, 0]; // King, Mantri, Sipahi, Chor
  const shuffled = [...roles].sort(() => 0.5 - Math.random());

  currentRoles = {};
  players.forEach((p, i) => currentRoles[p] = shuffled[i]);

  const sorted = Object.entries(currentRoles).sort((a, b) => b[1] - a[1]);
  const king = sorted[0][0];
  const mantri = sorted[1][0];
  const suspects = [sorted[2][0], sorted[3][0]];

  document.getElementById("status").innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 2rem; margin-bottom: 10px;">👑</div>
      <div style="font-size: 1.5rem; color: #667eea; font-weight: 700; margin-bottom: 5px;">${king}</div>
      <div style="color: #4a5568;">is the King</div>
    </div>
    <div style="margin-bottom: 20px;">
      <div style="font-size: 2rem; margin-bottom: 10px;">🤵</div>
      <div style="font-size: 1.5rem; color: #667eea; font-weight: 700; margin-bottom: 5px;">${mantri}</div>
      <div style="color: #4a5568;">is the Mantri</div>
    </div>
    <div style="margin-top: 30px; font-size: 1.2rem; color: #4a5568;">
      <i class="fas fa-search"></i> ${mantri}, guess who is the Chor:
    </div>
  `;

  document.getElementById("mantriGuess").innerHTML = `
    <button onclick="guessChor('${mantri}', '${suspects[0]}')" class="suspect-btn">
      <i class="fas fa-user-secret"></i> ${suspects[0]}
    </button>
    <button onclick="guessChor('${mantri}', '${suspects[1]}')" class="suspect-btn">
      <i class="fas fa-user-secret"></i> ${suspects[1]}
    </button>
  `;

  document.getElementById("result").innerHTML = "";
  document.getElementById("score").innerHTML = "";
}

function guessChor(mantri, guess) {
  const chor = Object.keys(currentRoles).find(p => currentRoles[p] === 0);

  let message = "";
  let isCorrect = false;
  
  if (guess === chor) {
    message = `✅ Correct! ${guess} was the Chor.`;
    isCorrect = true;
    players.forEach(p => scores[p] += currentRoles[p]);
    showNotification("Great job! Correct guess!", "success");
  } else {
    message = `❌ Wrong! ${guess} is not the Chor. Chor was ${chor}.`;
    isCorrect = false;
    players.forEach(p => {
      if (currentRoles[p] === 1000) scores[p] += 1000;
      else if (currentRoles[p] === 300) scores[p] += 300;
      else if (currentRoles[p] === 0) scores[p] += 500;
    });
    showNotification("Oops! Wrong guess!", "error");
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = message;
  resultDiv.style.background = isCorrect ? 
    "linear-gradient(45deg, #48bb78, #38a169)" : 
    "linear-gradient(45deg, #f56565, #e53e3e)";
  resultDiv.style.color = "white";
  resultDiv.style.animation = "pulse 0.6s ease-out";

  document.getElementById("mantriGuess").innerHTML = "";

  updateScoreboard();
}

function updateScoreboard() {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  let scoreboard = "<h3><i class='fas fa-trophy'></i> Scoreboard</h3>";
  sortedScores.forEach((player, index) => {
    const [name, score] = player;
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
    scoreboard += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">${medal}</span>
          <span style="font-weight: 600;">${name}</span>
        </div>
        <span style="font-weight: 700; font-size: 1.2rem;">${score}</span>
      </div>
    `;
  });
  
  document.getElementById("score").innerHTML = scoreboard;
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;
  
  if (type === "success") {
    notification.style.background = "linear-gradient(45deg, #48bb78, #38a169)";
  } else {
    notification.style.background = "linear-gradient(45deg, #f56565, #e53e3e)";
  }
  
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out forwards";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes slideOutUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-50px); opacity: 0; }
  }
  
  .suspect-btn {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24) !important;
    font-size: 16px !important;
    padding: 20px !important;
    min-width: 150px !important;
  }
  
  .suspect-btn:hover {
    background: linear-gradient(45deg, #ee5a24, #ff6b6b) !important;
    transform: translateY(-3px) scale(1.05) !important;
  }
`;
document.head.appendChild(style);
let players = [];
let scores = {};
let currentRoles = {};

function startGame() {
  if (players.length === 0) {
    // First time: get names
    let p1 = document.getElementById("player1").value.trim();
    let p2 = document.getElementById("player2").value.trim();
    let p3 = document.getElementById("player3").value.trim();
    let p4 = document.getElementById("player4").value.trim();

    if (!p1 || !p2 || !p3 || !p4) {
      
      
      showNotification("Please enter all 4 player names.", "error");
      return;
    }

    players = [p1, p2, p3, p4];
    scores = { [p1]: 0, [p2]: 0, [p3]: 0, [p4]: 0 };

    
    // Animate transition
    const nameInputArea = document.getElementById("nameInputArea");
    const gameArea = document.getElementById("gameArea");
    
    nameInputArea.style.animation = "slideOutUp 0.5s ease-out forwards";
    setTimeout(() => {
      nameInputArea.style.display = "none";
      gameArea.style.display = "block";
      gameArea.style.animation = "slideInUp 0.8s ease-out";
    }, 500);
  }

  const roles = [1000, 500, 300, 0]; // King, Mantri, Sipahi, Chor
  const shuffled = [...roles].sort(() => 0.5 - Math.random());

  currentRoles = {};
  players.forEach((p, i) => currentRoles[p] = shuffled[i]);

  const sorted = Object.entries(currentRoles).sort((a, b) => b[1] - a[1]);
  const king = sorted[0][0];
  const mantri = sorted[1][0];
  let suspects = [sorted[2][0], sorted[3][0]];

  // Shuffle suspects to randomize button order
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffle(suspects);

  document.getElementById("status").innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 2rem; margin-bottom: 10px;">👑</div>
      <div style="font-size: 1.5rem; color: #667eea; font-weight: 700; margin-bottom: 5px;">${king}</div>
      <div style="color: #4a5568;">is the King</div>
    </div>
    <div style="margin-bottom: 20px;">
      <div style="font-size: 2rem; margin-bottom: 10px;">🤵</div>
      <div style="font-size: 1.5rem; color: #667eea; font-weight: 700; margin-bottom: 5px;">${mantri}</div>
      <div style="color: #4a5568;">is the Mantri</div>
    </div>
    <div style="margin-top: 30px; font-size: 1.2rem; color: #4a5568;">
      <i class="fas fa-search"></i> ${mantri}, guess who is the Chor:
    </div>
  `;

  document.getElementById("mantriGuess").innerHTML = `
    <button onclick="guessChor('${mantri}', '${suspects[0]}')" class="suspect-btn">
      <i class="fas fa-user-secret"></i> ${suspects[0]}
    </button>
    <button onclick="guessChor('${mantri}', '${suspects[1]}')" class="suspect-btn">
      <i class="fas fa-user-secret"></i> ${suspects[1]}
    </button>
  `;

  document.getElementById("result").innerHTML = "";
  document.getElementById("score").innerHTML = "";
}

function guessChor(mantri, guess) {
  const chor = Object.keys(currentRoles).find(p => currentRoles[p] === 0);

  let message = "";
  let isCorrect = false;
  
  if (guess === chor) {
    message = `✅ Correct! ${guess} was the Chor.`;
    isCorrect = true;
    players.forEach(p => scores[p] += currentRoles[p]);
    showNotification("Great job! Correct guess!", "success");
  } else {
    message = `❌ Wrong! ${guess} is not the Chor. Chor was ${chor}.`;
    isCorrect = false;
    players.forEach(p => {
      if (currentRoles[p] === 1000) scores[p] += 1000;
      else if (currentRoles[p] === 300) scores[p] += 300;
      else if (currentRoles[p] === 0) scores[p] += 500;
    });
    showNotification("Oops! Wrong guess!", "error");
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = message;
  resultDiv.style.background = isCorrect ? 
    "linear-gradient(45deg, #48bb78, #38a169)" : 
    "linear-gradient(45deg, #f56565, #e53e3e)";
  resultDiv.style.color = "white";
  resultDiv.style.animation = "pulse 0.6s ease-out";

  document.getElementById("mantriGuess").innerHTML = "";

  updateScoreboard();
}

function updateScoreboard() {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  let scoreboard = "<h3><i class='fas fa-trophy'></i> Scoreboard</h3>";
  sortedScores.forEach((player, index) => {
    const [name, score] = player;
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
    scoreboard += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">${medal}</span>
          <span style="font-weight: 600;">${name}</span>
        </div>
        <span style="font-weight: 700; font-size: 1.2rem;">${score}</span>
      </div>
    `;
  });
  
  document.getElementById("score").innerHTML = scoreboard;
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;
  
  if (type === "success") {
    notification.style.background = "linear-gradient(45deg, #48bb78, #38a169)";
  } else {
    notification.style.background = "linear-gradient(45deg, #f56565, #e53e3e)";
  }
  
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out forwards";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes slideOutUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-50px); opacity: 0; }
  }
  
  .suspect-btn {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24) !important;
    font-size: 16px !important;
    padding: 20px !important;
    min-width: 150px !important;
  }
  
  .suspect-btn:hover {
    background: linear-gradient(45deg, #ee5a24, #ff6b6b) !important;
    transform: translateY(-3px) scale(1.05) !important;
  }
`;
document.head.appendChild(style);
<<<<<<< HEAD
=======
>>>>>>> 7ea9ee2 (Initial commit)
>>>>>>> 22ab14b (Describe your change here)
