
const DAILY_KEY = "zepboundProcessDailyV1";
const WEIGHT_KEY = "zepboundProcessWeightsV1";
const MEAL_KEY = "zepboundProcessMealsV1";
const VICTORY_KEY = "zepboundProcessVictoriesV1";
const SETTINGS_KEY = "zepboundProcessSettingsV1";

const defaults = {
  startingWeight: 328,
  waterGoal: 80,
  proteinGoal: 100,
  activityGoal: 30
};

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const mealSuggestions = {
  balanced: {
    breakfast: ["Greek yogurt with berries","Eggs and whole-grain toast","Oatmeal with peanut butter","Cottage cheese and fruit","Egg and turkey wrap","Protein smoothie","Scrambled eggs and avocado"],
    lunch: ["Grilled chicken salad","Turkey wrap and fruit","Tuna with crackers","Chicken soup and half sandwich","Leftover protein and vegetables","Chicken and bean bowl","Cottage cheese plate"],
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

function read(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function settings() {
  return { ...defaults, ...read(SETTINGS_KEY, {}) };
}
function escapeHtml(value = "") {
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, {weekday:"long", month:"long", day:"numeric"});
document.getElementById("weightDate").value = todayString();

function loadToday() {
  const daily = read(DAILY_KEY, []);
  const today = daily.find(d => d.date === todayString());
  if (!today) return;
  ["water","protein","activity","sleep","mealsPlanned","energy","dose","notes"].forEach(id => {
    const el = document.getElementById(id);
    if (el && today[id] !== undefined) el.value = today[id];
  });
  document.getElementById("shotTaken").checked = Boolean(today.shotTaken);
}

document.getElementById("dailyForm").addEventListener("submit", event => {
  event.preventDefault();
  const entry = {
    date: todayString(),
    water: Number(document.getElementById("water").value) || 0,
    protein: Number(document.getElementById("protein").value) || 0,
    activity: Number(document.getElementById("activity").value) || 0,
    sleep: Number(document.getElementById("sleep").value) || 0,
    mealsPlanned: Number(document.getElementById("mealsPlanned").value) || 0,
    energy: document.getElementById("energy").value,
    shotTaken: document.getElementById("shotTaken").checked,
    dose: document.getElementById("dose").value,
    notes: document.getElementById("notes").value.trim()
  };
  const daily = read(DAILY_KEY, []);
  const idx = daily.findIndex(d => d.date === entry.date);
  if (idx >= 0) daily[idx] = entry; else daily.push(entry);
  daily.sort((a,b) => new Date(a.date)-new Date(b.date));
  write(DAILY_KEY, daily);
  renderAll();
  alert("Today's check-in was saved.");
});

document.getElementById("clearDailyBtn").addEventListener("click", () => {
  document.getElementById("dailyForm").reset();
  renderFocus();
});

function renderFocus() {
  const s = settings();
  const daily = read(DAILY_KEY, []);
  const today = daily.find(d => d.date === todayString()) || {};
  document.getElementById("waterFocus").textContent = `${today.water || 0} / ${s.waterGoal} oz`;
  document.getElementById("proteinFocus").textContent = `${today.protein || 0} / ${s.proteinGoal} g`;
  document.getElementById("activityFocus").textContent = `${today.activity || 0} / ${s.activityGoal} min`;
  document.getElementById("mealsFocus").textContent = `${today.mealsPlanned || 0} / 3`;
  document.getElementById("shotFocus").textContent = today.shotTaken ? "Done" : "Not logged";
}

function blankMeals() {
  return days.map(day => ({day, breakfast:"", lunch:"", dinner:"", snack:""}));
}
function mealPlan() {
  return read(MEAL_KEY, blankMeals());
}
function renderMeals(plan = mealPlan()) {
  document.getElementById("mealWeek").innerHTML = plan.map((m, i) => `
    <article class="meal-day">
      <h3>${m.day}</h3>
      <textarea data-day="${i}" data-meal="breakfast" placeholder="Breakfast">${escapeHtml(m.breakfast)}</textarea>
      <textarea data-day="${i}" data-meal="lunch" placeholder="Lunch">${escapeHtml(m.lunch)}</textarea>
      <textarea data-day="${i}" data-meal="dinner" placeholder="Dinner">${escapeHtml(m.dinner)}</textarea>
      <textarea data-day="${i}" data-meal="snack" placeholder="Snack">${escapeHtml(m.snack)}</textarea>
    </article>
  `).join("");
}
function collectMeals() {
  const plan = blankMeals();
  document.querySelectorAll("#mealWeek textarea").forEach(el => {
    plan[Number(el.dataset.day)][el.dataset.meal] = el.value.trim();
  });
  return plan;
}
document.getElementById("suggestMealsBtn").addEventListener("click", () => {
  const style = document.getElementById("mealStyle").value;
  const includeSnack = document.getElementById("mealsPerDay").value === "4";
  const src = mealSuggestions[style];
  const plan = days.map((day,i) => ({
    day,
    breakfast: src.breakfast[i],
    lunch: src.lunch[i],
    dinner: src.dinner[i],
    snack: includeSnack ? src.snack[i] : ""
  }));
  renderMeals(plan);
});
document.getElementById("saveMealsBtn").addEventListener("click", () => {
  write(MEAL_KEY, collectMeals());
  alert("Meal plan saved.");
});
document.getElementById("exportMealsBtn").addEventListener("click", () => {
  const rows = [["Day","Breakfast","Lunch","Dinner","Snack"], ...collectMeals().map(m => [m.day,m.breakfast,m.lunch,m.dinner,m.snack])];
  downloadCsv("zepbound-meal-plan.csv", rows);
});

function shoppingGroups(plan) {
  const text = plan.flatMap(m => [m.breakfast,m.lunch,m.dinner,m.snack]).join(" ").toLowerCase();
  const map = {
    Protein: [["chicken","Chicken"],["turkey","Turkey"],["egg","Eggs"],["tuna","Tuna"],["salmon","Salmon"],["shrimp","Shrimp"],["fish","White fish"],["beef","Lean beef"],["pork","Pork tenderloin"]],
    Produce: [["berry","Berries"],["banana","Bananas"],["apple","Apples"],["salad","Salad greens"],["broccoli","Broccoli"],["vegetable","Mixed vegetables"],["carrot","Carrots"],["avocado","Avocado"]],
    Dairy: [["yogurt","Greek yogurt"],["cottage cheese","Cottage cheese"],["cheese","Cheese"]],
    Pantry: [["oatmeal","Oatmeal"],["rice","Rice"],["toast","Whole-grain bread"],["wrap","Whole-grain wraps"],["cracker","Crackers"],["bean","Beans"],["nuts","Nuts"],["peanut butter","Peanut butter"],["protein shake","Protein shakes"]]
  };
  const out = {};
  Object.entries(map).forEach(([group, items]) => {
    out[group] = items.filter(([key]) => text.includes(key)).map(([,label]) => label);
  });
  return out;
}
document.getElementById("shoppingListBtn").addEventListener("click", () => {
  const groups = shoppingGroups(collectMeals());
  document.getElementById("shoppingList").innerHTML = Object.entries(groups).map(([group,items]) => `
    <section class="shopping-group"><strong>${group}</strong><div>${items.length ? items.map(i => `• ${i}`).join("<br>") : "Nothing added yet"}</div></section>
  `).join("");
  document.getElementById("shoppingDialog").showModal();
});
document.getElementById("copyShoppingBtn").addEventListener("click", async () => {
  const groups = shoppingGroups(collectMeals());
  const text = Object.entries(groups).map(([g,items]) => `${g}\n${items.map(i=>`- ${i}`).join("\n")}`).join("\n\n");
  await navigator.clipboard.writeText(text);
  alert("Shopping list copied.");
});

document.getElementById("saveVictoriesBtn").addEventListener("click", () => {
  const selected = [...document.querySelectorAll(".victory-options input:checked")].map(i => i.value);
  const custom = document.getElementById("customVictory").value.trim();
  const existing = read(VICTORY_KEY, []);
  const all = [...new Set([...existing, ...selected, ...(custom ? [custom] : [])])];
  write(VICTORY_KEY, all);
  document.querySelectorAll(".victory-options input").forEach(i => i.checked = false);
  document.getElementById("customVictory").value = "";
  renderVictories();
});
function renderVictories() {
  const victories = read(VICTORY_KEY, []);
  document.getElementById("victoryList").innerHTML = victories.map(v => `<span class="victory-chip">${escapeHtml(v)}</span>`).join("");
}

function renderHistory() {
  const daily = [...read(DAILY_KEY, [])].reverse().slice(0, 7);
  if (!daily.length) {
    document.getElementById("habitHistory").innerHTML = "<p>No check-ins yet. Your recent habits will appear here.</p>";
    return;
  }
  document.getElementById("habitHistory").innerHTML = daily.map(d => `
    <div class="habit-row">
      <strong>${new Date(d.date+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}</strong>
      <span>💧 ${d.water || 0} oz</span>
      <span>🌿 ${d.protein || 0} g</span>
      <span>👟 ${d.activity || 0} min</span>
      <span>🌙 ${d.sleep || 0} hr</span>
      <span>${d.shotTaken ? "💉 Done" : "💉 —"}</span>
    </div>
  `).join("");
}

document.getElementById("weightForm").addEventListener("submit", event => {
  event.preventDefault();
  const weight = Number(document.getElementById("weight").value);
  const date = document.getElementById("weightDate").value;
  if (!weight || !date) return;
  const weights = read(WEIGHT_KEY, []);
  weights.push({date, weight});
  weights.sort((a,b)=>new Date(a.date)-new Date(b.date));
  write(WEIGHT_KEY, weights);
  document.getElementById("weight").value = "";
  renderProgress();
});
document.getElementById("toggleProgressBtn").addEventListener("click", () => {
  const panel = document.getElementById("progressPanel");
  panel.classList.toggle("hidden");
  document.getElementById("toggleProgressBtn").textContent = panel.classList.contains("hidden") ? "Show Progress" : "Hide Progress";
  if (!panel.classList.contains("hidden")) renderProgress();
});
function renderProgress() {
  const s = settings();
  const weights = read(WEIGHT_KEY, []);
  document.getElementById("startWeight").textContent = `${Number(s.startingWeight).toFixed(1)} lb`;
  if (!weights.length) {
    document.getElementById("currentWeight").textContent = "—";
    document.getElementById("totalChange").textContent = "—";
    drawChart([]);
    return;
  }
  const latest = weights[weights.length-1].weight;
  const change = s.startingWeight - latest;
  document.getElementById("currentWeight").textContent = `${latest.toFixed(1)} lb`;
  document.getElementById("totalChange").textContent = `${change >= 0 ? change.toFixed(1)+" lb down" : Math.abs(change).toFixed(1)+" lb up"}`;
  drawChart(weights);
}
function drawChart(weights) {
  const canvas = document.getElementById("weightChart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,w,h);
  if (!weights.length) {
    ctx.fillStyle = "#756f68";
    ctx.font = "20px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Add a weight entry when you are ready.", w/2, h/2);
    return;
  }
  const pad = {l:60,r:30,t:25,b:55};
  const vals = weights.map(x=>x.weight);
  let min = Math.min(...vals)-3, max = Math.max(...vals)+3;
  if (min===max){min-=5;max+=5;}
  const x = i => pad.l + (weights.length===1 ? (w-pad.l-pad.r)/2 : i*(w-pad.l-pad.r)/(weights.length-1));
  const y = v => pad.t + (max-v)*(h-pad.t-pad.b)/(max-min);
  ctx.strokeStyle = "#e7dfd4";
  for(let i=0;i<=4;i++){
    const py = pad.t + i*(h-pad.t-pad.b)/4;
    ctx.beginPath(); ctx.moveTo(pad.l,py); ctx.lineTo(w-pad.r,py); ctx.stroke();
  }
  ctx.strokeStyle = "#6c8a5a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  weights.forEach((p,i)=> i===0 ? ctx.moveTo(x(i),y(p.weight)) : ctx.lineTo(x(i),y(p.weight)));
  ctx.stroke();
  weights.forEach((p,i)=>{
    ctx.fillStyle="#6c8a5a"; ctx.beginPath(); ctx.arc(x(i),y(p.weight),6,0,Math.PI*2); ctx.fill();
  });
}

function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
document.getElementById("exportBtn").addEventListener("click", () => {
  const daily = read(DAILY_KEY, []);
  const rows = [["Date","Water","Protein","Activity","Sleep","Meals Planned","Energy","Shot Taken","Dose","Notes"],
    ...daily.map(d=>[d.date,d.water,d.protein,d.activity,d.sleep,d.mealsPlanned,d.energy,d.shotTaken?"Yes":"No",d.dose,d.notes])];
  downloadCsv("zepbound-process-data.csv", rows);
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  const s = settings();
  document.getElementById("settingStartWeight").value = s.startingWeight;
  document.getElementById("settingWaterGoal").value = s.waterGoal;
  document.getElementById("settingProteinGoal").value = s.proteinGoal;
  document.getElementById("settingActivityGoal").value = s.activityGoal;
  document.getElementById("settingsDialog").showModal();
});
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  write(SETTINGS_KEY, {
    startingWeight: Number(document.getElementById("settingStartWeight").value) || 328,
    waterGoal: Number(document.getElementById("settingWaterGoal").value) || 80,
    proteinGoal: Number(document.getElementById("settingProteinGoal").value) || 100,
    activityGoal: Number(document.getElementById("settingActivityGoal").value) || 30
  });
  document.getElementById("settingsDialog").close();
  renderAll();
});

function renderAll() {
  renderFocus();
  renderMeals();
  renderVictories();
  renderHistory();
  renderProgress();
}

loadToday();
renderAll();
