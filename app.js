
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

/* Version 8.2 improved integrated nutrition tracker */
const NUTRITION_STORAGE_KEY="mzjV81Nutrition";
const NUTRITION_FOODS=[
  {
    name:"Cabbage, raw",
    servingLabel:"1 cup chopped",
    servingAmount:1,
    servingUnit:"cup",
    calories:22,
    protein:1.1,
    carbs:5.2,
    sugar:2.8,
    fiber:2.2,
    fat:0.1,
    sodium:16
  },
  {
    name:"Cabbage, cooked",
    servingLabel:"1 cup cooked",
    servingAmount:1,
    servingUnit:"cup",
    calories:35,
    protein:1.9,
    carbs:8.2,
    sugar:4,
    fiber:3.1,
    fat:0.1,
    sodium:13
  },
  {
    name:"Cabbage, raw",
    servingLabel:"1 oz",
    servingAmount:1,
    servingUnit:"oz",
    calories:7,
    protein:0.4,
    carbs:1.6,
    sugar:0.8,
    fiber:0.7,
    fat:0,
    sodium:5
  },

{name:"Tillamook Original Smoked Sausages",aliases:["tillamook sausage","tillamook smoked sausage","smoked sausage","meat stick","beef sausage"],servingAmount:1,servingUnit:"oz",servingLabel:"1 oz (28 g)",calories:110,protein:8,carbs:0,sugar:0,fiber:0,fat:7,sodium:330},
{name:"Tilapia, cooked",aliases:["tilapia","tilapia fillet","cooked tilapia","grilled tilapia","baked tilapia","fish fillet"],servingAmount:4,servingUnit:"oz",servingLabel:"4 oz cooked",calories:145,protein:30,carbs:0,sugar:0,fiber:0,fat:3,sodium:63},
{name:"Bacon, pork, cooked",aliases:["bacon","pork bacon"],servingAmount:1,servingUnit:"strip",servingLabel:"1 cooked strip",calories:43,protein:3,carbs:.1,sugar:0,fiber:0,fat:3.3,sodium:137},
{name:"Bacon, pork, thick-cut",aliases:["bacon","thick bacon"],servingAmount:1,servingUnit:"slice",servingLabel:"1 thick slice",calories:70,protein:5,carbs:0,sugar:0,fiber:0,fat:5.5,sodium:230},
{name:"Bacon, center-cut pork",aliases:["bacon","center cut bacon"],servingAmount:2,servingUnit:"slice",servingLabel:"2 slices",calories:60,protein:6,carbs:0,sugar:0,fiber:0,fat:4,sodium:260},
{name:"Turkey bacon",aliases:["bacon","turkey bacon"],servingAmount:1,servingUnit:"slice",servingLabel:"1 slice",calories:30,protein:2,carbs:0,sugar:0,fiber:0,fat:2.3,sodium:180},
{name:"Canadian bacon",aliases:["bacon","canadian bacon","ham"],servingAmount:1,servingUnit:"slice",servingLabel:"1 slice",calories:43,protein:6,carbs:.5,sugar:.3,fiber:0,fat:1.8,sodium:350},
{name:"Egg, large, whole",aliases:["egg","eggs","boiled egg","fried egg"],servingAmount:1,servingUnit:"egg",servingLabel:"1 large egg",calories:72,protein:6.3,carbs:.4,sugar:.2,fiber:0,fat:4.8,sodium:71},
{name:"Egg whites",aliases:["egg","eggs","egg white"],servingAmount:1,servingUnit:"egg",servingLabel:"white from 1 large egg",calories:17,protein:3.6,carbs:.2,sugar:.2,fiber:0,fat:.1,sodium:55},
{name:"Hard-boiled egg",aliases:["egg","eggs","boiled egg"],servingAmount:1,servingUnit:"egg",servingLabel:"1 large egg",calories:78,protein:6.3,carbs:.6,sugar:.6,fiber:0,fat:5.3,sodium:62},
{name:"Scrambled egg, plain",aliases:["egg","eggs","scrambled eggs"],servingAmount:1,servingUnit:"egg",servingLabel:"1 large egg, scrambled",calories:91,protein:6.3,carbs:1,sugar:.4,fiber:0,fat:6.8,sodium:95},
{name:"Fried egg",aliases:["egg","eggs","fried egg"],servingAmount:1,servingUnit:"egg",servingLabel:"1 large fried egg",calories:90,protein:6.3,carbs:.4,sugar:.2,fiber:0,fat:6.8,sodium:95},
{name:"Egg omelet, plain",aliases:["egg","eggs","omelet"],servingAmount:1,servingUnit:"egg",servingLabel:"1 egg used",calories:94,protein:6.5,carbs:.5,sugar:.2,fiber:0,fat:7.2,sodium:105},
{name:"Grilled chicken breast",aliases:["chicken","chicken breast"],servingAmount:3,servingUnit:"oz",servingLabel:"3 oz cooked",calories:128,protein:26,carbs:0,sugar:0,fiber:0,fat:2.7,sodium:44},
{name:"Chicken thigh, roasted",aliases:["chicken","chicken thigh"],servingAmount:3,servingUnit:"oz",servingLabel:"3 oz cooked",calories:180,protein:22,carbs:0,sugar:0,fiber:0,fat:10,sodium:75},
{name:"Salmon, baked",aliases:["salmon","fish"],servingAmount:3,servingUnit:"oz",servingLabel:"3 oz cooked",calories:175,protein:19,carbs:0,sugar:0,fiber:0,fat:10.5,sodium:50},
{name:"Greek yogurt, plain nonfat",aliases:["yogurt","greek yogurt"],servingAmount:.75,servingUnit:"cup",servingLabel:"3/4 cup",calories:100,protein:17,carbs:6,sugar:5,fiber:0,fat:0,sodium:65},
{name:"Greek yogurt, flavored",aliases:["yogurt","greek yogurt"],servingAmount:1,servingUnit:"container",servingLabel:"1 single-serve container",calories:140,protein:12,carbs:18,sugar:14,fiber:0,fat:0,sodium:65},
{name:"Cottage cheese, low fat",aliases:["cottage cheese"],servingAmount:.5,servingUnit:"cup",servingLabel:"1/2 cup",calories:90,protein:12,carbs:5,sugar:4,fiber:0,fat:2.5,sodium:360},
{name:"Oatmeal, cooked",aliases:["oatmeal","oats"],servingAmount:1,servingUnit:"cup",servingLabel:"1 cup cooked",calories:154,protein:6,carbs:27,sugar:1,fiber:4,fat:3,sodium:2},
{name:"Banana, medium",aliases:["banana"],servingAmount:1,servingUnit:"piece",servingLabel:"1 medium banana",calories:105,protein:1.3,carbs:27,sugar:14.4,fiber:3.1,fat:.4,sodium:1},
{name:"Apple, medium",aliases:["apple"],servingAmount:1,servingUnit:"piece",servingLabel:"1 medium apple",calories:95,protein:.5,carbs:25,sugar:19,fiber:4.4,fat:.3,sodium:2},
{name:"Broccoli, cooked",aliases:["broccoli","vegetable"],servingAmount:1,servingUnit:"cup",servingLabel:"1 cup cooked",calories:55,protein:3.7,carbs:11.2,sugar:2.2,fiber:5.1,fat:.6,sodium:64},
{name:"Brown rice, cooked",aliases:["rice","brown rice"],servingAmount:.5,servingUnit:"cup",servingLabel:"1/2 cup cooked",calories:108,protein:2.5,carbs:22.4,sugar:.2,fiber:1.8,fat:.9,sodium:5},
{name:"Sweet potato, baked",aliases:["sweet potato","potato"],servingAmount:1,servingUnit:"piece",servingLabel:"1 medium",calories:112,protein:2,carbs:26,sugar:5.4,fiber:3.9,fat:.1,sodium:72},
{name:"Tuna, canned in water",aliases:["tuna","fish"],servingAmount:3,servingUnit:"oz",servingLabel:"3 oz drained",calories:99,protein:22,carbs:0,sugar:0,fiber:0,fat:.7,sodium:320},
{name:"Turkey breast, sliced",aliases:["turkey","deli turkey"],servingAmount:3,servingUnit:"oz",servingLabel:"3 oz",calories:90,protein:18,carbs:2,sugar:1,fiber:0,fat:1,sodium:540},
{name:"Black beans, cooked",aliases:["beans","black beans"],servingAmount:.5,servingUnit:"cup",servingLabel:"1/2 cup",calories:114,protein:7.6,carbs:20.4,sugar:.3,fiber:7.5,fat:.5,sodium:1},
{name:"Protein shake",aliases:["protein shake","shake"],servingAmount:1,servingUnit:"shake",servingLabel:"1 prepared shake",calories:160,protein:30,carbs:6,sugar:2,fiber:1,fat:3,sodium:210},
{name:"Almonds",aliases:["almonds","nuts"],servingAmount:1,servingUnit:"oz",servingLabel:"1 oz",calories:164,protein:6,carbs:6.1,sugar:1.2,fiber:3.5,fat:14.2,sodium:0},
{name:"Peanut butter",aliases:["peanut butter"],servingAmount:2,servingUnit:"tbsp",servingLabel:"2 tablespoons",calories:190,protein:7,carbs:7,sugar:3,fiber:2,fat:16,sodium:140},
{name:"Avocado",aliases:["avocado"],servingAmount:.5,servingUnit:"piece",servingLabel:"1/2 medium avocado",calories:120,protein:1.5,carbs:6.4,sugar:.3,fiber:5,fat:11,sodium:5}
];
let nutritionEntries=read(NUTRITION_STORAGE_KEY,[]);
const nutritionNutrients=["calories","protein","carbs","sugar","fiber","fat","sodium"];
function nutritionRound(n,p=1){return Number((Number(n)||0).toFixed(p))}
function nutritionSelectedDate(){return document.getElementById("nutritionDate")?.value||todayString()}
function nutritionForDate(){const d=nutritionSelectedDate();return nutritionEntries.filter(e=>e.date===d)}
function nutritionTotals(){return nutritionForDate().reduce((a,e)=>{nutritionNutrients.forEach(k=>a[k]+=Number(e[k])||0);return a},{calories:0,protein:0,carbs:0,sugar:0,fiber:0,fat:0,sodium:0})}
function saveNutrition(){write(NUTRITION_STORAGE_KEY,nutritionEntries);renderNutrition()}
function unitLabel(unit,amount){
  const names={serving:"serving",piece:"piece",slice:"slice",egg:"egg",strip:"strip",cup:"cup",tbsp:"tablespoon",tsp:"teaspoon",oz:"ounce",g:"gram",container:"container",shake:"shake"};
  const base=names[unit]||unit;
  return Number(amount)===1?base:(base==="piece"?"pieces":base==="slice"?"slices":base==="egg"?"eggs":base==="strip"?"strips":base==="cup"?"cups":base==="tablespoon"?"tablespoons":base==="teaspoon"?"teaspoons":base==="ounce"?"ounces":base==="container"?"containers":base==="shake"?"shakes":base+"s")
}
function setSelectValue(id,value){const el=document.getElementById(id);if(el&&el.options&&[...el.options].some(o=>o.value===value))el.value=value}
function setNutritionServingBasis(amount,unit){
  document.getElementById("nutritionServingAmount").value=amount;
  document.getElementById("nutritionServingUnit").value=unit;
  document.getElementById("nutritionServingUnitDisplay").value=unitLabel(unit,amount);
}
function nutritionPreview(){
  const amount=Number(document.getElementById("nutritionAmount")?.value)||0;
  const servingAmount=Number(document.getElementById("nutritionServingAmount")?.value)||1;
  const unit=document.getElementById("nutritionUnit")?.value||"serving";
  const multiplier=amount/servingAmount;
  document.getElementById("nutritionPreviewHeading").textContent=`${amount} ${unitLabel(unit,amount)}`;
  nutritionNutrients.forEach(k=>{
    const source=Number(document.getElementById("nutrition"+k[0].toUpperCase()+k.slice(1))?.value)||0;
    const total=source*multiplier;
    const target=document.getElementById("nutritionPreview"+k[0].toUpperCase()+k.slice(1));
    if(target)target.textContent=(k==="calories"||k==="sodium")?Math.round(total):nutritionRound(total);
  });
  const inlineAmount=document.getElementById("nutritionInlineAmount");
  const inlineCalories=document.getElementById("nutritionInlineCalories");
  const inlineProtein=document.getElementById("nutritionInlineProtein");
  if(inlineAmount)inlineAmount.textContent=`${amount} ${unitLabel(unit,amount)}`;
  if(inlineCalories){
    const sourceCalories=Number(document.getElementById("nutritionCalories")?.value)||0;
    inlineCalories.textContent=Math.round(sourceCalories*multiplier);
  }
  if(inlineProtein){
    const sourceProtein=Number(document.getElementById("nutritionProtein")?.value)||0;
    inlineProtein.textContent=nutritionRound(sourceProtein*multiplier);
  }

  const saved=nutritionTotals();
  const draft={};
  nutritionNutrients.forEach(k=>{
    const source=Number(document.getElementById("nutrition"+k[0].toUpperCase()+k.slice(1))?.value)||0;
    draft[k]=source*multiplier;
  });

  document.getElementById("nutritionTotalCalories").textContent=Math.round(saved.calories+draft.calories);
  document.getElementById("nutritionTotalProtein").textContent=nutritionRound(saved.protein+draft.protein);
  document.getElementById("nutritionTotalCarbs").textContent=nutritionRound(saved.carbs+draft.carbs);
  document.getElementById("nutritionTotalSugar").textContent=nutritionRound(saved.sugar+draft.sugar);
  document.getElementById("nutritionTotalFiber").textContent=nutritionRound(saved.fiber+draft.fiber);
  document.getElementById("nutritionTotalFat").textContent=nutritionRound(saved.fat+draft.fat);
  document.getElementById("nutritionTotalSodium").textContent=Math.round(saved.sodium+draft.sodium);

  const status=document.getElementById("nutritionTotalsStatus");
  const foodName=document.getElementById("nutritionFoodName")?.value.trim();
  if(status){
    status.textContent=foodName
      ? "Live totals including the food currently being entered"
      : "Saved food totals";
    status.classList.toggle("previewing",Boolean(foodName));
  }
}
function renderNutritionSearch(query=""){
  const wrap=document.getElementById("nutritionFoodResults");if(!wrap)return;
  const q=query.trim().toLowerCase();
  const results=NUTRITION_FOODS.filter(f=>!q||f.name.toLowerCase().includes(q)||(f.aliases||[]).some(a=>a.includes(q))).slice(0,12);
  wrap.innerHTML=results.map(f=>`<button type="button" class="nutrition-food-result" data-food-index="${NUTRITION_FOODS.indexOf(f)}"><span><strong>${esc(f.name)}</strong><small>${esc(f.servingLabel)}</small></span><span>${f.calories} cal • ${f.protein}g protein</span></button>`).join("");
  wrap.querySelectorAll("[data-food-index]").forEach(b=>b.addEventListener("click",()=>{
    const f=NUTRITION_FOODS[Number(b.dataset.foodIndex)];
    document.getElementById("nutritionFoodName").value=f.name;
    document.getElementById("nutritionAmount").value=f.servingAmount;
    setSelectValue("nutritionUnit",f.servingUnit);
    setNutritionServingBasis(f.servingAmount,f.servingUnit);
    nutritionNutrients.forEach(k=>document.getElementById("nutrition"+k[0].toUpperCase()+k.slice(1)).value=f[k]);
    nutritionPreview();
    document.getElementById("nutritionFoodForm").scrollIntoView({behavior:"smooth",block:"center"})
  }))
}
function renderNutrition(){
  if(!document.getElementById("nutritionDate"))return;
  const totals=nutritionTotals();
  document.getElementById("nutritionTotalCalories").textContent=Math.round(totals.calories);
  document.getElementById("nutritionTotalProtein").textContent=nutritionRound(totals.protein);
  document.getElementById("nutritionTotalCarbs").textContent=nutritionRound(totals.carbs);
  document.getElementById("nutritionTotalSugar").textContent=nutritionRound(totals.sugar);
  document.getElementById("nutritionTotalFiber").textContent=nutritionRound(totals.fiber);
  document.getElementById("nutritionTotalFat").textContent=nutritionRound(totals.fat);
  document.getElementById("nutritionTotalSodium").textContent=Math.round(totals.sodium);
  const date=nutritionSelectedDate();
  document.getElementById("nutritionLogHeading").textContent=new Date(date+"T00:00:00").toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
  const todays=nutritionForDate(),groups=["Breakfast","Lunch","Dinner","Snack"],wrap=document.getElementById("nutritionMealGroups");
  document.getElementById("nutritionEmptyState").classList.toggle("hidden",todays.length>0);
  wrap.innerHTML=groups.map(group=>{
    const items=todays.filter(e=>e.mealType===group);if(!items.length)return "";
    return `<section class="nutrition-meal-section"><h4>${group}</h4>${items.map(item=>`<div class="nutrition-meal-row"><div><p><strong>${esc(item.name)}</strong></p><small>${item.amount} ${esc(unitLabel(item.unit,item.amount))}</small></div><button type="button" class="nutrition-remove" data-nutrition-id="${item.id}">Remove</button><div class="nutrition-meal-nutrients">${Math.round(item.calories)} cal • ${nutritionRound(item.protein)}g protein • ${nutritionRound(item.carbs)}g carbs • ${nutritionRound(item.sugar)}g sugar • ${nutritionRound(item.fiber)}g fiber • ${nutritionRound(item.fat)}g fat • ${Math.round(item.sodium)}mg sodium</div></div>`).join("")}</section>`
  }).join("");
  wrap.querySelectorAll("[data-nutrition-id]").forEach(b=>b.addEventListener("click",()=>{nutritionEntries=nutritionEntries.filter(e=>e.id!==b.dataset.nutritionId);saveNutrition()}))
}
function initNutrition(){
  const date=document.getElementById("nutritionDate");if(!date)return;
  date.value=todayString();date.addEventListener("change",renderNutrition);
  document.getElementById("nutritionFoodSearch").addEventListener("input",e=>renderNutritionSearch(e.target.value));
  ["nutritionAmount","nutritionUnit","nutritionCalories","nutritionProtein","nutritionCarbs","nutritionSugar","nutritionFiber","nutritionFat","nutritionSodium"].forEach(id=>{
    const field=document.getElementById(id);
    ["input","change","keyup","blur"].forEach(eventName=>field.addEventListener(eventName,nutritionPreview));
  });
  document.getElementById("nutritionFoodForm").addEventListener("input",nutritionPreview);
  document.getElementById("nutritionFoodForm").addEventListener("change",nutritionPreview);
  document.getElementById("nutritionAmount").addEventListener("keydown",event=>{
    if(event.key==="Enter"){
      event.preventDefault();
      nutritionPreview();
      document.getElementById("nutritionFoodForm").requestSubmit();
    }
  });
  document.getElementById("nutritionFoodForm").addEventListener("submit",e=>{
    e.preventDefault();
    const amount=Number(document.getElementById("nutritionAmount").value)||1;
    const servingAmount=Number(document.getElementById("nutritionServingAmount").value)||1;
    const multiplier=amount/servingAmount;
    const entry={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:nutritionSelectedDate(),name:document.getElementById("nutritionFoodName").value.trim(),mealType:document.getElementById("nutritionMealType").value,amount,unit:document.getElementById("nutritionUnit").value,servingAmount,servingUnit:document.getElementById("nutritionServingUnit").value};
    nutritionNutrients.forEach(k=>{const id="nutrition"+k[0].toUpperCase()+k.slice(1);entry[k]=nutritionRound(Number(document.getElementById(id).value)*multiplier,k==="calories"||k==="sodium"?0:1)});
    nutritionEntries.push(entry);saveNutrition();e.target.reset();
    document.getElementById("nutritionAmount").value=1;
    setSelectValue("nutritionUnit","serving");
    setNutritionServingBasis(1,"serving");
    nutritionNutrients.forEach(k=>document.getElementById("nutrition"+k[0].toUpperCase()+k.slice(1)).value=0);
    renderNutrition();
    nutritionPreview()
  });
  document.getElementById("nutritionClearDayBtn").addEventListener("click",()=>{const d=nutritionSelectedDate();if(confirm(`Clear all food logged for ${d}?`)){nutritionEntries=nutritionEntries.filter(e=>e.date!==d);saveNutrition()}});
  document.getElementById("nutritionCopyProteinBtn").addEventListener("click",()=>{const total=nutritionRound(nutritionTotals().protein);document.getElementById("protein").value=total;quickCheckMessage.textContent=`Nutrition total copied: ${total} g protein. Save today when finished.`;document.querySelector('[data-view="homeView"]').click();setTimeout(()=>document.getElementById("protein").scrollIntoView({behavior:"smooth",block:"center"}),200)});
  renderNutritionSearch();renderNutrition();nutritionPreview()
}
initNutrition();


