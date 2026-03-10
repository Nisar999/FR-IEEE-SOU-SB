import React from 'react';
import VideoStream from './components/VideoStream';
import HeadcountWidget from './components/HeadcountWidget';
import AttendanceList from './components/AttendanceList';
import UnknownPersonsList from './components/UnknownPersonsList';
import CameraStatus from './components/CameraStatus';

function App() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Smart Vision AI Engine</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="badge active">System Online</span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Left Column (Video + Stats) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <VideoStream cameraId="cam_01" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
            <HeadcountWidget />
          </div>
        </div>

        {/* Right Column (Lists & Logs) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AttendanceList />
          <UnknownPersonsList />
          <CameraStatus />
        </div>
      </div>
    </div>
  );
}

export default App;
