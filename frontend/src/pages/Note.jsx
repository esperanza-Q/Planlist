import React, { useEffect, useMemo, useState } from 'react';
import MemoPart from '../components/Memo/MemoPart';
import { ReactComponent as SearchIcon } from '../assets/Search.svg';
import './Note.css';
import { api } from '../api/client';

const MemoListPage = () => {
  const [memos, setMemos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOnce = async (path) => {
    const { data } = await api.get(path, { timeout: 10000 });
    return Array.isArray(data) ? data : (data?.memos ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchMemos = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        // 1차: /api/note  → 실패(404 등) 시 2차: /api/note/
        let list;
        try {
          list = await fetchOnce('/api/note');
        } catch (e1) {
          if (e1?.response?.status === 404) {
            // 404를 "데이터 없음"으로 처리
            list = [];
          } else {
            // 혹시 경로 문제면 슬래시 폴백 시도
            try {
              list = await fetchOnce('/api/note/');
            } catch (e2) {
              if (e2?.response?.status === 404) list = [];
              else throw e2;
            }
          }
        }

        if (!cancelled) setMemos(list);
      } catch (err) {
        if (cancelled) return;
        // 네트워크 중단/취소는 무시
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        // 그 외만 에러 메시지 노출
        console.error('메모 불러오기 실패:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
        setErrorMsg('메모를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMemos();
    return () => { cancelled = true; };
  }, []);

  // 검색 필터링
  const filteredMemos = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return memos;
    return memos.filter((m) => (m.title || '').toLowerCase().includes(q));
  }, [memos, searchTerm]);

  const hasMemos = memos.length > 0;
  const hasFiltered = filteredMemos.length > 0;

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

      {loading && <div className="note-loading">로딩 중…</div>}
      {/* 에러는 네트워크/서버 오류일 때만 보여주고, 404는 빈 상태로 처리 */}
      {errorMsg && <div className="note-error">{errorMsg}</div>}

      <div className="note-memo-grid">
        {!loading && !errorMsg && (
          hasFiltered ? (
            filteredMemos.map((memo) => <MemoPart key={memo.noteId} memo={memo} />)
          ) : hasMemos ? (
            <p style={{ marginTop: '2rem', textAlign: 'justify' }}>No results found</p>
          ) : (
            <p style={{ marginTop: '2rem', textAlign: 'justify' }}>There is no note</p>
          )
        )}
      </div>
    </div>
  );
};

export default MemoListPage;
