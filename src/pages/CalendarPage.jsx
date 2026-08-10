import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const WEEKDAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function CalendarPage({ tasks = [], projects = [] }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? "—";

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const grid = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    let startIdx = firstOfMonth.getDay() - 1;
    if (startIdx < 0) startIdx = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [month, year]);

  function changeMonth(delta) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
    setSelectedDay(null);
  }

  const selectedKey = selectedDay ? `${year}-${month}-${selectedDay}` : null;
  const selectedTasks = selectedKey ? tasksByDate[selectedKey] || [] : [];
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="px-8 py-6">
      <h1 className="text-[20px] font-semibold text-slate-900 mb-1">Calendrier</h1>
      <p className="text-[13px] text-slate-400 mb-6">Échéances des tâches par date.</p>

      <div className="flex gap-6 items-start">
        <div className="flex-1 bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[15px] font-semibold text-slate-900">{MONTH_NAMES[month]} {year}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10.5px] font-semibold text-slate-400 uppercase py-1">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const key = `${year}-${month}-${d}`;
              const dayTasks = tasksByDate[key] || [];
              const selected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex flex-col items-center justify-center rounded-lg py-2.5 text-[12.5px] transition-colors ${
                    selected
                      ? "bg-blue-600 text-white font-semibold"
                      : dayTasks.length
                      ? "bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
                      : "text-slate-600 hover:bg-slate-50"
                  } ${isToday(d) && !selected ? "ring-1 ring-blue-300" : ""}`}
                >
                  {d}
                  {dayTasks.length > 0 && (
                    <span className={`w-1 h-1 rounded-full mt-1 ${selected ? "bg-white" : "bg-blue-500"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-[280px] shrink-0 bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="text-[13.5px] font-semibold text-slate-900">
            {selectedDay ? `${selectedDay} ${MONTH_NAMES[month]} ${year}` : "Sélectionnez une date"}
          </h3>
          <p className="text-[12px] text-slate-400 mb-4">{selectedTasks.length} tâche(s)</p>
          {selectedDay && selectedTasks.length === 0 && (
            <p className="text-[12.5px] text-slate-400 py-4 text-center">Aucune échéance ce jour-là.</p>
          )}
          <div className="space-y-2">
            {selectedTasks.map((t) => (
              <div key={t.id} className="rounded-lg p-3 bg-blue-50/60 border border-blue-100">
                <p className="text-[12.5px] font-medium text-blue-900">{t.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{projectName(t.projectId)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;