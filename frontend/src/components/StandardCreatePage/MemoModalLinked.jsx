// src/components/StandardCreatePage/MemoModal.jsx
import React, { useState } from 'react';
import './MemoModal.css';
import { api } from '../../api/client';

const MemoModal = ({ onClose, onSave, projectId }) => {
  const [type, setType] = useState('personal'); // personal | group
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title.');
      return;
    }
    if (!projectId) {
      alert('Missing projectId to save memo.');
      return;
    }

    const share = type === 'group' ? 'GROUP' : 'PERSONAL';

    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', desc);
    fd.append('projectId', String(projectId));
    fd.append('share', share);
    files.forEach((f) => fd.append('images', f));

    try {
      setSaving(true);
      // Do NOT set Content-Type manually; the browser will set proper boundaries.
      const res = await api.postSession('/api/note/writeNote', fd);

      // Map server -> UI memo shape expected by MemoCard
      const newMemo = {
        id: String(res?.noteId ?? Date.now()),
        type: type, // 'personal' | 'group'
        project: title,
        content: desc,
        category: 'pt', // adjust if you want a different tag
      };

      if (typeof onSave === 'function') onSave(newMemo);
      onClose();
    } catch (err) {
      console.error('Failed to save memo:', err);
      alert('Failed to save memo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box memo-modal">
        <h2>Memo</h2>

        <div className="memo-type-toggle">
          <button
            className={type === 'personal' ? 'active' : ''}
            onClick={() => setType('personal')}
            disabled={saving}
          >
            personal
          </button>
          <button
            className={type === 'group' ? 'active' : ''}
            onClick={() => setType('group')}
            disabled={saving}
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
            disabled={saving}
          />
          <textarea
            placeholder="Enter the contents..."
            rows="8"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* <div className="memo-input-box">
          <label>Images (optional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={saving}
          />
          {files.length > 0 && (
            <div className="memo-file-count">{files.length} file(s) selected</div>
          )}
        </div> */}

        <button className="memo-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Memo'}
        </button>
      </div>
    </div>
  );
};

export default MemoModal;
