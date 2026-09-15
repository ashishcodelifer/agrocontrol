/* AgroControl — frontend prototype (inspired by Phenomenon Studio's Dribbble shot) */
"use strict";

/* ---------------- data ---------------- */
const WORKERS = [
  {id:1,name:"Olena Kovalenko",role:"Field operations coordinator",img:"assets/worker-placeholder.svg",on:true, tasks:5, cap:88,skills:["Crop disease ID","Sampling & scouting"]},
  {id:2,name:"Ethan Parker",role:"Greenhouse harvest manager",img:"assets/worker-placeholder.svg",on:true, tasks:3, cap:70,skills:["Harvest planning","Produce handling"]},
  {id:3,name:"Lauren Hayes",role:"Harvest crew supervisor",img:"assets/worker-placeholder.svg",on:true, tasks:4, cap:63,skills:["Harvest planning","Team briefing","+2"]},
  {id:4,name:"Mike Carter",role:"Field equipment operator",img:"assets/worker-placeholder.svg",on:false,tasks:4, cap:82,skills:["GPS guidance","Fertilizer spreading"]},
  {id:5,name:"Ryan Brooks",role:"Field operations coordinator",img:"assets/worker-placeholder.svg",on:true, tasks:2, cap:45,skills:["Irrigation","Soil prep"]},
  {id:6,name:"Diane Collins",role:"Produce quality inspector",img:"assets/worker-placeholder.svg",on:true, tasks:6, cap:91,skills:["Inspection","Admin & reporting"]},
  {id:7,name:"Frank Bennett",role:"Tractor and implements operator",img:"assets/worker-placeholder.svg",on:false,tasks:3, cap:58,skills:["Tractor ops","Plowing"]},
  {id:8,name:"Tyler Hughes",role:"Livestock care technician",img:"assets/worker-placeholder.svg",on:true, tasks:5, cap:74,skills:["Livestock care","Feed planning"]},
];

const FIELDS = ["North 40","Apple orchard west field (12 ha)","Tomato greenhouse 2","Pumpkin test north","Corn pivot 1, quadrant NE","Strawberry tunnels (4-6 row)","Service yard, maintenance lane 2","Irrigation control (pivot 1)"];
const day = 864e5, today = new Date(); today.setHours(0,0,0,0);
const D = off => new Date(today.getTime()+off*day);

let TASKS = [
  {id:1, title:"Scout for early blight symptoms", status:"planned",  prio:"high",   field:FIELDS[0], due:D(3),  assignees:[1,5]},
  {id:2, title:"Weekly scouting loop for fungal pressure", status:"in-progress", prio:"medium", field:FIELDS[1], due:D(5), assignees:[3,6]},
  {id:3, title:"Record baseline crop health photos", status:"completed", prio:"low", field:FIELDS[4], due:D(-2), assignees:[6]},
  {id:4, title:"Preventive sprayer maintenance check", status:"overdue", prio:"high", field:FIELDS[6], due:D(-4), assignees:[4,7]},
  {id:5, title:"Check leaf wetness and canopy density", status:"planned", prio:"low", field:FIELDS[2], due:D(7), assignees:[2]},
  {id:6, title:"Check drainage, fix standing water", status:"in-progress", prio:"high", field:FIELDS[3], due:D(2), assignees:[1,8]},
  {id:7, title:"Calibrate moisture sensors, row 14", status:"completed", prio:"medium", field:FIELDS[7], due:D(-1), assignees:[5]},
  {id:8, title:"Monitor disease hotspots & update map", status:"planned", prio:"low", field:FIELDS[5], due:D(12), assignees:[3]},
  {id:9, title:"Clean and sanitize harvest crates", status:"in-progress", prio:"high", field:FIELDS[5], due:D(1), assignees:[2,6]},
  {id:10,title:"Fertilizer spreading — quadrant NE", status:"overdue", prio:"medium", field:FIELDS[4], due:D(-6), assignees:[4]},
  {id:11,title:"Soil sampling round B (blocks 8-12)", status:"completed", prio:"low", field:FIELDS[0], due:D(-3), assignees:[1]},
  {id:12,title:"Greenhouse climate check, zone C", status:"in-progress", prio:"medium", field:FIELDS[2], due:D(0), assignees:[2,5]},
];

