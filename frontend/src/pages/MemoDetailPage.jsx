import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MemoDetailPage.css';

import PlusIcon from '../icons/PlusIcon';
import SaveIcon from '../icons/SaveIcon';
import PrinterIcon from '../icons/PrinterIcon';
import { api } from '../api/client'; // axios 인스턴스

const MemoDetailPage = () => {
  const { id } = useParams();
  const memoId = parseInt(id, 10);

  const [memo, setMemo] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // 메모 불러오기
  useEffect(() => {
    let cancelled = false;

    const fetchMemo = async () => {
      try {
        const { data } = await api.get(`/api/note/getNote`, {
          params: { noteId: memoId },
          timeout: 10000,
        });
        if (!cancelled) setMemo(data);
      } catch (err) {
        if (!cancelled) {
          console.error('메모 불러오기 실패:', err);
          setMemo(null);
        }
      }
    };

    fetchMemo();
    return () => {
      cancelled = true;
    };
  }, [memoId]);

  // 메모 저장
  const handleSave = async () => {
    if (!memo) return;

    const formData = new FormData();
    formData.append('noteId', memo.id);
    formData.append('title', memo.title);
    formData.append('content', memo.description);
    formData.append('share', 'GROUP');

    if (imageFile) {
      formData.append('images', imageFile);
    }

    try {
      await api.post('/api/note/updateNote', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ 메모가 성공적으로 수정되었습니다!');
    } catch (err) {
      console.error('수정 실패:', err);
      alert('❌ 메모 수정 중 오류가 발생했습니다.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  if (!memo) return <div style={{ padding: '40px' }}>해당 메모를 찾을 수 없습니다.</div>;

  return (
    <div className="memo-detail-page">
      <div className="memo-detail-header">
        <span className="memo-detail-project">Project {memo.id} /</span>
        <div className="memo-detail-buttons">
          <button onClick={handleSave}><SaveIcon /> Save</button>
          <button onClick={handlePrint}><PrinterIcon /> Print</button>
        </div>
      </div>

      <input
        className="memo-detail-title"
        value={memo.title}
        onChange={(e) => setMemo({ ...memo, title: e.target.value })}
      />

      <textarea
        className="memo-detail-content"
        rows="12"
        value={memo.description}
        onChange={(e) => setMemo({ ...memo, description: e.target.value })}
      />

      {imageUrl && <img src={imageUrl} alt="Uploaded" className="memo-detail-image" />}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="memo-image-upload"
      />

      <button
        className="memo-detail-upload"
        onClick={() => document.getElementById('memo-image-upload').click()}
      >
        <PlusIcon /> Add Image
      </button>
    </div>
  );
};

export default MemoDetailPage;
