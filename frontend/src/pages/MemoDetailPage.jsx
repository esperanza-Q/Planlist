import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MemoDetailPage.css';

import PlusIcon from '../icons/PlusIcon';
import SaveIcon from '../icons/SaveIcon';
import PrinterIcon from '../icons/PrinterIcon';

// 임시 mock 데이터
const mockMemos = [
  { id: 1, title: 'Project 01', description: '내용 1', category: 'Travel' },
  { id: 2, title: 'Project 02', description: '내용 2', category: 'Meeting' },
  { id: 3, title: 'Customization', description: '내용 3', category: 'Standard' },
];

/*
useEffect(() => {
  fetch(`/api/note/${id}`)
    .then((res) => res.json())
    .then((data) => setMemo(data))
    .catch(() => setMemo(null));
}, [id]);

*/

const MemoDetailPage = () => {
  const { id } = useParams(); // URL에서 id 가져옴
  const memoId = parseInt(id, 10); // 숫자 변환
  const [memo, setMemo] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const found = mockMemos.find((m) => m.id === memoId);
    setMemo(found);
  }, [memoId]);

  const handleSave = () => {
    alert('✅ 저장됨');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUrl(URL.createObjectURL(file));
    }
  };

  if (!memo) return <div style={{ padding: '40px' }}> 해당 메모를 찾을 수 없습니다. </div>;

  return (
    <div className="memo-detail-page">
      <div className="memo-detail-header">
        <span className="memo-detail-project">Project {memo.id} /</span>
        <div className="memo-detail-buttons">
          <button onClick={handleSave}> <SaveIcon /> Save</button>
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
