import API from "./api.js";

// Login API call
export const login = async ({ identifier, password, role }) => {
  try {
    const response = await API.post('/auth/login', {
      email: identifier,
      password,
    });

    // Store token in local storage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return {
      ok: true,
      token: response.data.token,
      role: response.data.role,
      identifier: response.data.email,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// Register API call
export const register = async ({ name, identifier, password, role, phone, faceImages }) => {
  try {
    const response = await API.post('/auth/register', {
      name,
      email: identifier,
      password,
      role,
      phone,
      faceImages
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return {
      ok: true,
      ...response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};




// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    return null; // or throw
  }
};
