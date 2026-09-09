import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Diamond, CalendarClock, RotateCcw, Info } from "lucide-react";

const STATUS_STYLES = {
  A_FAIRE: { bar: "bg-amber-400", dot: "bg-amber-400", label: "À faire" },
  EN_COURS: { bar: "bg-blue-500", dot: "bg-blue-500", label: "En cours" },
  TERMINE: { bar: "bg-green-500", dot: "bg-green-500", label: "Terminé" },
};
const DEFAULT_STATUS_STYLE = { bar: "bg-slate-300", dot: "bg-slate-300", label: "Statut inconnu" };

const DAY_WIDTH = 34;
const ROW_HEIGHT = 56; // agrandi pour laisser la place au libellé de dates sous le titre
const HEADER_HEIGHT = 60; // bande mois + bande jour + bande jour-de-semaine
const MONTH_BAND_HEIGHT = 20;
const WEEKDAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"]; // index = getDay()

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function taskRawDates(task) {
  const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : null;
  const end = task.endDate ? new Date(task.endDate) : task.dueDate ? new Date(task.dueDate) : start;
  return { start: start ? startOfDay(start) : null, end: end ? startOfDay(end) : null };
}

function formatShortDate(d) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatRange(start, end) {
  if (!start) return "";
  if (!end || start.getTime() === end.getTime()) return formatShortDate(start);
  return `${formatShortDate(start)} → ${formatShortDate(end)}`;
}

// Overlay SVG des flèches de dépendance, calculé à partir de blockedByTaskIds.
// Limite honnête : ne dessine que les liens dont les DEUX tâches ont une
// position visible dans la fenêtre courante — une dépendance hors champ ne
// sera simplement pas tracée tant qu'on ne scrolle pas la vue jusqu'à elle.
function DependencyLines({ tasks, positions, dayCount }) {
  const lines = [];

  tasks.forEach((task, rowIndex) => {
    (task.blockedByTaskIds || []).forEach((blockerId) => {
      const blockerIndex = tasks.findIndex((t) => t.id === blockerId);
      if (blockerIndex === -1) return;

      const blockerPos = positions[blockerId];
      const taskPos = positions[task.id];
      if (!blockerPos || !taskPos) return;

      const x1 = blockerPos.startOffset * DAY_WIDTH + blockerPos.span * DAY_WIDTH - 2;
      const y1 = blockerIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
      const x2 = taskPos.startOffset * DAY_WIDTH + 2;
      const y2 = rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
      const midX = x1 + (x2 - x1) / 2;

      lines.push({
        id: `${blockerId}-${task.id}`,
        path: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
      });
    });
  });

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute left-[260px] pointer-events-none"
      style={{ top: HEADER_HEIGHT, width: dayCount * DAY_WIDTH, height: tasks.length * ROW_HEIGHT }}
    >
      <defs>
        <marker id="tl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#ef4444" />
        </marker>
      </defs>
      {lines.map((l) => (
        <path
          key={l.id}
          d={l.path}
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          markerEnd="url(#tl-arrow)"
          opacity="0.55"
        />
      ))}
    </svg>
  );
}

