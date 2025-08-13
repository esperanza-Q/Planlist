import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './StartProject.css';

import PT_icon from '../../assets/dumbbell_icon.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";



const CreatePT = ({ formData, updateFormData, nextStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [endDate, setEndDate] = useState(formData.endDate || new Date());
    const [isTrainer, setIsTrainer] = useState(!!formData.isTrainer);


  const handleNext = () => {
    
    updateFormData({ title, startDate, endDate });

    


    nextStep();
  };

  return (
    <form className="form-container">
      <div className="form-box" style={{height:"525px"}}>
        <div className="form-icon"> <img src={PT_icon}/></div>

        <h2>Start PT Project</h2>
        <p className="form-description">
          Welcome Project! Please enter your details.
        </p>

        <div className="underSection">
            <label>Project Title</label>
            <input
            type="text"
            className='title-box'
            placeholder="Enter your title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
            <div className="underSection" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="checkbox">
                <input
                  id="is-trainer"
                  type="checkbox"
                  checked={isTrainer}
                  onChange={(e) => setIsTrainer(e.target.checked)}
                />
                <label htmlFor="is-trainer">I’m the trainer</label>
              </div>
              
            </div>
       
        </div>
      </div>
      {/* ✅ 다음 버튼 */}
        <button className="project-next-button" type="submit" onClick={handleNext}><ProjectNextIcon/></button>
    </form>
  );
};

export default CreatePT;
