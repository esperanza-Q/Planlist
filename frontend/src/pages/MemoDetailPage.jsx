// src/pages/MemoDetailPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MemoDetailPage.css';

import PlusIcon from '../icons/PlusIcon';
import SaveIcon from '../icons/SaveIcon';
import PrinterIcon from '../icons/PrinterIcon';
import { api } from '../api/client'; // axios 인스턴스

import XCircleIcon from '../icons/XCircleIcon'

const MemoDetailPage = () => {
  const { id } = useParams();
  const memoId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : id;
  }, [id]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [share, setShare] = useState('PERSONAL'); // ← 읽기 전용(서버 값 고정)
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('');

  // 이미지 상태
  const [imageUrls, setImageUrls] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [addFiles, setAddFiles] = useState([]);

  // 상세 조회
  useEffect(() => {
    let cancelled = false;

    const fetchMemo = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get('/api/note/getNote', {
          params: { noteId: memoId },
          timeout: 12000,
        });
        const data = Array.isArray(res) ? res : (res?.data ?? res);
        const dto = data?.noteUpdateDTO ?? data ?? {};

        if (cancelled) return;

        setTitle(dto?.title ?? '');
        setContent(dto?.content ?? '');
        setShare((dto?.share ? String(dto.share).toUpperCase() : 'PERSONAL') === 'GROUP' ? 'GROUP' : 'PERSONAL'); // 고정
        setProjectName(dto?.project_name ?? '');
        setCategory(dto?.category ?? '');
        setImageUrls(Array.isArray(dto?.imageUrls) ? dto.imageUrls : []);
        setDeleteImages([]);
        setAddFiles([]);
      } catch (err) {
        if (!cancelled) {
          console.groupCollapsed('%c[MemoDetail] ❌ fetch error', 'color:#c00;font-weight:bold;');
          console.log('status:', err?.response?.status);
          console.log('data:', err?.response?.data);
          console.log('message:', err?.message);
          console.groupEnd();
          setErrorMsg('메모를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMemo();
    return () => { cancelled = true; };
  }, [memoId]);

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAddFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const toggleDeleteImage = (url) => {
    setDeleteImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const removeAddFileAt = (idx) => {
    setAddFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // 저장 (PUT /api/note/updateNote)
  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해 주세요.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('noteId', String(memoId));
      fd.append('title', title);
      fd.append('content', content);
      fd.append('share', share); // ← 읽기 전용이지만 필수라 그대로 전송

      // keep = 현재 imageUrls - deleteImages
      const keepUrls = imageUrls.filter((u) => !deleteImages.includes(u));
      if (keepUrls.length > 0) fd.append('imageUrls', keepUrls.join(','));
      if (deleteImages.length > 0) fd.append('deleteImages', deleteImages.join(','));
      addFiles.forEach((file) => fd.append('images', file, file.name));
      if (category) fd.append('category', category);

      await api.put('/api/note/updateNote', fd, { timeout: 20000 });

      alert('✅ 메모가 성공적으로 수정되었습니다!');

      // 재조회로 동기화
      try {
        const refetch = await api.get('/api/note/getNote', { params: { noteId: memoId } });
        const data = Array.isArray(refetch) ? refetch : (refetch?.data ?? refetch);
        const dto = data?.noteUpdateDTO ?? data ?? {};
        setTitle(dto?.title ?? '');
        setContent(dto?.content ?? '');
        setShare((dto?.share ? String(dto.share).toUpperCase() : 'PERSONAL') === 'GROUP' ? 'GROUP' : 'PERSONAL');
        setProjectName(dto?.project_name ?? '');
        setCategory(dto?.category ?? '');
        setImageUrls(Array.isArray(dto?.imageUrls) ? dto.imageUrls : []);
        setDeleteImages([]);
        setAddFiles([]);
      } catch (reErr) {
        console.warn('[MemoDetail] refetch failed:', reErr);
      }
    } catch (err) {
      console.groupCollapsed('%c[MemoDetail] ❌ update error', 'color:#c00;font-weight:bold;');
      console.log('status:', err?.response?.status);
      console.log('data:', err?.response?.data);
      console.log('message:', err?.message);
      console.groupEnd();
      const msg = err?.response?.data?.message || '메모 수정 중 오류가 발생했습니다.';
      alert(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return <div style={{ padding: 40 }}>로딩 중…</div>;
  if (errorMsg) return <div style={{ padding: 40, color: '#c00' }}>{errorMsg}</div>;

  return (
    <div className="memo-detail-page">
      <div className="memo-detail-header">
        <span className="memo-detail-project">
          {projectName ? `Project ${projectName}` : 'Project'} /
        </span>

        <div className="memo-detail-buttons">
          {/* 읽기 전용 공유 타입 뱃지 */}
          <span
            className="memo-share-badge"
            title="Share type (read-only)"
            style={{
              marginRight: 8,
              padding: '4px 8px',
              borderRadius: 8,
              background: share === 'GROUP' ? '#eef5ff' : '#f6f6f6',
              border: '1px solid #ddd',
              fontSize: 12,
            }}
          >
            {share}
          </span>

          <button onClick={handleSave} disabled={saving} title="Save">
            <SaveIcon /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={handlePrint} title="Print">
            <PrinterIcon /> Print
          </button>
        </div>
      </div>

      {/* 제목 */}
      <input
        className="memo-detail-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={saving}
        placeholder="Enter title..."
      />

      {/* 내용 */}
      <textarea
        className="memo-detail-content"
        rows={12}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={saving}
        placeholder="Enter content..."
      />

     {/* 기존 이미지 목록 (삭제 XCircleIcon 토글) */}
      {imageUrls.length > 0 && (
        <div className="memo-detail-images">
          {imageUrls.map((src, i) => {
            const checked = deleteImages.includes(src);
            return (
              <div
                key={i}
                className={`memo-image-item ${checked ? 'to-delete' : ''}`}
              >
                <img src={src} alt={`img-${i}`} className="memo-detail-image" />
                <div className="memo-image-actions">
                  <button
                    type="button"
                    className="memo-delete-btn"
                    onClick={() => toggleDeleteImage(src)}
                    title={checked ? "삭제 취소" : "삭제"}
                  >
                    <XCircleIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 새 이미지 업로드 */}
      <div className="memo-upload-area">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddFiles}
          id="memo-image-upload"
          style={{ display: 'none' }}
          disabled={saving}
        />

        <button
          className="memo-detail-upload"
          onClick={() => document.getElementById('memo-image-upload')?.click()}
          disabled={saving}
        >
          <PlusIcon /> Add Image
        </button>

        {addFiles.length > 0 && (
          <ul className="memo-file-list">
            {addFiles.map((f, idx) => (
              <li key={idx} className="memo-file-item">
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeAddFileAt(idx)}
                  disabled={saving}
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MemoDetailPage;
