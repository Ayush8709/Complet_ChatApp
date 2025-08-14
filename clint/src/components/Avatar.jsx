import React, { useMemo } from 'react';
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';

const Avatar = ({ userId, name, imageUrl, width = 50, height = 50 }) => {
  // 🔄 Redux se online users list laa rahe hain
  const onlineUser = useSelector(state => state?.user?.onlineUser || []);

  // ✂️ Naam se initials generate karte hain (e.g., "Amit Prajapati" => "AP")
  const avatarName = useMemo(() => {
    if (!name) return "";

    const splitName = name.trim().split(" ");
    const first = splitName[0]?.[0] || "";
    const second = splitName[1]?.[0] || "";

    return (first + second).toUpperCase();
  }, [name]);

  // 🎨 Random background color list for name initials avatar
  const bgColor = [
    'bg-slate-200',
    'bg-teal-200',
    'bg-red-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-gray-200',
    'bg-cyan-200',
    'bg-sky-200',
    'bg-blue-200'
  ];

  // 🟦 Random color selected once when component mounts
  const randomColor = useMemo(() => {
    return bgColor[Math.floor(Math.random() * bgColor.length)];
  }, []);

  // 🟢 Check if user is online
  const isOnline = onlineUser.includes(userId);

  return (
    <div
      className="text-slate-800 rounded-full font-bold relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >

      {/* ✅ Show image if available */}
      {imageUrl ? (
        <img
          src={imageUrl}
          width={width}
          height={height}
          alt={name}
          className="overflow-hidden rounded-full object-cover w-full h-full"
        />

      ) : name ? (
        // 🔤 Show initials if no image
        <div
          className={`flex justify-center items-center bg text-lg ${randomColor}`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {avatarName}
        </div>

      ) : (
        // 👤 Default icon if no name and no image
        <PiUserCircle size={width} />
      )}

      {/* 🟢 Online Indicator */}
      {isOnline && (
        <div className="bg-green-600 p-1 absolute bottom-1 -right-1 z-10 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
