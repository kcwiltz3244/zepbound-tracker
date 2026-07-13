
const KEYS={daily:"mzjV7Daily",wins:"mzjV7Wins",meals:"mzjV7Meals",weights:"mzjV7Weights",settings:"mzjV7Settings",journal:"mzjV7Journal",dayOne:"mzjV8DayOne",futureLetter:"mzjV8FutureLetter",mission:"mzjV8Mission",workouts:"mzjV8Workouts"};
const defaults={name:"Kevin Wiltz",startDate:new Date().toISOString().split("T")[0],startingWeight:328,waterGoal:80,proteinGoal:100,movementGoal:30,sleepGoal:8};
const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const mealSuggestions={
balanced:{breakfast:["Greek yogurt and berries","Eggs and toast","Oatmeal and peanut butter","Cottage cheese and fruit","Egg and turkey wrap","Protein smoothie","Scrambled eggs and avocado"],lunch:["Chicken salad","Turkey wrap and fruit","Tuna and crackers","Chicken soup and half sandwich","Leftover protein and vegetables","Chicken and bean bowl","Cottage cheese plate"],dinner:["Baked chicken, green beans, potato","Salmon, vegetables, rice","Turkey meatballs and vegetables","Beef and vegetable stir-fry","Pork tenderloin and sweet potato","Turkey chili and salad","Shrimp tacos and slaw"],snack:["Cheese stick and apple","Protein shake","Greek yogurt","Cottage cheese","Turkey roll-ups","Egg and fruit","Small handful of nuts"]},
highProtein:{breakfast:["3 eggs and turkey sausage","Greek yogurt with protein powder","Protein shake and egg","Cottage cheese and fruit","Turkey breakfast sandwich","Protein oatmeal","Eggs and chicken sausage"],lunch:["Chicken breast salad","Tuna and eggs","Turkey burger and salad","Chicken and bean bowl","Turkey and cottage cheese plate","Salmon pouch and crackers","Roast beef wrap"],dinner:["Chicken and broccoli","Salmon and asparagus","Lean steak and vegetables","Turkey chili","Shrimp stir-fry","Pork tenderloin","Baked cod and vegetables"],snack:["Protein shake","Greek yogurt","Cottage cheese","Turkey roll-ups","Two eggs","Cheese and turkey","Edamame"]},
simple:{breakfast:["Greek yogurt and banana","Eggs and toast","Protein shake","Cottage cheese and fruit","Oatmeal and peanut butter","Turkey sausage and fruit","Breakfast sandwich"],lunch:["Rotisserie chicken and salad","Turkey sandwich and carrots","Tuna packet and crackers","Soup and half sandwich","Frozen grilled chicken and vegetables","Deli turkey wrap","Cottage cheese and fruit"],dinner:["Rotisserie chicken and vegetables","Frozen salmon and rice","Turkey burger and salad","Chicken sausage and vegetables","Prepared chicken and sweet potato","Low-sodium chili","Shrimp and frozen vegetables"],snack:["Protein shake","Cheese stick","Greek yogurt","Apple and peanut butter","Hard-boiled egg","Cottage cheese cup","Nut pack"]},
gentle:{breakfast:["Plain oatmeal and banana","Greek yogurt and berries","Scrambled egg and toast","Cottage cheese and peaches","Protein shake sipped slowly","Cream of wheat","Egg whites and toast"],lunch:["Chicken noodle soup","Turkey sandwich on toast","Chicken and rice","Tuna and crackers","Cottage cheese and banana","Vegetable soup with chicken","Plain turkey wrap"],dinner:["Baked chicken, rice, carrots","Baked fish and mashed potatoes","Turkey meatloaf and green beans","Chicken soup and crackers","Turkey burger and sweet potato","Scrambled eggs and toast","Baked cod and rice"],snack:["Banana","Applesauce","Greek yogurt","Crackers and cheese","Protein shake","Cottage cheese","Toast and peanut butter"]}
};
function todayString(){const n=new Date(),o=n.getTimezoneOffset();return new Date(n.getTime()-o*60000).toISOString().split("T")[0]}
function read(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function settings(){return {...defaults,...read(KEYS.settings,{})}}
function esc(v=""){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function dl(name,rows){const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),b=new Blob([csv],{type:"text/csv"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function pct(v,g){return Math.max(0,Math.min(100,g?(Number(v)/Number(g))*100:0))}
function setGreeting(){const h=new Date().getHours(),w=h<12?"Good morning":h<18?"Good afternoon":"Good evening",s=settings();document.getElementById("greeting").textContent=`${w}, ${s.name}`;document.getElementById("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});const start=new Date(s.startDate+"T00:00:00"),daysSince=Math.max(0,Math.floor((new Date()-start)/86400000));document.getElementById("journeyWeek").textContent=Math.floor(daysSince/7)+1}
function loadToday(){const d=read(KEYS.daily,[]).find(x=>x.date===todayString());if(!d)return;["water","protein","movement","sleep","mood","energy","appetite","dose"].forEach(id=>{if(document.getElementById(id)&&d[id]!==undefined)document.getElementById(id).value=d[id]});document.getElementById("shotTaken").checked=!!d.shotTaken}
function renderToday(){const s=settings(),d=read(KEYS.daily,[]).find(x=>x.date===todayString())||{};waterValue.textContent=`${d.water||0} / ${s.waterGoal} oz`;proteinValue.textContent=`${d.protein||0} / ${s.proteinGoal} g`;movementValue.textContent=`${d.movement||0} / ${s.movementGoal} min`;sleepValue.textContent=`${d.sleep||0} / ${s.sleepGoal} hr`;shotValue.textContent=d.shotTaken?"Complete":"Not logged";currentDose.textContent=d.dose||dose.value||"2.5 mg";waterMeter.style.width=`${pct(d.water,s.waterGoal)}%`;proteinMeter.style.width=`${pct(d.protein,s.proteinGoal)}%`;movementMeter.style.width=`${pct(d.movement,s.movementGoal)}%`;sleepMeter.style.width=`${pct(d.sleep,s.sleepGoal)}%`;shotMeter.style.width=d.shotTaken?"100%":"0%"}
dailyForm.addEventListener("submit",e=>{e.preventDefault();const entry={date:todayString(),water:+water.value||0,protein:+protein.value||0,movement:+movement.value||0,sleep:+sleep.value||0,mood:mood.value,energy:energy.value,appetite:appetite.value,shotTaken:shotTaken.checked,dose:dose.value};const arr=read(KEYS.daily,[]),i=arr.findIndex(x=>x.date===entry.date);i>=0?arr[i]=entry:arr.push(entry);arr.sort((a,b)=>new Date(a.date)-new Date(b.date));write(KEYS.daily,arr);renderAll();renderMilestones();alert("Today was saved.")});
let selectedWins=new Set();document.querySelectorAll("[data-win]").forEach(b=>b.onclick=()=>{selectedWins.has(b.dataset.win)?(selectedWins.delete(b.dataset.win),b.classList.remove("selected")):(selectedWins.add(b.dataset.win),b.classList.add("selected"))});
saveWinBtn.onclick=()=>{const custom=customWin.value.trim(),arr=read(KEYS.wins,[]);let today=arr.find(x=>x.date===todayString());if(!today){today={date:todayString(),wins:[]};arr.push(today)}today.wins=[...new Set([...today.wins,...selectedWins,...(custom?[custom]:[])])];write(KEYS.wins,arr);selectedWins.clear();document.querySelectorAll("[data-win]").forEach(b=>b.classList.remove("selected"));customWin.value="";renderWins()};
function renderWins(){const t=read(KEYS.wins,[]).find(x=>x.date===todayString());winsList.innerHTML=t?.wins?.map(w=>`<span class="win-chip">⭐ ${esc(w)}</span>`).join("")||""}
function blankMeals(){return days.map(day=>({day,breakfast:"",lunch:"",dinner:"",snack:""}))}
function renderMeals(plan=read(KEYS.meals,blankMeals())){mealCarousel.innerHTML=plan.map((m,i)=>`<article class="meal-day"><h3>${m.day}</h3><textarea data-day="${i}" data-meal="breakfast" placeholder="Breakfast">${esc(m.breakfast)}</textarea><textarea data-day="${i}" data-meal="lunch" placeholder="Lunch">${esc(m.lunch)}</textarea><textarea data-day="${i}" data-meal="dinner" placeholder="Dinner">${esc(m.dinner)}</textarea><textarea data-day="${i}" data-meal="snack" placeholder="Snack">${esc(m.snack)}</textarea></article>`).join("")}
function collectMeals(){const p=blankMeals();document.querySelectorAll("#mealCarousel textarea").forEach(el=>p[+el.dataset.day][el.dataset.meal]=el.value.trim());return p}
suggestMealsBtn.onclick=()=>{const style=mealStyle.value,snack=mealsPerDay.value==="4",src=mealSuggestions[style];renderMeals(days.map((day,i)=>({day,breakfast:src.breakfast[i],lunch:src.lunch[i],dinner:src.dinner[i],snack:snack?src.snack[i]:""})))}
saveMealsBtn.onclick=()=>{write(KEYS.meals,collectMeals());alert("Meal plan saved.")}
exportMealsBtn.onclick=()=>dl("my-zepbound-meal-plan.csv",[["Day","Breakfast","Lunch","Dinner","Snack"],...collectMeals().map(m=>[m.day,m.breakfast,m.lunch,m.dinner,m.snack])])
function shopping(plan){const text=plan.flatMap(m=>[m.breakfast,m.lunch,m.dinner,m.snack]).join(" ").toLowerCase(),map={Protein:[["chicken","Chicken"],["turkey","Turkey"],["egg","Eggs"],["tuna","Tuna"],["salmon","Salmon"],["shrimp","Shrimp"],["fish","White fish"],["beef","Lean beef"],["pork","Pork tenderloin"]],Produce:[["berry","Berries"],["banana","Bananas"],["apple","Apples"],["salad","Salad greens"],["broccoli","Broccoli"],["vegetable","Mixed vegetables"],["carrot","Carrots"],["avocado","Avocado"]],Dairy:[["yogurt","Greek yogurt"],["cottage cheese","Cottage cheese"],["cheese","Cheese"]],Pantry:[["oatmeal","Oatmeal"],["rice","Rice"],["toast","Whole-grain bread"],["wrap","Whole-grain wraps"],["cracker","Crackers"],["bean","Beans"],["nuts","Nuts"],["peanut butter","Peanut butter"],["protein shake","Protein shakes"]]};const out={};Object.entries(map).forEach(([g,items])=>out[g]=items.filter(([k])=>text.includes(k)).map(([,l])=>l));return out}
shoppingListBtn.onclick=()=>{const groups=shopping(collectMeals());shoppingList.innerHTML=Object.entries(groups).map(([g,items])=>`<section class="shopping-group"><strong>${g}</strong><div>${items.length?items.map(i=>`• ${i}`).join("<br>"):"Nothing added yet"}</div></section>`).join("");shoppingDialog.showModal()}
copyShoppingBtn.onclick=async()=>{const g=shopping(collectMeals()),text=Object.entries(g).map(([k,v])=>`${k}\n${v.map(i=>"- "+i).join("\n")}`).join("\n\n");await navigator.clipboard.writeText(text);alert("Shopping list copied.")}
const journalPrompts=[
  "What made today meaningful?",
  "What are you proud of today?",
  "What felt easier today than it used to?",
  "What challenged you, and how did you respond?",
  "What small choice moved you forward?",
  "What made you smile today?",
  "What do you want to remember about today?"
];
let selectedTags=new Set();
let editingJournalDate=todayString();document.querySelectorAll("[data-tag]").forEach(b=>b.onclick=()=>{selectedTags.has(b.dataset.tag)?(selectedTags.delete(b.dataset.tag),b.classList.remove("selected")):(selectedTags.add(b.dataset.tag),b.classList.add("selected"))})
function loadJournalEntry(date=todayString()){
  editingJournalDate=date;
  journalEntryDate.value=date;
  const pretty=new Date(date+"T00:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  journalDateHeading.textContent=pretty;
  dailyPrompt.textContent=journalPrompts[new Date(date+"T00:00:00").getDay()%journalPrompts.length];
  const j=read(KEYS.journal,[]).find(x=>x.date===date);
  journalStory.value=j?.story||"";
  journalAdventure.value=j?.adventure||"";
  journalProud.value=j?.proud||"";
  journalGratitude.value=j?.gratitude||"";
  journalTomorrow.value=j?.tomorrow||"";
  journalFavorite.checked=!!j?.favorite;
  selectedTags=new Set(j?.tags||[]);
  document.querySelectorAll("[data-tag]").forEach(b=>b.classList.toggle("selected",selectedTags.has(b.dataset.tag)));
}
function clearJournalForm(){
  editingJournalDate=todayString();
  journalEntryDate.value=todayString();
  journalStory.value="";
  journalAdventure.value="";
  journalProud.value="";
  journalGratitude.value="";
  journalTomorrow.value="";
  journalFavorite.checked=false;
  selectedTags.clear();
  document.querySelectorAll("[data-tag]").forEach(b=>b.classList.remove("selected"));
  loadJournalEntry(todayString());
}
journalForm.addEventListener("submit",e=>{
  e.preventDefault();
  const date=journalEntryDate.value||editingJournalDate||todayString();
  const entry={
    date,
    story:journalStory.value.trim(),
    adventure:journalAdventure.value.trim(),
    proud:journalProud.value.trim(),
    gratitude:journalGratitude.value.trim(),
    tomorrow:journalTomorrow.value.trim(),
    favorite:journalFavorite.checked,
    tags:[...selectedTags]
  };
  const arr=read(KEYS.journal,[]);
  const i=arr.findIndex(x=>x.date===date);
  i>=0?arr[i]=entry:arr.push(entry);
  arr.sort((a,b)=>new Date(a.date)-new Date(b.date));
  write(KEYS.journal,arr);
  editingJournalDate=date;
  renderJournal();
  renderStory();
  alert("Journal entry saved.");
})
journalSearch.addEventListener("input",renderJournal);
journalFilter.addEventListener("change",renderJournal);
journalEntryDate.addEventListener("change",()=>loadJournalEntry(journalEntryDate.value));
newJournalBtn.addEventListener("click",clearJournalForm);
deleteJournalBtn.addEventListener("click",()=>{
  const date=journalEntryDate.value||editingJournalDate;
  const arr=read(KEYS.journal,[]);
  if(!arr.some(x=>x.date===date)) return alert("There is no saved entry for this date.");
  if(confirm("Delete this journal entry?")){
    write(KEYS.journal,arr.filter(x=>x.date!==date));
    clearJournalForm();
    renderJournal();
    renderStory();
  }
});
window.editJournalEntry=(date)=>loadJournalEntry(date);
function renderJournal(){
  const q=(journalSearch?.value||"").toLowerCase();
  const filter=journalFilter?.value||"all";
  const arr=[...read(KEYS.journal,[])].reverse().filter(j=>{
    const matchesSearch=!q||JSON.stringify(j).toLowerCase().includes(q);
    const matchesFilter=filter==="all"||j.favorite;
    return matchesSearch&&matchesFilter;
  });
  journalTimeline.innerHTML=arr.length?arr.map(j=>`
    <article class="timeline-card journal-entry-card ${j.favorite?"favorite":""}">
      <div class="timeline-date">${new Date(j.date+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div>
      <div>
        <div class="timeline-details">${(j.tags||[]).map(t=>`<span class="timeline-pill">${esc(t)}</span>`).join("")}</div>
        ${j.story?`<p class="timeline-note">${esc(j.story)}</p>`:""}
        ${j.adventure?`<p class="timeline-note"><strong>Adventure:</strong> ${esc(j.adventure)}</p>`:""}
        ${j.proud?`<p class="timeline-note"><strong>Proud of:</strong> ${esc(j.proud)}</p>`:""}
        ${j.gratitude?`<p class="timeline-note"><strong>Grateful:</strong> ${esc(j.gratitude)}</p>`:""}
        ${j.tomorrow?`<p class="timeline-note"><strong>Tomorrow:</strong> ${esc(j.tomorrow)}</p>`:""}
        <div class="journal-action-row">
          <button type="button" class="secondary-button" onclick="editJournalEntry('${j.date}')">Edit entry</button>
        </div>
      </div>
    </article>
  `).join(""):"<p>No journal entries yet.</p>";
}
function renderStory(){const daily=[...read(KEYS.daily,[])].reverse(),wins=read(KEYS.wins,[]),journals=read(KEYS.journal,[]);storyTimeline.innerHTML=daily.length?daily.map(d=>{const w=wins.find(x=>x.date===d.date)?.wins||[],j=journals.find(x=>x.date===d.date);return `<article class="timeline-card"><div class="timeline-date">${new Date(d.date+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div><div><div class="timeline-details"><span class="timeline-pill">💧 ${d.water||0} oz</span><span class="timeline-pill">🥩 ${d.protein||0} g</span><span class="timeline-pill">👟 ${d.movement||0} min</span><span class="timeline-pill">🌙 ${d.sleep||0} hr</span>${d.mood?`<span class="timeline-pill">🙂 ${esc(d.mood)}</span>`:""}${d.shotTaken?`<span class="timeline-pill">💉 ${esc(d.dose)}</span>`:""}${w.map(x=>`<span class="timeline-pill">⭐ ${esc(x)}</span>`).join("")}${j?.tags?.map(t=>`<span class="timeline-pill">${esc(t)}</span>`).join("")||""}</div>${j?.story?`<p class="timeline-note">${esc(j.story)}</p>`:""}</div></article>`}).join(""):"<p>No entries yet.</p>"}
exportDataBtn.onclick=()=>{const d=read(KEYS.daily,[]);dl("my-zepbound-journey-data.csv",[["Date","Water","Protein","Movement","Sleep","Mood","Energy","Appetite","Shot","Dose"],...d.map(x=>[x.date,x.water,x.protein,x.movement,x.sleep,x.mood,x.energy,x.appetite,x.shotTaken?"Yes":"No",x.dose])])}
weightDate.value=todayString();weightForm.addEventListener("submit",e=>{e.preventDefault();const date=weightDate.value,w=+weight.value;if(!date||!w)return;const arr=read(KEYS.weights,[]);arr.push({date,weight:w});arr.sort((a,b)=>new Date(a.date)-new Date(b.date));write(KEYS.weights,arr);weight.value="";renderProgress()})
function renderProgress(){const s=settings(),arr=read(KEYS.weights,[]);startWeight.textContent=`${(+s.startingWeight).toFixed(1)} lb`;if(!arr.length){currentWeight.textContent="—";weightChange.textContent="—";drawChart([]);return}const c=arr.at(-1).weight,ch=s.startingWeight-c;currentWeight.textContent=`${c.toFixed(1)} lb`;weightChange.textContent=ch>=0?`${ch.toFixed(1)} lb down`:`${Math.abs(ch).toFixed(1)} lb up`;drawChart(arr)}
function drawChart(arr){const c=weightChart,x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.fillStyle="#fff";x.fillRect(0,0,w,h);if(!arr.length){x.fillStyle="#6b7280";x.font="20px system-ui";x.textAlign="center";x.fillText("Add a weight entry whenever you are ready.",w/2,h/2);return}const p={l:60,r:30,t:25,b:50},v=arr.map(a=>a.weight);let mn=Math.min(...v)-3,mx=Math.max(...v)+3;const X=i=>p.l+(arr.length===1?(w-p.l-p.r)/2:i*(w-p.l-p.r)/(arr.length-1)),Y=n=>p.t+(mx-n)*(h-p.t-p.b)/(mx-mn);x.strokeStyle="#e6ebf3";for(let i=0;i<=4;i++){const py=p.t+i*(h-p.t-p.b)/4;x.beginPath();x.moveTo(p.l,py);x.lineTo(w-p.r,py);x.stroke()}const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,"#2563eb");g.addColorStop(1,"#8b5cf6");x.strokeStyle=g;x.lineWidth=5;x.beginPath();arr.forEach((a,i)=>i?x.lineTo(X(i),Y(a.weight)):x.moveTo(X(i),Y(a.weight)));x.stroke()}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.view).classList.add("active");scrollTo({top:0,behavior:"smooth"})})
settingsBtn.onclick=()=>{const s=settings();settingName.value=s.name;settingStartDate.value=s.startDate;settingStartWeight.value=s.startingWeight;settingWaterGoal.value=s.waterGoal;settingProteinGoal.value=s.proteinGoal;settingMovementGoal.value=s.movementGoal;settingSleepGoal.value=s.sleepGoal;settingsDialog.showModal()}
saveSettingsBtn.onclick=()=>{write(KEYS.settings,{name:settingName.value.trim()||"Kevin Wiltz",startDate:settingStartDate.value||todayString(),startingWeight:+settingStartWeight.value||328,waterGoal:+settingWaterGoal.value||80,proteinGoal:+settingProteinGoal.value||100,movementGoal:+settingMovementGoal.value||30,sleepGoal:+settingSleepGoal.value||8});settingsDialog.close();renderAll()}
function renderAll(){setGreeting();renderToday();renderWins();renderMeals();renderJournal();renderStory();renderProgress()}

const missions=[
{icon:"💧",title:"Water first.",text:"Keep your water nearby and take steady sips throughout the day."},
{icon:"🥩",title:"Protein first.",text:"Start meals with a comfortable protein choice before moving to the rest."},
{icon:"👟",title:"Move for ten.",text:"Ten comfortable minutes count. The goal is to keep your body involved."},
{icon:"🌙",title:"Protect your rest.",text:"Give yourself a calmer wind-down and a reasonable bedtime tonight."},
{icon:"❤️",title:"Be kind to yourself.",text:"A hard day is still part of the journey. Choose the next helpful step."}
];
const routines=[
{id:"gymA",category:"gym",name:"Gym A — Lower Body & Cardio",badge:"Gym",exercises:[
{name:"Stationary Bike",weight:"",sets:1,reps:"10 min"},{name:"Seated Leg Curl",weight:"",sets:2,reps:10},{name:"Leg Extension",weight:"",sets:2,reps:10},{name:"Supported Calf Raise",weight:"",sets:2,reps:12},{name:"Gentle Core Brace",weight:"",sets:2,reps:10}]},
{id:"gymB",category:"gym",name:"Gym B — Shoulder-Friendly Upper Body",badge:"Gym",exercises:[
{name:"Recumbent Bike Warm-up",weight:"",sets:1,reps:"8 min"},{name:"Seated Row — Comfortable Range",weight:"",sets:2,reps:10},{name:"Biceps Curl Machine",weight:"",sets:2,reps:10},{name:"Triceps Pressdown — Light",weight:"",sets:2,reps:10},{name:"Pallof Press — Light",weight:"",sets:2,reps:8}]},
{id:"gentle",category:"gentle",name:"Gentle Day — Keep Momentum",badge:"Gentle",exercises:[
{name:"Easy Bike or Walk",weight:"",sets:1,reps:"10 min"},{name:"Sit-to-Stand — Comfortable Height",weight:"",sets:2,reps:8},{name:"Heel Raises with Support",weight:"",sets:2,reps:10},{name:"Gentle Marching",weight:"",sets:2,reps:"30 sec"},{name:"Easy Stretching",weight:"",sets:1,reps:"5 min"}]},
{id:"home",category:"home",name:"Home Backup Workout",badge:"Home",exercises:[
{name:"Chair Sit-to-Stand",weight:"",sets:2,reps:8},{name:"Wall Push-up — Only if Pain-Free",weight:"",sets:2,reps:8},{name:"Standing Heel Raise",weight:"",sets:2,reps:10},{name:"Seated Knee Extension",weight:"",sets:2,reps:10},{name:"Indoor Walk",weight:"",sets:1,reps:"10 min"}]}
];
const milestoneDefinitions=[
{id:"began",icon:"🌅",title:"The Journey Begins",text:"Completed the Day One welcome.",test:()=>!!read(KEYS.dayOne,null)?.begun},
{id:"firstInjection",icon:"💉",title:"First Injection",text:"Logged your first Zepbound injection.",test:()=>read(KEYS.daily,[]).some(d=>d.shotTaken)},
{id:"firstJournal",icon:"📖",title:"First Journal Entry",text:"Saved the first page of your story.",test:()=>read(KEYS.journal,[]).length>=1},
{id:"futureLetter",icon:"❤️",title:"Letter to Future Me",text:"Captured why you started.",test:()=>!!read(KEYS.futureLetter,"").trim()},
{id:"firstWorkout",icon:"🏋️",title:"First Workout Logged",text:"Completed your first workout entry.",test:()=>read(KEYS.workouts,[]).length>=1},
{id:"threeWorkouts",icon:"💪",title:"Building Strength",text:"Logged three workouts.",test:()=>read(KEYS.workouts,[]).length>=3},
{id:"sevenCheckins",icon:"🔥",title:"Showing Up",text:"Completed seven daily check-ins.",test:()=>read(KEYS.daily,[]).length>=7},
{id:"tenWins",icon:"⭐",title:"Ten Wins",text:"Recorded ten personal victories.",test:()=>read(KEYS.wins,[]).flatMap(w=>w.wins||[]).length>=10},
{id:"tenPounds",icon:"🎉",title:"Ten Pounds",text:"Reached a ten-pound change when you chose to look.",test:()=>{const s=settings(),a=read(KEYS.weights,[]);return !!(a.length&&s.startingWeight-a.at(-1).weight>=10)}}
];
function initDayOne(){
  const overlay=document.getElementById("dayOneOverlay");
  const state=read(KEYS.dayOne,null);
  if(overlay && !state?.begun) overlay.classList.remove("hidden");
}
document.getElementById("beginJourneyBtn")?.addEventListener("click",()=>{
  write(KEYS.dayOne,{begun:true,date:todayString(),dose:"2.5 mg"});
  document.getElementById("dayOneOverlay")?.classList.add("hidden");
  renderMilestones();
});
function getDailyMission(){const n=Math.floor(new Date(todayString()+"T00:00:00").getTime()/86400000);return missions[Math.abs(n)%missions.length]}
function renderMission(){const m=getDailyMission(),s=read(KEYS.mission,{}),done=s.date===todayString()&&s.complete;missionIcon.textContent=done?"✓":m.icon;missionTitle.textContent=done?"Mission complete.":m.title;missionText.textContent=done?"You followed through on today’s focus. That matters.":m.text;completeMissionBtn.textContent=done?"Completed":"Mark complete";document.querySelector(".mission-card").classList.toggle("complete",done)}
completeMissionBtn.addEventListener("click",()=>{const s=read(KEYS.mission,{}),done=!(s.date===todayString()&&s.complete);write(KEYS.mission,{date:todayString(),complete:done});renderMission()});
document.querySelectorAll("[data-quick]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-quick='mood']").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");mood.value=b.dataset.value;quickCheckMessage.textContent=`Mood set to ${b.dataset.value}. Save the full check-in whenever you’re ready.`}));
function addQuickValue(field,amount){const el=document.getElementById(field);el.value=(Number(el.value)||0)+amount;quickCheckMessage.textContent=`Added ${amount}${field==="water"?" oz":field==="protein"?" g":" min"}. Save today when finished.`}
quickWaterBtn.addEventListener("click",()=>addQuickValue("water",8));quickProteinBtn.addEventListener("click",()=>addQuickValue("protein",20));quickMoveBtn.addEventListener("click",()=>addQuickValue("movement",10));
function loadFutureLetter(){futureLetter.value=read(KEYS.futureLetter,"")}
saveFutureLetterBtn.addEventListener("click",()=>{write(KEYS.futureLetter,futureLetter.value.trim());futureLetterSaved.classList.remove("hidden");setTimeout(()=>futureLetterSaved.classList.add("hidden"),2500);renderMilestones()});
toggleFutureLetterBtn.addEventListener("click",()=>{const h=futureLetter.classList.toggle("hidden");toggleFutureLetterBtn.textContent=h?"Show letter":"Hide letter"});
function lastExerciseSetting(name){for(const w of [...read(KEYS.workouts,[])].reverse()){const f=(w.exercises||[]).find(e=>e.name.toLowerCase()===name.toLowerCase());if(f)return f}return null}
function exerciseRowTemplate(e={name:"",weight:"",sets:2,reps:10}){const last=e.name?lastExerciseSetting(e.name):null;return `<div class="exercise-row"><label class="exercise-name">Exercise<input class="ex-name" type="text" value="${esc(e.name||"")}" placeholder="Exercise name"></label><label>Weight<input class="ex-weight" type="number" step="0.5" min="0" value="${e.weight||""}" placeholder="lb"></label><label>Sets<input class="ex-sets" type="number" min="1" max="10" value="${e.sets||2}"></label><label>Reps / time<input class="ex-reps" type="text" value="${esc(e.reps||10)}"></label><button type="button" class="danger-button remove-exercise">×</button><p class="last-setting">${last?`Last time: ${last.weight||"bodyweight"} • ${last.sets} sets • ${last.reps}`:"No previous setting yet."}</p></div>`}
function bindExerciseRows(){document.querySelectorAll(".remove-exercise").forEach(b=>b.onclick=()=>b.closest(".exercise-row").remove())}
function addExerciseRow(e){exerciseRows.insertAdjacentHTML("beforeend",exerciseRowTemplate(e));bindExerciseRows()}
addExerciseBtn.addEventListener("click",()=>addExerciseRow());
clearWorkoutBtn.addEventListener("click",()=>{workoutForm.reset();workoutDate.value=todayString();exerciseRows.innerHTML="";addExerciseRow();workoutHeading.textContent="Start a workout"});
function startRoutine(id){const r=routines.find(x=>x.id===id);if(!r)return;workoutName.value=r.name;workoutDate.value=todayString();exerciseRows.innerHTML="";r.exercises.forEach(addExerciseRow);workoutHeading.textContent=r.name;document.querySelector('[data-view="exerciseView"]').click();setTimeout(()=>workoutHeading.scrollIntoView({behavior:"smooth",block:"start"}),100)}
window.startRoutine=startRoutine;
function renderRoutines(){const f=routineFilter.value||"all";routineCards.innerHTML=routines.filter(r=>f==="all"||r.category===f).map(r=>`<article class="routine-card"><span class="routine-badge">${r.badge}</span><h3>${r.name}</h3><ul>${r.exercises.map(e=>`<li>${e.name} — ${e.sets} × ${e.reps}</li>`).join("")}</ul><button type="button" class="primary-button" onclick="startRoutine('${r.id}')">Start routine</button></article>`).join("")}
routineFilter.addEventListener("change",renderRoutines);
workoutForm.addEventListener("submit",ev=>{ev.preventDefault();const exercises=[...document.querySelectorAll(".exercise-row")].map(row=>({name:row.querySelector(".ex-name").value.trim(),weight:Number(row.querySelector(".ex-weight").value)||0,sets:Number(row.querySelector(".ex-sets").value)||1,reps:row.querySelector(".ex-reps").value.trim()})).filter(e=>e.name);if(!exercises.length)return alert("Add at least one exercise.");const w={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:workoutDate.value||todayString(),name:workoutName.value.trim()||"Gym Workout",feeling:workoutFeeling.value,exercises,notes:workoutNotes.value.trim()};const all=read(KEYS.workouts,[]);all.push(w);all.sort((a,b)=>new Date(a.date)-new Date(b.date));write(KEYS.workouts,all);workoutForm.reset();workoutDate.value=todayString();exerciseRows.innerHTML="";addExerciseRow();renderWorkouts();renderMilestones();alert("Workout complete. Great job today, Kevin.")});
function startOfWeek(date=new Date()){const d=new Date(date),day=d.getDay();d.setHours(0,0,0,0);d.setDate(d.getDate()-day);return d}
function renderWorkouts(){const all=[...read(KEYS.workouts,[])].reverse(),week=startOfWeek(),weekly=all.filter(w=>new Date(w.date+"T00:00:00")>=week).length;gymVisitsWeek.textContent=`${weekly} / 2–3`;totalWorkouts.textContent=all.length;lastWorkoutDate.textContent=all.length?new Date(all[0].date+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"}):"—";workoutHistory.innerHTML=all.length?all.map(w=>`<article class="workout-card"><h3>${esc(w.name)}</h3><p>${new Date(w.date+"T00:00:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}${w.feeling?` • ${esc(w.feeling)}`:""}</p><div class="workout-exercise-list">${w.exercises.map(e=>`<span>${esc(e.name)}: ${e.weight?e.weight+" lb • ":""}${e.sets} × ${esc(e.reps)}</span>`).join("")}</div>${w.notes?`<p class="timeline-note">${esc(w.notes)}</p>`:""}</article>`).join(""):"<p>No workouts logged yet. Choose a routine or build your own.</p>"}
function renderMilestones(){milestoneGrid.innerHTML=milestoneDefinitions.map(m=>{const u=!!m.test();return `<article class="milestone-card ${u?"unlocked":"locked"}"><div class="milestone-symbol">${m.icon}</div><h3>${m.title}</h3><p>${m.text}</p><span class="milestone-status">${u?"Unlocked":"Still ahead"}</span></article>`}).join("")}

loadToday();loadJournalEntry(todayString());renderAll();initDayOne();loadFutureLetter();renderMission();renderRoutines();workoutDate.value=todayString();addExerciseRow();renderWorkouts();renderMilestones();
