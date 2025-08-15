import React, { useRef, useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  });

  const [uploadPhotoName, setUploadPhotoName] = useState("");
  const fileInputRef = useRef(null); // for triggering file input
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploaded = await uploadFile(file); // assuming it returns { url: '...' }
      setData((prev) => ({
        ...prev,
        profile_pic: uploaded?.url
      }));
      setUploadPhotoName(file.name);
    } catch (err) {
      toast.error("File upload failed");
    }
  };

  const handleClearUploadPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadPhotoName("");
    setData((prev) => ({
      ...prev,
      profile_pic: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `/api/register`;

    try {
      const response = await axios.post(URL, data);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: ""
        });
        setUploadPhotoName("");
        navigate('/email');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    }
  };

  const triggerFileSelect = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  }

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
        <h3>Welcome to Chat app!</h3>

        <form className='grid gap-4 mt-5' onSubmit={handleSubmit}>
          {/* Name */}
          <div className='flex flex-col gap-1'>
            <label htmlFor='name'>Name :</label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter your name'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          {/* Email */}
          <div className='flex flex-col gap-1'>
            <label htmlFor='email'>Email :</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          {/* Password */}
          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password :</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          {/* Profile Photo Upload */}
          <div className='flex flex-col gap-1'>
            <label>Photo :</label>
            <div
              className='h-14 bg-slate-200 flex justify-between items-center border rounded px-2 hover:border-primary cursor-pointer'
              onClick={triggerFileSelect}
            >
              <p className='text-sm max-w-[300px] text-ellipsis overflow-hidden whitespace-nowrap'>
                {uploadPhotoName ? uploadPhotoName : "Upload profile photo"}
              </p>
              {
                uploadPhotoName && (
                  <button className='text-lg ml-2 hover:text-red-600' onClick={handleClearUploadPhoto}>
                    <IoClose />
                  </button>
                )
              }
            </div>
            <input
              type='file'
              ref={fileInputRef}
              id='profile_pic'
              name='profile_pic'
              className='hidden'
              onChange={handleUploadPhoto}
              accept='image/*'
            />
          </div>

          {/* Submit */}
          <button
            type='submit'
            className='bg-blue-700 text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
          >
            Register
          </button>
        </form>

        <p className='my-3 text-center'>
          Already have an account?{" "}
          <Link to={"/email"} className='hover:text-primary font-semibold'>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
