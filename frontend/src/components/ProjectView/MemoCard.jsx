import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import memo_trashbin from "../../assets/memo_trashbin.svg";
import arrow from "../../assets/arrow.svg";
import "../ProjectView/MemoCard.css";
import { api } from "../../api/client";
import MemoModal from "../../components/StandardCreatePage/MemoModal";

/**
 * Props
 * - initialMemos?: []
 * - onChange?: (list)=>void
 * - projectId?: string|number
 * - plannerId?: string|number
 * - projectName?: string     // 서버 리스트의 project_name 과 매칭
 */
const MemoCard = ({ initialMemos = [], onChange, projectId, plannerId, projectName }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");
  const [memos, setMemos] = useState(initialMemos);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // 프리뷰 캐시 (키별 관리)
  const [contentCache, setContentCache] = useState({});

  // ======= 키 네임스페이스 =======
  const cacheKey = useMemo(() => {
    const p = projectId ?? "";
    const pl = plannerId ?? "";
    const n = (projectName ?? "").trim();
    return `${p}|${pl}|${n}`;
  }, [projectId, plannerId, projectName]);

  const memosStoreRef = useRef(new Map());      // key -> list
  const contentStoreRef = useRef(new Map());    // key -> { [noteId]: content }
  const detailMetaStoreRef = useRef(new Map()); // key -> Map(noteId -> meta)
  const failedIdsStoreRef = useRef(new Map());  // key -> Set(noteId)
  const inflightStoreRef = useRef(new Map());   // key -> Set(noteId)

  const getKeyed = () => {
    if (!contentStoreRef.current.has(cacheKey)) contentStoreRef.current.set(cacheKey, {});
    if (!detailMetaStoreRef.current.has(cacheKey)) detailMetaStoreRef.current.set(cacheKey, new Map());
    if (!failedIdsStoreRef.current.has(cacheKey)) failedIdsStoreRef.current.set(cacheKey, new Set());
    if (!inflightStoreRef.current.has(cacheKey)) inflightStoreRef.current.set(cacheKey, new Set());
    if (!memosStoreRef.current.has(cacheKey)) memosStoreRef.current.set(cacheKey, []);
    return {
      contentCacheForKey: contentStoreRef.current.get(cacheKey),
      detailMetaForKey: detailMetaStoreRef.current.get(cacheKey),
      failedIdsForKey: failedIdsStoreRef.current.get(cacheKey),
      inflightForKey: inflightStoreRef.current.get(cacheKey),
      memosForKey: memosStoreRef.current.get(cacheKey),
    };
  };

  // 키 전환 시 해당 키의 목록/캐시를 표시
  useEffect(() => {
    const { memosForKey, contentCacheForKey } = getKeyed();
    setMemos(memosForKey);
    setContentCache(contentCacheForKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // 리스트 표준화
  const normalizeListItem = (raw) => ({
    id: String(raw?.noteId ?? raw?.id),
    noteId: String(raw?.noteId ?? raw?.id),
    type: String(raw?.share).toUpperCase() === "GROUP" ? "group" : "personal",
    title: raw?.title ?? "Untitled",
    project: raw?.project_name ?? raw?.projectName ?? raw?.project ?? "", 
    projectId: raw?.projectId ?? raw?.project_id ?? null,
    plannerId: raw?.plannerId ?? raw?.planner_id ?? null,
    content: "",
    category: raw?.category ?? "pt",
  });

  // 읽기: 서버에서 목록
  const fetchMemos = async (debugLabel = "load") => {
    setLoading(true);
    setErrMsg("");
    const started = performance.now();

    const { detailMetaForKey } = getKeyed();
    let finalPath = null;
    let list = [];
    let statusA, statusB;

    // 서버가 파라미터를 지원하면 전달
    const tryParams = {};
    if (projectId != null && projectId !== "") tryParams.projectId = projectId;
    if (plannerId != null && plannerId !== "") tryParams.plannerId = plannerId;

    try {
      try {
        const rA = await api.get("/api/note/", {
          timeout: 10000,
          params: Object.keys(tryParams).length ? tryParams : undefined,
        });
        const dataA = Array.isArray(rA) ? rA
              : Array.isArray(rA?.data) ? rA.data
              : (rA?.memos ?? rA?.data?.memos ?? []);
        statusA = rA?.status;
        finalPath = "/api/note/";
        list = Array.isArray(dataA) ? dataA : [];
      } catch (eA) {
        statusA = eA?.response?.status ?? "ERR";
        const rB = await api.get("/api/note", {
          timeout: 10000,
          params: Object.keys(tryParams).length ? tryParams : undefined,
        });
        const dataB = Array.isArray(rB) ? rB
              : Array.isArray(rB?.data) ? rB.data
              : (rB?.memos ?? rB?.data?.memos ?? []);
        statusB = rB?.status;
        finalPath = "/api/note";
        list = Array.isArray(dataB) ? dataB : [];
      }

      const normalized = (Array.isArray(list) ? list : []).map(normalizeListItem);

      // 1차: 이름 매칭
      const nameFiltered = projectName
        ? normalized.filter((m) => (m.project || "").trim() === String(projectName).trim())
        : normalized;

      // 2차: 리스트에 id가 있으면 바로 id 필터
      let prelim = nameFiltered;
      if (projectId != null && projectId !== "") {
        const pid = String(projectId);
        const hasAnyPid = nameFiltered.some((m) => m.projectId != null);
        if (hasAnyPid) prelim = nameFiltered.filter((m) => String(m.projectId) === pid);
      }
      if (plannerId != null && plannerId !== "") {
        const plid = String(plannerId);
        const hasAnyPlid = prelim.some((m) => m.plannerId != null);
        if (hasAnyPlid) prelim = prelim.filter((m) => String(m.plannerId) === plid);
      }

      // 3차: 상세 보강 (리스트에 id가 전혀 없을 때만 최소 조회)
      let final = prelim;
      const needsDetail =
        ((projectId != null && projectId !== "") || (plannerId != null && plannerId !== "")) &&
        !prelim.some((m) => m.projectId != null || m.plannerId != null);

      if (needsDetail) {
        const unknown = [];
        for (const m of prelim) {
          const nid = String(m.noteId ?? m.id);
          if (!detailMetaForKey.has(nid)) unknown.push(m);
        }
        const MAX_DETAIL = 12;
        const toFetch = unknown.slice(0, MAX_DETAIL);

        await Promise.all(
          toFetch.map(async (m) => {
            const nid = String(m.noteId ?? m.id);
            try {
              const res = await api.get("/api/note/getNote", {
                params: { noteId: nid },
                timeout: 8000,
              });
              const data = Array.isArray(res) ? res : res?.data ?? res;
              const dto = data?.noteUpdateDTO ?? data ?? {};
              detailMetaForKey.set(nid, {
                projectId: dto?.projectId ?? null,
                plannerId: dto?.plannerId ?? null,
                project_name: dto?.project_name ?? null,
              });
            } catch {
              detailMetaForKey.set(nid, { projectId: null, plannerId: null, project_name: null });
            }
          })
        );

        const keepById = (m) => {
          const nid = String(m.noteId ?? m.id);
          const meta = detailMetaForKey.get(nid) || {};
          if (projectId != null && projectId !== "" && meta.projectId != null) {
            return String(meta.projectId) === String(projectId);
          }
          if (plannerId != null && plannerId !== "" && meta.plannerId != null) {
            return String(meta.plannerId) === String(plannerId);
          }
          return true;
        };
        final = prelim.filter(keepById);
      }

      // 4차(엄격): 최종 방어 — projectId 불일치/정보없음은 제외
       if (projectName) {
         const pname = String(projectName).trim();
         final = final.filter((m) => String(m.project || "").trim() === pname);
       }

      // 키별 저장 + state 반영
      memosStoreRef.current.set(cacheKey, final);
      setMemos(final);
      onChange?.(final);

      console.groupCollapsed(`%c[MemoCard] ✅ fetched memos (${debugLabel})`, "color:#0a0;font-weight:bold;");
      console.log("finalPath:", finalPath, "statusA:", statusA, "statusB:", statusB);
      console.log("cacheKey:", cacheKey, "filters => projectId:", projectId, "plannerId:", plannerId, "projectName:", projectName);
      console.log("count(raw):", list.length, "after nameFilter:", nameFiltered.length, "final:", final.length);
      console.log("took:", Math.round(performance.now() - started) + "ms");
      console.groupEnd();
    } catch (err) {
      console.groupCollapsed("%c[MemoCard] ❌ fetch memos error", "color:#c00;font-weight:bold;");
      console.log("status:", err?.response?.status);
      console.log("data:", err?.response?.data);
      console.log("message:", err?.message);
      console.groupEnd();
      setErrMsg("메모 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 키 변경 시 로드
  useEffect(() => {
    fetchMemos("mount/filters");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // 탭 가시 목록
  const visibleMemos = useMemo(() => memos.filter((m) => m.type === activeTab), [memos, activeTab]);
   // initialMemos를 현재 키에 시딩하면서 projectName을 보정
 useEffect(() => {
   const seed = (initialMemos || []).map((m) => ({
     ...m,
     // 서버가 이름을 안 넣어줬다면 현재 화면의 projectName으로 주입
     project: (m.project ?? m.project_name ?? m.projectName ?? "").trim() || (projectName ?? ""),
   }));
   memosStoreRef.current.set(cacheKey, seed);
   setMemos(seed);
   if (!contentStoreRef.current.has(cacheKey)) {
     contentStoreRef.current.set(cacheKey, {});
   }
   // 상세 메타에도 이름 힌트 기록(나중에 필터 도움)
   const metaMap = detailMetaStoreRef.current.get(cacheKey) ?? new Map();
   seed.forEach((m) => {
     const nid = String(m.noteId ?? m.id);
     if (!metaMap.has(nid)) {
       metaMap.set(nid, { projectId: m.projectId ?? null, plannerId: m.plannerId ?? null, project_name: m.project ?? null });
     }
   });
   detailMetaStoreRef.current.set(cacheKey, metaMap);
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cacheKey, initialMemos, projectName]);

  // 프리패치 (키별)
  useEffect(() => {
    const { contentCacheForKey, failedIdsForKey, inflightForKey } = getKeyed();
    const MAX_PREFETCH = 8;
    const targets = [];
    for (const m of visibleMemos) {
      const id = String(m.noteId ?? m.id);
      if (!id) continue;
      if (contentCacheForKey[id] !== undefined) continue;
      if (failedIdsForKey.has(id)) continue;
      if (inflightForKey.has(id)) continue;
      targets.push(id);
      if (targets.length >= MAX_PREFETCH) break;
    }
    if (targets.length === 0) return;

    targets.forEach(async (id) => {
      inflightForKey.add(id);
      try {
        const res = await api.get("/api/note/getNote", { params: { noteId: id }, timeout: 10000 });
        const data = Array.isArray(res) ? res : res?.data ?? res;
        const dto = data?.noteUpdateDTO ?? data ?? {};
        const content =
          dto?.content ?? dto?.description ?? dto?.body ?? dto?.noteContent ?? dto?.contents ?? "";

        const next = { ...contentCacheForKey, [id]: typeof content === "string" ? content : "" };
        contentStoreRef.current.set(cacheKey, next);
        setContentCache(next);

        const meta = {
          projectId: dto?.projectId ?? null,
          plannerId: dto?.plannerId ?? null,
          project_name: dto?.project_name ?? null,
        };
        detailMetaStoreRef.current.get(cacheKey)?.set(id, meta);
      } catch (e) {
        failedIdsForKey.add(id);
        const next = { ...contentCacheForKey, [id]: "" };
        contentStoreRef.current.set(cacheKey, next);
        setContentCache(next);
      } finally {
        inflightForKey.delete(id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMemos, cacheKey]);

  // 키 전환 시 해당 키의 목록/캐시 표시 이후에 아래 useEffect 추가
 // ❶ initialMemos를 현재 키 저장소에 seed
 useEffect(() => {
   const seed = (initialMemos || []).map((m) => ({
     // initialMemos는 이미 정규화돼 있으니 그대로 두되,
     // 현재 projectId / plannerId를 주입해서 엄격필터에 걸리지 않게 한다.
     ...m,
     projectId: (m.projectId ?? (projectId ?? null)) && String(m.projectId ?? projectId),
     plannerId: m.plannerId ?? null,
   }));
   // 키별 저장
   memosStoreRef.current.set(cacheKey, seed);
   setMemos(seed);
   // 내용 캐시는 비워두고(프리패치가 채움)
   if (!contentStoreRef.current.has(cacheKey)) {
     contentStoreRef.current.set(cacheKey, {});
   }
   // 상세 메타에도 projectId 힌트 기록(엄격필터 도움)
   const metaMap = detailMetaStoreRef.current.get(cacheKey) ?? new Map();
   seed.forEach((m) => {
     const nid = String(m.noteId ?? m.id);
     if (!metaMap.has(nid)) {
       metaMap.set(nid, { projectId: m.projectId ?? null, plannerId: m.plannerId ?? null, project_name: m.project ?? null });
     }
   });
   detailMetaStoreRef.current.set(cacheKey, metaMap);
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cacheKey, initialMemos]);


  // 삭제 (키별)
  async function remove(idOrNoteId) {
    const targetId = String(idOrNoteId);
    try {
      await api.delete(`/api/note/deleteNote/${targetId}`, { timeout: 10000 });

      const { memosForKey, contentCacheForKey } = getKeyed();

      const nextList = memosForKey.filter((m) => String(m.noteId ?? m.id) !== targetId);
      memosStoreRef.current.set(cacheKey, nextList);
      setMemos(nextList);

      const nextCache = { ...contentCacheForKey };
      delete nextCache[targetId];
      contentStoreRef.current.set(cacheKey, nextCache);
      setContentCache(nextCache);

      detailMetaStoreRef.current.get(cacheKey)?.delete(targetId);

      onChange?.(nextList);
    } catch (err) {
      alert(err?.response?.data?.message || "메모 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  // 저장 (모달 → onSave)
  async function handleSaveFromModal(newMemo) {
    // MemoModal은 이미 projectId를 POST에 포함함. 여기서도 강제 주입해 낙관적 반영을 안전하게.
    const enriched = {
      ...newMemo,
      projectId,
      plannerId: plannerId ?? newMemo.plannerId ?? null,
    };

    const optimistic = {
      id: String(enriched.noteId ?? enriched.id ?? Date.now()),
      noteId: String(enriched.noteId ?? enriched.id ?? Date.now()),
      type: enriched.type === "group" ? "group" : "personal",
      title: enriched.title ?? "Untitled",
      project: enriched.project ?? enriched.title ?? "",
      content: enriched.content ?? "",
      category: enriched.category ?? "pt",
      projectId: enriched.projectId ?? null,
      plannerId: enriched.plannerId ?? null,
    };

    const { memosForKey } = getKeyed();
    const nextList = [optimistic, ...memosForKey];
    memosStoreRef.current.set(cacheKey, nextList);
    setMemos(nextList);
    onChange?.(nextList);
    setActiveTab(optimistic.type);

    await fetchMemos("after-save");
  }

  const openDetail = (idOrNoteId) => {
    const sid = String(idOrNoteId);
    if (!sid) return;
    navigate(`/memo/${sid}`);
  };

  return (
    <div className="memo-card">
      <div className="card-title">Memo</div>

      <div className="tab memo">
        {["personal", "group"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={activeTab === tab}
          >
            {tab === "personal" ? "Personal" : "Group"}
          </button>
        ))}
      </div>

      {loading && <div className="memo-loading">로딩 중…</div>}
      {errMsg && <div className="memo-error">{errMsg}</div>}

      <ul className="memo-list scrollable">
        {!loading && !errMsg && (
          visibleMemos.length === 0 ? (
            <li className="empty">No {activeTab} memos yet.</li>
          ) : (
            visibleMemos.map((m) => {
              const id = String(m.noteId ?? m.id);
              const preview = m.content || contentCache[id] || "";
              return (
                <div
                  key={m.id}
                  className="memo-item"
                  onClick={() => openDetail(id)}
                  style={{ cursor: "pointer" }}
                >
                  <button
                    className="memo-edit-button"
                    onClick={(e) => { e.stopPropagation(); openDetail(id); }}
                    title="Open"
                  >
                    <img src={arrow} alt="" />
                  </button>

                  <button
                    className="memo-delete-button"
                    onClick={(e) => { e.stopPropagation(); remove(id); }}
                    title="Delete memo"
                  >
                    <img src={memo_trashbin} alt="delete" />
                  </button>

                  <div className="memo-title">{m.title ?? m.project}</div>
                  <p className="memo-content">{preview || ' '}</p>
                  {m.category && <span className="memo-tag">{m.category}</span>}
                </div>
              );
            })
          )
        )}
      </ul>

      <button
        className="meet-button add"
        onClick={() => setShowMemoModal(true)}
        title={projectId ? "Add memo" : "Project ID missing"}
      >
        <p>Add memo</p>
      </button>

      {showMemoModal && (
        <MemoModal
          projectId={projectId}               // ★ 모달에도 명시 전달
          onClose={() => setShowMemoModal(false)}
          onSave={async (data) => {
            await handleSaveFromModal(data);
            setShowMemoModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MemoCard;
