// src/components/ProjectViewPT/CommentCard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import DefaultProfilePic from "../../assets/ProfilePic.png";
import x_circle from "../../assets/x_circle.svg";

const ensureCommentShape = (arr) =>
  Array.isArray(arr)
    ? arr.map((c, i) => ({
        id: c?.commentId ?? c?.id ?? (i + 1), // ← keep server id
        user: c?.user ?? c?.name ?? "user",
        text: c?.text ?? c?.content ?? "",
        isTrainer:
          String(c?.isTrainer ?? c?.role ?? "").toUpperCase() === "TRAINER",
        profilepic:
          c?.profilepic || c?.profileImage || c?.profile_image || DefaultProfilePic,
      }))
    : [];

const CommentCard = ({ initialComments, sessionId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [deleting, setDeleting] = useState(new Set()); // per-row busy state

  // sync from parent, normalized
  useEffect(() => {
    setComments(ensureCommentShape(initialComments || []));
  }, [initialComments]);

  const handleAddComment = useCallback(async () => {
    const trimmed = newComment.trim();
    if (!trimmed || isPosting) return;

    // optimistic comment
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      user: "you",
      text: trimmed,
      isTrainer: false,
      profilepic: DefaultProfilePic,
    };

    setComments((prev) => [...prev, optimistic]);
    setNewComment("");
    setIsPosting(true);

    try {
      // POST /api/pt/session/writeComment?sessionId=...
      await api.post(
        `/api/pt/session/writeComment`,
        { content: trimmed },
        { params: { sessionId } }
      );
      // Keep your full reload pattern (or switch to re-fetch if available)
      window.location.reload();
    } catch (e) {
      setComments((prev) => prev.filter((c) => c.id !== tempId)); // rollback
      alert(e?.message || "댓글 작성에 실패했습니다. 네트워크 상태를 확인해 주세요.");
      setNewComment(trimmed);
    } finally {
      setIsPosting(false);
    }
  }, [newComment, sessionId, isPosting]);

  // Build query string explicitly to avoid client params issues
  const deleteCommentApi = async (commentId) => {
    const qs = `?commentId=${encodeURIComponent(commentId)}`;
    try {
      return await api.delete(`/api/pt/session/deleteComment${qs}`);
    } catch (err) {
      // fallback if server only supports POST
      if (err?.status === 405 || err?.status === 404 || err?.status === 400) {
        return await api.post(`/api/pt/session/deleteComment${qs}`);
      }
      throw err;
    }
  };

  const handleDelete = async (comment) => {
    const id = comment?.id;
    if (!id) {
      alert("이 댓글은 식별자가 없어 삭제할 수 없습니다.");
      return;
    }
    // if it's an optimistic temp comment, remove locally
    if (String(id).startsWith("temp-")) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    if (!window.confirm("이 댓글을 삭제할까요?")) return;

    // optimistic remove
    const prev = comments;
    const next = prev.filter((c) => c.id !== id);
    const busy = new Set(deleting);
    busy.add(id);
    setDeleting(busy);
    setComments(next);

    try {
      await deleteCommentApi(id);
    } catch (e) {
      alert("삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setComments(prev); // rollback
    } finally {
      const done = new Set(busy);
      done.delete(id);
      setDeleting(done);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="comment-card">
      <ul className="comment-list">
        {comments.map((comment) => {
          const isBusy = deleting.has(comment.id);
          return (
            <li className="comment-item" key={comment.id}>
              <img
                src={comment.profilepic || DefaultProfilePic}
                alt={comment.user || "user"}
                onError={(e) => (e.currentTarget.src = DefaultProfilePic)}
              />
              <div className="comment-content">
                <div className="comment-user">{comment.user}</div>
                {comment.text}
                <div className="is-trainer">
                  {comment.isTrainer ? "trainer" : ""}
                </div>
              </div>
              <button
                className="delete-comment"
                onClick={() => handleDelete(comment)}
                disabled={isBusy}
                title="Delete comment"
              >
                <img src={x_circle} alt="delete" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="comment-input">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          disabled={isPosting}
        />
        <button
          onClick={handleAddComment}
          disabled={isPosting || !newComment.trim()}
        >
          {isPosting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};
export default CommentCard;
