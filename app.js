
const STORAGE_KEY = "zepboundTrackerEntriesV2";
const SETTINGS_KEY = "zepboundTrackerSettingsV2";
const form = document.getElementById("entryForm");
const historyBody = document.getElementById("historyBody");
const dateInput = document.getElementById("date");
const settingsDialog = document.getElementById("settingsDialog");
let deferredPrompt;

const defaultSettings = {
  startingWeight: 328,
  heightFeet: 6,
  heightInches: 1,
  injectionWeekday: 0,
  sheetUrl: "",
  syncKey: ""
};

function localDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
}
dateInput.value = localDateString();

function getEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
function getSettings() {
  try { return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) }; }
  catch { return { ...defaultSettings }; }
}
function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function selectedSideEffects() {
  const values = [...document.querySelectorAll(".sideEffect:checked")].map(el => el.value);
  if (values.includes("None") && values.length > 1) return values.filter(v => v !== "None");
  return values;
}
function average(entries, field) {
  const vals = entries.map(e => Number(e[field])).filter(v => Number.isFinite(v) && v > 0);
  return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : null;
}
function calculateBmi(weight, settings) {
  const inches = Number(settings.heightFeet) * 12 + Number(settings.heightInches);
  return inches > 0 ? (weight / (inches * inches)) * 703 : null;
}
function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date(localDateString() + "T00:00:00");
  const target = new Date(dateString + "T00:00:00");
  return Math.ceil((target - today) / 86400000);
}
function nextWeekday(weekday) {
  const now = new Date();
  const result = new Date(now);
  let diff = (Number(weekday) - now.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  result.setDate(now.getDate() + diff);
  return result;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: document.getElementById("date").value,
    weight: Number(document.getElementById("weight").value),
    waist: Number(document.getElementById("waist").value) || 0,
    dose: document.getElementById("dose").value,
    site: document.getElementById("site").value,
    injectionTaken: document.getElementById("injectionTaken").value,
    systolic: Number(document.getElementById("systolic").value) || 0,
    diastolic: Number(document.getElementById("diastolic").value) || 0,
    glucose: Number(document.getElementById("glucose").value) || 0,
    a1c: Number(document.getElementById("a1c").value) || 0,
    water: Number(document.getElementById("water").value) || 0,
    protein: Number(document.getElementById("protein").value) || 0,
    exercise: Number(document.getElementById("exercise").value) || 0,
    sleep: Number(document.getElementById("sleep").value) || 0,
    appetite: Number(document.getElementById("appetite").value),
    pensRemaining: Number(document.getElementById("pensRemaining").value) || 0,
    refillDate: document.getElementById("refillDate").value,
    goalWeight: Number(document.getElementById("goalWeight").value) || 0,
    sideEffects: selectedSideEffects(),
    notes: document.getElementById("notes").value.trim(),
    synced: false
  };

  const entries = getEntries();
  entries.push(entry);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEntries(entries);
  clearForm();
  render();
  await syncPendingEntries();
});

function clearForm() {
  form.reset();
  dateInput.value = localDateString();
  document.getElementById("dose").value = "2.5 mg";
  document.getElementById("appetite").value = "3";
  document.getElementById("injectionTaken").value = "Yes";
}
document.getElementById("clearFormBtn").addEventListener("click", clearForm);

function deleteEntry(id) {
  saveEntries(getEntries().filter(entry => entry.id !== id));
  render();
}
window.deleteEntry = deleteEntry;

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Delete every saved entry from this device? This cannot be undone.")) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

