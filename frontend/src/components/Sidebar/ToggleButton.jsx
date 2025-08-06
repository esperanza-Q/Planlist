import React from "react";
import './ToggleButton.css';
import ChevronsRightIcon from "../../icons/ChevronsRightIcon";

function ToggleButton({ onClick }) {
  return (
    <button onClick={onClick} className="toggle-btn">
        <div className="chevronRight">
            <ChevronsRightIcon />
        </div>
    </button>
  );
}

export default ToggleButton;
