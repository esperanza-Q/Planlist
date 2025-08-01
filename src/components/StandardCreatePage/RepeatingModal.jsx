import React, { useState } from 'react';
import './RepeatingModal.css';

const RepeatingModal = ({ onClose, onSave }) => {
  const [repeatCount, setRepeatCount] = useState(2);
  const [repeatMethod, setRepeatMethod] = useState('Same weekday');

  const handleSave = () => {
    onSave({ repeatCount, repeatMethod });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>🔁 Repeating</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <p>Set how and how often you'd like to repeat this.</p>

          <label>How many times to repeat</label>
          <select value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <label>Repeat method</label>
          <select value={repeatMethod} onChange={(e) => setRepeatMethod(e.target.value)}>
            <option value="Same weekday">Same weekday</option>
            <option value="Every X days">Every X days</option>
          </select>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default RepeatingModal;
