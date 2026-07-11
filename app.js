
const DAILY_KEY = "mzjV6Daily";
const WINS_KEY = "mzjV6Wins";
const MEALS_KEY = "mzjV6Meals";
const WEIGHTS_KEY = "mzjV6Weights";
const SETTINGS_KEY = "mzjV6Settings";

const defaults = {
  name: "Kev",
  startDate: new Date().toISOString().split("T")[0],
  startingWeight: 328,
  waterGoal: 80,
  proteinGoal: 100,
  movementGoal: 30,
  sleepGoal: 8
};

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const mealSuggestions = {
  balanced: {
    breakfast: ["Greek yogurt and berries","Eggs and toast","Oatmeal and peanut butter","Cottage cheese and fruit","Egg and turkey wrap","Protein smoothie","Scrambled eggs and avocado"],
    lunch: ["Chicken salad","Turkey wrap and fruit","Tuna and crackers","Chicken soup and half sandwich","Leftover protein and vegetables","Chicken and bean bowl","Cottage cheese plate"],
    dinner: ["Baked chicken, green beans, potato","Salmon, vegetables, rice","Turkey meatballs and vegetables","Beef and vegetable stir-fry","Pork tenderloin and sweet potato","Turkey chili and salad","Shrimp tacos and slaw"],
    snack: ["Cheese stick and apple","Protein shake","Greek yogurt","Cottage cheese","Turkey roll-ups","Egg and fruit","Small handful of nuts"]
  },
  highProtein: {
    breakfast: ["3 eggs and turkey sausage","Greek yogurt with protein powder","Protein shake and egg","Cottage cheese and fruit","Turkey breakfast sandwich","Protein oatmeal","Eggs and chicken sausage"],
    lunch: ["Chicken breast salad","Tuna and eggs","Turkey burger and salad","Chicken and bean bowl","Turkey and cottage cheese plate","Salmon pouch and crackers","Roast beef wrap"],
    dinner: ["Chicken and broccoli","Salmon and asparagus","Lean steak and vegetables","Turkey chili","Shrimp stir-fry","Pork tenderloin","Baked cod and vegetables"],
    snack: ["Protein shake","Greek yogurt","Cottage cheese","Turkey roll-ups","Two eggs","Cheese and turkey","Edamame"]
  },
  simple: {
    breakfast: ["Greek yogurt and banana","Eggs and toast","Protein shake","Cottage cheese and fruit","Oatmeal and peanut butter","Turkey sausage and fruit","Breakfast sandwich"],
    lunch: ["Rotisserie chicken and salad","Turkey sandwich and carrots","Tuna packet and crackers","Soup and half sandwich","Frozen grilled chicken and vegetables","Deli turkey wrap","Cottage cheese and fruit"],
    dinner: ["Rotisserie chicken and vegetables","Frozen salmon and rice","Turkey burger and salad","Chicken sausage and vegetables","Prepared chicken and sweet potato","Low-sodium chili","Shrimp and frozen vegetables"],
    snack: ["Protein shake","Cheese stick","Greek yogurt","Apple and peanut butter","Hard-boiled egg","Cottage cheese cup","Nut pack"]
  },
  gentle: {
    breakfast: ["Plain oatmeal and banana","Greek yogurt and berries","Scrambled egg and toast","Cottage cheese and peaches","Protein shake sipped slowly","Cream of wheat","Egg whites and toast"],
    lunch: ["Chicken noodle soup","Turkey sandwich on toast","Chicken and rice","Tuna and crackers","Cottage cheese and banana","Vegetable soup with chicken","Plain turkey wrap"],
    dinner: ["Baked chicken, rice, carrots","Baked fish and mashed potatoes","Turkey meatloaf and green beans","Chicken soup and crackers","Turkey burger and sweet potato","Scrambled eggs and toast","Baked cod and rice"],
    snack: ["Banana","Applesauce","Greek yogurt","Crackers and cheese","Protein shake","Cottage cheese","Toast and peanut butter"]
  }
};

