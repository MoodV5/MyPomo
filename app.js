const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-progress');
const btnToggle = document.getElementById('btn-toggle');
const btnSkip = document.getElementById('btn-skip');
const btnReset = document.getElementById('btn-reset');
const sessionLabel = document.getElementById('session-label');
const sessionCount = document.getElementById('session-count');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const errorMessage = document.getElementById('error-message');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskBadge = document.getElementById('task-badge');

const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');
const navCursor = document.getElementById('nav-cursor');

const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const btnSaveSettings = document.getElementById('btn-save-settings');
const settingsMessage = document.getElementById('settings-message');

let WORK_TIME = parseInt(localStorage.getItem('focustask_work')) * 60 || 25 * 60;
let BREAK_TIME = parseInt(localStorage.getItem('focustask_break')) * 60 || 5 * 60;
let LONG_BREAK_TIME = parseInt(localStorage.getItem('focustask_long_break')) * 60 || 15 * 60;

let timer;
let timeLeft = WORK_TIME;
let isRunning = false;
let currentMode = 'work';
let pomodoroCount = 1;

let tasks = JSON.parse(localStorage.getItem('focustasks')) || [];
let currentFilter = 'all';

let pomodoroHistory = JSON.parse(localStorage.getItem('focustask_history')) || [];

workDurationInput.value = WORK_TIME / 60;
breakDurationInput.value = BREAK_TIME / 60;
longBreakDurationInput.value = LONG_BREAK_TIME / 60;

function updateSessionIndicator() {
    sessionCount.textContent = `${pomodoroCount}/4`;
    if (currentMode === 'work') {
        sessionLabel.textContent = 'Pomodoro';
    } else if (currentMode === 'short-break') {
        sessionLabel.textContent = 'Short Break';
    } else if (currentMode === 'long-break') {
        sessionLabel.textContent = 'Long Break';
    }
}

function updateNavCursor() {
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && navCursor) {
        navCursor.style.width = `${activeBtn.offsetWidth}px`;
        navCursor.style.left = `${activeBtn.offsetLeft}px`;
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        updateNavCursor();

        views.forEach(v => v.classList.add('hidden'));

        const targetId = btn.dataset.target;
        document.getElementById(targetId).classList.remove('hidden');
    });
});

window.addEventListener('resize', updateNavCursor);

btnSaveSettings.addEventListener('click', () => {
    const newWork = parseInt(workDurationInput.value);
    const newBreak = parseInt(breakDurationInput.value);
    const newLongBreak = parseInt(longBreakDurationInput.value);
    
    if (newWork > 0 && newBreak > 0 && newLongBreak > 0) {
        localStorage.setItem('focustask_work', newWork);
        localStorage.setItem('focustask_break', newBreak);
        localStorage.setItem('focustask_long_break', newLongBreak);
        
        WORK_TIME = newWork * 60;
        BREAK_TIME = newBreak * 60;
        LONG_BREAK_TIME = newLongBreak * 60;
        
        resetTimer();
        
        settingsMessage.textContent = '設定を保存しました。';
        setTimeout(() => settingsMessage.textContent = '', 3000);
    }
});

function getTotalTime() {
    if (currentMode === 'work') return WORK_TIME;
    if (currentMode === 'short-break') return BREAK_TIME;
    return LONG_BREAK_TIME;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
        const totalTime = getTotalTime();
    const progress = (totalTime - timeLeft) / totalTime;
    const offset = progress * 283; 
    timerProgress.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    btnToggle.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            handlePhaseComplete();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    btnToggle.innerHTML = '<i class="fa-solid fa-play"></i> START';
}

function handlePhaseComplete() {
    pauseTimer();
    
    if (currentMode === 'work') {
                const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        pomodoroHistory.push({ date: dateStr, minutes: WORK_TIME / 60 });
        localStorage.setItem('focustask_history', JSON.stringify(pomodoroHistory));
        renderStats();

        if (pomodoroCount >= 4) {
                        alert('4回目のポモドーロ完了！15分の長い休憩をとりましょう。');
            switchMode('long-break');
        } else {
            alert('ポモドーロ完了！短い休憩をとりましょう。');
            switchMode('short-break');
        }
    } else {
        
        if (currentMode === 'long-break') {
            pomodoroCount = 1; 
        } else {
            pomodoroCount++;
        }
        alert('休憩終了です！作業を再開しましょう。');
        switchMode('work');
    }
    
}

function skipPhase() {
    handlePhaseComplete();
}

function resetTimer() {
    pauseTimer();
    timeLeft = getTotalTime();
    updateTimerDisplay();
}

