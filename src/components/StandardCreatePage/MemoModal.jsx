import React, { useState } from 'react';
import './MemoModal.css';

const MemoModal = ({ onClose, onSave }) => {
  const [type, setType] = useState('personal');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleSave = () => {
    onSave({
      id: Date.now(),
      type,
      title,
      description: desc,
      category: type === 'personal' ? 'Travel' : 'Standard',
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box memo-modal">
        <h2>Memo</h2>

        <div className="memo-type-toggle">
          <button
            className={type === 'personal' ? 'active' : ''}
            onClick={() => setType('personal')}
          >
            personal
          </button>
          <button
            className={type === 'group' ? 'active' : ''}
            onClick={() => setType('group')}
          >
            group
          </button>
        </div>

        <div className="memo-input-box">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter the title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Enter the contents..."
            rows="8"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>

        <button className="memo-save-btn" onClick={handleSave}>
          Save Memo
        </button>
      </div>
    </div>
  );
};

export default MemoModal;
