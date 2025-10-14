import React, { useState, useEffect } from 'react';

const StudySessionTracker = ({ children }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 m-4 px-3 py-1 bg-indigo-600 text-white rounded">
        Session Time: {formatTime(seconds)}
      </div>
      {children}
    </div>
  );
};

export default StudySessionTracker;
