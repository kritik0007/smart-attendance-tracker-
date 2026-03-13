import API from "./api.js";

export const verifyFace = async () => {
  // In a real app, you might do client-side pre-check. 
  // Since the backend handles Cloudinary upload and verification, 
  // we'll just simulate a successful client-side check to allow the flow to proceed.
  return { ok: true };
};

export const markAttendance = async ({ sessionKey, location, imageFile }) => {
  try {
    const formData = new FormData();
    formData.append('sessionKey', sessionKey);
    formData.append('location', JSON.stringify(location)); // Send as JSON string
    formData.append('image', imageFile); // The UI needs to pass the actual file object now

    const response = await API.post('/student/mark-attendance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { ok: true, data: response.data };
  } catch (error) {
    return {
      ok: false,
      reason: error.response?.data?.message || "Failed to mark attendance"
    };
  }
};

export const getAttendanceHistory = async () => {
  try {
    const response = await API.get('/student/attendance-history');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch attendance history", error);
    return [];
  }
};



