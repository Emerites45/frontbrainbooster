import { useEffect, useState } from "react";
import { STATUS_LABEL } from "../utils/dashboardHelpers";

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArchiveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function StatusConfirmModal({
  task,
  unfinishedSubtasksCount = 0,
  onConfirm,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!task) {
      setMounted(false);
      return;
    }

    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [task]);

  if (!task) return null;

  const isTermine = task.status === "TERMINE";
  const nextStatus = task.status === "A_FAIRE" ? "EN_COURS" : "TERMINE";
  const movingToTermine = !isTermine && nextStatus === "TERMINE";
  const isBlocked =
    unfinishedSubtasksCount > 0 && (isTermine || movingToTermine);

  const subtaskWarning =
    unfinishedSubtasksCount > 1
      ? `${unfinishedSubtasksCount} sous-tâches ne sont pas encore terminées.`
      : `1 sous-tâche n'est pas encore terminée.`;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-blue-deep/50 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`surface-card w-full max-w-[400px] p-7 transition-all duration-200 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${
            isTermine ? "bg-green-pale" : "bg-blue-pale"
          }`}
        >
          {isTermine ? (
            <CheckIcon className="h-5 w-5 text-termine" />
          ) : (
            <ArrowRightIcon className="h-5 w-5 text-blue" />
          )}
        </div>

        <h3 className="text-heading mb-1.5">
          {isTermine ? "Tâche terminée" : "Changer le statut"}
        </h3>

        {isTermine ? (
          <>
            <p className="text-body text-text-light mb-4">
              « <span className="font-medium text-text">{task.title}</span> »
              est marquée comme terminée. Que voulez-vous faire ?
            </p>

            {isBlocked && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow bg-yellow-pale px-3 py-2.5">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-text" />
                <p className="text-small text-text">
                  {subtaskWarning} Terminez-les avant d'archiver cette tâche.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onConfirm("ARCHIVE")}
                disabled={isBlocked}
                title={
                  isBlocked
                    ? "Terminez d'abord toutes les sous-tâches"
                    : undefined
                }
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-body font-medium transition-colors ${
                  isBlocked
                    ? "cursor-not-allowed border border-border bg-cream text-text-light"
                    : "bg-blue-deep text-white hover:bg-blue"
                }`}
              >
                <ArchiveIcon className="h-4 w-4" />
                Archiver cette tâche
              </button>

              <button
                type="button"
                onClick={() => onConfirm("A_FAIRE")}
                className="w-full rounded-lg border border-border py-2.5 text-body font-medium text-text transition-colors hover:bg-cream"
              >
                Remettre à « À faire »
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 text-small text-text-light transition-colors hover:text-text"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-body text-text-light">
              Voulez-vous vraiment passer «{" "}
              <span className="font-medium text-text">{task.title}</span> » à{" "}
              <span className="font-medium text-blue-deep">
                {STATUS_LABEL[nextStatus] ?? nextStatus}
              </span>{" "}
              ?
            </p>

            {isBlocked && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-yellow bg-yellow-pale px-3 py-2.5">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-text" />
                <p className="text-small text-text">
                  {subtaskWarning} Impossible de passer cette tâche à «
                  Terminé ».
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-body text-text-light transition-colors hover:text-text"
              >
                Non
              </button>
              <button
                type="button"
                onClick={() => onConfirm(nextStatus)}
                disabled={isBlocked}
                title={
                  isBlocked
                    ? "Terminez d'abord toutes les sous-tâches"
                    : undefined
                }
                className={`rounded-lg px-4 py-2 text-body font-medium transition-colors ${
                  isBlocked
                    ? "cursor-not-allowed border border-border bg-cream text-text-light"
                    : "bg-blue text-white hover:bg-blue-deep"
                }`}
              >
                Oui
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StatusConfirmModal;