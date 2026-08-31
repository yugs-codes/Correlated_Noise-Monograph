let db=JSON.parse(localStorage.getItem("dpMasteryV2")||"{}"), filter="all";
const k=id=>"d"+id, get=id=>db[k(id)]||{}, st=id=>get(id).status||"todo";
function render(){
 const root=document.querySelector("#roadmap");root.innerHTML="";
 [...new Set(DAYS.map(x=>x.chapter))].forEach(ch=>{
   const items=DAYS.filter(x=>x.chapter===ch&&(filter==="all"||st(x.id)===filter)); if(!items.length)return;
   const sec=document.createElement("section");sec.className="chapter";sec.innerHTML=`<div class="chapter-title"><span>ROADMAP</span><h3>${ch}</h3></div>`;
   items.forEach(x=>{
    const d=get(x.id), diff=x.difficulty.toLowerCase().replaceAll(" ","-");
    const a=document.createElement("article");a.className="day";
    a.innerHTML=`<div class="top"><div><h3>Day ${x.id}: ${x.title}</h3><div class="meta"><b>${x.section}</b> · ${x.chapter}</div></div><span class="badge ${diff}">${x.difficulty}</span></div>
    <details class="details" open><summary>Study guide, checkpoint & tests</summary><div class="detail-grid">
    <div class="detail"><b>What to study</b>${x.focus}</div><div class="detail"><b>End checkpoint</b>${x.checkpoint}</div>
    <div class="detail"><b>Self-test</b>${x.test}</div><div class="detail"><b>Coding / simulation</b>${x.coding}</div></div></details>
    <div class="controls"><select class="status" data-id="${x.id}"><option value="todo">Not Started</option><option value="progress">In Progress</option><option value="done">Completed</option></select>
    <input class="hours" data-id="${x.id}" type="number" step=".5" min="0" placeholder="Hours" value="${d.hours||""}">
    <input class="confidence" data-id="${x.id}" type="number" min="1" max="10" placeholder="Confidence /10" value="${d.confidence||""}></div>
    <textarea class="notes" data-id="${x.id}" placeholder="Notes: what I understood, derivations, exact blockers, questions for ChatGPT...">${d.notes||""}</textarea>
    <div class="checks"><label><input class="check" data-id="${x.id}" data-c="understood" type="checkbox" ${d.understood?"checked":""}> Main idea understood</label><label><input class="check" data-id="${x.id}" data-c="derive" type="checkbox" ${d.derive?"checked":""}> Can derive/prove key result</label><label><input class="check" data-id="${x.id}" data-c="explain" type="checkbox" ${d.explain?"checked":""}> Can explain without notes</label></div>`;
    a.querySelector(".status").value=d.status||"todo";sec.appendChild(a);
   });root.appendChild(sec);
 });
 document.querySelectorAll(".status,.hours,.confidence,.notes,.check").forEach(e=>e.addEventListener(e.classList.contains("notes")?"input":"change",update));
}
function update(e){let id=e.target.dataset.id,o=db[k(id)]||{};if(e.target.classList.contains("check"))o[e.target.dataset.c]=e.target.checked;else if(e.target.classList.contains("hours"))o.hours=+e.target.value;else if(e.target.classList.contains("confidence"))o.confidence=+e.target.value;else o[e.target.classList.contains("status")?"status":"notes"]=e.target.value;db[k(id)]=o;save()}
function save(){localStorage.setItem("dpMasteryV2",JSON.stringify(db));stats()}
function stats(){let done=DAYS.filter(x=>st(x.id)==="done").length,h=Object.values(db).reduce((a,x)=>a+(+x.hours||0),0),p=Math.round(done/DAYS.length*100);document.querySelector("#done").textContent=`${done}/${DAYS.length}`;document.querySelector("#hours").textContent=h;document.querySelector("#pct").textContent=p+"%";document.querySelector("#bar").style.width=p+"%"}
document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{filter=b.dataset.f;document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});
document.querySelector("#exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),progress:db},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="dp-monograph-progress.json";a.click()};
document.querySelector("#importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);db=x.progress||x;save();render();alert("Imported.");}catch{alert("Invalid file.")}};r.readAsText(f)};
document.querySelector("#resetBtn").onclick=()=>{if(confirm("Reset all progress?")){db={};save();render()}};
render();stats();