// src/components/.../ProjectOverview.jsx
import React, { useEffect, useRef, useState } from 'react';
import './ProjectOverview.css';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../api/client';

import { normalizeProjectsFromHome } from './util'; 
// 아이콘
import Overview_Cat_Big from '../../../assets/Overview_Cat_Big.svg';
import Overview_Cat01 from '../../../assets/Overview_Cat01.svg'; // Travel
import Overview_Cat02 from '../../../assets/Overview_Cat02.svg'; // Meeting
import Overview_Cat03 from '../../../assets/Overview_Cat03.svg'; // Study
import Overview_Cat04 from '../../../assets/Overview_Cat04.svg'; // PT/Default

const getIconByCategory = (category) => {
  const key = String(category || '').toLowerCase();
  switch (key) {
    case 'travel':  return Overview_Cat01;
    case 'meeting': return Overview_Cat02;
    case 'study':   return Overview_Cat03;
    case 'pt':      return Overview_Cat04;
    default:        return Overview_Cat04;
  }
};

const toMMDD = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
};

const toDateRange = (startISO, endISO) => {
  const s = toMMDD(startISO);
  const e = toMMDD(endISO);
  if (s && e) return s === e ? s : `${s}~${e}`;
  return s || e || '-';
};

const ProjectOverview = () => {
  const navigate = useNavigate();
  const circleRef = useRef(null);
  const [angle, setAngle] = useState(0);

  const [projects, setProjects] = useState([]); // 정규화된 형태
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScroll = (e) => {
    const delta = e.deltaY;
    setAngle((prev) => prev + delta * 0.3);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        // api.getSession 없으면 api.get으로 교체
        const json = await (api.getSession?.('/api/home') ?? (await api.get('/api/home')).data);
        const norm = normalizeProjectsFromHome(json);

        // Overview 표시에 맞춘 2차 매핑 (날짜/아이콘/보여줄 텍스트)
        const mapped = norm.map((p, i) => ({
          id: p.id,
          name: p.title,
          description: p.status, // 상태 라벨 그대로 표시
          date: toDateRange(p.startDate, p.endDate),
          type: String(p.category || 'standard').toLowerCase(), // travel/meeting/pt/standard
          image: getIconByCategory(p.category),
          raw: p.raw ?? p,
        }));

        setProjects(mapped);
      } catch (err) {
        console.error(err);
        setErrorMsg('프로젝트를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  return (
    <div className="project-overview">
      <h2 className="overview-title">Project Overview</h2>

      <div className="overview-card" onWheel={handleScroll}>
        <div className="overview-leftside-cat">
          <img src={Overview_Cat_Big} alt="cat" className="half-cat-image" />
        </div>

        <div className="overview-right">
          {loading && <div className="overview-empty">Loading…</div>}
          {!loading && errorMsg && <div className="overview-error">{errorMsg}</div>}
          {!loading && !errorMsg && projects.length === 0 && (
            <div className="overview-empty">There are no projects to display</div>
          )}

          {!loading && !errorMsg && projects.length > 0 && (
            <div className="circle-orbit" ref={circleRef}>
              {projects.map((project, index) => {
                const deg = angle + (360 / projects.length) * index;
                const x = 500 * Math.cos((deg * Math.PI) / 180);
                const y = 225 * Math.sin((deg * Math.PI) / 180);
                return (
                  <div
                    key={project.id}
                    className="project-item-circle"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      position: 'absolute',
                      top: '40%',
                      left: '-47%',
                    }}
                    title={project.raw?.status || ''}
                  >
                    <img src={project.image} alt="icon" className="project-icon" />
                    <div className="project-info">
                      <p className="project-title">{project.name}</p>
                      <p className="project-desc">{project.description}</p>
                    </div>
                    <div className="project-meta">
                      <p className="project-date">{project.date}</p>
                      <p className="project-type">{project.type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