function renderSummary(entries) {
  const settings = getSettings();
  const start = Number(settings.startingWeight) || 328;
  document.getElementById("startWeight").textContent = `${start.toFixed(1)} lb`;

  const next = nextWeekday(settings.injectionWeekday);
  document.getElementById("nextInjection").textContent = next.toLocaleDateString();

  if (!entries.length) {
    ["currentWeight","totalLost","percentLost","currentBmi","waistChange","pensRemainingSummary"].forEach(id => document.getElementById(id).textContent = "—");
    document.getElementById("goalText").textContent = "0%";
    document.getElementById("goalBar").style.width = "0%";
    renderMilestones(0);
    return;
  }

  const latest = entries[entries.length - 1];
  const lost = start - latest.weight;
  const percentLost = (lost / start) * 100;
  const bmi = calculateBmi(latest.weight, settings);
  const waistEntries = entries.filter(e => Number(e.waist) > 0);
  const waistDiff = waistEntries.length >= 2 ? waistEntries[0].waist - waistEntries[waistEntries.length - 1].waist : null;
  const tenPercentGoalWeightLoss = start * 0.10;
  const goalProgress = Math.max(0, Math.min(100, (lost / tenPercentGoalWeightLoss) * 100));

  document.getElementById("currentWeight").textContent = `${latest.weight.toFixed(1)} lb`;
  document.getElementById("totalLost").textContent = lost >= 0 ? `${lost.toFixed(1)} lb` : `+${Math.abs(lost).toFixed(1)} lb`;
  document.getElementById("percentLost").textContent = `${percentLost.toFixed(1)}%`;
  document.getElementById("currentBmi").textContent = bmi ? bmi.toFixed(1) : "—";
  document.getElementById("waistChange").textContent = waistDiff === null ? "—" : `${waistDiff.toFixed(1)} in`;
  document.getElementById("pensRemainingSummary").textContent = Number(latest.pensRemaining) || "—";
  document.getElementById("goalText").textContent = `${goalProgress.toFixed(0)}%`;
  document.getElementById("goalBar").style.width = `${goalProgress}%`;
  renderMilestones(Math.max(0, lost));
}

function renderMilestones(lost) {
  const goals = [10, 25, 50, 75, 100];
  document.getElementById("milestones").innerHTML = goals.map(goal =>
    `<span class="milestone ${lost >= goal ? "earned" : ""}">${lost >= goal ? "✓ " : ""}${goal} lb</span>`
  ).join("");
}

function renderHealth(entries) {
  if (!entries.length) {
    ["latestBp","latestGlucose","latestA1c","avgSleep","avgWater","avgProtein","avgExercise","commonSymptom"].forEach(id => document.getElementById(id).textContent = "—");
    return;
  }
  const latest = [...entries].reverse();
  const bp = latest.find(e => e.systolic && e.diastolic);
  const gl = latest.find(e => e.glucose);
  const a1c = latest.find(e => e.a1c);
  document.getElementById("latestBp").textContent = bp ? `${bp.systolic}/${bp.diastolic}` : "—";
  document.getElementById("latestGlucose").textContent = gl ? `${gl.glucose}` : "—";
  document.getElementById("latestA1c").textContent = a1c ? `${a1c.a1c.toFixed(1)}%` : "—";

  const sleep = average(entries, "sleep");
  const water = average(entries, "water");
  const protein = average(entries, "protein");
  const exercise = average(entries, "exercise");
  document.getElementById("avgSleep").textContent = sleep ? `${sleep.toFixed(1)} hr` : "—";
  document.getElementById("avgWater").textContent = water ? `${water.toFixed(0)} oz` : "—";
  document.getElementById("avgProtein").textContent = protein ? `${protein.toFixed(0)} g` : "—";
  document.getElementById("avgExercise").textContent = exercise ? `${exercise.toFixed(1)} days` : "—";

  const counts = {};
  entries.flatMap(e => e.sideEffects || []).filter(s => s !== "None").forEach(s => counts[s] = (counts[s] || 0) + 1);
  const common = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  document.getElementById("commonSymptom").textContent = common ? common[0] : "None reported";
}

function renderHistory(entries) {
  if (!entries.length) {
    historyBody.innerHTML = `<tr><td colspan="12">No entries yet. Add your first weekly check-in above.</td></tr>`;
    return;
  }
  historyBody.innerHTML = [...entries].reverse().map(entry => `
    <tr>
      <td>${escapeHtml(entry.date)}</td>
      <td>${Number(entry.weight).toFixed(1)} lb</td>
      <td>${entry.waist ? `${Number(entry.waist).toFixed(1)} in` : "—"}</td>
      <td>${escapeHtml(entry.dose)}</td>
      <td>${entry.systolic && entry.diastolic ? `${entry.systolic}/${entry.diastolic}` : "—"}</td>
      <td>${entry.water || "—"} oz</td>
      <td>${entry.protein || "—"} g</td>
      <td>${entry.exercise || 0} days</td>
      <td>${entry.sleep || "—"} hr</td>
      <td title="${escapeHtml(entry.notes)}">${escapeHtml((entry.sideEffects || []).join(", ") || "None reported")}</td>
      <td>${entry.synced ? "✓" : "Pending"}</td>
      <td><button class="danger" onclick="deleteEntry('${entry.id}')">Delete</button></td>
    </tr>
  `).join("");
}

