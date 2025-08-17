import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../MeetingCreatePage/DetailMeetingStartPage.css';

import { api } from '../../api/client';

import CubeAltIcon from '../../icons/CubeAltIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { addDays } from 'date-fns';

const DetailstandardStartPage = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || addDays(new Date(), 7));

  // ── helpers ──────────────────────────────────────────────────────────────
  const getProjectId = (fd) =>
    fd?.projectId ?? fd?.project?.id ?? fd?.project?.projectId ?? null;

  const handleStartChange = (date) => {
    setStartDate(date);
    if (date) setEndDate(addDays(date, 7)); // keep +7 UX
  };

  // 날짜를 YYYY-MM-DD로 직렬화
  const toYMD = (d) => {
    if (d instanceof Date && !isNaN(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    // 이미 문자열로 들어오는 경우 그대로 사용(백엔드가 수용한다면)
    return d;
  };

  // 실제 초대할 이메일들 꺼내오기: 프로젝트의 formData 구조에 맞춰 경로만 바꾸면 됩니다.
  const getInviteEmails = () => {
    // 예시: formData.participants 또는 formData.invitedFriends 등
    const list = formData?.participants || formData?.invitedFriends || [];
    return list
      .map(p => p?.email || p?.user?.email)
      .filter(Boolean);
  };

  const handleNext = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your standard project.");
      return;
    }

    const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the standard project first.");
      return;
    }

    try {
      // 1) 세션 생성
      // ⚠️ 백엔드가 snake_case를 기대하는 경우가 많아 snake_case로 전송
      const payload = {
        projectId,
        title,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        is_recurring: true,         // ← 과거 로그상 is_recurring NULL 에러 방지
        recurrence_unit: "WEEKLY",
        recurrence_count: 1,
      };

      const res = await api.postSession("/api/standard/project/addSession", payload);

      // api.postSession이 axios라면 data 안에 실제 응답이 담깁니다.
      const data = res?.data ?? res;
      const plannerId = data?.plannerId ?? null;
      if (!plannerId) {
        throw new Error("No plannerId returned from addSession");
      }

      // 2) 초대 (있는 사람만, 개별 실패 허용)
      const emails = getInviteEmails();
      if (emails.length > 0) {
        const results = await Promise.allSettled(
          emails.map(email =>
            api.post(`/api/standard/inviteUser/${projectId}/invite`, { email })
          )
        );

        const failed = results
          .map((r, i) => (r.status === 'rejected' ? emails[i] : null))
          .filter(Boolean);

        if (failed.length) {
          console.warn("초대 실패 이메일:", failed);
          alert(`초대에 실패한 이메일: ${failed.join(', ')}`);
        }
      } else {
        console.log("초대할 이메일이 없습니다. 초대 단계는 건너뜁니다.");
      }

      // 3) (선택) 상태 조회
      // try {
      //   const inprogress = await api.get(`/api/standard/inviteUser/${projectId}/inprogress`);
      //   console.log("inprogress:", inprogress?.data ?? inprogress);
      // } catch (e) {
      //   console.warn("inprogress 조회 실패(무시 가능):", e);
      // }

      // 4) 폼 업데이트 & 다음 단계
      updateFormData({
        title,
        startDate,
        endDate,
        projectId,
        plannerId,
        session: data,
      });

      nextStep();
    } catch (e) {
      // 서버 메시지를 최대한 노출
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Unknown error";
      console.error("Failed to create standard session:", e);
      alert(`Failed to create standard session.\n${msg}`);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"><CubeAltIcon/></div>

        <h2>Start Standard session</h2>
        <p className="form-description">
          Enter a specific topic under the main project.
        </p>

        <div className="underSection">
          <label>Sub Project Title</label>
          <input
            type="text"
            className='title-box'
            placeholder="Enter your title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Select the week</label>
          <div className="meeting-date-picker-wrapper">
            <DatePicker
              selected={startDate}
              onChange={handleStartChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
            <span> ~ </span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              disabled
            />
          </div>
        </div>
      </div>

      <button className="project-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default DetailstandardStartPage;
