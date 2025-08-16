import React, { useEffect, useMemo, useState } from 'react';
import MemoPart from '../components/Memo/MemoPart';
import { ReactComponent as SearchIcon } from '../assets/Search.svg';
import './Note.css';
import { api } from '../api/client';

// API: { noteId, project_name, title, category, share }
const normalizeToMemoShape = (raw) => ({
  id: String(raw.noteId),
  type: String(raw.share).toUpperCase() === 'GROUP' ? 'group' : 'personal',
  project: raw.project_name ?? '',
  title: raw.title ?? 'Untitled',
  content: raw.content ?? raw.description ?? '',
  category: raw.category ?? 'pt',
  __title: raw.title ?? '',
});

const DEBUG = false;

const MemoListPage = () => {
  const [memos, setMemos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [debugInfo, setDebugInfo] = useState({
    path: '/api/note/',
    status: null,
    rawType: '',
    isArray: false,
    rawCount: null,
    normCount: 0,
    sampleRaw: null,
    tookMs: 0,
  });

 // ✅ 교체: fetchMemos 함수 전체
const fetchMemos = async () => {
  const path = '/api/note/';
  const started = performance.now();
  setLoading(true);
  setErrorMsg('');

  try {
    // api.get 이 배열([]) 자체를 리턴할 수도, { data: [...] }를 리턴할 수도 있으니 모두 대응
    const res = await api.get(path, { timeout: 10000 });

    // 1) axios 스타일: { data: ... }
    // 2) 커스텀: 배열/객체 그대로
    const raw = Array.isArray(res)
      ? res
      : (res?.data ?? res);

    const isArray = Array.isArray(raw);
    const rawArr = isArray ? raw : (raw?.memos ?? []); // 객체 래핑 케이스
    const normalized = rawArr.map(normalizeToMemoShape);

    const tookMs = Math.round(performance.now() - started);

    // 디버그
    console.groupCollapsed('%c[MemoList] ✅ /api/note/ 2xx', 'color:#0a0;font-weight:bold;');
    console.log('res (as returned by api.get):', res);
    console.log('typeof raw:', typeof raw);
    console.log('Array.isArray(raw):', isArray);
    console.log('raw:', raw);
    console.log('rawArr.length:', rawArr.length);
    console.log('first raw item:', rawArr[0]);
    console.log('first normalized:', normalized[0]);
    console.log('took(ms):', tookMs);
    console.groupEnd();

    setMemos(normalized);
    setDebugInfo({
      path,
      status: 200, // 성공으로 간주
      rawType: typeof raw,
      isArray,
      rawCount: isArray ? raw.length : Array.isArray(raw?.memos) ? raw.memos.length : null,
      normCount: normalized.length,
      sampleRaw: isArray ? raw?.[0] : rawArr?.[0] ?? null,
      tookMs,
    });
  } catch (err) {
    const tookMs = Math.round(performance.now() - started);
    const status = err?.response?.status;

    console.groupCollapsed('%c[MemoList] ❌ /api/note/ error', 'color:#c00;font-weight:bold;');
    console.log('status:', status);
    console.log('data:', err?.response?.data);
    console.log('message:', err?.message);
    console.log('took(ms):', tookMs);
    console.groupEnd();

    if (status === 404) {
      // 정책상 404를 "데이터 없음"으로 처리
      setMemos([]);
      setDebugInfo({
        path,
        status: 404,
        rawType: '(none)',
        isArray: false,
        rawCount: 0,
        normCount: 0,
        sampleRaw: null,
        tookMs,
      });
    } else {
      setErrorMsg('메모를 불러오지 못했습니다.');
      setDebugInfo({
        path,
        status: status ?? '(network)',
        rawType: '(error)',
        isArray: false,
        rawCount: null,
        normCount: 0,
        sampleRaw: null,
        tookMs,
      });
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { fetchMemos(); }, []);

  const filteredMemos = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return memos;
    return memos.filter(
      (m) =>
        (m.project || '').toLowerCase().includes(q) ||
        (m.__title || '').toLowerCase().includes(q)
    );
  }, [memos, searchTerm]);

  const hasMemos = memos.length > 0;
  const hasFiltered = filteredMemos.length > 0;

  // 개발 중 UI 확인용: 모의 데이터 주입
  const injectMock = () => {
    const mock = [
      { noteId: 1, project_name: 'Planlist', title: 'Kickoff Notes', category: 'pt', share: 'PERSONAL' },
      { noteId: 2, project_name: 'Study', title: 'React Hooks', category: 'study', share: 'GROUP' },
    ].map(normalizeToMemoShape);
    setMemos(mock);
  };

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

      {/* Debug 패널 */}
      {DEBUG && (
        <div style={{ fontSize: 12, background:'#f7f7f7', border:'1px dashed #ddd', padding:'8px 10px', borderRadius:8, marginBottom:12 }}>
          <div><b>Debug</b></div>
          <div>path: {debugInfo.path}</div>
          <div>status: {String(debugInfo.status)}</div>
          <div>typeof raw: {debugInfo.rawType}</div>
          <div>isArray(raw): {String(debugInfo.isArray)}</div>
          <div>rawCount: {String(debugInfo.rawCount)}</div>
          <div>normalizedCount: {debugInfo.normCount}</div>
          <div>took: {debugInfo.tookMs}ms</div>
          <div>sampleRaw: <code>{JSON.stringify(debugInfo.sampleRaw)}</code></div>
          <div style={{ marginTop: 6, display:'flex', gap:8 }}>
            <button onClick={fetchMemos}>↻ Re-fetch</button>
            <button onClick={injectMock}>💡 Inject mock</button>
          </div>
        </div>
      )}

      {loading && <div className="note-loading">로딩 중…</div>}
      {errorMsg && <div className="note-error">{errorMsg}</div>}


      <div className="note-memo-grid">
        {!loading && !errorMsg && (
          hasFiltered ? (
            filteredMemos.map((memo) => (
              <MemoPart
                key={memo.id}
                memo={memo}
                canDelete={true}
                onDelete={(deletedId) => {
                  setMemos((prev) => prev.filter((m) => String(m.id) !== String(deletedId)));
                }}
              />
            ))
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