/* Version 9.0 Nutrition Coach */
const NUTRITION_GOALS_KEY="mzjV9NutritionGoals";
const NUTRITION_FAVORITES_KEY="mzjV9NutritionFavorites";
const GROCERY_KEY="mzjV9Grocery";
let nutritionGoals=read(NUTRITION_GOALS_KEY,{calories:1900,protein:130,fiber:30});
let nutritionFavorites=read(NUTRITION_FAVORITES_KEY,[]);
let groceryItems=read(GROCERY_KEY,[]);

function clampPercent(value,goal){return Math.max(0,Math.min(100,goal?value/goal*100:0))}
function uniqueByName(items){
  const seen=new Set();
  return items.filter(item=>{
    const key=(item.name||"").toLowerCase();
    if(!key||seen.has(key))return false;
    seen.add(key);return true
  })
}
function nutritionTodayEntries(){return nutritionEntries.filter(e=>e.date===todayString())}
function totalsForDate(date){
  return nutritionEntries.filter(e=>e.date===date).reduce((sum,e)=>{
    nutritionNutrients.forEach(k=>sum[k]+=Number(e[k])||0);return sum
  },{calories:0,protein:0,carbs:0,sugar:0,fiber:0,fat:0,sodium:0})
}
function renderGoalProgress(){
  if(!document.getElementById("goalCaloriesText"))return;
  const totals=nutritionTotals();
  document.getElementById("goalCaloriesText").textContent=`${Math.round(totals.calories).toLocaleString()} / ${nutritionGoals.calories.toLocaleString()}`;
  document.getElementById("goalProteinText").textContent=`${nutritionRound(totals.protein)} / ${nutritionGoals.protein} g`;
  document.getElementById("goalFiberText").textContent=`${nutritionRound(totals.fiber)} / ${nutritionGoals.fiber} g`;
  document.getElementById("goalCaloriesMeter").style.width=`${clampPercent(totals.calories,nutritionGoals.calories)}%`;
  document.getElementById("goalProteinMeter").style.width=`${clampPercent(totals.protein,nutritionGoals.protein)}%`;
  document.getElementById("goalFiberMeter").style.width=`${clampPercent(totals.fiber,nutritionGoals.fiber)}%`
}
function renderMealTotals(){
  document.querySelectorAll(".nutrition-meal-section").forEach(section=>{
    const title=section.querySelector("h4")?.textContent;
    const items=nutritionForDate().filter(e=>e.mealType===title);
    const totals=items.reduce((s,e)=>{nutritionNutrients.forEach(k=>s[k]+=Number(e[k])||0);return s},{calories:0,protein:0,carbs:0,sugar:0,fiber:0,fat:0,sodium:0});
    let summary=section.querySelector(".meal-total-summary");
    if(!summary){summary=document.createElement("p");summary.className="meal-total-summary";section.querySelector("h4").after(summary)}
    summary.textContent=`${Math.round(totals.calories)} calories • ${nutritionRound(totals.protein)} g protein • ${nutritionRound(totals.carbs)} g carbs`
  });
  document.querySelectorAll(".nutrition-meal-row").forEach(row=>{
    const id=row.querySelector("[data-nutrition-id]")?.dataset.nutritionId;
    if(!id||row.querySelector(".nutrition-favorite"))return;
    const button=document.createElement("button");
    button.type="button";button.className="nutrition-favorite";
    button.textContent=nutritionFavorites.some(f=>f.sourceId===id)?"★":"☆";
    button.title="Save as favorite";
    button.addEventListener("click",()=>{
      const entry=nutritionEntries.find(e=>e.id===id);if(!entry)return;
      const existing=nutritionFavorites.findIndex(f=>f.name===entry.name&&f.amount===entry.amount&&f.unit===entry.unit);
      if(existing>=0)nutritionFavorites.splice(existing,1);
      else nutritionFavorites.unshift({...entry,sourceId:id,id:"fav-"+Date.now(),date:undefined});
      write(NUTRITION_FAVORITES_KEY,nutritionFavorites);
      renderNutritionCoach()
    });
    row.querySelector("div").prepend(button)
  })
}
function prefillNutrition(entry){
  document.getElementById("nutritionFoodName").value=entry.name;
  document.getElementById("nutritionMealType").value=entry.mealType||"Breakfast";
  document.getElementById("nutritionAmount").value=entry.amount||entry.servingAmount||1;
  setSelectValue("nutritionUnit",entry.unit||entry.servingUnit||"serving");
  setNutritionServingBasis(entry.servingAmount||entry.amount||1,entry.servingUnit||entry.unit||"serving");
  const multiplier=(entry.amount||1)/(entry.servingAmount||entry.amount||1);
  nutritionNutrients.forEach(k=>{
    const perBasis=multiplier?Number(entry[k]||0)/multiplier:Number(entry[k]||0);
    document.getElementById("nutrition"+k[0].toUpperCase()+k.slice(1)).value=nutritionRound(perBasis,k==="calories"||k==="sodium"?0:1)
  });
  nutritionPreview();
  document.getElementById("nutritionFoodForm").scrollIntoView({behavior:"smooth",block:"center"})
}
function renderRecentFoods(){
  const list=document.getElementById("recentFoodsList");if(!list)return;
  const recent=uniqueByName([...nutritionEntries].reverse()).slice(0,8);
  list.innerHTML=recent.map((e,i)=>`<button type="button" data-recent-index="${i}">${esc(e.name)}<small>${e.amount} ${esc(unitLabel(e.unit,e.amount))}</small></button>`).join("");
  document.getElementById("recentFoodsEmpty").classList.toggle("hidden",recent.length>0);
  list.querySelectorAll("[data-recent-index]").forEach(b=>b.addEventListener("click",()=>prefillNutrition(recent[Number(b.dataset.recentIndex)])))
}
function renderFavorites(){
  const list=document.getElementById("favoriteFoodsList");if(!list)return;
  list.innerHTML=nutritionFavorites.slice(0,10).map((e,i)=>`<button type="button" data-favorite-index="${i}">★ ${esc(e.name)}<small>${e.amount} ${esc(unitLabel(e.unit,e.amount))}</small></button>`).join("");
  document.getElementById("favoriteFoodsEmpty").classList.toggle("hidden",nutritionFavorites.length>0);
  list.querySelectorAll("[data-favorite-index]").forEach(b=>b.addEventListener("click",()=>prefillNutrition(nutritionFavorites[Number(b.dataset.favoriteIndex)])))
}
function renderProteinCoach(){
  const total=nutritionTotals().protein;
  const remaining=Math.max(0,nutritionGoals.protein-total);
  document.getElementById("proteinCoachHeading").textContent=remaining>0?`${nutritionRound(remaining)} g still available to reach your goal`:"Protein goal reached";
  document.getElementById("proteinCoachMessage").textContent=remaining>0
    ?`You have logged ${nutritionRound(total)} g. Choose a familiar protein food or continue with your planned meals.`
    :`You have logged ${nutritionRound(total)} g of protein today. Nice work—keep meals comfortable and balanced.`;
  const suggestions=NUTRITION_FOODS.filter(f=>f.protein>=12).sort((a,b)=>b.protein-a.protein).slice(0,6);
  const wrap=document.getElementById("proteinCoachSuggestions");
  wrap.innerHTML=suggestions.map((f,i)=>`<button type="button" data-protein-index="${i}">${esc(f.name)}<small>${f.protein} g per ${esc(f.servingLabel)}</small></button>`).join("");
  wrap.querySelectorAll("[data-protein-index]").forEach(b=>b.addEventListener("click",()=>{
    const f=suggestions[Number(b.dataset.proteinIndex)];
    prefillNutrition({...f,amount:f.servingAmount,unit:f.servingUnit,mealType:"Snack"})
  }))
}
function renderWeeklyNutrition(){
  const wrap=document.getElementById("weeklyNutritionGrid");if(!wrap)return;
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);
    const date=d.toISOString().slice(0,10),totals=totalsForDate(date);
    days.push({date,label:d.toLocaleDateString(undefined,{weekday:"short"}),totals})
  }
  wrap.innerHTML=days.map(day=>`<article class="${day.date===todayString()?"today":""}"><strong>${day.label}</strong><span>${Math.round(day.totals.calories)} cal</span><span>${nutritionRound(day.totals.protein)}g protein</span><span>${nutritionRound(day.totals.fiber)}g fiber</span></article>`).join("")
}
function renderGrocery(){
  const wrap=document.getElementById("groceryList");if(!wrap)return;
  wrap.innerHTML=groceryItems.map((item,i)=>`<label class="${item.checked?"checked":""}"><input type="checkbox" data-grocery-check="${i}" ${item.checked?"checked":""}><span>${esc(item.text)}</span><button type="button" data-grocery-remove="${i}">×</button></label>`).join("");
  wrap.querySelectorAll("[data-grocery-check]").forEach(input=>input.addEventListener("change",()=>{
    groceryItems[Number(input.dataset.groceryCheck)].checked=input.checked;write(GROCERY_KEY,groceryItems);renderGrocery()
  }));
  wrap.querySelectorAll("[data-grocery-remove]").forEach(button=>button.addEventListener("click",()=>{
    groceryItems.splice(Number(button.dataset.groceryRemove),1);write(GROCERY_KEY,groceryItems);renderGrocery()
  }))
}
function renderHomeNutrition(){
  if(!document.getElementById("homeCalories"))return;
  const totals=totalsForDate(todayString());
  const meals=new Set(nutritionTodayEntries().map(e=>e.mealType)).size;
  document.getElementById("homeCalories").textContent=Math.round(totals.calories).toLocaleString();
  document.getElementById("homeProtein").textContent=`${nutritionRound(totals.protein)} g`;
  document.getElementById("homeFiber").textContent=`${nutritionRound(totals.fiber)} g`;
  document.getElementById("homeMealsLogged").textContent=meals;
  document.getElementById("homeCaloriesGoal").textContent=`of ${nutritionGoals.calories.toLocaleString()}`;
  document.getElementById("homeProteinGoal").textContent=`of ${nutritionGoals.protein} g`;
  document.getElementById("homeFiberGoal").textContent=`of ${nutritionGoals.fiber} g`;
  document.getElementById("homeCaloriesMeter").style.width=`${clampPercent(totals.calories,nutritionGoals.calories)}%`;
  document.getElementById("homeProteinMeter").style.width=`${clampPercent(totals.protein,nutritionGoals.protein)}%`;
  document.getElementById("homeFiberMeter").style.width=`${clampPercent(totals.fiber,nutritionGoals.fiber)}%`;
  document.getElementById("homeMealsMeter").style.width=`${Math.min(100,meals/3*100)}%`;

  const proteinRemaining=Math.max(0,nutritionGoals.protein-totals.protein);
  let title="Your next good choice",message="Log your first meal when you are ready.";
  if(meals===0){message="Nothing is logged yet. Start with what you actually ate—there is no need to make the day look perfect."}
  else if(proteinRemaining>35){title="Protein needs attention";message=`You have ${nutritionRound(proteinRemaining)} g left to reach your protein target. A protein-rich meal or snack can help.`}
  else if(totals.fiber<nutritionGoals.fiber*.5&&meals>=2){title="A little more fiber may help";message="Fruit, vegetables, beans, or oatmeal could gently raise today’s fiber."}
  else if(proteinRemaining<=0){title="Protein goal reached";message="You reached your protein target. Keep the rest of the day comfortable, hydrated, and balanced."}
  else{title="You are building a solid day";message=`You are within ${nutritionRound(proteinRemaining)} g of your protein goal. Keep going one choice at a time.`}
  document.getElementById("dailyCoachTitle").textContent=title;
  document.getElementById("dailyCoachMessage").textContent=message
}
function renderNutritionCoach(){
  renderGoalProgress();renderMealTotals();renderRecentFoods();renderFavorites();renderProteinCoach();renderWeeklyNutrition();renderGrocery();renderHomeNutrition()
}
function initNutritionCoach(){
  const goalsDialog=document.getElementById("nutritionGoalsDialog");
  document.getElementById("nutritionGoalSettingsBtn").addEventListener("click",()=>{
    document.getElementById("goalCaloriesInput").value=nutritionGoals.calories;
    document.getElementById("goalProteinInput").value=nutritionGoals.protein;
    document.getElementById("goalFiberInput").value=nutritionGoals.fiber;
    goalsDialog.showModal()
  });
  document.getElementById("saveNutritionGoalsBtn").addEventListener("click",()=>{
    nutritionGoals={
      calories:Number(document.getElementById("goalCaloriesInput").value)||1900,
      protein:Number(document.getElementById("goalProteinInput").value)||130,
      fiber:Number(document.getElementById("goalFiberInput").value)||30
    };
    write(NUTRITION_GOALS_KEY,nutritionGoals);goalsDialog.close();renderNutritionCoach()
  });
  document.getElementById("groceryForm").addEventListener("submit",e=>{
    e.preventDefault();const input=document.getElementById("groceryInput");const text=input.value.trim();
    if(text){groceryItems.push({text,checked:false});write(GROCERY_KEY,groceryItems);input.value="";renderGrocery()}
  });
  document.getElementById("clearGroceryBtn").addEventListener("click",()=>{
    groceryItems=groceryItems.filter(i=>!i.checked);write(GROCERY_KEY,groceryItems);renderGrocery()
  });
  document.getElementById("openNutritionBtn").addEventListener("click",()=>document.querySelector('[data-view="mealsView"]').click());
  document.getElementById("nutritionDate").addEventListener("change",renderNutritionCoach);
  document.getElementById("nutritionFoodForm").addEventListener("submit",()=>setTimeout(renderNutritionCoach,0));
  document.getElementById("nutritionClearDayBtn").addEventListener("click",()=>setTimeout(renderNutritionCoach,0));
  renderNutritionCoach()
}
initNutritionCoach();