function renderChart(entries) {
  const canvas = document.getElementById("weightChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width, height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (!entries.length) {
    ctx.fillStyle = "#64748b";
    ctx.font = "20px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Your weight trend will appear here.", width / 2, height / 2);
    return;
  }

  const padding = { left: 70, right: 30, top: 30, bottom: 65 };
  const weights = entries.map(e => Number(e.weight));
  let minW = Math.min(...weights), maxW = Math.max(...weights);
  if (minW === maxW) { minW -= 5; maxW += 5; } else { minW -= 3; maxW += 3; }

  const x = i => padding.left + (entries.length === 1 ? (width - padding.left - padding.right) / 2 : i * (width - padding.left - padding.right) / (entries.length - 1));
  const y = w => padding.top + (maxW - w) * (height - padding.top - padding.bottom) / (maxW - minW);

  ctx.strokeStyle = "#d7e0dd";
  ctx.fillStyle = "#64748b";
  ctx.font = "14px system-ui";
  ctx.textAlign = "right";
  for (let i = 0; i <= 5; i++) {
    const value = minW + (maxW - minW) * i / 5;
    const py = y(value);
    ctx.beginPath(); ctx.moveTo(padding.left, py); ctx.lineTo(width - padding.right, py); ctx.stroke();
    ctx.fillText(value.toFixed(0), padding.left - 10, py + 5);
  }

  ctx.strokeStyle = "#1f6f5f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  entries.forEach((entry, i) => i === 0 ? ctx.moveTo(x(i), y(entry.weight)) : ctx.lineTo(x(i), y(entry.weight)));
  ctx.stroke();

  entries.forEach((entry, i) => {
    const px = x(i), py = y(entry.weight);
    ctx.fillStyle = "#1f6f5f";
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
    if (entries.length <= 8 || i === 0 || i === entries.length - 1) {
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.fillText(Number(entry.weight).toFixed(1), px, py - 12);
      ctx.save(); ctx.translate(px, height - 18); ctx.rotate(-0.45); ctx.textAlign = "right"; ctx.fillText(entry.date, 0, 0); ctx.restore();
    }
  });
}

function renderAlerts(entries) {
  const box = document.getElementById("alertBox");
  const messages = [];
  if (entries.length) {
    const latest = entries[entries.length - 1];
    if (latest.pensRemaining > 0 && latest.pensRemaining <= 1) messages.push("You have one or fewer pens remaining.");
    const refillDays = daysUntil(latest.refillDate);
    if (refillDays !== null && refillDays >= 0 && refillDays <= 7) messages.push(`Your refill date is in ${refillDays} day${refillDays === 1 ? "" : "s"}.`);
    if (refillDays !== null && refillDays < 0) messages.push("Your refill date has passed.");
  }
  if (messages.length) {
    box.innerHTML = messages.join("<br>");
    box.classList.remove("hidden");
  } else box.classList.add("hidden");
}

