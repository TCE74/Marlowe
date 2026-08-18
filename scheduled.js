const scheduledGroupsEl=document.getElementById('scheduledGroups');

function sundayOnOrAfter(dateISO){
  const d=dateFromISO(dateISO),day=d.getDay(),add=(7-day)%7;
  d.setDate(d.getDate()+add);
  return localISO(d);
}

function scheduledCard(t){
  const when=t.scheduledTime?timeLabel(t.scheduledTime):'Flexible';
  const priority=['','Urgent','Important','Normal'][t.priority]||'Normal';
  return `<div class="scheduled-item"><div><div class="scheduled-title">${esc(t.title)}</div><div class="task-meta"><span class="pill cat">${esc(t.category||'General')}</span><span class="pill scheduled">${businessLabel(t.scheduledDate)} · ${when}</span><span class="pill">${Number(t.minutes)||0} min</span><span class="pill">${priority}</span></div></div><a class="mini-link" href="day.html?date=${encodeURIComponent(t.scheduledDate)}">View day</a></div>`;
}

function groupHTML(title,list){
  return `<section class="card schedule-group"><div class="schedule-group-head"><h2>${title}</h2><span class="group-count">${list.length}</span></div>${list.length?list.map(scheduledCard).join(''):'<div class="empty">Nothing scheduled.</div>'}</section>`;
}

function renderScheduled(){
  const today=localISO();
  const thisWeekEnd=sundayOnOrAfter(today);
  const nextWeekStart=addDaysISO(thisWeekEnd,1);
  const nextWeekEnd=addDaysISO(nextWeekStart,6);
  const nextMonthEnd=addDaysISO(nextWeekEnd,30);
  const future=tasks.filter(t=>!isDaily(t)&&!t.done&&t.scheduledDate&&t.scheduledDate>=today).sort(scheduledSort);

  const groups={thisWeek:[],nextWeek:[],nextMonth:[],later:[]};
  future.forEach(t=>{
    if(t.scheduledDate<=thisWeekEnd)groups.thisWeek.push(t);
    else if(t.scheduledDate<=nextWeekEnd)groups.nextWeek.push(t);
    else if(t.scheduledDate<=nextMonthEnd)groups.nextMonth.push(t);
    else groups.later.push(t);
  });

  scheduledGroupsEl.innerHTML=
    groupHTML('This week',groups.thisWeek)+
    groupHTML('Next Week',groups.nextWeek)+
    groupHTML('Next Month',groups.nextMonth)+
    groupHTML('Later in the year',groups.later);
}

renderScheduled();