/* Version 9.0.1 Automatic Food Matching */
const FOOD_ALIASES={
  "cabbage":"cabbage, raw",
  "raw cabbage":"cabbage, raw",
  "cooked cabbage":"cabbage, cooked",
  "boiled cabbage":"cabbage, cooked",
  "steamed cabbage":"cabbage, cooked",
  "broccoli":"broccoli, cooked",
  "steamed broccoli":"broccoli, cooked",
  "broccoli steamed":"broccoli, cooked",
  "eggs":"egg, large",
  "egg":"egg, large",
  "bacon":"bacon, pork, thick-cut",
  "chicken":"chicken breast, cooked",
  "chicken breast":"chicken breast, cooked",
  "rice":"rice, white, cooked",
  "brown rice":"rice, brown, cooked",
  "oatmeal":"oatmeal, cooked",
  "apple":"apple, medium",
  "banana":"banana, medium"
};
function normalizeFoodText(value){return String(value||"").toLowerCase().replace(/[^\w\s]/g," ").replace(/\s+/g," ").trim()}
function findFoodMatch(query){
  const normalized=normalizeFoodText(query); if(!normalized)return null;
  const aliasTarget=FOOD_ALIASES[normalized];
  if(aliasTarget){const aliased=NUTRITION_FOODS.find(food=>normalizeFoodText(food.name)===normalizeFoodText(aliasTarget));if(aliased)return aliased}
  const exact=NUTRITION_FOODS.find(food=>normalizeFoodText(food.name)===normalized);if(exact)return exact;
  const starts=NUTRITION_FOODS.filter(food=>normalizeFoodText(food.name).startsWith(normalized));if(starts.length===1)return starts[0];
  const contains=NUTRITION_FOODS.filter(food=>normalizeFoodText(food.name).includes(normalized));if(contains.length===1)return contains[0];
  const words=normalized.split(" ").filter(Boolean);
  const scored=NUTRITION_FOODS.map(food=>{const haystack=normalizeFoodText(food.name);return {food,score:words.reduce((t,w)=>t+(haystack.includes(w)?1:0),0)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  if(scored.length&&(scored.length===1||scored[0].score>scored[1].score))return scored[0].food;
  return null
}
function applyFoodMatch(food){
  if(!food)return false;
  document.getElementById("nutritionFoodName").value=food.name;
  setNutritionServingBasis(food.servingAmount||1,food.servingUnit||"serving");
  document.getElementById("nutritionAmount").value=food.servingAmount||1;
  setSelectValue("nutritionUnit",food.servingUnit||"serving");
  nutritionNutrients.forEach(key=>{document.getElementById("nutrition"+key[0].toUpperCase()+key.slice(1)).value=food[key]??0});
  const status=document.getElementById("nutritionFoodMatchStatus");
  if(status){status.textContent=`Matched: ${food.name} — nutrition values loaded.`;status.classList.add("matched");status.classList.remove("not-matched")}
  nutritionPreview(); return true
}
function autoMatchTypedFood(showFailure=true){
  const input=document.getElementById("nutritionFoodName"),query=input?.value.trim();if(!query)return false;
  const match=findFoodMatch(query);if(match)return applyFoodMatch(match);
  if(showFailure){const status=document.getElementById("nutritionFoodMatchStatus");if(status){status.textContent="No matching food was found. Choose a suggestion or enter the nutrition values manually.";status.classList.remove("matched");status.classList.add("not-matched")}}
  return false
}
function initAutomaticFoodMatching(){
  const input=document.getElementById("nutritionFoodName");if(!input)return;
  let mobileMatchTimer;
  input.addEventListener("input",()=>{clearTimeout(mobileMatchTimer);mobileMatchTimer=setTimeout(()=>autoMatchTypedFood(false),650)});
  input.addEventListener("change",()=>autoMatchTypedFood(true));
  input.addEventListener("blur",()=>autoMatchTypedFood(true));
  input.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key==="Tab")autoMatchTypedFood(true)});
  ["nutritionAmount","nutritionUnit","nutritionMealType"].forEach(id=>document.getElementById(id)?.addEventListener("focus",()=>autoMatchTypedFood(true)));
  document.getElementById("nutritionFoodForm").addEventListener("submit",event=>{
    const nutrientTotal=nutritionNutrients.reduce((sum,key)=>sum+(Number(document.getElementById("nutrition"+key[0].toUpperCase()+key.slice(1))?.value)||0),0);
    if(nutrientTotal===0&&input.value.trim()){const matched=autoMatchTypedFood(true);if(matched){event.preventDefault();setTimeout(()=>document.getElementById("nutritionFoodForm").requestSubmit(),0)}}
  },true)
}
initAutomaticFoodMatching();


