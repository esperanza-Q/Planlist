
import React, { useEffect, useState } from 'react';
import MemoPart from '../components/Memo/MemoPart';
import { ReactComponent as SearchIcon } from '../assets/Search.svg';

import './Note.css';

/* 테스트용 데이터 
const mockMemos = [
  { id: 1, title: 'Project 01', description: 'A short description about context of this category goes here.', category: 'Travel', isMine: true },
  { id: 2, title: 'Project 02', description: 'A short description about context of this category goes here.', category: 'Meeting', isMine: false },
  { id: 3, title: 'Customization', description: 'A short description about context of this category goes here.', category: 'Meeting', isMine: false },
  { id: 4, title: 'Customization', description: 'A short description about context of this category goes here.', category: 'PT', isMine: false },
  { id: 5, title: 'Customization', description: 'A short description about context of this category goes here.', category: 'Standard', isMine: false },
];

*/


const MemoListPage = () => {
  const [memoList, setMemoList] = useState([]); // 전체 메모
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [filteredMemos, setFilteredMemos] = useState([]); // 필터된 메모
  
  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const response = await fetch('/api/note/');
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setMemoList(data);
        setFilteredMemos(data);
      } catch (error) {
        console.error("메모 불러오기 실패:", error);
      }
    };

    fetchMemos();
  }, []);

   // ✅ 검색어 변경될 때마다 필터링
  useEffect(() => {
    const filtered = memoList.filter((memo) =>
      memo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMemos(filtered);
  }, [searchTerm, memoList]);

  
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="note-memo-grid">
        {filteredMemos.length > 0 ? (
          filteredMemos.map((memo) => <MemoPart key={memo.id} memo={memo} />)
        ) : (
          <p style={{ marginTop: "2rem", textAlign: "justify" }}>No results found</p>
        )}
      </div>
    </div>
  );
};

export default MemoListPage;
