
let players = [];
let scores = {};
let currentRoles = {};
let chitAssignments = [];
let chitRoles = [1000, 500, 300, 0]; // King, Mantri, Sipahi, Chor
let chitPhase = 0; // 0: picking, 1: reveal, 2: mantri guess, 3: result
let pickedChits = [];
let mantriName = '';
let kingName = '';
let guessCandidates = [];
let pickOrder = [];

const roleIcons = {
  1000: '👑',
  500: '🤵',
  300: '🛡️',
  0: '🦹'
};
const roleScores = {
  1000: 1000,
  500: 500,
  300: 300,
  0: 0
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startGame() {
  chitPhase = 0;
  pickedChits = [];
  chitAssignments = [];
  document.getElementById('result').innerHTML = '';
  document.getElementById('score').innerHTML = '';
  document.getElementById('status').innerHTML = '';
  document.getElementById('mantriGuess').innerHTML = '';

  if (players.length === 0) {
    let p1 = document.getElementById("player1").value.trim();
    let p2 = document.getElementById("player2").value.trim();
    let p3 = document.getElementById("player3").value.trim();
    let p4 = document.getElementById("player4").value.trim();
    // Assign default names if any are blank
    if (!p1) p1 = "Player 1";
    if (!p2) p2 = "Player 2";
    if (!p3) p3 = "Player 3";
    if (!p4) p4 = "Player 4";
    players = [p1, p2, p3, p4];
    scores = { [p1]: 0, [p2]: 0, [p3]: 0, [p4]: 0 };
    document.getElementById("nameInputArea").style.animation = "slideOutUp 0.5s ease-out forwards";
    setTimeout(() => {
      document.getElementById("nameInputArea").style.display = "none";
      document.getElementById("chitArea").style.display = "block";
      showChitPickPhase();
    }, 500);
  } else {
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("chitArea").style.display = "block";
    showChitPickPhase();
  }
}

function showChitPickPhase() {
  chitPhase = 0;
  pickedChits = [];
  chitAssignments = [];
  let chitArea = document.getElementById('chitArea');
  chitArea.innerHTML = `<h3 style='color:#eebbc3;'>Pick a chit one by one</h3>`;
  // Shuffle roles and players for picking order
  let roles = [...chitRoles];
  shuffle(roles);
  pickOrder = [...players];
  shuffle(pickOrder);
  chitAssignments = pickOrder.map((p, i) => ({ player: p, role: null, chitIndex: null }));
  // Arrange players around a round table
  chitArea.innerHTML += renderRoundTable();
  chitArea.innerHTML += `<div id='pickPrompt' style='margin-top:20px;font-size:1.2rem;color:#eebbc3;'></div>`;
  updatePickPrompt();
}

function renderRoundTable(showAll = false, revealKingMantri = false, revealAll = false, enableGuess = false) {
  // Player positions: 0-North, 1-East, 2-South, 3-West
  let pos = [0, 1, 2, 3];
  let playerPos = {};
  for (let i = 0; i < 4; i++) playerPos[pos[i]] = pickOrder[i];
  // Chits in the center
  let chitsHTML = '';
  let nextIdx = chitAssignments.findIndex(a => a.role === null);
  let nextChitPick = (nextIdx !== -1) ? null : null;
  if (nextIdx !== -1) {
    nextChitPick = chitAssignments[nextIdx];
  }
  for (let i = 0; i < 4; i++) {
    let assign = chitAssignments.find(a => a.chitIndex === i);
    let chitContent = '🎴';
    let bg = '#232946';
    let color = '#eebbc3';
    let pointer = 'default';
    let extra = '';
    let onclick = '';
    if (assign && assign.role !== null) {
      if (showAll || revealAll || (revealKingMantri && (assign.role === 1000 || assign.role === 500))) {
        // Always use a flex column for icon, name, and score, with proper font sizes and spacing
        let icon = roleIcons[assign.role];
        let name = assign.player;
        let score = roleScores[assign.role];
        if (assign.role === 1000) { bg = '#48bb78'; color = '#fff'; }
        else if (assign.role === 500) { bg = '#eebbc3'; color = '#232946'; }
        else if (assign.role === 300) { bg = '#393e5c'; color = '#eebbc3'; }
        else if (assign.role === 0) { bg = '#232946'; color = '#eebbc3'; }
        chitContent = `<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;'>
          <span style='font-size:2rem;line-height:1;'>${icon}</span>
          <span style='font-size:0.95rem;line-height:1;margin-top:2px;word-break:break-word;text-align:center;'>${name}</span>
          <span style='font-size:0.85rem;line-height:1;margin-top:2px;'>${score}</span>
        </div>`;
      } else {
        chitContent = '🎴';
        bg = '#232946';
        color = '#eebbc3';
        // If in guess phase, show name under chit and make clickable
        if (enableGuess && (assign.role === 0 || assign.role === 300)) {
          pointer = 'pointer';
          extra = `<div style='font-size:0.95rem;margin-top:2px;color:#eebbc3;'>${assign.player}</div>`;
          onclick = `onclick='mantriGuessChitByChit(${i})'`;
        }
      }
    } else if (chitPhase === 0 && nextChitPick && assign === undefined && !pickedChits.includes(i)) {
      // Only allow the next chit to be picked
      pointer = 'pointer';
      onclick = `onclick='pickChit(${i})'`;
    }
    chitsHTML += `<div class='chit-card' id='chit${i}' ${onclick} style='width:70px;height:100px;background:${bg};border-radius:12px;box-shadow:0 4px 16px #181c2f;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:2rem;color:${color};margin:0 10px;cursor:${pointer};transition:transform 0.2s;overflow:hidden;'>${chitContent}${extra}</div>`;
  }
  // Table layout
  return `
    <div style='display:flex;flex-direction:column;align-items:center;justify-content:center;'>
      <div style='display:flex;justify-content:center;align-items:center;width:350px;height:60px;'>
        <div style='flex:1;text-align:center;color:#eebbc3;'>${playerPos[0]}</div>
      </div>
      <div style='display:flex;flex-direction:row;align-items:center;justify-content:center;width:350px;'>
        <div style='flex:1;text-align:center;color:#eebbc3;'>${playerPos[3]}</div>
        <div style='display:flex;justify-content:center;align-items:center;'>${chitsHTML}</div>
        <div style='flex:1;text-align:center;color:#eebbc3;'>${playerPos[1]}</div>
      </div>
      <div style='display:flex;justify-content:center;align-items:center;width:350px;height:60px;'>
        <div style='flex:1;text-align:center;color:#eebbc3;'>${playerPos[2]}</div>
      </div>
    </div>
  `;
}

function updatePickPrompt() {
  let next = chitAssignments.find(a => a.role === null);
  if (next) {
    document.getElementById('pickPrompt').innerHTML = `It's <b>${next.player}</b>'s turn to pick a chit.`;
  } else {
    document.getElementById('pickPrompt').innerHTML = '';
    revealKingMantri();
  }
}

function pickChit(idx) {
  if (chitPhase !== 0) return;
  // Only allow the current player in pickOrder to pick
  let nextIdx = chitAssignments.findIndex(a => a.role === null);
  if (nextIdx === -1) return;
  let currentPlayer = chitAssignments[nextIdx].player;
  // Only allow picking if the chit is not already picked and it's the current player's turn
  if (pickedChits.includes(idx)) return;
  // Assign role
  if (pickedChits.length === 0) {
    window._chitRolesShuffled = [...chitRoles];
    shuffle(window._chitRolesShuffled);
  }
  let role = window._chitRolesShuffled[pickedChits.length];
  chitAssignments[nextIdx].role = role;
  chitAssignments[nextIdx].chitIndex = idx;
  pickedChits.push(idx);
  // Update only the picked chit visually for immediate feedback
  let chitDiv = document.getElementById('chit' + idx);
  if (role === 1000 || role === 500) {
    let icon = roleIcons[role];
    let name = chitAssignments[nextIdx].player;
    let score = roleScores[role];
    let bg = (role === 1000) ? '#48bb78' : '#eebbc3';
    let color = (role === 1000) ? '#fff' : '#232946';
    chitDiv.style.background = bg;
    chitDiv.style.color = color;
    chitDiv.style.pointerEvents = 'none';
    chitDiv.innerHTML = `<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;'>
      <span style='font-size:2rem;line-height:1;'>${icon}</span>
      <span style='font-size:0.95rem;line-height:1;margin-top:2px;word-break:break-word;text-align:center;'>${name}</span>
      <span style='font-size:0.85rem;line-height:1;margin-top:2px;'>${score}</span>
    </div>`;
  } else {
    // For Sipahi or Chor, show name only (no icon or score)
    chitDiv.style.background = '#232946';
    chitDiv.style.color = '#eebbc3';
    chitDiv.style.pointerEvents = 'none';
    let name = chitAssignments[nextIdx].player;
    chitDiv.innerHTML = `<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;'>
      <span style='font-size:2rem;line-height:1;'>🎴</span>
      <span style='font-size:0.95rem;line-height:1;margin-top:2px;word-break:break-word;text-align:center;'>${name}</span>
    </div>`;
  }
  updatePickPrompt();
}

function revealKingMantri() {
  chitPhase = 1;
  kingName = chitAssignments.find(a => a.role === 1000).player;
  mantriName = chitAssignments.find(a => a.role === 500).player;
  let sipahi = chitAssignments.find(a => a.role === 300).player;
  let chor = chitAssignments.find(a => a.role === 0).player;
  guessCandidates = [sipahi, chor];
  shuffle(guessCandidates);
  // Show chits: reveal king and mantri, hide others, show names under hidden chits, make them clickable
  let chitArea = document.getElementById('chitArea');
  chitArea.innerHTML = `<h3 style='color:#eebbc3;'>Chits revealed!</h3><div style='margin-bottom:20px;color:#eebbc3;'>Mantri must guess the Chor by clicking one of the two hidden chits below.</div>` + renderRoundTable(false, true, false, true);
  chitArea.innerHTML += `<div id='mantriGuessArea' style='margin-top:30px;'></div>`;
}

function showMantriGuess() {
  // No separate guess buttons needed
}

function mantriGuessChitByChit(idx) {
  chitPhase = 3;
  let assign = chitAssignments.find(a => a.chitIndex === idx);
  let guessed = assign.player;
  let chor = chitAssignments.find(a => a.role === 0).player;
  let area = document.getElementById('mantriGuessArea');
  area.innerHTML = '';
  // Reveal all chits with icons, names, and scores
  let chitArea = document.getElementById('chitArea');
  chitArea.innerHTML = `<h3 style='color:#eebbc3;'>Chits revealed:</h3>` + renderRoundTable(true, false, true, false);
  // Show result
  let isCorrect = (guessed === chor);
  let message = isCorrect ? `✅ Correct! ${guessed} was the Chor.` : `❌ Wrong! ${guessed} is not the Chor. Chor was ${chor}.`;
  if (isCorrect) {
    players.forEach(p => scores[p] += chitAssignments.find(a => a.player === p).role);
    showNotification("Great job! Correct guess!", "success");
  } else {
    players.forEach(p => {
      let role = chitAssignments.find(a => a.player === p).role;
      if (role === 1000) scores[p] += 1000;
      else if (role === 300) scores[p] += 300;
      else if (role === 0) scores[p] += 500;
    });
    showNotification("Oops! Wrong guess!", "error");
  }
  document.getElementById('result').innerHTML = message;
  updateScoreboard();
  chitArea.innerHTML += `<button class='next-btn' style='margin-top:30px;' onclick='startGame()'><i class='fas fa-forward'></i> Next Round</button>`;
  document.getElementById('gameArea').style.display = 'block';
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
