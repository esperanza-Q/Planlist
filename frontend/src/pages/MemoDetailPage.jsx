import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MemoDetailPage.css';

import PlusIcon from '../icons/PlusIcon';
import SaveIcon from '../icons/SaveIcon';
import PrinterIcon from '../icons/PrinterIcon';

/* 임시 mock 데이터
const mockMemos = [
  { id: 1, title: 'Project 01', description: '내용 1', category: 'Travel' },
  { id: 2, title: 'Project 02', description: '내용 2', category: 'Meeting' },
  { id: 3, title: 'Customization', description: '내용 3', category: 'Standard' },
];
*/


const MemoDetailPage = () => {
  const { id } = useParams(); // URL에서 id 가져옴
  const memoId = parseInt(id, 10); // 숫자 변환
  const [memo, setMemo] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // 업로드 미리보기용
  const [imageFile, setImageFile] = useState(null); // 실제 업로드용 파일 객체

  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const response = await fetch(`/api/note/getNote?noteId=${memoId}`);
        if (!response.ok) throw new Error('메모 불러오기 실패');
        const data = await response.json();
        setMemo(data);
      } catch (err) {
        console.error(err);
        setMemo(null);
      }
    };

  fetchMemo();
}, [memoId]);



  const handleSave = async () => {
    const formData = new FormData();
    formData.append('noteId', memo.id); // 필수
    formData.append('title', memo.title);
    formData.append('content', memo.description);
    formData.append('share', 'GROUP'); // 실제 선택값으로 바꿔도 됨

    if (imageFile) {
      formData.append('images', imageFile); // 여러 개면 반복문
    }

    // 예: 기존 이미지 중 삭제할 이미지가 있다면
    // formData.append('deleteImages', 'old_image_url.jpg');

    try {
      const response = await fetch('/api/note/updateNote', {
        method: 'POST', // 또는 'PUT' (백엔드에 따라 다름)
        body: formData,
      });

      if (!response.ok) throw new Error('메모 수정 실패');

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
    setImageUrl(URL.createObjectURL(file)); // 미리보기용
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