/* Version 9.0.3 robust typed-food matching */
(function(){
  const input=document.getElementById("nutritionFoodName");
  const amount=document.getElementById("nutritionAmount");
  const findButton=document.getElementById("findTypedFoodBtn");
  if(!input)return;

  let timer=null;

  function showStatus(message,state){
    const status=document.getElementById("nutritionFoodMatchStatus");
    if(!status)return;
    status.textContent=message;
    status.classList.remove("matched","not-matched");
    if(state)status.classList.add(state);
  }

  function normalizeV903(value){
    return String(value||"").toLowerCase().replace(/[^\w\s]/g," ").replace(/\s+/g," ").trim();
  }

  function findV903Match(query){
    const normalized=normalizeV903(query);
    if(!normalized)return null;

    const aliases={
      "cabbage":"cabbage, raw",
      "raw cabbage":"cabbage, raw",
      "cooked cabbage":"cabbage, cooked",
      "boiled cabbage":"cabbage, cooked",
      "steamed cabbage":"cabbage, cooked"
    };
    const target=aliases[normalized]||normalized;

    return NUTRITION_FOODS.find(food=>normalizeV903(food.name)===normalizeV903(target))
      || NUTRITION_FOODS.find(food=>normalizeV903(food.name).startsWith(normalized))
      || NUTRITION_FOODS.find(food=>normalizeV903(food.name).includes(normalized))
      || null;
  }

  function applyV903Match(){
    const query=input.value.trim();
    if(!query)return false;

    const food=findV903Match(query);
    if(!food){
      showStatus(`"${query}" is not in the food list yet. Choose a suggestion or enter nutrition manually.`,"not-matched");
      return false;
    }

    input.value=food.name;
    document.getElementById("nutritionAmount").value=food.servingAmount||1;
    if(typeof setSelectValue==="function"){
      setSelectValue("nutritionUnit",food.servingUnit||"serving");
    }else{
      const unit=document.getElementById("nutritionUnit");
      if(unit)unit.value=food.servingUnit||"serving";
    }
    if(typeof setNutritionServingBasis==="function"){
      setNutritionServingBasis(food.servingAmount||1,food.servingUnit||"serving");
    }
    nutritionNutrients.forEach(key=>{
      const field=document.getElementById("nutrition"+key[0].toUpperCase()+key.slice(1));
      if(field)field.value=food[key]??0;
    });
    showStatus(`Matched: ${food.name} — nutrition values loaded.`,"matched");
    if(typeof nutritionPreview==="function")nutritionPreview();
    return true;
  }

  input.addEventListener("input",()=>{
    clearTimeout(timer);
    timer=setTimeout(applyV903Match,450);
  });
  input.addEventListener("blur",applyV903Match);
  input.addEventListener("change",applyV903Match);
  input.addEventListener("keydown",event=>{
    if(event.key==="Tab" || event.key==="Enter"){
      applyV903Match();
    }
  });
  if(amount){
    amount.addEventListener("focus",applyV903Match);
    amount.addEventListener("pointerdown",applyV903Match);
  }
  if(findButton)findButton.addEventListener("click",applyV903Match);
})();


/* Version 10 — smart food search and phone-first nutrition entry */
const V10_OFF_SEARCH_URL="https://world.openfoodfacts.org/cgi/search.pl";
let v10OnlineFoods=[];

function v10Number(value){
  const n=Number(value);
  return Number.isFinite(n)?n:0;
}
function v10Text(value){return String(value||"").trim()}
function v10Nutrient(product,key){
  const n=product?.nutriments||{};
  return v10Number(n[`${key}_100g`] ?? n[key]);
}
function v10ProductToFood(product){
  const name=v10Text(product.product_name_en||product.product_name||product.generic_name_en||product.generic_name);
  if(!name)return null;
  const brand=v10Text(product.brands);
  return {
    name:brand?`${name} — ${brand}`:name,
    servingLabel:"100 g",
    servingAmount:100,
    servingUnit:"g",
    calories:Math.round(v10Nutrient(product,"energy-kcal")),
    protein:v10Nutrient(product,"proteins"),
    carbs:v10Nutrient(product,"carbohydrates"),
    sugar:v10Nutrient(product,"sugars"),
    fiber:v10Nutrient(product,"fiber"),
    fat:v10Nutrient(product,"fat"),
    sodium:Math.round(v10Nutrient(product,"sodium")*1000),
    image:v10Text(product.image_front_small_url||product.image_small_url),
    source:"Open Food Facts"
  };
}
function v10FoodHasNutrition(food){
  return [food.calories,food.protein,food.carbs,food.fat,food.fiber].some(v=>Number(v)>0);
}
function v10ApplyFood(food){
  if(!food)return;
  document.getElementById("nutritionFoodName").value=food.name;
  document.getElementById("nutritionAmount").value=food.servingAmount||1;
  setSelectValue("nutritionUnit",food.servingUnit||"serving");
  setNutritionServingBasis(food.servingAmount||1,food.servingUnit||"serving");
  nutritionNutrients.forEach(k=>{
    const field=document.getElementById("nutrition"+k[0].toUpperCase()+k.slice(1));
    if(field)field.value=food[k]??0;
  });
  const status=document.getElementById("nutritionFoodMatchStatus");
  if(status){
    status.textContent=`Selected: ${food.name}. Change the amount, then add it.`;
    status.classList.add("matched");status.classList.remove("not-matched");
  }
  nutritionPreview();
  document.getElementById("nutritionAmount")?.focus({preventScroll:true});
  document.getElementById("nutritionFoodForm")?.scrollIntoView({behavior:"smooth",block:"start"});
}
function v10FoodCard(food,index,online=false){
  const image=food.image?`<img src="${esc(food.image)}" alt="" loading="lazy">`:`<span class="food-card-placeholder">🍽️</span>`;
  return `<button type="button" class="v10-food-card" data-v10-${online?'online':'local'}="${index}">${image}<span class="v10-food-card-copy"><strong>${esc(food.name)}</strong><small>${esc(food.servingLabel||'Serving information')}</small><span>${Math.round(food.calories||0)} cal • ${nutritionRound(food.protein||0)}g protein</span></span><span class="v10-select-arrow">›</span></button>`;
}
function v10BindFoodCards(container){
  container.querySelectorAll("[data-v10-local]").forEach(btn=>btn.addEventListener("click",()=>v10ApplyFood(NUTRITION_FOODS[Number(btn.dataset.v10Local)])));
  container.querySelectorAll("[data-v10-online]").forEach(btn=>btn.addEventListener("click",()=>v10ApplyFood(v10OnlineFoods[Number(btn.dataset.v10Online)])));
}
function v10RenderLocal(query=""){
  const wrap=document.getElementById("nutritionFoodResults");if(!wrap)return;
  const q=query.trim().toLowerCase();
  if(!q){wrap.innerHTML="";return}
  const matches=NUTRITION_FOODS.filter(f=>f.name.toLowerCase().includes(q)||(f.aliases||[]).some(a=>a.includes(q))).slice(0,8);
  wrap.innerHTML=matches.length?`<p class="result-section-label">Quick local matches</p>${matches.map(f=>v10FoodCard(f,NUTRITION_FOODS.indexOf(f),false)).join("")}`:"";
  v10BindFoodCards(wrap);
}
async function v10SearchOnline(){
  const input=document.getElementById("nutritionFoodSearch");
  const query=input.value.trim();
  const status=document.getElementById("onlineFoodSearchStatus");
  const wrap=document.getElementById("onlineFoodResults");
  if(query.length<2){status.textContent="Type at least two letters first.";input.focus();return}
  status.textContent=`Searching the larger food database for “${query}”…`;
  wrap.innerHTML='<div class="food-search-loading">Searching…</div>';
  try{
    const params=new URLSearchParams({search_terms:query,search_simple:"1",action:"process",json:"1",page_size:"18",fields:"code,product_name,product_name_en,generic_name,generic_name_en,brands,nutriments,image_front_small_url,image_small_url"});
    const response=await fetch(`${V10_OFF_SEARCH_URL}?${params.toString()}`,{headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error(`Search returned ${response.status}`);
    const data=await response.json();
    const seen=new Set();
    v10OnlineFoods=(data.products||[]).map(v10ProductToFood).filter(Boolean).filter(v10FoodHasNutrition).filter(food=>{const key=food.name.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,12);
    if(!v10OnlineFoods.length){
      wrap.innerHTML='<div class="food-search-empty"><strong>No usable online matches found.</strong><span>Try a brand name, a more specific description, or use manual nutrition entry.</span></div>';
      status.textContent="No online matches with nutrition values were found.";return;
    }
    wrap.innerHTML=`<p class="result-section-label">Online food database</p>${v10OnlineFoods.map((f,i)=>v10FoodCard(f,i,true)).join("")}`;
    status.textContent=`Found ${v10OnlineFoods.length} foods. Tap the closest match.`;
    v10BindFoodCards(wrap);
  }catch(error){
    wrap.innerHTML='<div class="food-search-empty"><strong>Online search is temporarily unavailable.</strong><span>Your built-in foods and manual entry still work.</span></div>';
    status.textContent="Could not reach the online database. Check the connection and try again.";
  }
}
function v10InitSmartFoodSearch(){
  const input=document.getElementById("nutritionFoodSearch");
  const button=document.getElementById("onlineFoodSearchBtn");
  if(!input||!button)return;
  input.addEventListener("input",()=>v10RenderLocal(input.value));
  input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();v10SearchOnline()}});
  button.addEventListener("click",v10SearchOnline);

  const toggle=document.getElementById("toggleNutritionDetailsBtn");
  const details=document.getElementById("nutritionDetailsFields");
  if(toggle&&details){
    toggle.addEventListener("click",()=>{
      const open=details.classList.toggle("open");
      toggle.setAttribute("aria-expanded",String(open));
      toggle.textContent=open?"Hide nutrition details":"Show nutrition details";
    });
  }
}
v10InitSmartFoodSearch();