function TimelinePage({ projects = [], tasks = [], onEditTask }) {
  const [projectId, setProjectId] = useState("");
  const [viewStart, setViewStart] = useState(() => startOfDay(new Date()));

  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);

  const dayCount = 28;

  const days = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, i) => {
        const d = new Date(viewStart);
        d.setDate(viewStart.getDate() + i);
        return d;
      }),
    [viewStart]
  );

  const monthBands = useMemo(() => {
    const bands = [];
    days.forEach((d) => {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const last = bands[bands.length - 1];
      if (last && last.key === key) {
        last.span += 1;
      } else {
        bands.push({ key, span: 1, label: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) });
      }
    });
    return bands;
  }, [days]);

  const projectTasks = tasks.filter(
    (t) => String(t.projectId) === String(projectId) && !t.parentTaskId && !t.archived
  );
  const datedProjectTasks = projectTasks.filter((t) => t.startDate || t.dueDate || t.endDate);

  function shiftView(deltaWeeks) {
    const d = new Date(viewStart);
    d.setDate(d.getDate() + deltaWeeks * 7);
    setViewStart(startOfDay(d));
  }

  function jumpTo(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - 3);
    setViewStart(startOfDay(d));
  }

  function resetToToday() {
    setViewStart(startOfDay(new Date()));
  }

  useEffect(() => {
    if (!projectId) return;
    const candidates = tasks
      .filter((t) => String(t.projectId) === String(projectId) && !t.parentTaskId && !t.archived)
      .map((t) => taskRawDates(t).start)
      .filter(Boolean);
    if (candidates.length === 0) return;
    jumpTo(new Date(Math.min(...candidates.map((d) => d.getTime()))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function barPosition(task) {
    const { start, end } = taskRawDates(task);
    if (!start) return null;
    const viewEnd = new Date(viewStart);
    viewEnd.setDate(viewStart.getDate() + dayCount);
    if (end < viewStart || start > viewEnd) return null;
    const clampedStart = start < viewStart ? viewStart : start;
    const clampedEnd = end > viewEnd ? viewEnd : end;
    const startOffset = Math.round((clampedStart - viewStart) / 86400000);
    const span = Math.max(1, Math.round((clampedEnd - clampedStart) / 86400000) + 1);
    return { startOffset, span };
  }

  const positions = useMemo(() => {
    const map = {};
    datedProjectTasks.forEach((t) => {
      const pos = barPosition(t);
      if (pos) map[t.id] = pos;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datedProjectTasks, viewStart]);

  const today = startOfDay(new Date());
  const todayIndex = days.findIndex((d) => d.getTime() === today.getTime());

  function handleMouseDown(e, task) {
    if (!onEditTask) return;
    e.preventDefault();
    const startX = e.clientX;
    const drag = { deltaDays: 0 };
    setDragState({ taskId: task.id, deltaDays: 0 });
    document.body.classList.add("select-none");

    function onMove(ev) {
      drag.deltaDays = Math.round((ev.clientX - startX) / DAY_WIDTH);
      setDragState({ taskId: task.id, deltaDays: drag.deltaDays });
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("select-none");
      setDragState(null);
      const finalDelta = drag.deltaDays;
      if (finalDelta === 0) return;

      if (task.type === "MILESTONE") {
        const base = task.dueDate ? new Date(task.dueDate) : null;
        if (!base) return;
        base.setDate(base.getDate() + finalDelta);
        onEditTask(task.id, { dueDate: toISODate(base) });
        return;
      }
      const baseStart = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : null;
      const baseEnd = task.endDate ? new Date(task.endDate) : task.dueDate ? new Date(task.dueDate) : baseStart;
      if (!baseStart) return;
      baseStart.setDate(baseStart.getDate() + finalDelta);
      baseEnd.setDate(baseEnd.getDate() + finalDelta);
      onEditTask(task.id, { startDate: toISODate(baseStart), endDate: toISODate(baseEnd) });
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function handleResizeDown(e, task) {
    if (!onEditTask || task.type === "MILESTONE") return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const resize = { deltaDays: 0 };
    setResizeState({ taskId: task.id, deltaDays: 0 });
    document.body.classList.add("select-none");

    function onMove(ev) {
      resize.deltaDays = Math.round((ev.clientX - startX) / DAY_WIDTH);
      setResizeState({ taskId: task.id, deltaDays: resize.deltaDays });
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("select-none");
      setResizeState(null);
      const finalDelta = resize.deltaDays;
      if (finalDelta === 0) return;
      const baseEnd = task.endDate ? new Date(task.endDate) : task.dueDate ? new Date(task.dueDate) : null;
      if (!baseEnd) return;
      baseEnd.setDate(baseEnd.getDate() + finalDelta);
      const start = task.startDate ? new Date(task.startDate) : baseEnd;
      if (baseEnd < start) return;
      onEditTask(task.id, { endDate: toISODate(baseEnd) });
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const selectedProject = projects.find((p) => String(p.id) === String(projectId));

  return (
    <div className="px-8 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Timeline</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Vue chronologique des tâches d'un projet.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Sélectionner un projet</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={resetToToday} title="Revenir à aujourd'hui" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[12.5px] text-slate-500 hover:bg-slate-50">
            <RotateCcw size={13} />
            Aujourd'hui
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftView(-4)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft size={15} /></button>
            <button onClick={() => shiftView(4)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {!projectId ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-[13.5px] text-slate-400">Sélectionnez un projet pour voir sa timeline.</p>
        </div>
      ) : datedProjectTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-[13.5px] text-slate-400">Aucune tâche avec des dates sur ce projet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Bandeau d'explication + légende — toujours visible, en langage courant */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[12px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <Info size={13} className="text-slate-400" />
              Chaque barre représente la durée d'une tâche. Sa couleur indique où elle en est.
            </span>
            <span className="ml-auto flex items-center gap-4">
              {Object.values(STATUS_STYLES).map((s) => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <Diamond size={9} className="text-amber-500" fill="currentColor" />
                Jalon (échéance ponctuelle)
              </span>
            </span>
          </div>

          <div className="tl-scroll overflow-x-auto">
            <div className="relative" style={{ minWidth: dayCount * DAY_WIDTH + 260 }}>
              {/* En-tête : mois / jour du mois / jour de semaine */}
              <div className="sticky top-0 z-10 bg-white">
                <div className="flex border-b border-slate-100" style={{ height: MONTH_BAND_HEIGHT }}>
                  <div className="sticky left-0 z-20 w-[260px] shrink-0 bg-white" />
                  <div className="flex">
                    {monthBands.map((m) => (
                      <div key={m.key} className="flex items-center border-l border-slate-100 px-2 text-[10.5px] font-medium capitalize text-slate-400" style={{ width: m.span * DAY_WIDTH }}>
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex border-b border-slate-100" style={{ height: HEADER_HEIGHT - MONTH_BAND_HEIGHT }}>
                  <div className="sticky left-0 z-20 flex shrink-0 items-center bg-white px-4 text-[11px] font-semibold uppercase text-slate-400" style={{ width: 260 }}>
                    Tâche
                  </div>
                  {days.map((d, i) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday = i === todayIndex;
                    return (
                      <div
                        key={i}
                        className={`shrink-0 flex flex-col items-center justify-center leading-tight ${
                          isToday ? "bg-blue-50 text-blue-600" : isWeekend ? "bg-slate-50 text-slate-300" : "text-slate-400"
                        }`}
                        style={{ width: DAY_WIDTH }}
                      >
                        <span className="text-[9px]">{WEEKDAY_LETTERS[d.getDay()]}</span>
                        <span className={`text-[12px] ${isToday ? "font-semibold" : ""}`}>{d.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {todayIndex !== -1 && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 bg-blue-50/40"
                  style={{ left: 260 + todayIndex * DAY_WIDTH, width: DAY_WIDTH, height: datedProjectTasks.length * ROW_HEIGHT }}
                />
              )}

              <DependencyLines tasks={datedProjectTasks} positions={positions} dayCount={dayCount} />

              {datedProjectTasks.map((t, rowIndex) => {
                const pos = positions[t.id];
                const { start: rawStart, end: rawEnd } = taskRawDates(t);
                const isDragging = dragState?.taskId === t.id;
                const dragOffsetPx = isDragging ? dragState.deltaDays * DAY_WIDTH : 0;
                const isResizing = resizeState?.taskId === t.id;
                const resizeExtraPx = isResizing ? resizeState.deltaDays * DAY_WIDTH : 0;
                const style = STATUS_STYLES[t.status] ?? DEFAULT_STATUS_STYLE;
                const barWidthPx = pos ? Math.max(8, pos.span * DAY_WIDTH - 4 + resizeExtraPx) : 0;
                const showInlineLabel = pos && barWidthPx > 90;

                return (
                  <div key={t.id} className={`group flex items-center border-b border-slate-50 hover:bg-slate-50/60 ${rowIndex % 2 === 1 ? "bg-slate-50/30" : ""}`} style={{ height: ROW_HEIGHT }}>
                    <div className="sticky left-0 z-10 flex shrink-0 flex-col justify-center gap-0.5 truncate bg-white px-4 group-hover:bg-slate-50/60" style={{ width: 260 }}>
                      <span className="flex items-center gap-1.5 truncate text-[12.5px] text-slate-700">
                        {t.type === "MILESTONE" && <Diamond size={10} className="text-amber-500 shrink-0" fill="currentColor" />}
                        <span className="truncate">{t.title}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">{formatRange(rawStart, rawEnd)} · {style.label}</span>
                    </div>

                    <div className="relative flex items-center h-full" style={{ minWidth: dayCount * DAY_WIDTH }}>
                      {pos ? (
                        t.type === "MILESTONE" ? (
                          <div
                            onMouseDown={(e) => handleMouseDown(e, t)}
                            className={`absolute ${onEditTask ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "z-20 opacity-80" : ""}`}
                            style={{ left: pos.startOffset * DAY_WIDTH + 12 + dragOffsetPx }}
                            title={formatRange(rawStart, rawEnd)}
                          >
                            <Diamond size={14} className="text-amber-500" fill="currentColor" />
                          </div>
                        ) : (
                          <div
                            onMouseDown={(e) => handleMouseDown(e, t)}
                            className={`absolute h-5 rounded-full flex items-center px-2 ${style.bar} ${onEditTask ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "z-20 opacity-80 shadow-md" : "shadow-sm"} group/bar`}
                            style={{ left: pos.startOffset * DAY_WIDTH + 2 + dragOffsetPx, width: barWidthPx }}
                            title={formatRange(rawStart, rawEnd)}
                          >
                            {showInlineLabel && (
                              <span className="truncate text-[10px] font-medium text-white">{formatRange(rawStart, rawEnd)}</span>
                            )}
                            <div
                              onMouseDown={(e) => handleResizeDown(e, t)}
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r-full bg-black/20 opacity-0 group-hover/bar:opacity-100"
                            />
                          </div>
                        )
                      ) : (
                        rawStart && (
                          <button onClick={() => jumpTo(rawStart)} className="absolute left-2 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-600">
                            <CalendarClock size={12} />
                            Hors période — {formatShortDate(rawStart)} · voir
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tl-scroll::-webkit-scrollbar { height: 8px; }
        .tl-scroll::-webkit-scrollbar-track { background: transparent; }
        .tl-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }
        .tl-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

export default TimelinePage;