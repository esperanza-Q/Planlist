import React from 'react';
import './MemoPart.css';
import ArrowRightStrokeIcon from '../../icons/ArrowRightStrokeIcon';
import TrashIcon from '../../icons/TrashIcon';
import { useNavigate } from 'react-router-dom';

const MemoPart = ({ memo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/memo/${memo.id}`);
  };

  return (
    <div
      className={`note-memo-card ${memo.isMine ? 'mine' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="note-memo-card-header">
        <h3 className="note-memo-title">{memo.title}</h3>
        {memo.isMine && <TrashIcon className="note-trash-icon" />}
      </div>
      <p className="note-memo-desc">{memo.description}</p>
      <div className="note-memo-footer">
        <span className="note-memo-category">{memo.category}</span>
        <ArrowRightStrokeIcon />
      </div>
    </div>
  );
};

export default MemoPart;