document.getElementById("exportBtn").addEventListener("click", () => {
  const entries = getEntries();
  if (!entries.length) return alert("There is no data to export yet.");
  const headers = ["Date","Weight","Waist","Dose","Injection Site","Injection Taken","Systolic","Diastolic","Glucose","A1C","Water oz","Protein g","Exercise Days","Sleep Hours","Appetite 1-5","Pens Remaining","Refill Date","Goal Weight","Side Effects","Notes","Synced"];
  const rows = entries.map(e => headers.map(h => {
    const map = {
      "Date":e.date,"Weight":e.weight,"Waist":e.waist,"Dose":e.dose,"Injection Site":e.site,"Injection Taken":e.injectionTaken,
      "Systolic":e.systolic,"Diastolic":e.diastolic,"Glucose":e.glucose,"A1C":e.a1c,"Water oz":e.water,"Protein g":e.protein,
      "Exercise Days":e.exercise,"Sleep Hours":e.sleep,"Appetite 1-5":e.appetite,"Pens Remaining":e.pensRemaining,
      "Refill Date":e.refillDate,"Goal Weight":e.goalWeight,"Side Effects":(e.sideEffects||[]).join("; "),
      "Notes":e.notes||"","Synced":e.synced ? "Yes":"No"
    };
    return map[h] ?? "";
  }));
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `zepbound-health-${localDateString()}.csv`; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("printBtn").addEventListener("click", () => window.print());

document.getElementById("settingsBtn").addEventListener("click", () => {
  const s = getSettings();
  document.getElementById("settingStartWeight").value = s.startingWeight;
  document.getElementById("heightFeet").value = s.heightFeet;
  document.getElementById("heightInches").value = s.heightInches;
  document.getElementById("injectionWeekday").value = s.injectionWeekday;
  document.getElementById("sheetUrl").value = s.sheetUrl;
  document.getElementById("syncKey").value = s.syncKey;
  settingsDialog.showModal();
});
document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
  const s = {
    startingWeight: Number(document.getElementById("settingStartWeight").value) || 328,
    heightFeet: Number(document.getElementById("heightFeet").value) || 6,
    heightInches: Number(document.getElementById("heightInches").value) || 1,
    injectionWeekday: Number(document.getElementById("injectionWeekday").value),
    sheetUrl: document.getElementById("sheetUrl").value.trim(),
    syncKey: document.getElementById("syncKey").value.trim()
  };
  saveSettings(s);
  settingsDialog.close();
  render();
  await syncPendingEntries();
});
document.getElementById("testSyncBtn").addEventListener("click", async () => {
  const url = document.getElementById("sheetUrl").value.trim();
  const key = document.getElementById("syncKey").value.trim();
  if (!url || !key) return alert("Enter both the Apps Script URL and your private sync key.");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify({action:"test", syncKey:key})
    });
    const result = await response.json();
    alert(result.ok ? "Google Sheets connection successful." : `Connection failed: ${result.message || "Unknown error"}`);
  } catch (error) {
    alert("Connection failed. Check the web-app URL and deployment permissions.");
  }
});

async function syncPendingEntries() {
  const settings = getSettings();
  const badge = document.getElementById("syncBadge");
  if (!settings.sheetUrl || !settings.syncKey) {
    badge.textContent = "Local only";
    badge.className = "badge neutral";
    return;
  }
  const entries = getEntries();
  const pending = entries.filter(e => !e.synced);
  if (!pending.length) {
    badge.textContent = "Sheets synced";
    badge.className = "badge success";
    return;
  }
  badge.textContent = `Syncing ${pending.length}`;
  badge.className = "badge warning";
  let changed = false;

  for (const entry of pending) {
    try {
      const response = await fetch(settings.sheetUrl, {
        method: "POST",
        headers: {"Content-Type":"text/plain;charset=utf-8"},
        body: JSON.stringify({action:"addEntry", syncKey:settings.syncKey, entry})
      });
      const result = await response.json();
      if (result.ok) {
        const target = entries.find(e => e.id === entry.id);
        if (target) target.synced = true;
        changed = true;
      }
    } catch {}
  }
  if (changed) saveEntries(entries);
  const remaining = entries.filter(e => !e.synced).length;
  badge.textContent = remaining ? `${remaining} pending` : "Sheets synced";
  badge.className = remaining ? "badge warning" : "badge success";
  renderHistory(entries);
}

function render() {
  const entries = getEntries();
  renderSummary(entries);
  renderHealth(entries);
  renderHistory(entries);
  renderChart(entries);
  renderAlerts(entries);
  syncPendingEntries();
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault(); deferredPrompt = event;
  document.getElementById("installBtn").classList.remove("hidden");
});
document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice;
  deferredPrompt = null; document.getElementById("installBtn").classList.add("hidden");
});
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));