/* Version 11 — Smart Dining and one-tap restaurant logging */
const V11_DINING_FAVORITES_KEY="mzjV11DiningFavorites";
let v11DiningFavorites=new Set(read(V11_DINING_FAVORITES_KEY,[]));
let v11DiningRestaurant="All";
let v11DiningFilter="all";

const V11_DINING_ITEMS=[
  {id:"sk-glad-choc",restaurant:"Smoothie King",name:"Gladiator GLP-1 Chocolate (20 oz)",emoji:"🥤",mealType:"Snack",calories:220,protein:45,carbs:5,sugar:0,fiber:2,fat:3.5,sodium:500,score:"green",why:["45 g protein","0 g added sugar","Lower-calorie shake"],verified:"2026-07"},
  {id:"sk-glad-van",restaurant:"Smoothie King",name:"Gladiator GLP-1 Vanilla (20 oz)",emoji:"🥤",mealType:"Snack",calories:220,protein:45,carbs:3,sugar:1,fiber:1,fat:2.5,sodium:400,score:"green",why:["45 g protein","0 g added sugar","Very low carbohydrate"],verified:"2026-07"},
  {id:"sk-power-choc",restaurant:"Smoothie King",name:"Power Meal Slim GLP-1 Chocolate (20 oz)",emoji:"🥤",mealType:"Snack",calories:200,protein:22,carbs:26,sugar:6,fiber:10,fat:7,sodium:630,score:"green",why:["10 g fiber","22 g protein","Meal-sized nutrition"],verified:"2026-07"},
  {id:"sk-activator",restaurant:"Smoothie King",name:"Activator Recovery GLP-1 Almond Berry (20 oz)",emoji:"🫐",mealType:"Snack",calories:200,protein:24,carbs:22,sugar:13,fiber:5,fat:2,sodium:220,score:"green",why:["24 g protein","5 g fiber","Fruit-forward option"],verified:"2026-07"},

  {id:"cfa-grill12",restaurant:"Chick-fil-A",name:"12-count Grilled Nuggets",emoji:"🍗",mealType:"Lunch",calories:200,protein:38,carbs:2,sugar:1,fiber:0,fat:4.5,sodium:660,score:"green",why:["38 g protein","Low carbohydrate","Easy small portion"],verified:"starter"},
  {id:"cfa-grill8",restaurant:"Chick-fil-A",name:"8-count Grilled Nuggets",emoji:"🍗",mealType:"Lunch",calories:130,protein:25,carbs:1,sugar:1,fiber:0,fat:3,sodium:440,score:"green",why:["25 g protein","Low calorie","Good for lighter appetite"],verified:"starter"},
  {id:"cfa-grillsand",restaurant:"Chick-fil-A",name:"Grilled Chicken Sandwich",emoji:"🥪",mealType:"Lunch",calories:390,protein:28,carbs:44,sugar:12,fiber:3,fat:12,sodium:770,score:"yellow",why:["28 g protein","Complete meal","Watch sauces and sodium"],verified:"starter"},
  {id:"cfa-kale",restaurant:"Chick-fil-A",name:"Kale Crunch Side",emoji:"🥬",mealType:"Snack",calories:170,protein:4,carbs:13,sugar:8,fiber:4,fat:12,sodium:250,score:"yellow",why:["4 g fiber","Vegetable side","Pair with lean protein"],verified:"starter"},

  {id:"chip-lowcal",restaurant:"Chipotle",name:"High Protein–Low Calorie Bowl",emoji:"🥗",mealType:"Lunch",calories:470,protein:36,carbs:28,sugar:6,fiber:11,fat:25,sodium:1050,score:"green",why:["36 g protein","High fiber","No tortilla"],verified:"2026 starter"},
  {id:"chip-chicken-cup",restaurant:"Chipotle",name:"High Protein Chicken Cup",emoji:"🍗",mealType:"Snack",calories:180,protein:32,carbs:0,sugar:0,fiber:0,fat:7,sodium:310,score:"green",why:["32 g protein","Small portion","Easy protein add-on"],verified:"2026-07"},
  {id:"chip-kylie",restaurant:"Chipotle",name:"Kylie’s High Protein Chicken Bowl",emoji:"🥣",mealType:"Lunch",calories:690,protein:52,carbs:67,sugar:7,fiber:12,fat:25,sodium:1500,score:"yellow",why:["52 g protein","12 g fiber","Higher calorie and sodium"],verified:"2025-12"},
  {id:"chip-salad",restaurant:"Chipotle",name:"Chicken Salad: fajita vegetables, tomato salsa, beans",emoji:"🥗",mealType:"Lunch",calories:430,protein:40,carbs:35,sugar:7,fiber:13,fat:14,sodium:1100,score:"green",why:["Protein + fiber","Skip tortilla","Customize portions"],verified:"starter"},

  {id:"sb-eggs",restaurant:"Starbucks",name:"Eggs & Cheddar Protein Box",emoji:"🥚",mealType:"Lunch",calories:460,protein:22,carbs:40,sugar:21,fiber:5,fat:24,sodium:460,score:"yellow",why:["22 g protein","Portable meal","Higher calorie than a shake"],verified:"2026-07"},
  {id:"sb-cheese-fruit",restaurant:"Starbucks",name:"Cheese & Fruit Protein Box",emoji:"🧀",mealType:"Lunch",calories:470,protein:20,carbs:37,sugar:17,fiber:4,fat:28,sodium:620,score:"yellow",why:["20 g protein","Portable","Higher fat"],verified:"2026-07"},
  {id:"sb-egg-bites",restaurant:"Starbucks",name:"Egg White & Roasted Red Pepper Egg Bites",emoji:"🥚",mealType:"Breakfast",calories:170,protein:12,carbs:11,sugar:3,fiber:0,fat:8,sodium:470,score:"yellow",why:["Small serving","12 g protein","Pair with fruit or yogurt"],verified:"starter"},
  {id:"sb-coffee",restaurant:"Starbucks",name:"Grande Caffè Latte with nonfat milk",emoji:"☕",mealType:"Snack",calories:130,protein:13,carbs:19,sugar:18,fiber:0,fat:0,sodium:150,score:"yellow",why:["13 g protein","No syrup","Liquid calories still count"],verified:"starter"},

  {id:"sub-turkey",restaurant:"Subway",name:"6-inch Oven-Roasted Turkey on wheat, vegetables, mustard",emoji:"🥪",mealType:"Lunch",calories:300,protein:20,carbs:48,sugar:7,fiber:5,fat:4,sodium:850,score:"yellow",why:["20 g protein","Add vegetables","Choose mustard over creamy sauce"],verified:"starter"},
  {id:"sub-chicken-salad",restaurant:"Subway",name:"Rotisserie-Style Chicken Salad",emoji:"🥗",mealType:"Lunch",calories:230,protein:24,carbs:13,sugar:6,fiber:4,fat:10,sodium:620,score:"green",why:["24 g protein","Lower carbohydrate","Dressing changes totals"],verified:"starter"},
  {id:"panera-chicken-salad",restaurant:"Panera",name:"Half Green Goddess Cobb Salad with Chicken",emoji:"🥗",mealType:"Lunch",calories:260,protein:21,carbs:12,sugar:6,fiber:4,fat:15,sodium:560,score:"green",why:["21 g protein","Half portion","Vegetable-rich"],verified:"starter"},
  {id:"panera-turkey-chili",restaurant:"Panera",name:"Cup of Turkey Chili",emoji:"🥣",mealType:"Lunch",calories:200,protein:14,carbs:27,sugar:5,fiber:7,fat:5,sodium:690,score:"green",why:["7 g fiber","Warm smaller meal","Moderate protein"],verified:"starter"},

  {id:"braums-grill",restaurant:"Braum’s",name:"Grilled Chicken Sandwich, no mayonnaise",emoji:"🥪",mealType:"Lunch",calories:380,protein:33,carbs:42,sugar:7,fiber:2,fat:9,sodium:900,score:"yellow",why:["33 g protein","Skip mayonnaise","Sodium can be high"],verified:"starter estimate"},
  {id:"braums-milk",restaurant:"Braum’s",name:"Fat-Free Milk (12 oz)",emoji:"🥛",mealType:"Snack",calories:130,protein:13,carbs:18,sugar:18,fiber:0,fat:0,sodium:170,score:"yellow",why:["13 g protein","Simple option","Contains natural milk sugar"],verified:"starter estimate"},

  {id:"g-fairlife",restaurant:"Grocery Favorites",name:"Fairlife Nutrition Plan Shake",emoji:"🥤",mealType:"Snack",calories:150,protein:30,carbs:4,sugar:2,fiber:1,fat:2.5,sodium:230,score:"green",why:["30 g protein","Ready to drink","Low sugar"],verified:"label varies"},
  {id:"g-premier",restaurant:"Grocery Favorites",name:"Premier Protein Shake",emoji:"🥤",mealType:"Snack",calories:160,protein:30,carbs:5,sugar:1,fiber:3,fat:3,sodium:370,score:"green",why:["30 g protein","Shelf-stable","Multiple flavors"],verified:"label varies"},
  {id:"g-oikos",restaurant:"Grocery Favorites",name:"Oikos Triple Zero Greek Yogurt",emoji:"🥣",mealType:"Snack",calories:90,protein:15,carbs:7,sugar:5,fiber:0,fat:0,sodium:60,score:"green",why:["15 g protein","Small portion","Easy snack"],verified:"label varies"},
  {id:"g-cottage",restaurant:"Grocery Favorites",name:"Low-fat Cottage Cheese (1/2 cup)",emoji:"🥣",mealType:"Snack",calories:90,protein:12,carbs:5,sugar:4,fiber:0,fat:2.5,sodium:360,score:"green",why:["12 g protein","Soft texture","Watch sodium"],verified:"generic"},
  {id:"g-tuna",restaurant:"Grocery Favorites",name:"Tuna Packet in Water",emoji:"🐟",mealType:"Snack",calories:90,protein:20,carbs:0,sugar:0,fiber:0,fat:1,sodium:300,score:"green",why:["20 g protein","No preparation","Portable"],verified:"label varies"},
  {id:"g-chicken",restaurant:"Grocery Favorites",name:"Rotisserie Chicken Breast, skin removed (3 oz)",emoji:"🍗",mealType:"Lunch",calories:140,protein:26,carbs:0,sugar:0,fiber:0,fat:3,sodium:420,score:"green",why:["26 g protein","Easy meal prep","Remove skin for less fat"],verified:"generic"}
];

