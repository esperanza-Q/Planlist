// src/components/ProjectViewTravel/ProjectViewTravel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../../api/client";

import ViewPlannerCard from "./ViewPlannerCard";
import "./ProjectViewTravel.css";
import TravelInfoCard from "./TravelInfoCard";
import ProfilePic from "../../assets/ProfilePic.png";
import MemoCard from "../../components/ProjectView/MemoCard"
import TravelMemoCard from "./TravelMemoCard";

// ---------- small utils ----------
const parseId = (v) => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : null;
};

// "YYYY-MM-DD" 또는 "YYYY-MM-DDTHH:mm:ss" 모두 처리
const toDate = (str) => {
  if (!str) return "TBD";
  const s = String(str);
  // 날짜만 있는 경우 그대로 반환
  if (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ISO 형태면 앞 10자리
  return s.slice(0, 10);
};

const toTime = (str) => {
  if (!str) return "TBD";
  const s = String(str);
  const parts = s.split("T");
  if (parts.length < 2) return "TBD"; // 시간 정보가 없는 날짜만 들어온 경우
  const time = parts[1].slice(0, 5);
  return time || "TBD";
};

// 응답의 카테고리 철자 차이 흡수 (accommodation/accomodation 등)
const normalizeCategory = (c) => {
  const v = String(c || "").toLowerCase();
  if (v.startsWith("accom")) return "accommodation";
  if (["restaurant", "dining", "food", "맛집", "식당"].includes(v)) return "restaurant";
  return "place";
};

// TravelInfoCard가 원하는 형태로 매핑
const tripToInfoProject = (trip) => ({
  id: trip.project_id,
  title: trip.project_name,
  description: trip.description || "",
  category: "travel",
  status: "Active", // 서버 status를 그대로 쓰고 싶으면: (trip.status || "Active")
  repeat: "none",
  startDate: toDate(trip.start_date),
  startTime: toTime(trip.start_date),
  endTime: toTime(trip.end_date),
  endDate: toDate(trip.end_date),
  placeName: trip.location || "",
  placeAddress: trip.location || "",
  users: Array.isArray(trip.participants)
    ? trip.participants.map((p) => ({
        name: p.username || p.name || "user",
        avatar: p.profileImage || ProfilePic,
      }))
    : [],
  meetings: [],
});

const ProjectViewTravel = () => {
  const { projectId: pathId } = useParams();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // /project/travel/:projectId  또는  /project/travel?projectId=34  둘 다 지원
  const idFromPath = parseId(pathId);
  const idFromQuery = parseId(query.get("projectId"));
  const projectId = idFromPath ?? idFromQuery;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!projectId) {
        setLoading(false);
        setErrMsg("프로젝트 ID가 없습니다. URL을 확인해 주세요.");
        return;
      }
      setLoading(true);
      setErrMsg("");

      try {
        // ✅ 스펙에 맞춘 엔드포인트: GET /api/travel/info/{project_id}
        const data = await api.getSession(`/api/travel/project/${encodeURIComponent(projectId)}`);
        // 실제 응답 예시:
        // {
        //   project: { projectId, projectName, category, status, startDate, endDate, confirmedAt },
        //   participants: [{ name, profileImage }],
        //   memo: [...]
        // }

        const p = data?.project || {};

        // ViewPlannerCard와 TravelInfoCard 모두가 안전하게 렌더되도록 "옛 스키마 모양"으로 정규화
        const normalized = {
          // 예전 필드명으로 매핑
          project_id: p.projectId ?? projectId,
          project_name: p.projectName ?? "",
          description: "", // 백엔드에 설명 필드가 없다면 빈 문자열
          start_date: p.startDate || null, // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
          end_date: p.endDate || null,
          location: p.location || "",

          // participants: {username, profileImage} 형태로 통일
          participants: Array.isArray(data?.participants)
            ? data.participants.map((u, idx) => ({
                id: u.id ?? idx,
                username: u.name,
                profileImage: u.profileImage,
              }))
            : [],

          // ViewPlannerCard가 참조할 수 있도록 기본 형태 제공
          datePlanners: Array.isArray(data?.datePlanners) ? data.datePlanners : [],

          // 메모: 배열이면 첫 항목의 content를 팀 메모처럼 노출 (필요 시 로직 조정)
          teamMemo: {
            content: Array.isArray(data?.memo) && data.memo.length > 0
              ? (data.memo[0]?.content || "")
              : "",
          },

          // 원한다면 status도 보존
          status: p.status || "INPROGRESS",
          confirmedAt: p.confirmedAt || null,
        };

        // schedules 카테고리 안전화
        normalized.datePlanners = normalized.datePlanners.map((dp) => ({
          ...dp,
          schedules: Array.isArray(dp?.schedules)
            ? dp.schedules.map((s) => ({ ...s, category: normalizeCategory(s.category) }))
            : [],
        }));

        if (!cancelled) setTrip(normalized);
      } catch (e) {
        if (!cancelled) setErrMsg(e?.message || "여행 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const infoProject = useMemo(() => (trip ? tripToInfoProject(trip) : null), [trip]);

  // Team memo -> TravelMemoCard format (간단 매핑)
  const initialMemos = useMemo(() => {
    const list = [];
    if (trip?.teamMemo?.content) {
      list.push({
        id: "team-memo",
        type: "group",
        project: trip.project_name || `project ${projectId}`,
        content: trip.teamMemo.content,
        category: "travel",
      });
    }
    return list;
  }, [trip, projectId]);

  if (loading) {
    return (
      <div className="screen">
        <div className="project-view-div">로딩 중...</div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="screen">
        <div className="project-view-div">
          <p style={{ color: "crimson" }}>{errMsg}</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="screen">
        <div className="project-view-div">
          <p>표시할 여행 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="project-view-div">
        <div className="layout">
          {/* 상단 요약 카드 */}
          {infoProject && <TravelInfoCard project={infoProject} />}

          {/* 팀 메모 노출 */}
          <  MemoCard initialMemos={initialMemos} />
        </div>

        <div className="layout">
          {/* 전체 trip 데이터(정규화)를 플래너 카드에 전달 */}
          <ViewPlannerCard project={trip} />

          <button className="meet-button addfinish">
            mark as finished
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewTravel;