function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
}
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function settings() { return {...defaults, ...read(SETTINGS_KEY, {})}; }
function escapeHtml(value = "") {
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function progress(value, goal) {
  return Math.max(0, Math.min(100, goal ? (Number(value) / Number(goal)) * 100 : 0));
}

function setGreeting() {
  const hour = new Date().getHours();
  const word = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const s = settings();
  document.getElementById("greeting").textContent = `${word}, ${s.name}`;
  document.getElementById("todayLabel").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  const start = new Date(s.startDate + "T00:00:00");
  const daysSince = Math.max(0, Math.floor((new Date() - start) / 86400000));
  document.getElementById("journeyWeek").textContent = Math.floor(daysSince / 7) + 1;
}

function loadToday() {
  const daily = read(DAILY_KEY, []);
  const today = daily.find(d => d.date === todayString());
  if (!today) return;
  ["water","protein","movement","sleep","mood","appetite","dose","notes"].forEach(id => {
    const el = document.getElementById(id);
    if (el && today[id] !== undefined) el.value = today[id];
  });
  document.getElementById("shotTaken").checked = Boolean(today.shotTaken);
}

function renderToday() {
  const s = settings();
  const daily = read(DAILY_KEY, []);
  const today = daily.find(d => d.date === todayString()) || {};
  document.getElementById("waterValue").textContent = `${today.water || 0} / ${s.waterGoal} oz`;
  document.getElementById("proteinValue").textContent = `${today.protein || 0} / ${s.proteinGoal} g`;
  document.getElementById("movementValue").textContent = `${today.movement || 0} / ${s.movementGoal} min`;
  document.getElementById("sleepValue").textContent = `${today.sleep || 0} / ${s.sleepGoal} hr`;
  document.getElementById("shotValue").textContent = today.shotTaken ? "Complete" : "Not logged";
  document.getElementById("currentDose").textContent = today.dose || document.getElementById("dose").value || "2.5 mg";
  document.getElementById("waterMeter").style.width = `${progress(today.water, s.waterGoal)}%`;
  document.getElementById("proteinMeter").style.width = `${progress(today.protein, s.proteinGoal)}%`;
  document.getElementById("movementMeter").style.width = `${progress(today.movement, s.movementGoal)}%`;
  document.getElementById("sleepMeter").style.width = `${progress(today.sleep, s.sleepGoal)}%`;
  document.getElementById("shotMeter").style.width = today.shotTaken ? "100%" : "0%";
}

document.getElementById("dailyForm").addEventListener("submit", event => {
  event.preventDefault();
  const entry = {
    date: todayString(),
    water: Number(document.getElementById("water").value) || 0,
    protein: Number(document.getElementById("protein").value) || 0,
    movement: Number(document.getElementById("movement").value) || 0,
    sleep: Number(document.getElementById("sleep").value) || 0,
    mood: document.getElementById("mood").value,
    appetite: document.getElementById("appetite").value,
    shotTaken: document.getElementById("shotTaken").checked,
    dose: document.getElementById("dose").value,
    notes: document.getElementById("notes").value.trim()
  };
  const daily = read(DAILY_KEY, []);
  const index = daily.findIndex(d => d.date === entry.date);
  if (index >= 0) daily[index] = entry; else daily.push(entry);
  daily.sort((a,b) => new Date(a.date)-new Date(b.date));
  write(DAILY_KEY, daily);
  renderAll();
  alert("Today was saved.");
});

let selectedWins = new Set();
document.querySelectorAll("[data-win]").forEach(button => {
  button.addEventListener("click", () => {
    const win = button.dataset.win;
    if (selectedWins.has(win)) {
      selectedWins.delete(win);
      button.classList.remove("selected");
    } else {
      selectedWins.add(win);
      button.classList.add("selected");
    }
  });
});
document.getElementById("saveWinBtn").addEventListener("click", () => {
  const custom = document.getElementById("customWin").value.trim();
  const wins = read(WINS_KEY, []);
  let today = wins.find(w => w.date === todayString());
  if (!today) {
    today = {date: todayString(), wins: []};
    wins.push(today);
  }
  today.wins = [...new Set([...today.wins, ...selectedWins, ...(custom ? [custom] : [])])];
  write(WINS_KEY, wins);
  selectedWins = new Set();
  document.querySelectorAll("[data-win]").forEach(b => b.classList.remove("selected"));
  document.getElementById("customWin").value = "";
  renderWins();
});

function renderWins() {
  const wins = read(WINS_KEY, []);
  const today = wins.find(w => w.date === todayString());
  document.getElementById("winsList").innerHTML = today?.wins?.map(win => `<span class="win-chip">⭐ ${escapeHtml(win)}</span>`).join("") || "";
}

function blankMeals() {
  return days.map(day => ({day, breakfast:"", lunch:"", dinner:"", snack:""}));
}
function mealPlan() { return read(MEALS_KEY, blankMeals()); }
function renderMeals(plan = mealPlan()) {
  document.getElementById("mealCarousel").innerHTML = plan.map((meal, index) => `
    <article class="meal-day">
      <h3>${meal.day}</h3>
      <textarea data-day="${index}" data-meal="breakfast" placeholder="Breakfast">${escapeHtml(meal.breakfast)}</textarea>
      <textarea data-day="${index}" data-meal="lunch" placeholder="Lunch">${escapeHtml(meal.lunch)}</textarea>
      <textarea data-day="${index}" data-meal="dinner" placeholder="Dinner">${escapeHtml(meal.dinner)}</textarea>
      <textarea data-day="${index}" data-meal="snack" placeholder="Snack">${escapeHtml(meal.snack)}</textarea>
    </article>
  `).join("");
}
function collectMeals() {
  const plan = blankMeals();
  document.querySelectorAll("#mealCarousel textarea").forEach(el => {
    plan[Number(el.dataset.day)][el.dataset.meal] = el.value.trim();
  });
  return plan;
}
document.getElementById("suggestMealsBtn").addEventListener("click", () => {
  const style = document.getElementById("mealStyle").value;
  const includeSnack = document.getElementById("mealsPerDay").value === "4";
  const source = mealSuggestions[style];
  renderMeals(days.map((day,index) => ({
    day,
    breakfast: source.breakfast[index],
    lunch: source.lunch[index],
    dinner: source.dinner[index],
    snack: includeSnack ? source.snack[index] : ""
  })));
});
document.getElementById("saveMealsBtn").addEventListener("click", () => {
  write(MEALS_KEY, collectMeals());
  alert("Meal plan saved.");
});
document.getElementById("exportMealsBtn").addEventListener("click", () => {
  const rows = [["Day","Breakfast","Lunch","Dinner","Snack"], ...collectMeals().map(m => [m.day,m.breakfast,m.lunch,m.dinner,m.snack])];
  downloadCsv("my-zepbound-meal-plan.csv", rows);
});

function shoppingGroups(plan) {
  const text = plan.flatMap(m => [m.breakfast,m.lunch,m.dinner,m.snack]).join(" ").toLowerCase();
  const map = {
    Protein: [["chicken","Chicken"],["turkey","Turkey"],["egg","Eggs"],["tuna","Tuna"],["salmon","Salmon"],["shrimp","Shrimp"],["fish","White fish"],["beef","Lean beef"],["pork","Pork tenderloin"]],
    Produce: [["berry","Berries"],["banana","Bananas"],["apple","Apples"],["salad","Salad greens"],["broccoli","Broccoli"],["vegetable","Mixed vegetables"],["carrot","Carrots"],["avocado","Avocado"]],
    Dairy: [["yogurt","Greek yogurt"],["cottage cheese","Cottage cheese"],["cheese","Cheese"]],
    Pantry: [["oatmeal","Oatmeal"],["rice","Rice"],["toast","Whole-grain bread"],["wrap","Whole-grain wraps"],["cracker","Crackers"],["bean","Beans"],["nuts","Nuts"],["peanut butter","Peanut butter"],["protein shake","Protein shakes"]]
  };
  const output = {};
  Object.entries(map).forEach(([group, items]) => output[group] = items.filter(([key]) => text.includes(key)).map(([,label]) => label));
  return output;
}
document.getElementById("shoppingListBtn").addEventListener("click", () => {
  const groups = shoppingGroups(collectMeals());
  document.getElementById("shoppingList").innerHTML = Object.entries(groups).map(([group, items]) => `
    <section class="shopping-group"><strong>${group}</strong><div>${items.length ? items.map(i => `• ${i}`).join("<br>") : "Nothing added yet"}</div></section>
  `).join("");
  document.getElementById("shoppingDialog").showModal();
});
document.getElementById("copyShoppingBtn").addEventListener("click", async () => {
  const groups = shoppingGroups(collectMeals());
  const text = Object.entries(groups).map(([group,items]) => `${group}\n${items.map(i => `- ${i}`).join("\n")}`).join("\n\n");
  await navigator.clipboard.writeText(text);
  alert("Shopping list copied.");
});

function renderStory() {
  const daily = [...read(DAILY_KEY, [])].reverse();
  const wins = read(WINS_KEY, []);
  if (!daily.length) {
    document.getElementById("storyTimeline").innerHTML = "<p>No entries yet. Your journey will appear here as you check in.</p>";
    return;
  }
  document.getElementById("storyTimeline").innerHTML = daily.map(day => {
    const dayWins = wins.find(w => w.date === day.date)?.wins || [];
    return `
      <article class="timeline-card">
        <div class="timeline-date">${new Date(day.date+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div>
        <div>
          <div class="timeline-details">
            <span class="timeline-pill">💧 ${day.water || 0} oz</span>
            <span class="timeline-pill">🥩 ${day.protein || 0} g</span>
            <span class="timeline-pill">👟 ${day.movement || 0} min</span>
            <span class="timeline-pill">🌙 ${day.sleep || 0} hr</span>
            ${day.mood ? `<span class="timeline-pill">🙂 ${escapeHtml(day.mood)}</span>` : ""}
            ${day.shotTaken ? `<span class="timeline-pill">💉 ${escapeHtml(day.dose)}</span>` : ""}
            ${dayWins.map(win => `<span class="timeline-pill">⭐ ${escapeHtml(win)}</span>`).join("")}
          </div>
          ${day.notes ? `<p class="timeline-note">${escapeHtml(day.notes)}</p>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

document.getElementById("exportDataBtn").addEventListener("click", () => {
  const daily = read(DAILY_KEY, []);
  const rows = [["Date","Water","Protein","Movement","Sleep","Mood","Appetite","Shot Taken","Dose","Notes"],
    ...daily.map(d => [d.date,d.water,d.protein,d.movement,d.sleep,d.mood,d.appetite,d.shotTaken?"Yes":"No",d.dose,d.notes])];
  downloadCsv("my-zepbound-journey-data.csv", rows);
});

document.getElementById("weightDate").value = todayString();
document.getElementById("weightForm").addEventListener("submit", event => {
  event.preventDefault();
  const date = document.getElementById("weightDate").value;
  const weight = Number(document.getElementById("weight").value);
  if (!date || !weight) return;
  const weights = read(WEIGHTS_KEY, []);
  weights.push({date, weight});
  weights.sort((a,b) => new Date(a.date)-new Date(b.date));
  write(WEIGHTS_KEY, weights);
  document.getElementById("weight").value = "";
  renderProgress();
});
function renderProgress() {
  const s = settings();
  const weights = read(WEIGHTS_KEY, []);
  document.getElementById("startWeight").textContent = `${Number(s.startingWeight).toFixed(1)} lb`;
  if (!weights.length) {
    document.getElementById("currentWeight").textContent = "—";
    document.getElementById("weightChange").textContent = "—";
    drawChart([]);
    return;
  }
  const current = weights[weights.length - 1].weight;
  const change = Number(s.startingWeight) - current;
  document.getElementById("currentWeight").textContent = `${current.toFixed(1)} lb`;
  document.getElementById("weightChange").textContent = change >= 0 ? `${change.toFixed(1)} lb down` : `${Math.abs(change).toFixed(1)} lb up`;
  drawChart(weights);
}
function drawChart(weights) {
  const canvas = document.getElementById("weightChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width, height = canvas.height;
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,width,height);
  if (!weights.length) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "20px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Add a weight entry whenever you are ready.", width/2, height/2);
    return;
  }
  const padding = {left:60,right:30,top:25,bottom:50};
  const values = weights.map(w => w.weight);
  let min = Math.min(...values)-3, max = Math.max(...values)+3;
  if (min === max) { min -= 5; max += 5; }
  const x = i => padding.left + (weights.length === 1 ? (width-padding.left-padding.right)/2 : i*(width-padding.left-padding.right)/(weights.length-1));
  const y = value => padding.top + (max-value)*(height-padding.top-padding.bottom)/(max-min);
  ctx.strokeStyle = "#e6ebf3";
  for (let i=0;i<=4;i++) {
    const py = padding.top + i*(height-padding.top-padding.bottom)/4;
    ctx.beginPath(); ctx.moveTo(padding.left,py); ctx.lineTo(width-padding.right,py); ctx.stroke();
  }
  const gradient = ctx.createLinearGradient(0,0,width,0);
  gradient.addColorStop(0,"#2563eb");
  gradient.addColorStop(1,"#8b5cf6");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 5;
  ctx.beginPath();
  weights.forEach((point,index) => index === 0 ? ctx.moveTo(x(index),y(point.weight)) : ctx.lineTo(x(index),y(point.weight)));
  ctx.stroke();
  weights.forEach((point,index) => {
    ctx.fillStyle = "#2563eb";
    ctx.beginPath(); ctx.arc(x(index),y(point.weight),6,0,Math.PI*2); ctx.fill();
  });
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.view).classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  });
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  const s = settings();
  document.getElementById("settingName").value = s.name;
  document.getElementById("settingStartDate").value = s.startDate;
  document.getElementById("settingStartWeight").value = s.startingWeight;
  document.getElementById("settingWaterGoal").value = s.waterGoal;
  document.getElementById("settingProteinGoal").value = s.proteinGoal;
  document.getElementById("settingMovementGoal").value = s.movementGoal;
  document.getElementById("settingSleepGoal").value = s.sleepGoal;
  document.getElementById("settingsDialog").showModal();
});
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  write(SETTINGS_KEY, {
    name: document.getElementById("settingName").value.trim() || "Kev",
    startDate: document.getElementById("settingStartDate").value || todayString(),
    startingWeight: Number(document.getElementById("settingStartWeight").value) || 328,
    waterGoal: Number(document.getElementById("settingWaterGoal").value) || 80,
    proteinGoal: Number(document.getElementById("settingProteinGoal").value) || 100,
    movementGoal: Number(document.getElementById("settingMovementGoal").value) || 30,
    sleepGoal: Number(document.getElementById("settingSleepGoal").value) || 8
  });
  document.getElementById("settingsDialog").close();
  renderAll();
});

function renderAll() {
  setGreeting();
  renderToday();
  renderWins();
  renderMeals();
  renderStory();
  renderProgress();
}

loadToday();
renderAll();