function v11DiningGoals(){
  const goals=typeof getNutritionGoals==="function"?getNutritionGoals():{calories:1900,protein:130,fiber:30};
  return {calories:Number(goals.calories)||1900,protein:Number(goals.protein)||130,fiber:Number(goals.fiber)||30};
}
function v11DiningTotals(){
  const entries=nutritionEntries.filter(e=>e.date===todayString());
  return entries.reduce((a,e)=>{a.calories+=Number(e.calories)||0;a.protein+=Number(e.protein)||0;a.fiber+=Number(e.fiber)||0;return a},{calories:0,protein:0,fiber:0});
}
function v11AddDiningItem(item){
  const entry={
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),
    date:todayString(),
    mealType:item.mealType||"Lunch",
    name:`${item.restaurant}: ${item.name}`,
    amount:1,
    unit:"serving",
    calories:item.calories,
    protein:item.protein,
    carbs:item.carbs,
    sugar:item.sugar,
    fiber:item.fiber,
    fat:item.fat,
    sodium:item.sodium
  };
  nutritionEntries.push(entry);
  write(NUTRITION_STORAGE_KEY,nutritionEntries);
  renderNutrition();
  if(typeof renderNutritionCoach==="function")renderNutritionCoach();
  v11RenderDining();
  const button=document.querySelector(`[data-dining-add="${item.id}"]`);
  if(button){const old=button.textContent;button.textContent="✓ Added to today";button.classList.add("added");setTimeout(()=>{button.textContent=old;button.classList.remove("added")},1600)}
}
function v11ToggleDiningFavorite(id){
  if(v11DiningFavorites.has(id))v11DiningFavorites.delete(id);else v11DiningFavorites.add(id);
  write(V11_DINING_FAVORITES_KEY,[...v11DiningFavorites]);
  v11RenderDining();
}
function v11DiningCard(item){
  const favorite=v11DiningFavorites.has(item.id);
  const label=item.score==="green"?"Best choice":"Good choice";
  return `<article class="dining-item-card ${item.score}">
    <div class="dining-card-top">
      <span class="dining-item-emoji">${item.emoji}</span>
      <div class="dining-card-title"><small>${esc(item.restaurant)}</small><h3>${esc(item.name)}</h3></div>
      <button type="button" class="dining-favorite ${favorite?'saved':''}" data-dining-favorite="${item.id}" aria-label="${favorite?'Remove from':'Add to'} favorites">${favorite?'★':'☆'}</button>
    </div>
    <div class="dining-score-line"><span class="choice-badge ${item.score}">${item.score==="green"?"🟢":"🟡"} ${label}</span><span>${item.calories} cal</span></div>
    <div class="dining-macro-grid">
      <div><strong>${item.protein}g</strong><span>Protein</span></div>
      <div><strong>${item.fiber}g</strong><span>Fiber</span></div>
      <div><strong>${item.carbs}g</strong><span>Carbs</span></div>
      <div><strong>${item.sodium}mg</strong><span>Sodium</span></div>
    </div>
    <details class="why-choice"><summary>Why this choice?</summary><ul>${item.why.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>
    <button type="button" class="primary-button dining-add-button" data-dining-add="${item.id}">Add to today</button>
  </article>`;
}
function v11RenderDining(){
  const wrap=document.getElementById("diningResults");if(!wrap)return;
  const query=(document.getElementById("diningSearchInput")?.value||"").trim().toLowerCase();
  const totals=v11DiningTotals(),goals=v11DiningGoals();
  const calLeft=Math.max(0,goals.calories-totals.calories);
  const proteinLeft=Math.max(0,goals.protein-totals.protein);
  const fiberLeft=Math.max(0,goals.fiber-totals.fiber);
  document.getElementById("diningCaloriesLeft").textContent=`${Math.round(calLeft)} kcal`;
  document.getElementById("diningProteinLeft").textContent=`${nutritionRound(proteinLeft)} g`;
  document.getElementById("diningFiberLeft").textContent=`${nutritionRound(fiberLeft)} g`;
  const coachTitle=document.getElementById("diningCoachTitle"),coachMessage=document.getElementById("diningCoachMessage");
  if(proteinLeft>35){coachTitle.textContent="Protein is today’s priority";coachMessage.textContent=`You have about ${Math.round(proteinLeft)} g of protein left. Green choices with 25+ g protein are highlighted.`}
  else if(fiberLeft>8){coachTitle.textContent="Add some fiber next";coachMessage.textContent=`You’re close on protein. Look for vegetables, beans, berries, or an item with 5+ g fiber.`}
  else{coachTitle.textContent="You’re in a good spot";coachMessage.textContent="Choose a portion that feels comfortable, eat slowly, and stop when comfortably satisfied."}

  let items=V11_DINING_ITEMS.filter(item=>{
    const restaurantOK=v11DiningRestaurant==="All"||item.restaurant===v11DiningRestaurant;
    const filterOK=v11DiningFilter==="all"||item.score===v11DiningFilter||(v11DiningFilter==="favorites"&&v11DiningFavorites.has(item.id));
    const queryOK=!query||`${item.restaurant} ${item.name} ${item.why.join(" ")}`.toLowerCase().includes(query);
    return restaurantOK&&filterOK&&queryOK;
  });
  items.sort((a,b)=>{
    const aNeed=(a.protein*Math.min(1,proteinLeft/30))+(a.fiber*Math.min(1,fiberLeft/8))-a.calories/250;
    const bNeed=(b.protein*Math.min(1,proteinLeft/30))+(b.fiber*Math.min(1,fiberLeft/8))-b.calories/250;
    return bNeed-aNeed;
  });
  wrap.innerHTML=items.map(v11DiningCard).join("");
  document.getElementById("diningResultCount").textContent=`${items.length} item${items.length===1?"":"s"}`;
  document.getElementById("diningResultsHeading").textContent=v11DiningRestaurant==="All"?"Recommended choices":v11DiningRestaurant;
  document.getElementById("diningEmpty").classList.toggle("hidden",items.length>0);
  wrap.querySelectorAll("[data-dining-add]").forEach(btn=>btn.addEventListener("click",()=>v11AddDiningItem(V11_DINING_ITEMS.find(x=>x.id===btn.dataset.diningAdd))));
  wrap.querySelectorAll("[data-dining-favorite]").forEach(btn=>btn.addEventListener("click",()=>v11ToggleDiningFavorite(btn.dataset.diningFavorite)));
}
function v11InitDining(){
  const chips=document.getElementById("diningRestaurantChips");if(!chips)return;
  const restaurants=["All",...new Set(V11_DINING_ITEMS.map(x=>x.restaurant))];
  chips.innerHTML=restaurants.map((name,i)=>`<button type="button" class="restaurant-chip ${i===0?'active':''}" data-restaurant="${esc(name)}">${esc(name)}</button>`).join("");
  chips.querySelectorAll("[data-restaurant]").forEach(btn=>btn.addEventListener("click",()=>{
    v11DiningRestaurant=btn.dataset.restaurant;
    chips.querySelectorAll(".restaurant-chip").forEach(x=>x.classList.toggle("active",x===btn));
    v11RenderDining();
  }));
  document.querySelectorAll("[data-dining-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    v11DiningFilter=btn.dataset.diningFilter;
    document.querySelectorAll("[data-dining-filter]").forEach(x=>x.classList.toggle("active",x===btn));
    v11RenderDining();
  }));
  document.getElementById("diningSearchInput").addEventListener("input",v11RenderDining);
  document.getElementById("clearDiningSearchBtn").addEventListener("click",()=>{
    document.getElementById("diningSearchInput").value="";
    v11DiningRestaurant="All";v11DiningFilter="all";
    chips.querySelectorAll(".restaurant-chip").forEach((x,i)=>x.classList.toggle("active",i===0));
    document.querySelectorAll("[data-dining-filter]").forEach(x=>x.classList.toggle("active",x.dataset.diningFilter==="all"));
    v11RenderDining();
  });
  document.getElementById("diningOpenNutritionBtn").addEventListener("click",()=>document.querySelector('[data-view="mealsView"]').click());
  document.getElementById("homeDiningShortcut").addEventListener("click",()=>document.querySelector('[data-view="diningView"]').click());
  document.querySelector('[data-view="diningView"]').addEventListener("click",()=>setTimeout(v11RenderDining,0));
  v11RenderDining();
}
v11InitDining();


/* Version 11.1 — Personal dose-effectiveness tracker */
const DOSE_EFFECTIVENESS_KEY="mzjV11DoseEffectiveness";
let doseEffectivenessEntries=read(DOSE_EFFECTIVENESS_KEY,[]);