const STATUSES = [
  {key:"planned",   label:"Planned",   cls:"st-planned"},
  {key:"in-progress",label:"In progress",cls:"st-progress"},
  {key:"completed", label:"Completed", cls:"st-completed"},
  {key:"overdue",   label:"Overdue",   cls:"st-overdue"},
];

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmtDate = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
const daysLeft = d => Math.round((d - today)/day);
const dueLabel = d => { const n = daysLeft(d);
  if(n===0) return "Today"; if(n===1) return "Tomorrow";
  if(n>1) return `${n} days`; if(n===-1) return "1 day overdue"; return `${-n} days overdue`; };
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg){ const t=$("#toast"); $("#toast-msg").textContent=msg;
  t.classList.add("show"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2200); }
const workerById = id => WORKERS.find(w=>w.id===id);

/* ---------------- tabs ---------------- */
function switchTab(name){
  $$(".tabs button").forEach(b=>b.classList.toggle("active", b.dataset.tab===name));
  $$(".view").forEach(v=>v.classList.toggle("active", v.id==="view-"+name));
  if(name==="dashboard") drawDashboardCharts();
  if(name==="calendar") renderCalendar();
}

/* ---------------- dashboard ---------------- */
let workloadChart=null;
function drawDashboardCharts(){
  const el = $("#workloadChart"); if(!el) return;
  const labels=[], tasks=[], cap=[];
  for(let i=-9;i<=0;i++){ labels.push(D(i).toLocaleDateString("en-US",{month:"short",day:"numeric"}));
    tasks.push([9,14,7,5,10,6,12,7,9,13][i+9] ?? 8);
    cap.push(18); }
  const ctx = el.getContext("2d");
  if(workloadChart) workloadChart.destroy();
  workloadChart = new Chart(ctx,{ type:"bar",
    data:{labels, datasets:[
      {label:"Capacity", data:cap, backgroundColor:"rgba(255,255,255,.16)", borderRadius:6, barPercentage:.62, categoryPercentage:.7},
      {label:"Tasks", data:tasks, backgroundColor:"#ece84b", borderRadius:6, barPercentage:.62, categoryPercentage:.7},
    ]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{backgroundColor:"#1b2c1f",borderColor:"rgba(255,255,255,.1)",borderWidth:1,padding:10,
        callbacks:{title:i=>i[0].label, label:c=>` ${c.dataset.label}: ${c.parsed.y}`}}},
      scales:{
        x:{grid:{display:false},ticks:{color:"#8fa392",font:{size:10}}},
        y:{grid:{color:"rgba(255,255,255,.05)"},ticks:{color:"#8fa392",stepSize:6},max:21},
      }}});
  // sparkline in crop health card
  const sp = $("#sparkline");
  if(sp){ const c=sp.getContext("2d"), w=sp.width=sp.offsetWidth*2, h=sp.height=64;
    c.clearRect(0,0,w,h); c.beginPath();
    const pts=[.65,.6,.62,.55,.58,.5,.45,.48,.4,.36,.3];
    pts.forEach((p,i)=>{const x=i/(pts.length-1)*w, y=p*h; i?c.lineTo(x,y):c.moveTo(x,y);});
    c.strokeStyle="#ece84b"; c.lineWidth=2.5; c.stroke();
    c.lineTo(w,h); c.lineTo(0,h); c.closePath();
    const g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,"rgba(236,232,75,.25)"); g.addColorStop(1,"rgba(236,232,75,0)");
    c.fillStyle=g; c.fill(); }
}

