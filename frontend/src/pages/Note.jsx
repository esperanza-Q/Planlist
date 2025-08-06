
import React from 'react';
import MemoPart from '../components/Memo/MemoPart';
import { ReactComponent as SearchIcon } from '../assets/Search.svg';

import './Note.css';

const mockMemos = [
  { id: 1, title: 'Project 01', description: 'A short description about context of this category goes here.', category: 'Travel', isMine: true },
  { id: 2, title: 'Project 02', description: 'A short description about context of this category goes here.', category: 'Meeting', isMine: false },
  { id: 3, title: 'Customization', description: 'A short description about context of this category goes here.', category: 'Meeting', isMine: false },
  { id: 4, title: 'Customization', description: 'A short description about context of this category goes here.', category: 'PT', isMine: false },
  { id: 5, title: 'Customization', description: 'A short description about context of this category goes here.', category: 'Standard', isMine: false },
];

const MemoListPage = () => {
  return (
    <div className="note-memo-page">
      <div className="note-memo-header">
        <h2>MY MEMO</h2>
        <div className="note-memo-search-wrapper">
          <SearchIcon className="note-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="note-memo-search"
          />
        </div>
      </div>

      <div className="note-memo-grid">
        {mockMemos.map((memo) => (
          <MemoPart key={memo.id} memo={memo} />
        ))}
      </div>
    </div>
  );
};

export default MemoListPage;
