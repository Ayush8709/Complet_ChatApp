import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  _id: null,
  name: "",
  email: "",
  profile_pic: "",
  token: null,
  onlineUser: [],
  socketConnection: null,
};

if (process.env.NODE_ENV === 'development') {
  console.log('Initial user state:', initialState);
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set user details (excluding token)
    setUser: (state, action) => {
      const { _id, name, email, profile_pic } = action.payload;
      state._id = _id;
      state.name = name;
      state.email = email;
      state.profile_pic = profile_pic;
    },

    // Set JWT token
    setToken: (state, action) => {
      state.token = action.payload;
    },

    // Combined user and token setter (optional)
    setUserAndToken: (state, action) => {
      const { user, token } = action.payload;
      state._id = user._id;
      state.name = user.name;
      state.email = user.email;
      state.profile_pic = user.profile_pic;
      state.token = token;
    },

    // Clear all user info on logout
    logout: (state) => {
      state._id = null;
      state.name = "";
      state.email = "";
      state.profile_pic = "";
      state.token = null;
      state.socketConnection = null;
      state.onlineUser = [];
    },

    // Set online users array
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },

    // Set socket connection object
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
  },
});

// Export actions
export const {
  setUser,
  setToken,
  setUserAndToken,
  logout,
  setOnlineUser,
  setSocketConnection
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
