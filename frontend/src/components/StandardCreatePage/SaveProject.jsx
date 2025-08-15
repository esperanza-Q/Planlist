import React, { useState } from 'react';
import './SavePorject.css';
import MemoModal from './MemoModal';

import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProfileOverflowIcon } from '../../assets/profile_overflow.svg';
import SaveIcon from '../../icons/SaveIcon';
import PlusCircleIcon from '../../icons/PlusCircleIcon';
import GridCirclePlusIcon from '../../icons/GridCirclePlusIcon';
import LocationIcon from '../../icons/LocationIcon';
import Clock4Icon from '../../icons/Clock4Icon';
import PlusIcon from '../../icons/PlusIcon';

import profile1 from "../../assets/ProfilePic.png"
import profile2 from '../../assets/ProfilePic02.svg';
import profile3 from '../../assets/ProfilePic03.svg';
import profile4 from '../../assets/ProfilePic04.svg';

import MemoPart from '../Memo/MemoPart';


const mockFormData = {
  projectName: 'Team Collaboration',
  invitedFriends: [
    { id: 1, name: 'Alice', profileImage: profile1 },
    { id: 2, name: 'Bob', profileImage: profile2 },
  ],
  selectedDate: '2025-08-05',
  startTime: '10:00 am',
  endTime: '12:00 pm',
  place: {
    name: 'Sungshin Univ. Library',
  },
};

const SavePorject = ({
  formData,
  updateFormData = () => {},
  nextStep = () => {},
  prevStep = () => {},
}) => {
const safeFormData = formData && Object.keys(formData).length > 0 ? formData : mockFormData;
  const [myMemos, setMyMemos] = useState([]);
  const [teamMemos, setTeamMemos] = useState([]);
  const [references, setReferences] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [locationMemo, setLocationMemo] = useState(formData.place?.name || '');
  const [dateTime, setDateTime] = useState({
    date: formData.selectedDate,
    start: formData.startTime || '12:00 am',
    end: formData.endTime || '1:00 am',
  });
  const [memoModalOpen, setMemoModalOpen] = useState(false);

    const projectName = safeFormData.projectName || 'Untitled Project';
    const invitedFriends = safeFormData.invitedFriends || [];
    console.log("✅ formData:", formData);
    console.log("✅ safeFormData:", safeFormData);
    console.log("✅ invitedFriends:", invitedFriends);

  const handleSave = async () => {
    const payload = {
      ...formData,
      dateTime,
      locationMemo,
      references,
      memos: {
        my: myMemos,
        team: teamMemos,
      },
    };

    const formDataObj = new FormData();
    formDataObj.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    uploadedFiles.forEach((file) => {
      formDataObj.append('files', file);
    });

    try {
      const res = await fetch('/api/project/save', {
        method: 'POST',
        body: formDataObj,
      });

      if (res.ok) {
        alert('저장 완료!');
        nextStep();
      } else {
        alert('저장 실패!');
      }
    } catch (err) {
      console.error('저장 오류:', err);
      alert('에러 발생');
    }
  };

  return (
    <div className="step5-container">
      {/* Title & Profile */}
      <div className="save-project-left-section">
        <div className="save-project-title">
            <button onClick={prevStep} className="prev-button">
                <BackIcon />
            </button>

            <div className="save-project-title-row">
                <h2>{projectName}</h2>
                <div className="save-project-profile-pics">
                    {invitedFriends.length === 0 && <p style={{ color: 'gray' }}>No invited friends</p>}
                    {invitedFriends.map((friend, index) => (
                        <img
                        key={index}
                        src={friend.profileImage}
                        alt={friend.name}
                        className="save-project-profile-pic"
                        style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                        />
                    ))}
                    </div>

            </div>
        </div>


        {/* Date / Location / File Upload */}
        <div className="save-project-left-panel">
          <section className="save-project-section-box">
            <label><Clock4Icon /> Date & Time</label>
            <input value={dateTime.date} disabled />
            
            <div className="save-project-time-inputs">
                 <div className="save-project-tofrom-title">
                    <h5>To</h5>
                    <input
                        value={dateTime.start}
                        onChange={(e) => setDateTime({ ...dateTime, start: e.target.value })}
                    />
              </div>
                <div className="save-project-tofrom-title">
                    <h5>From</h5>
                    <input
                    value={dateTime.end}
                    onChange={(e) => setDateTime({ ...dateTime, end: e.target.value })}
                    />
                </div>
            </div>
          </section>

          <section className="save-project-section-box">
            <label><LocationIcon /> Choose location</label>
            <input value={locationMemo} onChange={(e) => setLocationMemo(e.target.value)} />
          </section>

          <section className="save-project-section-box">
            <label><GridCirclePlusIcon /> Add Reference (Upload)</label>

            {/* 실제 파일 input은 숨기고, label을 클릭하면 열리도록 */}
            <div className="file-upload-wrapper">
                <label htmlFor="file-upload" className="custom-file-upload">
                <PlusIcon/> Select File
                </label>
                <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={(e) => setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])}
                />
                <span className="file-count">
                {uploadedFiles.length > 0
                    ? `${uploadedFiles.length} Selected files`
                    : 'No files selected'}
                </span>
            </div>

            <ul className="save-project-file-preview-list">
                {uploadedFiles.map((file, i) => (
                    <li key={i} className="file-tag">
                    <span className="file-name">{file.name}</span>
                    <button
                        className="delete-file-button"
                        onClick={() =>
                        setUploadedFiles((prev) => prev.filter((_, index) => index !== i))
                        }
                    >
                        ⨉
                    </button>
                    </li>
                ))}
            </ul>

            </section>

        </div>
      </div>

      {/* Right Panel - Memo 영역 */}
      <div className="save-project-right-panel">
        <div className="save-project-memo-section">
          <div className="save-project-memo-header">
            MY MEMO
            <button className="save-project-memo-header-button" onClick={() => setMemoModalOpen(true)}>
              <PlusCircleIcon />
            </button>
          </div>
          {/* MY MEMO 영역 */}
            <div className="save-project-memo-placeholder">
            {myMemos.map((memo, index) => (
                <MemoPart key={index} memo={{ ...memo, isMine: true }} />
            ))}
            </div>

        </div>

        <div className="save-project-memo-section">
          <div className="save-project-memo-header">
            TEAM MEMO
            <button className="save-project-memo-header-button" onClick={() => setMemoModalOpen(true)}>
              <PlusCircleIcon />
            </button>
          </div>
          {/* TEAM MEMO 영역 */}
            <div className="save-project-memo-placeholder">
            {teamMemos.map((memo, index) => (
                <MemoPart key={index} memo={{ ...memo, isMine: false }} />
            ))}
            </div>

        </div>
      </div>

      {/* Save 버튼 */}
      <div className="save-project-bottom-right">
        <button className="save-project-save-button" onClick={handleSave}>
          Save <SaveIcon />
        </button>
      </div>

      {memoModalOpen && (
        <MemoModal
          onClose={() => setMemoModalOpen(false)}
          onSave={(memo) => {
            if (memo.type === 'personal') setMyMemos(prev => [...prev, memo]);
            else setTeamMemos(prev => [...prev, memo]);
          }}
        />
      )}
    </div>
  );
};

export default SavePorject;
