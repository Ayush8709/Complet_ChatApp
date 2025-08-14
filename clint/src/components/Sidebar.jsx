import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// 🧩 Icons
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { FiArrowUpLeft } from "react-icons/fi";
import { FaImage, FaVideo } from "react-icons/fa6";

// 🧩 Components
import Avatar from './Avatar';
import EditUserDetails from './EditUserDetails';
import SearchUser from './SearchUser';
import { logout } from '../redux/userSlice';

const Sidebar = () => {
    // 🔍 Redux store se current user aur socketConnection le rahe hain
    const user = useSelector(state => state?.user);
    const socketConnection = useSelector(state => state?.user?.socketConnection);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 🎛️ Local State
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [openSearchUser, setOpenSearchUser] = useState(false);
    const [allUser, setAllUser] = useState([]);

    // 🧠 Side Effect: Socket se conversation data fetch karna
    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('sidebar', user._id);

            socketConnection.on('conversation', (data) => {
                const conversationUserData = data.map(conversationUser => {
                    // 🧩 Kaun user dikhana hai conversation me?
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return { ...conversationUser, userDetails: conversationUser?.sender };
                    } else if (conversationUser?.receiver?._id !== user?._id) {
                        return { ...conversationUser, userDetails: conversationUser.receiver };
                    } else {
                        return { ...conversationUser, userDetails: conversationUser.sender };
                    }
                });

                setAllUser(conversationUserData);
            });
        }
    }, [socketConnection, user]);

    // 🚪 Logout handler
    const handleLogout = () => {
        dispatch(logout());
        navigate("/email");
        localStorage.clear();
    };

    return (
        <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>

            {/* 🔹 Left Sidebar - Icon Bar */}
            <div className='bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 flex flex-col justify-between'>

                {/* 🔘 Top Icons */}
                <div>
                    <NavLink 
                        title='Chat'
                        className={({ isActive }) =>
                            `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive && "bg-slate-200"}`
                        }
                    >
                        <IoChatbubbleEllipses size={20} />
                    </NavLink>

                    <div
                        title='Add Friend'
                        onClick={() => setOpenSearchUser(true)}
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
                    >
                        <FaUserPlus size={20} />
                    </div>
                </div>

                {/* 🔘 Bottom Icons: Avatar + Logout */}
                <div className='flex flex-col items-center '>
                    <button
                        title={user?.name}
                        onClick={() => setEditUserOpen(true)}
                    >
                        <Avatar
                            width={40}
                            height={40}
                            name={user?.name}
                            imageUrl={user?.profile_pic}
                            userId={user?._id}
                        />
                    </button>

                    <button
                        title='Logout'
                        onClick={handleLogout}
                        className='w-12 h-12 flex justify-center items-center hover:bg-slate-200 rounded'
                    >
                        <BiLogOut size={20} />
                    </button>
                </div>
            </div>

            {/* 🔹 Main Chat Sidebar */}
            <div className='w-full'>

                {/* 🔘 Header */}
                <div className='h-16 flex items-center'>
                    <h2 className='text-xl font-bold p-4 text-slate-800'>Message</h2>
                </div>
                <div className='bg-slate-200 p-[0.5px]'></div>

                {/* 🔘 User List */}
                <div className='h-[calc(100vh-65px)] overflow-y-auto scrollbar'>

                    {/* 🚫 No conversations yet */}
                    {allUser.length === 0 && (
                        <div className='mt-12 text-center text-slate-400'>
                            <div className='flex justify-center my-4 text-slate-500'>
                                <FiArrowUpLeft size={50} />
                            </div>
                            <p className='text-lg'>Explore users to start a conversation with.</p>
                        </div>
                    )}

                    {/* ✅ List of conversations */}
                    {allUser.map(conv => (
                        <NavLink
                            to={`/${conv?.userDetails?._id}`}
                            key={conv?._id}
                            className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'
                        >
                            <Avatar
                                imageUrl={conv?.userDetails?.profile_pic}
                                name={conv?.userDetails?.name}
                                width={40}
                                height={40}
                            />
                            <div>
                                <h3 className='font-semibold text-base line-clamp-1 '>{conv?.userDetails?.name}</h3>

                                <div className='text-slate-500 text-xs flex items-center gap-1'>
                                    {/* 📷 Image */}
                                    {conv?.lastMsg?.imageUrl && (
                                        <span className='flex items-center gap-1'>
                                            <FaImage />
                                            {!conv?.lastMsg?.text && <span>Image</span>}
                                        </span>
                                    )}

                                    {/* 🎥 Video */}
                                    {conv?.lastMsg?.videoUrl && (
                                        <span className='flex items-center gap-1 '>
                                            <FaVideo />
                                            {!conv?.lastMsg?.text && <span>Video</span>}
                                        </span>
                                    )}

                                    {/* 📝 last Mesage */}
                                    <p className='text-ellipsis line-clamp-1 '>{conv?.lastMsg?.text}</p>
                                </div>
                            </div>

                            {/* 🔔 Unseen messages */}
                            {Boolean(conv?.unseenMsg) && (
                                <p className='ml-auto w-6 h-6 p-1 bg-primary text-white text-xs flex justify-center items-center font-semibold rounded-full'>
                                    {conv?.unseenMsg}
                                </p>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* ✏️ Edit user details modal */}
            {editUserOpen && (
                <EditUserDetails
                    onClose={() => setEditUserOpen(false)}
                    user={user}
                />
            )}

            {/* 🔍 Search user modal */}
            {openSearchUser && (
                <SearchUser onClose={() => setOpenSearchUser(false)} />
            )}
        </div>
    );
};

export default Sidebar;