const MEAL_STORAGE_KEY = "zepboundMealPlanV1";
const mealDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const mealSuggestions = {
  balanced: {
    breakfast: [
      "2 eggs, whole-grain toast, and berries",
      "Greek yogurt, berries, and a small handful of walnuts",
      "Oatmeal with milk, cinnamon, and a spoonful of peanut butter",
      "Cottage cheese with pineapple and whole-grain toast",
      "Egg and turkey sausage breakfast wrap",
      "Protein smoothie with berries and spinach",
      "Scrambled eggs with tomatoes and avocado"
    ],
    lunch: [
      "Grilled chicken salad with light dressing",
      "Turkey and cheese wrap with raw vegetables",
      "Tuna salad with whole-grain crackers and fruit",
      "Chicken and vegetable soup with half a sandwich",
      "Leftover lean protein with vegetables",
      "Bean and chicken bowl with salsa",
      "Cottage cheese plate with fruit and sliced turkey"
    ],
    dinner: [
      "Baked chicken, green beans, and a small baked potato",
      "Salmon, roasted vegetables, and brown rice",
      "Lean turkey meatballs with marinara and vegetables",
      "Beef and vegetable stir-fry with a small serving of rice",
      "Grilled pork tenderloin, broccoli, and sweet potato",
      "Turkey chili with a side salad",
      "Shrimp tacos with cabbage slaw"
    ],
    snack: [
      "Cheese stick and apple",
      "Protein shake",
      "Greek yogurt",
      "Cottage cheese",
      "Turkey roll-ups",
      "Hard-boiled egg and fruit",
      "Small handful of nuts"
    ]
  },
  highProtein: {
    breakfast: [
      "3 eggs with turkey sausage",
      "Greek yogurt with protein powder and berries",
      "Protein shake and a hard-boiled egg",
      "Cottage cheese bowl with fruit",
      "Egg-white and turkey breakfast sandwich",
      "Protein oatmeal with milk",
      "Scrambled eggs with chicken sausage"
    ],
    lunch: [
      "Grilled chicken breast salad",
      "Tuna packet, boiled eggs, and vegetables",
      "Turkey burger patty with salad",
      "Chicken bowl with black beans",
      "Cottage cheese and sliced turkey plate",
      "Salmon pouch with whole-grain crackers",
      "Lean roast beef wrap"
    ],
    dinner: [
      "Chicken breast, broccoli, and potatoes",
      "Salmon with asparagus",
      "Lean steak with vegetables",
      "Turkey chili with beans",
      "Shrimp and vegetable stir-fry",
      "Pork tenderloin with green beans",
      "Baked cod with roasted vegetables"
    ],
    snack: [
      "30 g protein shake",
      "Greek yogurt",
      "Cottage cheese",
      "Two turkey roll-ups",
      "Two hard-boiled eggs",
      "Cheese stick and turkey slices",
      "Edamame"
    ]
  },
  simple: {
    breakfast: [
      "Greek yogurt cup and banana",
      "Eggs and toast",
      "Protein shake",
      "Cottage cheese and fruit",
      "Oatmeal cup with peanut butter",
      "Turkey sausage and fruit",
      "Breakfast sandwich on whole-grain bread"
    ],
    lunch: [
      "Rotisserie chicken and bagged salad",
      "Turkey sandwich and baby carrots",
      "Tuna packet and crackers",
      "Soup and half a sandwich",
      "Frozen grilled chicken with vegetables",
      "Deli turkey wrap",
      "Cottage cheese, fruit, and crackers"
    ],
    dinner: [
      "Rotisserie chicken, microwave vegetables, and potato",
      "Frozen salmon, steam-in-bag vegetables, and rice",
      "Turkey burger and salad kit",
      "Chicken sausage with vegetables",
      "Prepared grilled chicken and sweet potato",
      "Low-sodium chili and salad",
      "Shrimp with frozen stir-fry vegetables"
    ],
    snack: [
      "Protein shake",
      "Cheese stick",
      "Greek yogurt",
      "Apple with peanut butter",
      "Hard-boiled egg",
      "Cottage cheese cup",
      "Small nut pack"
    ]
  },
  gentle: {
    breakfast: [
      "Plain oatmeal with banana",
      "Greek yogurt with a few berries",
      "Scrambled egg and dry toast",
      "Cottage cheese and peaches",
      "Protein shake sipped slowly",
      "Cream of wheat with milk",
      "Egg whites and toast"
    ],
    lunch: [
      "Chicken noodle soup",
      "Turkey sandwich on toast",
      "Plain baked chicken with rice",
      "Tuna with crackers",
      "Cottage cheese and banana",
      "Broth-based vegetable soup with chicken",
      "Plain turkey wrap"
    ],
    dinner: [
      "Baked chicken, rice, and carrots",
      "Baked fish and mashed potatoes",
      "Turkey meatloaf with green beans",
      "Chicken soup with crackers",
      "Plain turkey burger and sweet potato",
      "Scrambled eggs and toast",
      "Baked cod with rice"
    ],
    snack: [
      "Banana",
      "Applesauce",
      "Greek yogurt",
      "Crackers and cheese",
      "Protein shake sipped slowly",
      "Cottage cheese",
      "Dry toast with peanut butter"
    ]
  }
};

