import { useState } from 'react';
import MypageProfile from '../components/Setting/MyPageProfile.jsx';
import Setting_friends from '../components/Setting/Setting_friends.jsx';

function Setting() {
  const [view, setView] = useState('profile'); // default is profile

  return (
    <div>
      {view === 'profile' && <MypageProfile setView={setView} />}
      {view === 'friends' && <Setting_friends setView={setView}  />}
    </div>
  );
}

export default Setting;