/* ---------------- tasks ---------------- */
let taskView = "kanban";
function renderTasks(){
  renderKanban(); renderTaskList();
}
function taskCardHTML(t){
  const avs = t.assignees.map(id=>{const w=workerById(id); return w?`<img src="${w.img}" title="${esc(w.name)}">`:"";}).join("");
  return `<div class="tcard" draggable="true" data-id="${t.id}">
    <h5>${esc(t.title)}</h5>
    <div class="tmeta">
      <div class="row">&#128197; ${fmtDate(t.due)} &nbsp;&#183;&nbsp; ${dueLabel(t.due)}</div>
      <div class="row">&#127807; ${esc(t.field)}</div>
    </div>
    <div class="tfoot"><span class="prio ${t.prio}">${t.prio.toUpperCase()}</span>
      <span class="assignees">${avs}</span></div>
  </div>`;
}
function renderKanban(){
  const wrap = $("#kanban"); wrap.innerHTML="";
  STATUSES.forEach(st=>{
    const list = TASKS.filter(t=>t.status===st.key && taskMatches(t));
    const col = document.createElement("div");
    col.className="kcol"; col.dataset.status=st.key;
    col.innerHTML = `<div class="kcol-head"><span class="status-badge ${st.cls}">${st.label}</span><span class="count">${list.length}</span></div>`;
    list.forEach(t=> col.insertAdjacentHTML("beforeend", taskCardHTML(t)));
    wrap.appendChild(col);
  });
  bindDnD();
}
function renderTaskList(){
  const tbody = $("#taskRows"); tbody.innerHTML="";
  TASKS.filter(taskMatches).forEach(t=>{
    const sel = STATUSES.map(s=>`<option value="${s.key}" ${s.key===t.status?"selected":""}>${s.label}</option>`).join("");
    tbody.insertAdjacentHTML("beforeend", `<tr data-id="${t.id}">
      <td class="tname">${esc(t.title)}</td>
      <td>${esc(t.field)}</td>
      <td>${fmtDate(t.due)} <span style="color:var(--muted-2)">(${dueLabel(t.due)})</span></td>
      <td><span class="prio ${t.prio}">${t.prio.toUpperCase()}</span></td>
      <td><select class="status-sel">${sel}</select></td>
      <td><span class="assignees">${t.assignees.map(id=>{const w=workerById(id);return w?`<img src="${w.img}" title="${esc(w.name)}">`:"";}).join("")}</span></td>
    </tr>`);
  });
  $$("#taskRows .status-sel").forEach(sel=> sel.addEventListener("change", e=>{
    const id = +e.target.closest("tr").dataset.id;
    TASKS.find(t=>t.id===id).status = e.target.value;
    renderTasks(); toast("Task status updated");
  }));
}
function taskMatches(t){
  const q = $("#taskSearch").value.trim().toLowerCase();
  if(q && !(t.title.toLowerCase().includes(q) || t.field.toLowerCase().includes(q))) return false;
  const f = $("#prioFilter").value;
  if(f!=="all" && t.prio!==f) return false;
  return true;
}
/* drag & drop */
function bindDnD(){
  $$("#kanban .tcard").forEach(card=>{
    card.addEventListener("dragstart", e=>{ e.dataTransfer.setData("text/plain", card.dataset.id); card.classList.add("dragging"); });
    card.addEventListener("dragend", ()=> card.classList.remove("dragging"));
  });
  $$("#kanban .kcol").forEach(col=>{
    col.addEventListener("dragover", e=>{ e.preventDefault(); col.classList.add("drag-over"); });
    col.addEventListener("dragleave", ()=> col.classList.remove("drag-over"));
    col.addEventListener("drop", e=>{
      e.preventDefault(); col.classList.remove("drag-over");
      const id = +e.dataTransfer.getData("text/plain");
      const t = TASKS.find(t=>t.id===id); if(!t) return;
      t.status = col.dataset.status; renderTasks();
      toast(`Moved to "${STATUSES.find(s=>s.key===t.status).label}"`);
    });
  });
}

