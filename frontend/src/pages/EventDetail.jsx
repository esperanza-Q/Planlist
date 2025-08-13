//이벤트 상세 페이지 연동 예시용

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  //API에 맞게 변경
  useEffect(() => {
    axios.get(`/api/events/${id}`).then((res) => setEvent(res.data));
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>Time: {event.startTime} - {event.endTime}</p>
      <p>Description: {event.description || 'No description.'}</p>
    </div>
  );
};

export default EventDetail;
