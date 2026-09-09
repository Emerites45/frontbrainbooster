import { useState, useEffect, useRef } from "react";

import { Trash2, Send } from "lucide-react";

import {
  fetchComments,
  createComment,
  deleteComment,
} from "../../api/api";

import Avatar from "../ui/Avatar";

import {
  notifyUsers,
  taskBoardPathForUser,
} from "../../utils/notify";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "à l'instant";

  if (diffMin < 60) {
    return `il y a ${diffMin} min`;
  }

  const diffH = Math.floor(diffMin / 60);

  if (diffH < 24) {
    return `il y a ${diffH}h`;
  }

  return `il y a ${Math.floor(diffH / 24)}j`;
}

function CommentSection({
  taskId,
  currentUser,
  assigneeIds = [],
  taskTitle,
  recipientUsers = [],
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mentions
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const inputRef = useRef(null);

  // =========================================================
  // LOAD COMMENTS
  // =========================================================

  useEffect(() => {
    load();
  }, [taskId]);

  async function load() {
    setLoading(true);

    try {
      const data = await fetchComments(taskId);
      setComments(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires :", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // MENTION INPUT
  // =========================================================

  function handleTextChange(e) {
    const value = e.target.value;

    setText(value);

    const lastAt = value.lastIndexOf("@");

    // No @ found
    if (lastAt === -1) {
      setShowMentions(false);
      setMentionQuery("");
      return;
    }

    const afterAt = value.slice(lastAt + 1);

    // Only show suggestions while typing the current @mention
    if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
      setMentionQuery(afterAt);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  }

  function insertMention(user) {
    const lastAt = text.lastIndexOf("@");

    if (lastAt === -1) return;

    const newText =
      text.slice(0, lastAt) +
      `@${user.firstName} `;

    setText(newText);
    setShowMentions(false);
    setMentionQuery("");

    // Put cursor back inside the input
    requestAnimationFrame(() => {
      inputRef.current?.focus();

      const position = newText.length;

      inputRef.current?.setSelectionRange(
        position,
        position
      );
    });
  }

  // =========================================================
  // MENTION CANDIDATES
  // =========================================================

  const mentionCandidates = recipientUsers
    .filter((user) => {
      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim();

      return fullName
        .toLowerCase()
        .includes(mentionQuery.toLowerCase());
    })
    .slice(0, 5);

  // =========================================================
  // CREATE COMMENT
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!text.trim() || submitting) return;

    setSubmitting(true);

    try {
      const commentText = text.trim();

      // Create comment
      await createComment(taskId, commentText);

      // =====================================================
      // MENTION NOTIFICATIONS
      // =====================================================

      const mentionedUsers = recipientUsers.filter((user) =>
        commentText.includes(`@${user.firstName}`)
      );

      if (mentionedUsers.length > 0) {
        notifyUsers(
          mentionedUsers.map((user) => user.id),
          {
            type: "COMMENT",
            title: "Vous avez été mentionné",
            message: `${
              currentUser?.firstName ?? "Quelqu'un"
            } vous a mentionné dans « ${
              taskTitle ?? "une tâche"
            } »`,
            link: taskBoardPathForUser(mentionedUsers[0]),
          },
          currentUser?.id
        );
      }

      // =====================================================
      // ASSIGNEE NOTIFICATIONS
      // =====================================================

      const others = assigneeIds.filter(
        (id) => id !== currentUser?.id
      );

      if (others.length > 0) {
        const targets = recipientUsers.filter((user) =>
          others.includes(user.id)
        );

        notifyUsers(
          others,
          {
            type: "COMMENT",
            title: "Nouveau commentaire",
            message: `${
              currentUser?.firstName ?? "Quelqu'un"
            } a commenté « ${
              taskTitle ?? "une tâche"
            } »`,
            link: targets[0]
              ? taskBoardPathForUser(targets[0])
              : "/",
          },
          currentUser?.id
        );
      }

      // Reset
      setText("");
      setShowMentions(false);
      setMentionQuery("");

      // Reload comments
      await load();
    } catch (error) {
      console.error(
        "Erreur lors de la création du commentaire :",
        error
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce commentaire ?")) {
      return;
    }

    try {
      await deleteComment(id);
      await load();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du commentaire :",
        error
      );
    }
  }

  // =========================================================
  // SORT COMMENTS
  // =========================================================

  const sorted = [...comments].sort(
    (a, b) =>
      new Date(a.createdAt) -
      new Date(b.createdAt)
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          COMMENTS
      ===================================================== */}

      {loading ? (
        <p className="text-[12.5px] text-slate-400">
          Chargement des commentaires...
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-[13px] text-slate-400 mb-4">
          Aucun commentaire pour l'instant.
        </p>
      ) : (
        <ul className="space-y-3.5 mb-4">
          {sorted.map((comment) => {
            const isMine =
              comment.createdBy === currentUser?.id;

            return (
              <li
                key={comment.id}
                className="flex items-start gap-2.5 group"
              >
                {/* Avatar */}
                <Avatar
                  userId={comment.createdBy}
                  firstName={
                    comment.authorName?.split(" ")[0]
                  }
                  lastName={
                    comment.authorName?.split(" ")[1]
                  }
                  size="sm"
                />

                {/* Comment content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-slate-800">
                      {comment.authorName || "Utilisateur"}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-600 mt-0.5 break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Delete */}
                {isMine && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(comment.id)
                    }
                    className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* =====================================================
          COMMENT FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        {/* Input + mention dropdown */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Ajouter un commentaire... (@ pour mentionner)"
            className="flex-1 w-full rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
          />

          {/* =================================================
              MENTION DROPDOWN
          ================================================= */}

          {showMentions &&
            mentionCandidates.length > 0 && (
              <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10">
                {mentionCandidates.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() =>
                      insertMention(user)
                    }
                    className="w-full text-left px-3 py-2 text-[12.5px] hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-slate-800">
                      {user.firstName} {user.lastName}
                    </div>

                    {user.email && (
                      <div className="text-[11px] text-slate-400">
                        {user.email}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Send */}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 shrink-0 transition-colors disabled:opacity-40"
          title="Envoyer"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

export default CommentSection;
