import React from 'react';
import './DetailTimeModal.css';

const DetailTimeModal = ({ date, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Detail Time</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <table className="time-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 24 }, (_, i) => (
                <tr key={i}>
                  <td>{i}:00</td>
                  <td className={i >= 9 && i <= 18 ? 'highlight' : ''}></td>
                  <td className={i >= 6 && i <= 20 ? 'highlight' : ''}></td>
                  <td className={i >= 8 && i <= 17 ? 'highlight' : ''}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailTimeModal;
