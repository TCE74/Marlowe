const dayPickerEl=document.getElementById('dayPicker');
const dayTitleEl=document.getElementById('dayTitle');
const daySummaryEl=document.getElementById('daySummary');
const dayTasksEl=document.getElementById('dayTasks');
const dayCountEl=document.getElementById('dayCount');
const dayMinutesEl=document.getElementById('dayMinutes');
const dayFinishEl=document.getElementById('dayFinish');
const dayNoticeEl=document.getElementById('dayNotice');
const prevDayEl=document.getElementById('prevDay');
const todayDayEl=document.getElementById('todayDay');
const nextDayEl=document.getElementById('nextDay');
const nextScheduledEl=document.getElementById('nextScheduled');

let selectedDate=localISO();

function renderDay(){
  dayPickerEl.value=selectedDate;
  dayTitleEl.textContent=fullDateLabel(selectedDate);

  const list=tasksForDate(selectedDate);
  const fm=todayFinishMap(list,selectedDate);

  dayTasksEl.innerHTML=list.length
    ? list.map(t=>taskHTML(t,fm,'',selectedDate)).join('')
    : '<div class="empty">Nothing planned for this day.</div>';

  const open=list.filter(t=>!isDoneForDate(t,selectedDate));
  dayCountEl.textContent=open.length;

  const mins=open.reduce((a,t)=>a+Number(t.minutes||0),0);
  dayMinutesEl.textContent=mins;

  const ends=open.map(t=>fm[t.id]).filter(Number.isFinite);
  const finish=ends.length?Math.max(...ends):null;
  dayFinishEl.textContent=finish?fmtClock(finish):'—';

  const dailyCount=list.filter(isDaily).length;
  const scheduledCount=list.filter(t=>!isDaily(t)&&t.scheduledDate===selectedDate).length;
  const flexibleCount=selectedDate===localISO()?list.filter(t=>!isDaily(t)&&!t.scheduledDate&&t.bucket==='today').length:0;

  daySummaryEl.textContent=`${dailyCount} daily · ${scheduledCount} scheduled${flexibleCount?` · ${flexibleCount} flexible`:''}`;
  dayNoticeEl.innerHTML=finish>WORK_END?'<div class="notice">This day currently runs past 5:00 pm.</div>':'';
}

window.toggleForDate=(id,date)=>{
  const t=tasks.find(x=>x.id===id);
  if(!t)return;
  setDoneForDate(t,date,!isDoneForDate(t,date));
  localStorage.setItem(KEY,JSON.stringify(tasks));
  renderDay();
};

window.del=id=>{
  if(!confirm('Delete this task?'))return;
  tasks=tasks.filter(x=>x.id!==id);
  localStorage.setItem(KEY,JSON.stringify(tasks));
  renderDay();
};

window.move=id=>{
  const t=tasks.find(x=>x.id===id);
  if(!t||isDaily(t))return;
  if(t.scheduledDate){
    t.scheduledDate='';
    t.scheduledTime='';
    t.bucket='backlog';
  }else{
    t.bucket=t.bucket==='today'?'backlog':'today';
  }
  localStorage.setItem(KEY,JSON.stringify(tasks));
  renderDay();
};

function jumpToNextScheduled(){
  const next=tasks
    .filter(t=>!isDaily(t)&&!t.done&&t.scheduledDate&&t.scheduledDate>selectedDate)
    .sort(scheduledSort)[0];
  if(!next){
    dayNoticeEl.innerHTML='<div class="notice">There are no later scheduled tasks.</div>';
    return;
  }
  selectedDate=next.scheduledDate;
  renderDay();
  const label=next.scheduledTime?timeLabel(next.scheduledTime):'flexible time';
  dayNoticeEl.innerHTML=`<div class="notice">Next scheduled: <strong>${esc(next.title)}</strong> at ${label}.</div>`;
}

prevDayEl.addEventListener('click',()=>{selectedDate=addDaysISO(selectedDate,-1);renderDay()});
nextDayEl.addEventListener('click',()=>{selectedDate=addDaysISO(selectedDate,1);renderDay()});
todayDayEl.addEventListener('click',()=>{selectedDate=localISO();renderDay()});
nextScheduledEl.addEventListener('click',jumpToNextScheduled);
dayPickerEl.addEventListener('change',()=>{if(dayPickerEl.value){selectedDate=dayPickerEl.value;renderDay()}});

renderDay();