/* ---------------- calendar ---------------- */
let calCursor = new Date(today.getFullYear(), today.getMonth(), 1);
function renderCalendar(){
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  $("#calTitle").textContent = calCursor.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const first = new Date(y,m,1), startDay=(first.getDay()+6)%7; // monday start
  const daysIn = new Date(y,m+1,0).getDate(), prevDays = new Date(y,m,0).getDate();
  const grid = $("#calGrid"); grid.innerHTML="";
  ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach(d=> grid.insertAdjacentHTML("beforeend",`<div class="cal-dow">${d}</div>`));
  const cells = [];
  for(let i=0;i<42;i++){
    const n = i-startDay+1;
    if(n<1) cells.push({d:new Date(y,m-1,prevDays+n), other:true});
    else if(n>daysIn) cells.push({d:new Date(y,m+1,n-daysIn), other:true});
    else cells.push({d:new Date(y,m,n), other:false});
  }
  cells.slice(0,42).forEach(({d,other})=>{
    const evs = TASKS.filter(t=> t.due.toDateString()===d.toDateString());
    const isToday = d.toDateString()===today.toDateString();
    grid.insertAdjacentHTML("beforeend", `<div class="cal-day ${other?"other":""} ${isToday?"today":""}">
      <span class="num">${d.getDate()}</span>
      ${evs.map(t=>`<div class="cal-ev ev-${t.status}" title="${esc(t.title)}">${esc(t.title)}</div>`).join("")}
    </div>`);
  });
  // upcoming sidebar
  const up = TASKS.filter(t=>t.status!=="completed").sort((a,b)=>a.due-b.due).slice(0,5);
  $("#upcoming").innerHTML = up.map(t=>`<div class="up-item">
      <div class="up-date">${t.due.getDate()}<small>${t.due.toLocaleDateString("en-US",{month:"short"})}</small></div>
      <div><h6>${esc(t.title)}</h6><p>${esc(t.field)} &middot; <span class="status-badge ${STATUSES.find(s=>s.key===t.status).cls}" style="font-size:9.5px">${STATUSES.find(s=>s.key===t.status).label}</span></p></div>
    </div>`).join("");
}

/* ---------------- workers ---------------- */
function renderWorkers(){
  const q = $("#workerSearch").value.trim().toLowerCase();
  const grid = $("#workersGrid"); grid.innerHTML="";
  WORKERS.filter(w=> !q || w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q)).forEach(w=>{
    const tags = w.skills.map((s,i)=> i<2?`<span class="tag">${esc(s)}</span>`:`<span class="tag more">${esc(s)}</span>`).join("");
    grid.insertAdjacentHTML("beforeend", `<div class="wcard" data-id="${w.id}">
      <div class="ph"><img src="${w.img}" alt="${esc(w.name)}">
        <span class="wstatus ${w.on?"on":"off"}"><i></i>${w.on?"On shift":"Off duty"}</span></div>
      <div class="winfo"><h4>${esc(w.name)}<span class="kebab">&#8943;</span></h4>
        <div class="wrole">${esc(w.role)}</div>
        <div class="tags">${tags}</div>
        <div class="wfoot"><span>${w.tasks} tasks</span><span>${w.cap}% capacity</span></div>
        <div class="capbar"><i style="width:${w.cap}%"></i></div>
      </div></div>`);
  });
  $$("#workersGrid .wcard").forEach(c=> c.addEventListener("click", ()=> openWorker(+c.dataset.id)));
}

