import React, { useMemo, useState } from 'react';
import './MemoModal.css';
import { api } from '../../api/client';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Props
 * - onClose(): 닫기
 * - onSave(memo): 저장 성공 후 상위에 전달 (MemoCard 등)
 * - projectId?: number|string                // 없어도 됨 (아래에서 자동으로 수집)
 * - projectName?: string                     // 응답에 project_name 없을 때 보조로 사용
 * - formData?: any                           // 상위 스텝의 formData 전달 가능
 */
const MemoModal = ({ onClose, onSave, projectId: propProjectId, projectName, formData }) => {
  const [type, setType] = useState('personal'); // 'personal' | 'group'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);       // File[]
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ------ projectId 수집 로직 ------
  const params = useParams();                 // e.g. /project/:projectId
  const location = useLocation();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const getFromFormData = (fd) =>
    fd?.projectId ?? fd?.project?.id ?? fd?.project?.projectId ?? null;

  const effectiveProjectId = useMemo(() => {
    // 우선순위: prop → formData → route param → query → localStorage
    return (
      propProjectId ??
      getFromFormData(formData) ??
      params.projectId ??
      search.get('projectId') ??
      localStorage.getItem('currentProjectId') ??
      null
    );
  }, [propProjectId, formData, params.projectId, search]);

  // ------ 파일 업로드 ------
  const onChangeFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list]);
  };
  const removeFileAt = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  // ------ 응답 → MemoCard/MemoPart 공통 구조로 변환 ------
  const toMemoShape = (raw) => {
    const noteId = (raw && (raw.noteId ?? raw.id)) ?? null; // 서버가 안 주면 null
    const shareUpper = String(raw?.share ?? (type === 'group' ? 'GROUP' : 'PERSONAL')).toUpperCase();

    const proj =
      (raw && (raw.project_name || raw.project)) ||
      projectName ||
      title ||
      'Untitled';
    
    const finalTitle = (raw && raw.title) ?? title ?? 'Untitled';

    const body =
      (raw && (raw.content || raw.description)) ||
      content ||
      '';

    const category = raw?.category ?? 'pt'; // 없으면 기본값

    return {
      id: String(noteId ?? Date.now()),
      noteId: noteId ?? undefined,      // ✅ 서버 id 그대로 별도 보관
      type: shareUpper === 'GROUP' ? 'group' : 'personal',
      project: proj,
      title: finalTitle,  
      content: body,
      category,
      projectId: String(
       raw?.projectId ?? raw?.project_id ?? effectiveProjectId ?? ''
     ),
    };
  };

  // ------ 저장 ------
  const handleSave = async () => {
    // 실사용에서 projectId 강제 필요
    if (!effectiveProjectId) {
      setErrorMsg('projectId를 찾을 수 없습니다. (props/formData/route/query/localStorage 중 하나로 전달해주세요)');
      return;
    }
    if (title.trim() === '') {
      setErrorMsg('제목을 입력해 주세요.');
      return;
    }
    if (content.trim() === '') {
      setErrorMsg('내용을 입력해 주세요.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('content', content);
      fd.append('projectId', String(effectiveProjectId));
      fd.append('share', type === 'group' ? 'GROUP' : 'PERSONAL');
      files.forEach((f) => fd.append('images', f, f.name));

      const res = await api.post('/api/note/writeNote', fd, {
        timeout: 20000,
        // headers: { 'Content-Type': 'multipart/form-data' }, // 보통 axios가 자동 지정
      });

      const data = Array.isArray(res) ? res : (res?.data ?? res);
      const normalized = toMemoShape(data);

      // 작성 성공 시 상위에 반영
      onSave(normalized);

      // 편의상 마지막 projectId 저장(다음 번 모달에서 자동 사용)
      try {
        localStorage.setItem('currentProjectId', String(effectiveProjectId));
      } catch {}

      onClose();
    } catch (err) {
      console.groupCollapsed('%c[MemoModal] ❌ writeNote error', 'color:#c00;font-weight:bold;');
      console.log('status:', err?.response?.status);
      console.log('data:', err?.response?.data);
      console.log('message:', err?.message);
      console.groupEnd();

      const status = err?.response?.status;
      if (status === 404) {
        setErrorMsg('메모 작성 API(/api/note/writeNote)를 찾을 수 없습니다.');
      } else if (status === 400) {
        setErrorMsg(err?.response?.data?.message ?? '요청 형식이 올바르지 않습니다.');
      } else {
        setErrorMsg('메모 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose();
      }}
    >
      <div className="modal-box memo-modal">
        <h2>Write Note</h2>

        {/* projectId 힌트 (개발 중 확인용) */}
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
          projectId: <b>{effectiveProjectId ?? '(none)'}</b>
        </div>

        <div className="memo-type-toggle">
          <button
            className={type === 'personal' ? 'active' : ''}
            onClick={() => setType('personal')}
            disabled={saving}
          >
            PERSONAL
          </button>
          <button
            className={type === 'group' ? 'active' : ''}
            onClick={() => setType('group')}
            disabled={saving}
          >
            GROUP
          </button>
        </div>

        <div className="memo-input-box">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter the title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />

          <label style={{ marginTop: 8 }}>Contents</label>
          <textarea
            placeholder="Enter the contents..."
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={saving}
          />

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onChangeFiles}
            disabled={saving}
          />

          {files.length > 0 && (
            <ul className="memo-file-list">
              {files.map((f, idx) => (
                <li key={idx} className="memo-file-item">
                  <span>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFileAt(idx)}
                    disabled={saving}
                    style={{ marginLeft: 8 }}
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {errorMsg && <div className="memo-error">{errorMsg}</div>}

        <div className="memo-actions">
          <button className="memo-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="memo-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoModal;