function switchMode(mode) {
    currentMode = mode;
    document.body.classList.remove('break-mode', 'long-break-mode');
    
    if (mode === 'work') {
        timeLeft = WORK_TIME;
    } else if (mode === 'short-break') {
        document.body.classList.add('break-mode');
        timeLeft = BREAK_TIME;
    } else if (mode === 'long-break') {
        document.body.classList.add('long-break-mode');
        timeLeft = LONG_BREAK_TIME;
    }
    
    updateSessionIndicator();
    resetTimer();
    updateNavCursor(); 
}

btnToggle.addEventListener('click', toggleTimer);
btnSkip.addEventListener('click', skipPhase);
btnReset.addEventListener('click', resetTimer);

function saveTasks() {
    localStorage.setItem('focustasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';

    if (taskBadge) {
        const activeTasksCount = tasks.filter(t => !t.completed).length;
        if (activeTasksCount > 0) {
            taskBadge.textContent = activeTasksCount;
            taskBadge.style.display = 'inline-block';
        } else {
            taskBadge.style.display = 'none';
        }
    }
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; 
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-content">
                <div class="checkbox">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <button class="btn-delete"><i class="fa-solid fa-trash"></i></button>
        `;

        li.querySelector('.task-content').addEventListener('click', () => {
            task.completed = !task.completed;
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            task.completedDate = task.completed ? dateStr : null;
            
            saveTasks();
            renderTasks();
            renderCalendar();
        });

        li.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            li.classList.add('fade-out');
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
                renderCalendar();
            }, 300);
        });

        taskList.appendChild(li);
    });
}

function addTask(text) {
    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        completedDate: null
    };
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text === '') {
        errorMessage.textContent = 'タスクを入力してください。';
        return;
    }
    if (text.length > 50) {
        errorMessage.textContent = 'タスクは50文字以内で入力してください。';
        return;
    }
    errorMessage.textContent = '';
    addTask(text);
    taskInput.value = '';
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

const calendarDays = document.getElementById('calendar-days');
const currentMonthYear = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();

function renderCalendar() {
    if (!calendarDays) return;
    calendarDays.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;

    const completedDates = new Set(tasks.filter(t => t.completed && t.completedDate).map(t => t.completedDate));
    
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        if (dateStr === todayStr) {
            dayDiv.classList.add('today');
        }

        if (completedDates.has(dateStr)) {
            dayDiv.classList.add('highlight');
            dayDiv.addEventListener('click', () => showDetailView(dateStr));
        }

        calendarDays.appendChild(dayDiv);
    }
}

const detailView = document.getElementById('detail-view');
const btnBack = document.getElementById('btn-back');
const detailDateTitle = document.getElementById('detail-date-title');
const detailTaskList = document.getElementById('detail-task-list');

function showDetailView(dateStr) {
    detailDateTitle.textContent = dateStr;
    detailTaskList.innerHTML = '';
    const dateTasks = tasks.filter(t => t.completed && t.completedDate === dateStr);
    
    dateTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item completed';
        li.innerHTML = `
            <div class="task-content">
                <div class="checkbox">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
        `;
        detailTaskList.appendChild(li);
    });
    
    views.forEach(v => v.classList.add('hidden'));
    detailView.classList.remove('hidden');
}

if (btnBack) {
    btnBack.addEventListener('click', () => {
        detailView.classList.add('hidden');
        document.getElementById('stats-view').classList.remove('hidden');
    });
}

if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

const statTotalPomodoros = document.getElementById('stat-total-pomodoros');
const statTotalMinutes = document.getElementById('stat-total-minutes');
const barChart = document.getElementById('bar-chart');

function renderStats() {
    if (!statTotalPomodoros) return;
    
        statTotalPomodoros.textContent = pomodoroHistory.length;
    const totalMins = pomodoroHistory.reduce((sum, item) => sum + item.minutes, 0);
    statTotalMinutes.textContent = totalMins;

        const today = new Date();
    const last7Days = [];
    const dailyMinutes = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
        
        last7Days.push(dayLabel);
        
        const minsForDay = pomodoroHistory
            .filter(item => item.date === dateStr)
            .reduce((sum, item) => sum + item.minutes, 0);
        dailyMinutes.push(minsForDay);
    }

        barChart.innerHTML = '';
    const maxMins = Math.max(...dailyMinutes, 60); 
    
    for (let i = 0; i < 7; i++) {
        const mins = dailyMinutes[i];
        const heightPercent = (mins / maxMins) * 100;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0%'; 
        setTimeout(() => bar.style.height = `${heightPercent}%`, 100);
        
        const tooltip = document.createElement('div');
        tooltip.className = 'bar-tooltip';
        tooltip.textContent = `${mins} min`;
        bar.appendChild(tooltip);
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = last7Days[i];
        
        wrapper.appendChild(bar);
        wrapper.appendChild(label);
        barChart.appendChild(wrapper);
    }
}

updateSessionIndicator();
updateTimerDisplay();
renderTasks();
renderCalendar();
renderStats();

setTimeout(updateNavCursor, 50);
