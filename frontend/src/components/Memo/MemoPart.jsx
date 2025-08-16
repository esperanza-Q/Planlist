// src/components/Memo/MemoPart.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './MemoPart.css';
import ArrowRightStrokeIcon from '../../icons/ArrowRightStrokeIcon';
import TrashIcon from '../../icons/TrashIcon';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const MemoPart = ({ memo, onDelete, canDelete = true }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  // 상세 프리뷰 상태
  const [contentText, setContentText] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [didFetch, setDidFetch] = useState(false);

  const normalized = useMemo(() => {
    const rawId = memo?.noteId ?? memo?.id;
    const serverId = Number(rawId);
    const hasServerId = Number.isFinite(serverId);

    const shareUpper = String(memo?.share ?? memo?.type ?? '').toUpperCase();
    const type =
      shareUpper === 'GROUP' ? 'group'
      : shareUpper === 'PERSONAL' ? 'personal'
      : (memo?.type === 'group' || memo?.type === 'personal') ? memo.type
      : 'personal';

    const title =
      (typeof memo?.title === 'string' && memo.title.trim()) ||
      (typeof memo?.project === 'string' && memo.project.trim()) ||
      (typeof memo?.project_name === 'string' && memo.project_name.trim()) ||
      'Untitled';

    const initialContent = memo?.content ?? memo?.description ?? memo?.body ?? '';
    const category = memo?.category ?? 'pt';

    return {
      id: hasServerId ? String(serverId) : String(rawId ?? ''),
      serverId,
      hasServerId,
      type, title, initialContent, category,
    };
  }, [memo]);

  // 카드 클릭 → 상세
  const handleClick = () => {
    if (!normalized.hasServerId) return;
    navigate(`/memo/${normalized.serverId}`);
  };

  // id 바뀌면 초기화 후 한 번만 상세 프리뷰 로드
  useEffect(() => {
    setContentText(normalized.initialContent || '');
    setDidFetch(false);
  }, [normalized.id, normalized.initialContent]);

  useEffect(() => {
    if (!normalized.hasServerId) return;
    if (didFetch) return;
    if (normalized.initialContent && normalized.initialContent.trim() !== '') return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingContent(true);
        const res = await api.get('/api/note/getNote', {
          params: { noteId: normalized.serverId },
          timeout: 10000,
        });
        const data = Array.isArray(res) ? res : (res?.data ?? res);
        const dto = data?.noteUpdateDTO ?? data ?? {};
        const fetched =
          dto?.content ??
          dto?.description ??
          dto?.body ??
          dto?.noteContent ??
          dto?.contents ??
          '';

        if (!cancelled) setContentText(typeof fetched === 'string' ? fetched : '');
      } catch {
        if (!cancelled) setContentText('');
      } finally {
        if (!cancelled) {
          setLoadingContent(false);
          setDidFetch(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [normalized.hasServerId, normalized.serverId, normalized.initialContent, didFetch]);

  // ✅ 삭제: 프리플라이트 없이 바로 DELETE 시도
  const handleDelete = async (e) => {
    e.stopPropagation();
    setErr('');

    if (!normalized.hasServerId) {
      alert('아직 서버에 저장되지 않은 메모여서 삭제할 수 없습니다.');
      return;
    }
    if (deleting) return;

    setDeleting(true);
    try {
      await api.delete(`/api/note/deleteNote/${normalized.serverId}`, { timeout: 15000 });
      onDelete?.(String(normalized.serverId)); // 부모가 목록에서 제거
    } catch (error) {
      // 백엔드가 500이지만 메시지는 "찾을 수 없음/존재하지 않음"인 케이스를 성공으로 간주
      const raw = error?.response?.data;
      const txt = (raw && (raw.message || raw.code)) || error?.message || '';
      const notFoundLike = /찾을 수 없|존재하지 않|COMMON400/i.test(txt) || error?.response?.status === 404;
      if (notFoundLike) {
        onDelete?.(String(normalized.serverId));
        return;
      }

      const msg = raw?.message || '삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      setErr(msg);
      alert(`❌ ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`note-memo-card ${normalized.type === 'personal' ? 'mine' : ''}`}
      onClick={handleClick}
      style={{ cursor: normalized.hasServerId ? 'pointer' : 'default', opacity: deleting ? 0.6 : 1 }}
    >
      <div className="note-memo-card-header">
        <h3 className="note-memo-title">{normalized.title}</h3>

        {/* 🔁 personal 제한 제거: canDelete만 참이면 버튼 노출 */}
        {canDelete && (
          <button
            className="memo-note-trash-icon"
            onClick={handleDelete}
            disabled={deleting || !normalized.hasServerId}
            title={deleting ? 'Deleting…' : 'Delete memo'}
            aria-label="delete memo"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <p className="note-memo-desc">
        {loadingContent ? 'Loading…' : (contentText || 'No content')}
      </p>

      <div className="note-memo-footer">
        {normalized.category && <span className="note-memo-category">{normalized.category}</span>}
        <ArrowRightStrokeIcon />
      </div>

      {err && <div className="note-error" style={{ marginTop: 6 }}>{err}</div>}
    </div>
  );
};

export default MemoPart;