function doseISODate(value){
  const d=value?new Date(`${value}T12:00:00`):new Date();
  return Number.isNaN(d.getTime())?new Date():d;
}
function doseDayDifference(start,end){
  const a=doseISODate(start),b=doseISODate(end);
  return Math.floor((b-a)/86400000);
}
function doseAverage(entry){
  return ((Number(entry.appetite)||0)+(Number(entry.cravings)||0)+(Number(entry.fullness)||0))/3;
}
function doseFindShots(){
  const shots=[];
  (dailyEntries||[]).forEach(entry=>{
    if(entry.shotTaken){
      shots.push({date:entry.date,dose:entry.dose||"Dose not recorded"});
    }
  });
  const dayOne=read("mzjV8DayOne",null);
  if(dayOne?.begun&&dayOne?.date&&!shots.some(s=>s.date===dayOne.date)){
    shots.push({date:dayOne.date,dose:dayOne.dose||"2.5 mg"});
  }
  return shots.sort((a,b)=>b.date.localeCompare(a.date));
}
function doseCurrentShot(onDate=todayString()){
  return doseFindShots().find(shot=>shot.date<=onDate)||null;
}
function doseCycleEntries(shot){
  if(!shot)return[];
  return doseEffectivenessEntries
    .filter(entry=>entry.shotDate===shot.date&&doseDayDifference(shot.date,entry.date)>=0&&doseDayDifference(shot.date,entry.date)<=6)
    .sort((a,b)=>a.date.localeCompare(b.date));
}
function dosePossibleFadeDay(entries,shot){
  let previouslyStrong=false;
  for(const entry of entries){
    const avg=doseAverage(entry);
    if(avg>=6)previouslyStrong=true;
    if(previouslyStrong&&avg<6){
      return doseDayDifference(shot.date,entry.date)+1;
    }
  }
  return null;
}
function doseUpdateOutputs(){
  const pairs=[
    ["doseAppetiteControl","doseAppetiteOutput"],
    ["doseCravingControl","doseCravingOutput"],
    ["doseFullnessControl","doseFullnessOutput"]
  ];
  pairs.forEach(([inputId,outputId])=>{
    const input=document.getElementById(inputId),output=document.getElementById(outputId);
    if(input&&output)output.textContent=`${input.value} / 10`;
  });
}
function doseLoadTodayEntry(){
  const shot=doseCurrentShot();
  const today=todayString();
  const existing=shot?doseEffectivenessEntries.find(e=>e.date===today&&e.shotDate===shot.date):null;
  document.getElementById("doseEffectivenessDate").value=today;
  document.getElementById("doseAppetiteControl").value=existing?.appetite??5;
  document.getElementById("doseCravingControl").value=existing?.cravings??5;
  document.getElementById("doseFullnessControl").value=existing?.fullness??5;
  document.getElementById("doseEffectivenessNotes").value=existing?.notes??"";
  doseUpdateOutputs();
}
function renderDoseEffectiveness(){
  const panel=document.getElementById("doseEffectivenessPanel");
  if(!panel)return;
  const shot=doseCurrentShot();
  const noShot=document.getElementById("doseTrackerNoShot");
  const form=document.getElementById("doseEffectivenessForm");

  if(!shot){
    document.getElementById("doseTrackerCurrentDose").textContent="Not logged";
    document.getElementById("doseTrackerShotDate").textContent="—";
    document.getElementById("doseTrackerCycleDay").textContent="—";
    document.getElementById("doseTrackerFadeDay").textContent="Not enough data";
    noShot.classList.remove("hidden");
    form.classList.add("dose-disabled");
  }else{
    const cycleDay=doseDayDifference(shot.date,todayString())+1;
    document.getElementById("doseTrackerCurrentDose").textContent=shot.dose;
    document.getElementById("doseTrackerShotDate").textContent=formatDate(shot.date);
    document.getElementById("doseTrackerCycleDay").textContent=cycleDay>=1?`Day ${cycleDay}`:"Before injection";
    noShot.classList.add("hidden");
    form.classList.remove("dose-disabled");
  }

  const entries=doseCycleEntries(shot);
  const fadeDay=shot?dosePossibleFadeDay(entries,shot):null;
  document.getElementById("doseTrackerFadeDay").textContent=fadeDay?`Day ${fadeDay}`:"Not detected yet";

  const chart=document.getElementById("doseEffectivenessChart");
  const byDay=new Map(entries.map(e=>[doseDayDifference(shot.date,e.date)+1,e]));
  chart.innerHTML=Array.from({length:7},(_,i)=>{
    const day=i+1,entry=byDay.get(day),avg=entry?doseAverage(entry):null;
    const height=avg===null?4:Math.max(8,avg*9);
    const date=shot?new Date(doseISODate(shot.date).getTime()+i*86400000):null;
    const dateLabel=date?date.toLocaleDateString(undefined,{weekday:"short"}):"";
    return `<article class="dose-day ${fadeDay===day?"fade-day":""}">
      <div class="dose-bar-shell"><div class="dose-bar ${avg===null?"empty":avg>=7?"strong":avg>=5?"moderate":"low"}" style="height:${height}%"></div></div>
      <strong>Day ${day}</strong>
      <span>${dateLabel}</span>
      <small>${avg===null?"—":avg.toFixed(1)}</small>
    </article>`;
  }).join("");

  if(entries.length){
    const overall=entries.reduce((sum,e)=>sum+doseAverage(e),0)/entries.length;
    document.getElementById("doseTrackerAverage").textContent=`Average ${overall.toFixed(1)} / 10`;
    const first=doseAverage(entries[0]),last=doseAverage(entries[entries.length-1]);
    let insight=`You have ${entries.length} check-in${entries.length===1?"":"s"} in this cycle.`;
    if(entries.length>=2){
      const change=last-first;
      if(change<=-2) insight+=` Control is down ${Math.abs(change).toFixed(1)} points from your first check-in.`;
      else if(change>=2) insight+=` Control is up ${change.toFixed(1)} points from your first check-in.`;
      else insight+=" Your ratings are fairly steady so far.";
    }
    if(fadeDay) insight+=` Your first possible fade point appears on Day ${fadeDay}.`;
    document.getElementById("doseTrackerInsight").textContent=insight;
  }else{
    document.getElementById("doseTrackerAverage").textContent="No check-ins";
    document.getElementById("doseTrackerInsight").textContent="Add daily check-ins to identify your personal pattern.";
  }
  doseLoadTodayEntry();
}
function saveDoseEffectiveness(event){
  event.preventDefault();
  const shot=doseCurrentShot();
  if(!shot){
    alert("Please log an injection date first using “Injection taken today” in the daily check-in.");
    return;
  }
  const date=todayString();
  const entry={
    id:`${shot.date}-${date}`,
    shotDate:shot.date,
    dose:shot.dose,
    date,
    appetite:Number(document.getElementById("doseAppetiteControl").value),
    cravings:Number(document.getElementById("doseCravingControl").value),
    fullness:Number(document.getElementById("doseFullnessControl").value),
    notes:document.getElementById("doseEffectivenessNotes").value.trim(),
    updatedAt:new Date().toISOString()
  };
  const index=doseEffectivenessEntries.findIndex(e=>e.shotDate===shot.date&&e.date===date);
  if(index>=0)doseEffectivenessEntries[index]=entry;else doseEffectivenessEntries.push(entry);
  write(DOSE_EFFECTIVENESS_KEY,doseEffectivenessEntries);
  renderDoseEffectiveness();
  const button=document.querySelector("#doseEffectivenessForm button[type='submit']");
  if(button){const old=button.textContent;button.textContent="✓ Check-in saved";setTimeout(()=>button.textContent=old,1600)}
}
function initDoseEffectiveness(){
  const form=document.getElementById("doseEffectivenessForm");
  if(!form)return;
  ["doseAppetiteControl","doseCravingControl","doseFullnessControl"].forEach(id=>{
    document.getElementById(id).addEventListener("input",doseUpdateOutputs);
  });
  form.addEventListener("submit",saveDoseEffectiveness);
  document.getElementById("dailyForm")?.addEventListener("submit",()=>setTimeout(renderDoseEffectiveness,0));
  renderDoseEffectiveness();
}
initDoseEffectiveness();


// Version 11.3.1 — direct weekly progress photo storage with iPhone picker fix
const PHOTO_PROGRESS_KEY="mzjV11PhotoProgress";
const PHOTO_DB_NAME="mzjProgressPhotos";
const PHOTO_DB_STORE="photos";
let photoProgressEntries=read(PHOTO_PROGRESS_KEY,[]);
let selectedPhotoFile=null;
let selectedPhotoObjectUrl="";
const photoObjectUrls=new Set();

