import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../redux/userSlice';

const CheckPasswordPage = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const userInfo = location?.state;

  // Redirect to /email if name is missing in state
  useEffect(() => {
    if (!userInfo?.name) {
      navigate('/email');
    }
  }, [location, navigate, userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `https://complet-chatapp.onrender.com/api/password`;

    try {
      const response = await axios.post(URL, {
        userId: userInfo?._id,
        password
      }, {
        withCredentials: true
      });

      console.log(response.data);

      toast.success(response.data.message || "Login successful");

      if (response.data.token) {
        const token = response?.data?.token;
        console.log('token', token);
        dispatch(setToken(token));
        localStorage.setItem('token', token);

        // Clear password field
        setPassword('');

        navigate('/');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>

        {/* Avatar and name */}
        <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
          <Avatar
            width={70}
            height={70}
            name={userInfo?.name}
            imageUrl={userInfo?.profile_pic}
          />
          <h2 className='font-semibold text-lg mt-1'>{userInfo?.name}</h2>
        </div>

        {/* Password form */}
        <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password:</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type='submit'
            className='bg-blue-700 text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
          >
            Login
          </button>
        </form>

        <p className='my-3 text-center'>
          <Link to={"/forgot-password"} className='hover:text-primary font-semibold'>
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckPasswordPage;