const ingredientMap = {
  "egg": ["Protein", "Eggs"],
  "chicken": ["Protein", "Chicken"],
  "turkey": ["Protein", "Turkey"],
  "tuna": ["Protein", "Tuna"],
  "salmon": ["Protein", "Salmon"],
  "shrimp": ["Protein", "Shrimp"],
  "fish": ["Protein", "White fish"],
  "cod": ["Protein", "Cod"],
  "beef": ["Protein", "Lean beef"],
  "steak": ["Protein", "Lean steak"],
  "pork": ["Protein", "Pork tenderloin"],
  "yogurt": ["Dairy", "Greek yogurt"],
  "cottage cheese": ["Dairy", "Cottage cheese"],
  "cheese": ["Dairy", "Cheese sticks or sliced cheese"],
  "milk": ["Dairy", "Milk"],
  "berries": ["Produce", "Berries"],
  "banana": ["Produce", "Bananas"],
  "apple": ["Produce", "Apples"],
  "pineapple": ["Produce", "Pineapple"],
  "peaches": ["Produce", "Peaches"],
  "avocado": ["Produce", "Avocado"],
  "salad": ["Produce", "Salad greens"],
  "broccoli": ["Produce", "Broccoli"],
  "green beans": ["Produce", "Green beans"],
  "carrots": ["Produce", "Carrots"],
  "spinach": ["Produce", "Spinach"],
  "vegetable": ["Produce", "Mixed vegetables"],
  "cabbage": ["Produce", "Cabbage slaw"],
  "asparagus": ["Produce", "Asparagus"],
  "potato": ["Pantry", "Potatoes"],
  "sweet potato": ["Pantry", "Sweet potatoes"],
  "rice": ["Pantry", "Rice"],
  "oatmeal": ["Pantry", "Oatmeal"],
  "toast": ["Pantry", "Whole-grain bread"],
  "bread": ["Pantry", "Whole-grain bread"],
  "wrap": ["Pantry", "Whole-grain wraps"],
  "crackers": ["Pantry", "Whole-grain crackers"],
  "beans": ["Pantry", "Beans"],
  "nuts": ["Pantry", "Nuts"],
  "peanut butter": ["Pantry", "Peanut butter"],
  "protein shake": ["Pantry", "Protein shakes or powder"],
  "soup": ["Pantry", "Low-sodium soup"],
  "chili": ["Pantry", "Chili ingredients"],
  "salsa": ["Pantry", "Salsa"]
};

function blankMealPlan() {
  return mealDays.map(day => ({
    day, breakfast: "", lunch: "", dinner: "", snack: "", notes: ""
  }));
}

function getMealPlan() {
  try {
    return JSON.parse(localStorage.getItem(MEAL_STORAGE_KEY)) || blankMealPlan();
  } catch {
    return blankMealPlan();
  }
}

function saveMealPlan(plan) {
  localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(plan));
}

function renderMealPlan(plan = getMealPlan()) {
  const body = document.getElementById("mealPlanBody");
  if (!body) return;
  body.innerHTML = plan.map((row, index) => `
    <tr>
      <td>${row.day}</td>
      <td><textarea data-day="${index}" data-meal="breakfast" placeholder="Breakfast">${escapeHtml(row.breakfast || "")}</textarea></td>
      <td><textarea data-day="${index}" data-meal="lunch" placeholder="Lunch">${escapeHtml(row.lunch || "")}</textarea></td>
      <td><textarea data-day="${index}" data-meal="dinner" placeholder="Dinner">${escapeHtml(row.dinner || "")}</textarea></td>
      <td><textarea data-day="${index}" data-meal="snack" placeholder="Snack">${escapeHtml(row.snack || "")}</textarea></td>
      <td><textarea data-day="${index}" data-meal="notes" placeholder="Portion, prep, symptoms">${escapeHtml(row.notes || "")}</textarea></td>
    </tr>
  `).join("");
}

