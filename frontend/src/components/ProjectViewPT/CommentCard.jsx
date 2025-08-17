// src/components/ProjectViewPT/CommentCard.jsx (or your current path)
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import DefaultProfilePic from "../../assets/ProfilePic.png";
import x_circle from "../../assets/x_circle.svg";


const ensureCommentShape = (arr) =>
  Array.isArray(arr)
    ? arr.map((c, i) => ({
        id: c?.id ?? i + 1,
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

  // sync from parent, but normalize + ensure fallback avatar
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
      // body: { content: "..."} ; response is a plain string on success
      const result = await api.post(
        `/api/pt/session/writeComment?sessionId=${encodeURIComponent(sessionId)}`,
        { content: trimmed }
      );

      // result may be: "성공적으로 코멘트를 작성하였습니다."
      // We don't get the created comment back, so keep optimistic one.
      // Optionally, you could re-fetch comments here if your API supports it.
      if (typeof result !== "string") {
        // no-op; still fine
      }
      window.location.reload();
    } catch (e) {
      // rollback optimistic on error
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      // surface a lightweight error message
      const msg =
        e?.message ||
        "댓글 작성에 실패했습니다. 네트워크 상태를 확인해 주세요.";
      // eslint-disable-next-line no-alert
      alert(msg);
      // (optional) restore input
      setNewComment(trimmed);
    } finally {
      setIsPosting(false);
    }
  }, [newComment, sessionId, isPosting]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="comment-card">
      <ul className="comment-list">
        {comments.map((comment) => (
          <li className="comment-item" key={comment.id}>
            <img
              src={comment.profilepic || DefaultProfilePic}
              alt={comment.user || "user"}
              onError={(e) => (e.currentTarget.src = DefaultProfilePic)}
            />
            <div className="comment-content">
              <div className="comment-user">
                {comment.user}
              </div>
              {comment.text}
              <div className="is-trainer">
                {comment.isTrainer ? "trainer" : ""}
              </div>
            </div>
            <button className="delete-comment" >
              <img src={x_circle} />
              </button>
          </li>
        ))}
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
        <button onClick={handleAddComment} disabled={isPosting || !newComment.trim()}>
          {isPosting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};

export default CommentCard;
