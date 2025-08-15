import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import Divider from './Divider';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ onClose, user }) => {
  const dispatch = useDispatch();
  const uploadPhotoRef = useRef(); // file input ke liye reference

  // 🔸 Local state for form data
  const [data, setData] = useState({
    name: user?.name || '',
    profile_pic: user?.profile_pic || ''
  });

  // 🔄 Jab user prop change ho, to local state update karo
  useEffect(() => {
    setData(prev => ({
      ...prev,
      ...user
    }));
  }, [user]);

  // ✏️ Input ke value change hone par update
  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 📂 "Change Photo" button se file input open karna
  const handleOpenUploadPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();

    uploadPhotoRef.current.click(); // hidden input open
  };

  // 📤 File upload hone ke baad photo ka URL state me store karo
  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const result = await uploadFile(file); // server/cloud pe upload

    if (result?.url) {
      setData(prev => ({
        ...prev,
        profile_pic: result.url
      }));
    }
  };

  // 💾 Form submit (save changes)
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await axios.post(
        `https://complet-chatapp.onrender.com/api/update-user`, data,
        { withCredentials: true }
      );

      // 🟢 Success message
      toast.success(response?.data?.message);

      // 🔁 Redux store update
      if (response.data.success) {
        dispatch(setUser(response.data.data));
        onClose(); // Modal close
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    }
  };

  // 🔚 Return JSX
  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
      <div className="bg-white p-6 m-2 rounded w-full max-w-sm">

        {/* 🧾 Header */}
        <h2 className="font-semibold text-lg">Profile Details</h2>
        <p className="text-sm text-slate-500">Edit user details</p>

        {/* 📝 Form Start */}
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">

          {/* 🔤 Name Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              value={data.name}
              onChange={handleOnChange}
              className="px-2 py-1 border border-gray-300 rounded focus:outline-primary"
              required
            />
          </div>

          {/* 🖼️ Profile Picture Section */}
          <div>
            <label>Photo:</label>
            <div className="mt-1 flex items-center gap-4">
              <Avatar
                width={40}
                height={40}
                imageUrl={data.profile_pic}
                name={data.name}
              />

              <button
                className="text-blue-700 font-medium hover:underline"
                onClick={handleOpenUploadPhoto}
              >
                Change Photo
              </button>

              <input
                ref={uploadPhotoRef}
                type="file"
                id="profile_pic"
                className="hidden"
                onChange={handleUploadPhoto}
              />
            </div>
          </div>

          <Divider />

          {/* ✅ Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border border-primary text-primary px-4 py-1 rounded hover:bg-primary hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