let detailCharts=[];
function openWorker(id){
  const w = workerById(id); if(!w) return;
  $("#wdImg").src = w.img; $("#wdName").textContent = w.name;
  $("#wdRole").textContent = w.role;
  $("#wdLoc").innerHTML = `<span class="dot-on"></span>${w.on?"On shift":"Off duty"} &middot; South Greenhouses (block B, row 12) &middot; Harvest & quality (team B)`;
  const wt = TASKS.filter(t=>t.assignees.includes(id)).slice(0,4);
  $("#wdTasks").innerHTML = wt.length ? wt.map(t=>`<span class="wd-task">${esc(t.title)}</span>`).join("") : `<span class="wd-task">No open tasks</span>`;
  openModal("#workerModal");
  detailCharts.forEach(c=>c.destroy()); detailCharts=[];
  // scatter
  const sc = $("#scatterChart").getContext("2d");
  const clusters=[[8,75,"#ece84b"],[12,55,"#7fa8e0"],[16,35,"#5ac274"]];
  const mk=(cx,cy,col)=>Array.from({length:9},()=>({x:cx+ (Math.random()*4-2), y:cy+(Math.random()*30-15), col}));
  detailCharts.push(new Chart(sc,{type:"scatter",
    data:{datasets:[{data:clusters.flatMap(c=>mk(c[0],c[1],c[2])), pointRadius:5,
      pointBackgroundColor:clusters.flatMap(c=>Array(9).fill(c[2])).map((c,i)=>c)}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      scales:{x:{min:6,max:20,grid:{color:"rgba(255,255,255,.05)"},ticks:{color:"#8fa392",font:{size:9}}},
              y:{min:0,max:100,grid:{color:"rgba(255,255,255,.05)"},ticks:{color:"#8fa392",font:{size:9}}}}}}));
  // workload bars
  const wl = $("#workloadChart2").getContext("2d");
  const vals = Array.from({length:16},()=>Math.floor(Math.random()*14)+2);
  detailCharts.push(new Chart(wl,{type:"bar",
    data:{labels:Array.from({length:16},(_,i)=>`${String(7+Math.floor(i/2)).padStart(2,"0")}:${i%2?"30":"00"}`),
      datasets:[{data:vals,backgroundColor:"#ece84b",borderRadius:3}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      scales:{x:{grid:{display:false},ticks:{color:"#8fa392",font:{size:8},maxTicksLimit:8}},
              y:{display:false}}}}));
  // radar
  const rd = $("#radarChart").getContext("2d");
  detailCharts.push(new Chart(rd,{type:"radar",
    data:{labels:["Sanitation","Audits","Sampling","Handling","Reporting"],
      datasets:[{data:[85,70,90,65,55],backgroundColor:"rgba(236,232,75,.18)",borderColor:"#ece84b",pointBackgroundColor:"#ece84b",borderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      scales:{r:{min:0,max:100,grid:{color:"rgba(255,255,255,.08)"},angleLines:{color:"rgba(255,255,255,.08)"},
        pointLabels:{color:"#a9b8aa",font:{size:9}},ticks:{display:false}}}}}));
}

/* ---------------- modals ---------------- */
function openModal(sel){ $(sel).classList.add("open"); }
function closeModal(sel){ $(sel).classList.remove("open"); }
$$(".modal-back").forEach(m=> m.addEventListener("click", e=>{ if(e.target===m) m.classList.remove("open"); }));
document.addEventListener("keydown", e=>{ if(e.key==="Escape") $$(".modal-back.open").forEach(m=>m.classList.remove("open")); });

/* ---------------- init ---------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  // tabs
  $$(".tabs button").forEach(b=> b.addEventListener("click", ()=> switchTab(b.dataset.tab)));
  // tasks controls
  $("#taskSearch").addEventListener("input", renderTasks);
  $("#prioFilter").addEventListener("change", renderTasks);
  $$(".view-toggle button").forEach(b=> b.addEventListener("click", ()=>{
    taskView = b.dataset.view;
    $$(".view-toggle button").forEach(x=>x.classList.toggle("active", x===b));
    $("#kanban").style.display = taskView==="kanban" ? "grid" : "none";
    $("#taskListWrap").style.display = taskView==="list" ? "block" : "none";
  }));
  // new task
  $("#newTaskBtn").addEventListener("click", ()=> openModal("#taskModal"));
  $("#taskForm").addEventListener("submit", e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    TASKS.push({ id: Math.max(...TASKS.map(t=>t.id))+1,
      title: fd.get("title"), status:"planned", prio: fd.get("prio"),
      field: fd.get("field"), due: new Date(fd.get("due")+"T00:00:00"),
      assignees:[+fd.get("assignee")] });
    e.target.reset(); closeModal("#taskModal"); renderTasks(); switchTab("tasks");
    toast("Task created");
  });
  // calendar nav
  $("#calPrev").addEventListener("click", ()=>{ calCursor.setMonth(calCursor.getMonth()-1); renderCalendar(); });
  $("#calNext").addEventListener("click", ()=>{ calCursor.setMonth(calCursor.getMonth()+1); renderCalendar(); });
  // workers
  $("#workerSearch").addEventListener("input", renderWorkers);
  $("#addWorkerBtn").addEventListener("click", ()=> openModal("#workerFormModal"));
  $("#workerForm").addEventListener("submit", e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    WORKERS.push({ id: Math.max(...WORKERS.map(w=>w.id))+1, name: fd.get("name"), role: fd.get("role"),
      img:"assets/worker-placeholder.svg",
      on:true, tasks:0, cap:10, skills:["New hire"] });
    e.target.reset(); closeModal("#workerFormModal"); renderWorkers(); toast("Worker added");
  });
  // field select on map
  $("#fieldSelect").addEventListener("click", ()=> toast("Field filter: All fields (demo)"));

  renderTasks(); renderWorkers(); renderCalendar(); drawDashboardCharts();
});
