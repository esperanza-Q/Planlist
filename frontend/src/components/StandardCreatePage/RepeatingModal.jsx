import React, { useState } from 'react';
import './RepeatingModal.css';
import RepeatIcon from '../../icons/RepeatIcon';

const RepeatingModal = ({ onClose, onSave }) => {
  const [repeatCount, setRepeatCount] = useState(2);
  const [repeatMethod, setRepeatMethod] = useState('Same weekday');

  const handleSave = () => {
    onSave({ repeatCount, repeatMethod });
    onClose();
  };

  return (
    <div className="Repeating-modal-overlay">
      <div className="Repeating-modal-box">
        <div className="Repeating-modal-header">
          <RepeatIcon className="Repeating-modal-icon" /> <h3> Repeating</h3>
        </div>

        <div className="Repeating-modal-content">
          <p>Set how and how often you'd like to repeat this.</p>

          <label>How many times to repeat</label>
          <select value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <label>Repeat method</label>
          <select value={repeatMethod} onChange={(e) => setRepeatMethod(e.target.value)}>
            <option value="Same weekday">Same weekday</option>
            <option value="Same date">Same date</option>
          </select>
        </div>

        <div className="Repeating-modal-footer">
          <button className="Repeating-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="Repeating-btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default RepeatingModal;
