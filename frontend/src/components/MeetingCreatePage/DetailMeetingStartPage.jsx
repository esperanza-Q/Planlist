
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DetailMeetingStartPage.css';

import { api } from '../../api/client';

import DiscussionIcon from '../../icons/DiscussionIcon';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { addDays, parseISO, isValid as isValidDate } from 'date-fns';

const DetailmeetingStartPage = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || addDays(new Date(), 7));

  const getProjectId = (fd) =>
    fd?.projectId ?? fd?.project?.id ?? fd?.project?.projectId ?? null;

  const handleStartChange = (date) => {
    setStartDate(date);
    if (date) setEndDate(addDays(date, 7)); // keep +7 UX
  };

  const handleNext = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your meeting project.");
      return;
    }

    const projectId = getProjectId(formData);
    if (!projectId) {
      alert("Missing project id from previous step. Please start from the meeting project first.");
      return;
    }

    const toYMD = (d) =>
      d instanceof Date
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`
        : d;
    
    const getInviteEmails = () => {
    // 프로젝트에서 실제 보유한 필드명으로 수정하세요
    const list = formData?.participants || formData?.invitedFriends || [];
    return list
      .map(p => p?.email || p?.user?.email)
      .filter(Boolean);
  };

     try {
      // 1) 세션 생성
      const res = await api.postSession("/api/meeting/project/addSession", {
        projectId,
        title,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        isRecurring: 1,          // 서버가 snake_case만 받는다면 is_recurring로 변경 필요
        recurrenceUnit: "WEEKLY",// 서버와 스펙 확인(ENUM/대소문자)
        recurrenceCount: 1,
      });

      const data = res?.data ?? res;
      const plannerId = data?.plannerId ?? null;
      if (!plannerId) {
        throw new Error("No plannerId returned from addSession");
      }

      // 2) 초대 (있는 사람만)
      const emails = getInviteEmails();
      if (emails.length > 0) {
        const results = await Promise.allSettled(
          emails.map(email =>
            api.post(`/api/meeting/inviteUser/${projectId}/invite`, { email })
          )
        );

        const failed = results
          .map((r, i) => (r.status === 'rejected' ? emails[i] : null))
          .filter(Boolean);

        if (failed.length) {
          console.warn("초대 실패 이메일:", failed);
          // 실패한 사람은 건너뛰고 진행 (필요하면 alert로 알려주기)
          alert(`초대에 실패한 이메일: ${failed.join(', ')}`);
        }
      } else {
        console.log("초대할 이메일이 없습니다. 초대 단계는 건너뜁니다.");
      }

      // 3) 상태 조회(선택)
      try {
        const inprogress = await api.get(`/api/meeting/inviteUser/${projectId}/inprogress`);
        console.log("inprogress:", inprogress?.data ?? inprogress);
      } catch (e) {
        console.warn("inprogress 조회 실패(무시 가능):", e);
      }

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
      // 서버 에러 메시지 보여주기 (가능하면)
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Unknown error";
      console.error("Failed to create meeting session:", e);
      alert(`Failed to create meeting session.\n${msg}`);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div className="form-icon"><DiscussionIcon/></div>

        <h2>Start meeting session</h2>
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

export default DetailmeetingStartPage;