function collectMealPlanFromScreen() {
  const plan = blankMealPlan();
  document.querySelectorAll("#mealPlanBody textarea").forEach(el => {
    const day = Number(el.dataset.day);
    const meal = el.dataset.meal;
    plan[day][meal] = el.value.trim();
  });
  return plan;
}

function generateMealWeek() {
  const style = document.getElementById("mealStyle").value;
  const mealsPerDay = document.getElementById("mealsPerDay").value;
  const source = mealSuggestions[style];
  const plan = mealDays.map((day, index) => ({
    day,
    breakfast: source.breakfast[index % source.breakfast.length],
    lunch: source.lunch[index % source.lunch.length],
    dinner: source.dinner[index % source.dinner.length],
    snack: mealsPerDay === "4" ? source.snack[index % source.snack.length] : "",
    notes: style === "gentle"
      ? "Eat slowly and keep the portion small. Stop when comfortably full."
      : "Start with the protein, then vegetables, then starch if still hungry."
  }));
  renderMealPlan(plan);
}

function buildShoppingList(plan) {
  const groups = { Protein: new Set(), Dairy: new Set(), Produce: new Set(), Pantry: new Set() };
  const combined = plan.flatMap(row => [row.breakfast, row.lunch, row.dinner, row.snack]).join(" ").toLowerCase();

  Object.entries(ingredientMap).forEach(([keyword, [group, item]]) => {
    if (combined.includes(keyword)) groups[group].add(item);
  });

  return groups;
}

function renderShoppingList(groups) {
  const container = document.getElementById("shoppingList");
  container.innerHTML = Object.entries(groups).map(([group, items]) => {
    const list = [...items].sort();
    if (!list.length) return "";
    return `
      <section class="shopping-group">
        <h3>${group}</h3>
        ${list.map(item => `<label><input type="checkbox"> ${escapeHtml(item)}</label>`).join("")}
      </section>
    `;
  }).join("") + `
    <div class="meal-tip">
      <strong>Helpful basics:</strong> water, low-sodium broth, ginger tea, and simple crackers can be useful when your stomach feels unsettled.
    </div>
  `;
}

document.getElementById("generateMealsBtn")?.addEventListener("click", generateMealWeek);

document.getElementById("saveMealsBtn")?.addEventListener("click", () => {
  saveMealPlan(collectMealPlanFromScreen());
  alert("Meal plan saved on this device.");
});

document.getElementById("clearMealsBtn")?.addEventListener("click", () => {
  if (confirm("Clear the entire meal plan?")) {
    saveMealPlan(blankMealPlan());
    renderMealPlan();
  }
});

document.getElementById("shoppingListBtn")?.addEventListener("click", () => {
  const plan = collectMealPlanFromScreen();
  saveMealPlan(plan);
  renderShoppingList(buildShoppingList(plan));
  document.getElementById("shoppingDialog").showModal();
});

document.getElementById("copyShoppingBtn")?.addEventListener("click", async () => {
  const groups = buildShoppingList(collectMealPlanFromScreen());
  const text = Object.entries(groups)
    .filter(([, items]) => items.size)
    .map(([group, items]) => `${group}\n${[...items].sort().map(item => `- ${item}`).join("\n")}`)
    .join("\n\n");
  try {
    await navigator.clipboard.writeText(text);
    alert("Shopping list copied.");
  } catch {
    alert("Copy was blocked by the browser. You can select and copy the list manually.");
  }
});

document.getElementById("printShoppingBtn")?.addEventListener("click", () => window.print());

document.getElementById("exportMealsBtn")?.addEventListener("click", () => {
  const plan = collectMealPlanFromScreen();
  const headers = ["Day","Breakfast","Lunch","Dinner","Snack","Notes"];
  const rows = plan.map(row => [row.day,row.breakfast,row.lunch,row.dinner,row.snack,row.notes]);
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zepbound-meal-plan-${localDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

renderMealPlan();
render();
