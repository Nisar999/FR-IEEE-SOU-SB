import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const fetchHealth = () => axios.get(`${API_BASE}/health`);
export const fetchLiveHeadcount = () => axios.get(`${API_BASE}/live-headcount`);
export const fetchActivePersons = () => axios.get(`${API_BASE}/active-persons`);
export const fetchTodayAttendance = () => axios.get(`${API_BASE}/today-attendance`);
export const fetchUnknownPersons = () => axios.get(`${API_BASE}/unknown-persons`);
export const fetchCameraStatus = () => axios.get(`${API_BASE}/camera-status`);
export const fetchPersonHistory = (name) => axios.get(`${API_BASE}/person-history/${encodeURIComponent(name)}`);
export const promoteUnknown = (unknownId, knownName) => axios.post(`${API_BASE}/promote-unknown`, { unknown_id: unknownId, known_name: knownName });
export const WEBRTC_OFFER_URL = `${API_BASE}/offer`;
