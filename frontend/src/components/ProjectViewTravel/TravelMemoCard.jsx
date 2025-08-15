import React, { useState, useMemo } from "react";

import memo_trashbin from "../../assets/memo_trashbin.svg"
import arrow from "../../assets/arrow.svg"
import "../ProjectView/MemoCard.css"

const TravelMemoCard = ({ initialMemos = [], onChange })=> {
          const [activeTab, setActiveTab] = useState("personal");
          const [memos, setMemos] = useState(initialMemos);
        
          const visibleMemos = useMemo(
            () => memos.filter(m => m.type === activeTab),
            [memos, activeTab]
          );
        
          function remove(id) {
            const next = memos.filter(m => m.id !== id);
            setMemos(next);
            if (typeof onChange === "function") onChange(next);
          }
        
          return (
            <div className="memo-card travel-memo-card">
                <div className="card-title"> Memo </div>
              {/* Tabs */}
              <div className="tab memo">
                {["personal", "group"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    disabled={activeTab === tab}
                  >
                    {tab === "personal" ? "Personal" : "Group"}
                  </button>
                ))}
                
                
              </div>
        
              {/* Memo List */}
              <ul className="memo-list scrollable memo-list-travel">
                {visibleMemos.length === 0 ? (
                  <li className="empty">No {activeTab} memos yet.</li>
                ) : (
                  visibleMemos.map(m => (
                    
                    <div key={m.id} className="memo-item">
                        
                        <button className="memo-edit-button" disabled>
                            <img src={arrow}/>
                        </button>
                        <button className="memo-delete-button" onClick={() => remove(m.id)}>
                            <img src={memo_trashbin}/>                
                        </button>
                        
                        <div className="memo-title">{m.project}</div>
                        <p className="memo-content">{m.content}</p>
                        {m.category && <span className="memo-tag">{m.category}</span>}
                    
                    </div>
                  ))
                )}
              </ul>
              <button className="meet-button add" >
                  <p>Add memo</p>
                </button>
            </div>
    )


}

export default TravelMemoCard;