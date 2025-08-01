import React, { useState } from 'react';
import './SavePorject.css';
import MemoModal from './MemoModal';

const SavePorject = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [myMemos, setMyMemos] = useState([]);
  const [teamMemos, setTeamMemos] = useState([]);
  const [references, setReferences] = useState([]);
  const [locationMemo, setLocationMemo] = useState(formData.place?.name || '');
  const [dateTime, setDateTime] = useState({
    date: formData.selectedDate,
    start: '12:00 am',
    end: '1:00 am',
  });

  const [memoModalOpen, setMemoModalOpen] = useState(false);

  const handleMemoSave = (memo) => {
    if (memo.type === 'personal') {
      setMyMemos(prev => [...prev, memo]);
    } else {
      setTeamMemos(prev => [...prev, memo]);
    }
  };

  const deleteMemo = (type, id) => {
    if (type === 'personal') setMyMemos(myMemos.filter(m => m.id !== id));
    else setTeamMemos(teamMemos.filter(m => m.id !== id));
  };

  const addReference = () => {
    const newRef = `Data ${references.length + 1}`;
    setReferences([...references, newRef]);
  };

  const deleteReference = (index) => {
    setReferences(refs => refs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      dateTime,
      locationMemo,
      references,
      memos: {
        my: myMemos,
        team: teamMemos,
      },
    };

    try {
      const res = await fetch('/api/project/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('저장 완료!');
        nextStep(); // or redirect
      } else {
        alert('저장 실패!');
      }
    } catch (err) {
      console.error('저장 오류:', err);
      alert('에러 발생');
    }
  };

  return (
    <div className="step5-container">
      <h2>Project Name</h2>

      {/* DateTime + Reference + Location */}
      <div className="left-panel">
        <section className="section-box">
          <label>Date & Time</label>
          <input value={dateTime.date} disabled />
          <div className="time-inputs">
            <input value={dateTime.start} onChange={(e) => setDateTime({ ...dateTime, start: e.target.value })} />
            <input value={dateTime.end} onChange={(e) => setDateTime({ ...dateTime, end: e.target.value })} />
          </div>
        </section>

        <section className="section-box">
          <label>Add Reference</label>
          <div className="reference-list">
            {references.map((ref, i) => (
              <span key={i}>
                {ref} <button onClick={() => deleteReference(i)}>❌</button>
              </span>
            ))}
            <button onClick={addReference}>＋</button>
          </div>
        </section>

        <section className="section-box">
          <label>Choose location</label>
          <input value={locationMemo} onChange={(e) => setLocationMemo(e.target.value)} />
        </section>
      </div>

      {/* Memos */}
      <div className="right-panel">
        <div className="memo-section">
          <div className="memo-header">
            MY MEMO 
            <button onClick={() => setMemoModalOpen(true)}>＋</button>
          </div>
          <div className="memo-list">
            {myMemos.map((m) => (
              <MemoCard key={m.id} memo={m} onDelete={() => deleteMemo('personal', m.id)} />
            ))}
          </div>
        </div>

        <div className="memo-section">
          <div className="memo-header">
            TEAM MEMO 
            <button onClick={() => setMemoModalOpen(true)}>＋</button>
          </div>
          <div className="memo-list">
            {teamMemos.map((m) => (
              <MemoCard key={m.id} memo={m} onDelete={() => deleteMemo('group', m.id)} />
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-right">
        <button className="save-button" onClick={handleSave}>💾 Save</button>
      </div>

      {memoModalOpen && (
        <MemoModal
          onClose={() => setMemoModalOpen(false)}
          onSave={handleMemoSave}
        />
      )}
    </div>
  );
};

const MemoCard = ({ memo, onDelete }) => (
  <div className="memo-card">
    <div className="memo-title">{memo.title}</div>
    <div className="memo-desc">
      {memo.description || 'A short description about context of this category goes here.'}
    </div>
    <div className="memo-meta">{memo.category}</div>
    <button className="delete-btn" onClick={onDelete}>🗑</button>
  </div>
);

export default SavePorject;
