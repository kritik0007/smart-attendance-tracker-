import API from './api';

export const getDashboardStats = async () => {
    const response = await API.get('/admin/stats');
    return response.data;
};

export const getUsers = async (role) => {
    const response = await API.get(`/admin/users?role=${role}`);
    return response.data;
};

export const addUser = async (userData) => {
    // If face images are files, we might need to handle them differently (upload to Cloudinary first or send as multipart)
    // For simplicity, AdminDashboard currently receives base64 strings from FileReader.
    // Ideally, we should upload these.
    // For this 'addUser' endpoint implementation in backend, it expects JSON body.
    // The backend user model has `faceImages: [String]`.
    // If we pass base64 strings, it might be too large for JSON body limit or inefficient.
    // However, given the current setup, if we treat them as part of user data, we'll send them.
    // If we want to support file upload, we need FormData.
    // Let's assume for now we send JSON. If images are large, this might fail.
    // TODO: Check if backend /add-user handles image upload. The current controller just saves req.body.
    // So validation: we need to ensure the frontend sends what the backend expects.
    // The backend User model has `faceImages` as array of strings. 

    const response = await API.post('/admin/add-user', userData);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await API.delete(`/admin/user/${userId}`);
    return response.data;
};

export const updateUser = async (userId, userData) => {
    const response = await API.put(`/admin/user/${userId}`, userData);
    return response.data;
};

export const getClassrooms = async () => {
    const response = await API.get('/admin/classrooms');
    return response.data;
};

export const addClassroom = async (classroomData) => {
    // Similar logic for reference images - if they are base64, payload size might be an issue.
    const response = await API.post('/admin/create-classroom', classroomData);
    return response.data;
};

export const updateClassroom = async (classroomId, classroomData) => {
    const response = await API.put(`/admin/classroom/${classroomId}`, classroomData);
    return response.data;
};

export const deleteClassroom = async (classroomId) => {
    const response = await API.delete(`/admin/classroom/${classroomId}`);
    return response.data;
};

export const getAttendanceReports = async (filters) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.className) params.append('className', filters.className);

    const response = await API.get(`/admin/attendance?${params.toString()}`);
    return response.data;
};
