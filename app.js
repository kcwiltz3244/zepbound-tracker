
const STARTING_WEIGHT = 328;
const STORAGE_KEY = "zepboundTrackerEntries";
const form = document.getElementById("entryForm");
const historyBody = document.getElementById("historyBody");
const dateInput = document.getElementById("date");
let deferredPrompt;

function localDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
}

dateInput.value = localDateString();

function getEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedSideEffects() {
  const values = [...document.querySelectorAll(".sideEffect:checked")].map(el => el.value);
  if (values.includes("None") && values.length > 1) {
    return values.filter(v => v !== "None");
  }
  return values;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: document.getElementById("date").value,
    weight: Number(document.getElementById("weight").value),
    dose: document.getElementById("dose").value,
    site: document.getElementById("site").value,
    water: Number(document.getElementById("water").value) || 0,
    protein: Number(document.getElementById("protein").value) || 0,
    exercise: Number(document.getElementById("exercise").value) || 0,
    appetite: Number(document.getElementById("appetite").value),
    sideEffects: selectedSideEffects(),
    notes: document.getElementById("notes").value.trim()
  };

  const entries = getEntries();
  entries.push(entry);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEntries(entries);
  clearForm();
  render();
});

function clearForm() {
  form.reset();
  dateInput.value = localDateString();
  document.getElementById("dose").value = "2.5 mg";
  document.getElementById("appetite").value = "3";
}

document.getElementById("clearFormBtn").addEventListener("click", clearForm);

function deleteEntry(id) {
  const entries = getEntries().filter(entry => entry.id !== id);
  saveEntries(entries);
  render();
}

window.deleteEntry = deleteEntry;

document.getElementById("resetBtn").addEventListener("click", () => {
  const confirmed = confirm("Delete every saved entry from this device?");
  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

function renderSummary(entries) {
  document.getElementById("startWeight").textContent = `${STARTING_WEIGHT.toFixed(1)} lb`;
  if (!entries.length) {
    document.getElementById("currentWeight").textContent = "—";
    document.getElementById("totalLost").textContent = "—";
    document.getElementById("percentLost").textContent = "—";
    document.getElementById("goalText").textContent = "0%";
    document.getElementById("goalBar").style.width = "0%";
    return;
  }

  const latest = entries[entries.length - 1];
  const lost = STARTING_WEIGHT - latest.weight;
  const percentLost = (lost / STARTING_WEIGHT) * 100;
  const tenPercentGoalWeightLoss = STARTING_WEIGHT * 0.10;
  const goalProgress = Math.max(0, Math.min(100, (lost / tenPercentGoalWeightLoss) * 100));

  document.getElementById("currentWeight").textContent = `${latest.weight.toFixed(1)} lb`;
  document.getElementById("totalLost").textContent = `${lost >= 0 ? "" : "+"}${Math.abs(lost).toFixed(1)} lb ${lost >= 0 ? "lost" : "gained"}`;
  document.getElementById("percentLost").textContent = `${percentLost.toFixed(1)}%`;
  document.getElementById("goalText").textContent = `${goalProgress.toFixed(0)}%`;
  document.getElementById("goalBar").style.width = `${goalProgress}%`;
}

function renderHistory(entries) {
  if (!entries.length) {
    historyBody.innerHTML = `<tr><td colspan="8">No entries yet. Add your first weekly check-in above.</td></tr>`;
    return;
  }

  historyBody.innerHTML = [...entries].reverse().map(entry => `
    <tr>
      <td>${escapeHtml(entry.date)}</td>
      <td>${Number(entry.weight).toFixed(1)} lb</td>
      <td>${escapeHtml(entry.dose)}</td>
      <td>${entry.water || "—"} oz</td>
      <td>${entry.protein || "—"} g</td>
      <td>${entry.exercise || 0} days</td>
      <td title="${escapeHtml(entry.notes)}">${escapeHtml((entry.sideEffects || []).join(", ") || "None reported")}</td>
      <td><button class="danger" onclick="deleteEntry('${entry.id}')">Delete</button></td>
    </tr>
  `).join("");
}

function renderChart(entries) {
  const canvas = document.getElementById("weightChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
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

  const padding = { left: 70, right: 30, top: 30, bottom: 60 };
  const weights = entries.map(e => Number(e.weight));
  let minW = Math.min(...weights);
  let maxW = Math.max(...weights);

  if (minW === maxW) {
    minW -= 5;
    maxW += 5;
  } else {
    minW -= 3;
    maxW += 3;
  }

  const x = index => padding.left + (entries.length === 1 ? (width - padding.left - padding.right) / 2 : index * (width - padding.left - padding.right) / (entries.length - 1));
  const y = weight => padding.top + (maxW - weight) * (height - padding.top - padding.bottom) / (maxW - minW);

  ctx.strokeStyle = "#d7e0dd";
  ctx.fillStyle = "#64748b";
  ctx.font = "14px system-ui";
  ctx.lineWidth = 1;
  ctx.textAlign = "right";

  for (let i = 0; i <= 5; i++) {
    const value = minW + (maxW - minW) * i / 5;
    const py = y(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, py);
    ctx.lineTo(width - padding.right, py);
    ctx.stroke();
    ctx.fillText(value.toFixed(0), padding.left - 10, py + 5);
  }

  ctx.strokeStyle = "#1f6f5f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  entries.forEach((entry, index) => {
    const px = x(index);
    const py = y(Number(entry.weight));
    index === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.stroke();

  entries.forEach((entry, index) => {
    const px = x(index);
    const py = y(Number(entry.weight));
    ctx.fillStyle = "#1f6f5f";
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    if (entries.length <= 8 || index === entries.length - 1 || index === 0) {
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.fillText(Number(entry.weight).toFixed(1), px, py - 12);
      ctx.save();
      ctx.translate(px, height - 18);
      ctx.rotate(-0.45);
      ctx.textAlign = "right";
      ctx.fillText(entry.date, 0, 0);
      ctx.restore();
    }
  });
}

document.getElementById("exportBtn").addEventListener("click", () => {
  const entries = getEntries();
  if (!entries.length) {
    alert("There is no data to export yet.");
    return;
  }

  const headers = ["Date","Weight","Dose","Injection Site","Water oz","Protein g","Exercise Days","Appetite 1-5","Side Effects","Notes"];
  const rows = entries.map(e => [
    e.date, e.weight, e.dose, e.site, e.water, e.protein, e.exercise, e.appetite,
    (e.sideEffects || []).join("; "), e.notes || ""
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zepbound-tracker-${localDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

function render() {
  const entries = getEntries();
  renderSummary(entries);
  renderHistory(entries);
  renderChart(entries);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  document.getElementById("installBtn").classList.remove("hidden");
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("installBtn").classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

render();