function photoEntryLabel(entry){
  return `WEEK ${entry.week}\n${formatDate(entry.date)}\n${entry.weight?entry.weight+" lbs":""}\nDose: ${entry.dose}${entry.notes?"\n"+entry.notes:""}`.trim();
}
function suggestedPhotoWeek(){
  const s=settings();
  const start=new Date((s.startDate||todayString())+"T00:00:00");
  const now=new Date(todayString()+"T00:00:00");
  return Math.max(1,Math.floor((now-start)/604800000)+1);
}
function openPhotoDb(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(PHOTO_DB_NAME,1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(PHOTO_DB_STORE))db.createObjectStore(PHOTO_DB_STORE);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error("Could not open photo storage."));
  });
}
async function putProgressPhoto(key,blob){
  const db=await openPhotoDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_DB_STORE,"readwrite");
    tx.objectStore(PHOTO_DB_STORE).put(blob,key);
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
  db.close();
}
async function getProgressPhoto(key){
  if(!key)return null;
  const db=await openPhotoDb();
  const result=await new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_DB_STORE,"readonly");
    const req=tx.objectStore(PHOTO_DB_STORE).get(key);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });
  db.close();return result;
}
async function deleteProgressPhoto(key){
  if(!key)return;
  const db=await openPhotoDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_DB_STORE,"readwrite");
    tx.objectStore(PHOTO_DB_STORE).delete(key);
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
  db.close();
}
function releasePhotoObjectUrls(){
  photoObjectUrls.forEach(url=>URL.revokeObjectURL(url));photoObjectUrls.clear();
}
function makePhotoUrl(blob){
  if(!blob)return "";
  const url=URL.createObjectURL(blob);photoObjectUrls.add(url);return url;
}
function setPhotoUploadStatus(message,state=""){
  const el=document.getElementById("photoUploadStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`photo-upload-status${state?` is-${state}`:""}`;
}
function showSelectedPhoto(file){
  const preview=document.getElementById("photoUploadPreview");
  const removeBtn=document.getElementById("removeSelectedPhotoBtn");
  if(selectedPhotoObjectUrl){URL.revokeObjectURL(selectedPhotoObjectUrl);selectedPhotoObjectUrl="";}
  selectedPhotoFile=file||null;
  if(!preview)return;
  if(!file){
    preview.innerHTML='<div class="photo-preview-placeholder"><span>🖼️</span><strong>No photo selected</strong><small>Your selected picture will appear here.</small></div>';
    if(removeBtn)removeBtn.hidden=true;
    setPhotoUploadStatus("No photo chosen yet.");
    return;
  }
  setPhotoUploadStatus(`Photo selected: ${file.name||"iPhone photo"}. Preparing preview…`,"loading");
  selectedPhotoObjectUrl=URL.createObjectURL(file);
  const img=new Image();
  img.alt="Selected weekly progress photo";
  img.onload=()=>{
    preview.replaceChildren(img);
    setPhotoUploadStatus("Photo selected and ready to save.","ready");
  };
  img.onerror=()=>{
    preview.innerHTML='<div class="photo-preview-placeholder"><span>✅</span><strong>Photo selected</strong><small>This image format cannot be previewed here, but the app can still try to save it.</small></div>';
    setPhotoUploadStatus("Photo selected. Preview unavailable; tap Save week to store it.","ready");
    URL.revokeObjectURL(selectedPhotoObjectUrl);selectedPhotoObjectUrl="";
  };
  img.src=selectedPhotoObjectUrl;
  if(removeBtn)removeBtn.hidden=false;
}
async function loadPhotoEntry(week){
  const e=photoProgressEntries.find(x=>Number(x.week)===Number(week));
  if(!e)return;
  photoWeek.value=e.week;photoDate.value=e.date;photoWeight.value=e.weight||"";photoDose.value=e.dose||"2.5 mg";photoNotes.value=e.notes||"";
  showSelectedPhoto(null);
  if(e.photoKey){
    try{
      const blob=await getProgressPhoto(e.photoKey);
      if(blob){
        selectedPhotoFile=new File([blob],`week-${e.week}.jpg`,{type:blob.type||"image/jpeg"});
        showSelectedPhoto(selectedPhotoFile);
      }
    }catch(err){console.error(err);}
  }
  document.getElementById("photoWeekForm")?.scrollIntoView({behavior:"smooth",block:"start"});
}
async function deletePhotoEntry(week){
  const entry=photoProgressEntries.find(x=>Number(x.week)===Number(week));
  if(!entry||!confirm(`Delete the Week ${week} record and its saved photo?`))return;
  try{await deleteProgressPhoto(entry.photoKey);}catch(err){console.error(err);}
  photoProgressEntries=photoProgressEntries.filter(x=>Number(x.week)!==Number(week));
  write(PHOTO_PROGRESS_KEY,photoProgressEntries);await renderPhotoProgress();
}
async function photoCardMarkup(e){
  let image='<div class="photo-card-placeholder">📷<span>No photo</span></div>';
  if(e.photoKey){
    try{const blob=await getProgressPhoto(e.photoKey);if(blob)image=`<button type="button" class="photo-card-image-button" onclick="openPhotoViewer(${Number(e.week)})" aria-label="View Week ${Number(e.week)} photo"><img class="photo-card-image" src="${makePhotoUrl(blob)}" alt="Week ${Number(e.week)} progress photo"></button>`;}catch(err){console.error(err);}
  }
  return `<article class="photo-week-card ${e.photoKey?"photo-complete":""}">
    ${image}
    <div class="photo-week-card-body">
      <div class="photo-week-card-top"><span class="photo-week-badge">Week ${e.week}</span><span class="photo-status">${e.photoKey?"✓ Photo saved":"Photo pending"}</span></div>
      <strong>${formatDate(e.date)}</strong>
      <div class="photo-week-details"><span>⚖️ ${e.weight?esc(e.weight)+" lb":"No weight"}</span><span>💉 ${esc(e.dose||"—")}</span></div>
      ${e.notes?`<p>${esc(e.notes)}</p>`:""}
      <div class="photo-card-actions"><button type="button" class="primary-button" onclick="openPhotoViewer(${Number(e.week)})" ${e.photoKey?"":"disabled"}>View photo</button><button type="button" class="secondary-button" onclick="loadPhotoEntry(${Number(e.week)})">Edit</button><button type="button" class="secondary-button" onclick="navigator.clipboard.writeText(photoEntryLabel(photoProgressEntries.find(x=>Number(x.week)===${Number(e.week)}))).then(()=>alert('Label copied.'))">Copy label</button><button type="button" class="danger-button" onclick="deletePhotoEntry(${Number(e.week)})">Delete</button></div>
    </div>
  </article>`;
}
async function renderPhotoProgress(){
  const grid=document.getElementById("photoWeekGrid");if(!grid)return;
  releasePhotoObjectUrls();
  photoProgressEntries.sort((a,b)=>Number(a.week)-Number(b.week));
  if(photoProgressEntries.length){grid.innerHTML=(await Promise.all(photoProgressEntries.map(photoCardMarkup))).join("");}
  else grid.innerHTML="<div class='photo-empty'><div>📷</div><strong>No weekly photos logged yet.</strong><p>Start with Week 1 and build your visual journey one picture at a time.</p></div>";
  const a=document.getElementById("comparePhotoA"),b=document.getElementById("comparePhotoB");
  const opts=photoProgressEntries.map(e=>`<option value="${e.week}">Week ${e.week}</option>`).join("");
  if(a&&b){const av=a.value,bv=b.value;a.innerHTML=opts;b.innerHTML=opts;if(photoProgressEntries.length){a.value=photoProgressEntries.some(e=>String(e.week)===av)?av:String(photoProgressEntries[0].week);b.value=photoProgressEntries.some(e=>String(e.week)===bv)?bv:String(photoProgressEntries[photoProgressEntries.length-1].week);}await renderPhotoComparison();}
}
async function comparisonCard(entry){
  let image='<div class="photo-compare-placeholder">No photo saved</div>';
  if(entry.photoKey){try{const blob=await getProgressPhoto(entry.photoKey);if(blob)image=`<img class="photo-compare-image" src="${makePhotoUrl(blob)}" alt="Week ${Number(entry.week)} comparison photo">`;}catch(err){console.error(err);}}
  return `<article>${image}<div class="photo-compare-copy"><span>Week ${entry.week}</span><strong>${entry.weight?entry.weight+" lb":"—"}</strong><small>${formatDate(entry.date)} • ${esc(entry.dose)}</small><p>${esc(entry.notes||"No notes")}</p></div></article>`;
}
async function renderPhotoComparison(){
  const out=document.getElementById("photoCompareResult");if(!out)return;
  const a=photoProgressEntries.find(e=>String(e.week)===document.getElementById("comparePhotoA")?.value),b=photoProgressEntries.find(e=>String(e.week)===document.getElementById("comparePhotoB")?.value);
  if(!a||!b){out.innerHTML="<p>Add at least one weekly record to compare.</p>";return;}
  const change=(a.weight&&b.weight)?(Number(b.weight)-Number(a.weight)).toFixed(1):null;
  out.innerHTML=`${await comparisonCard(a)}<div class="compare-arrow">→</div>${await comparisonCard(b)}${change!==null?`<div class="compare-change">Weight change: <strong>${Number(change)>0?"+":""}${change} lb</strong></div>`:""}`;
}

let photoViewerWeek=null;
let photoViewerObjectUrl="";
function photoEntriesWithImages(){return photoProgressEntries.filter(e=>e.photoKey).sort((a,b)=>Number(a.week)-Number(b.week));}
function closePhotoViewer(){
  const viewer=document.getElementById("photoViewer");
  if(!viewer)return;
  viewer.hidden=true;viewer.setAttribute("aria-hidden","true");document.body.classList.remove("photo-viewer-open");
  if(photoViewerObjectUrl){URL.revokeObjectURL(photoViewerObjectUrl);photoViewerObjectUrl="";}
  photoViewerWeek=null;
}
async function openPhotoViewer(week){
  const entry=photoProgressEntries.find(e=>Number(e.week)===Number(week));
  if(!entry?.photoKey){alert(`No photo is saved for Week ${week}.`);return;}
  const viewer=document.getElementById("photoViewer"),wrap=document.getElementById("photoViewerImageWrap"),details=document.getElementById("photoViewerDetails");
  if(!viewer||!wrap||!details)return;
  try{
    const blob=await getProgressPhoto(entry.photoKey);
    if(!blob){alert("The saved photo could not be found on this device.");return;}
    if(photoViewerObjectUrl)URL.revokeObjectURL(photoViewerObjectUrl);
    photoViewerObjectUrl=URL.createObjectURL(blob);photoViewerWeek=Number(entry.week);
    document.getElementById("photoViewerTitle").textContent=`Week ${entry.week}`;
    wrap.innerHTML=`<img src="${photoViewerObjectUrl}" alt="Week ${Number(entry.week)} progress photo">`;
    details.innerHTML=`<div><span>Date</span><strong>${formatDate(entry.date)}</strong></div><div><span>Weight</span><strong>${entry.weight?esc(entry.weight)+" lb":"—"}</strong></div><div><span>Dose</span><strong>${esc(entry.dose||"—")}</strong></div><div class="photo-viewer-notes"><span>Notes</span><p>${esc(entry.notes||"No notes added.")}</p></div>`;
    const entries=photoEntriesWithImages(),index=entries.findIndex(e=>Number(e.week)===photoViewerWeek);
    document.getElementById("previousPhotoBtn").disabled=index<=0;
    document.getElementById("nextPhotoBtn").disabled=index<0||index>=entries.length-1;
    viewer.hidden=false;viewer.setAttribute("aria-hidden","false");document.body.classList.add("photo-viewer-open");
  }catch(err){console.error(err);alert("The photo could not be opened.");}
}
function movePhotoViewer(direction){
  const entries=photoEntriesWithImages(),index=entries.findIndex(e=>Number(e.week)===Number(photoViewerWeek));
  const next=entries[index+direction];if(next)openPhotoViewer(next.week);
}
function initPhotoViewer(){
  document.getElementById("closePhotoViewerBtn")?.addEventListener("click",closePhotoViewer);
  document.querySelectorAll("[data-close-photo-viewer]").forEach(el=>el.addEventListener("click",closePhotoViewer));
  document.getElementById("previousPhotoBtn")?.addEventListener("click",()=>movePhotoViewer(-1));
  document.getElementById("nextPhotoBtn")?.addEventListener("click",()=>movePhotoViewer(1));
  document.getElementById("editViewedPhotoBtn")?.addEventListener("click",()=>{const week=photoViewerWeek;closePhotoViewer();if(week!==null)loadPhotoEntry(week);});
  document.addEventListener("keydown",e=>{if(document.getElementById("photoViewer")?.hidden!==false)return;if(e.key==="Escape")closePhotoViewer();if(e.key==="ArrowLeft")movePhotoViewer(-1);if(e.key==="ArrowRight")movePhotoViewer(1);});
}

function initPhotoProgress(){
  const form=document.getElementById("photoWeekForm");if(!form)return;
  const fileInput=document.getElementById("photoFileInput");
  photoWeek.value=suggestedPhotoWeek();photoDate.value=todayString();
  const todayDaily=read(KEYS.daily,[]).find(x=>x.date===todayString());if(todayDaily?.dose)photoDose.value=todayDaily.dose;
  const weights=read(KEYS.weights,[]);if(weights.length)photoWeight.value=weights[weights.length-1].weight||"";
  const handleChosenPhoto=()=>{
    const file=fileInput?.files?.[0];
    if(!file){showSelectedPhoto(null);return;}
    const imageLike=file.type.startsWith("image/")||/\.(heic|heif|jpg|jpeg|png|webp)$/i.test(file.name||"");
    if(!imageLike){alert("Please choose a photo.");fileInput.value="";showSelectedPhoto(null);return;}
    if(file.size>35*1024*1024){alert("That photo is larger than 35 MB. Choose a smaller image.");fileInput.value="";showSelectedPhoto(null);return;}
    showSelectedPhoto(file);
  };
  fileInput?.addEventListener("change",handleChosenPhoto);
  fileInput?.addEventListener("input",handleChosenPhoto);
  document.getElementById("removeSelectedPhotoBtn")?.addEventListener("click",()=>{if(fileInput)fileInput.value="";showSelectedPhoto(null);});
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const week=Number(photoWeek.value);
    if(!week||!photoDate.value){alert("Enter a week number and date.");return;}
    const existing=photoProgressEntries.find(x=>Number(x.week)===week);
    let photoKey=existing?.photoKey||"";
    const saveBtn=document.getElementById("savePhotoWeekBtn");
    try{
      if(saveBtn){saveBtn.disabled=true;saveBtn.textContent="Saving photo…";}
      if(selectedPhotoFile){
        setPhotoUploadStatus("Saving photo securely on this device…","loading");
        photoKey=`week-${week}`;
        await putProgressPhoto(photoKey,selectedPhotoFile);
        const testBlob=await getProgressPhoto(photoKey);
        if(!testBlob)throw new Error("Photo verification failed");
      }
      const entry={week,date:photoDate.value,weight:photoWeight.value?Number(photoWeight.value):null,dose:photoDose.value,notes:photoNotes.value.trim(),photoKey,updatedAt:new Date().toISOString()};
      const i=photoProgressEntries.findIndex(x=>Number(x.week)===week);if(i>=0)photoProgressEntries[i]=entry;else photoProgressEntries.push(entry);
      write(PHOTO_PROGRESS_KEY,photoProgressEntries);await renderPhotoProgress();
      if(photoKey){
        setPhotoUploadStatus("Photo saved successfully. It now appears in your weekly gallery.","ready");
        await openPhotoViewer(week);
      }else{alert(`Week ${week} saved. Add a photo anytime by editing this week.`);}
    }catch(err){
      console.error(err);
      setPhotoUploadStatus("The photo could not be saved. Try opening the app in Safari and choose the photo again.","error");
      alert("The photo could not be saved. Try again in Safari. If it still fails, choose a screenshot or JPEG copy of the photo.");
    }finally{
      if(saveBtn){saveBtn.disabled=false;saveBtn.textContent="Save week";}
    }
  });
  copyPhotoLabelBtn.onclick=()=>{const entry={week:Number(photoWeek.value||suggestedPhotoWeek()),date:photoDate.value||todayString(),weight:photoWeight.value,dose:photoDose.value,notes:photoNotes.value.trim()};navigator.clipboard.writeText(photoEntryLabel(entry)).then(()=>alert("Photo label copied. Paste it into Markup or your photo editor."));};
  clearPhotoFormBtn.onclick=()=>{form.reset();if(fileInput)fileInput.value="";showSelectedPhoto(null);photoWeek.value=suggestedPhotoWeek();photoDate.value=todayString();photoDose.value="2.5 mg";};
  comparePhotoA.onchange=renderPhotoComparison;comparePhotoB.onchange=renderPhotoComparison;
  renderPhotoProgress();
}
initPhotoViewer();
initPhotoProgress();
