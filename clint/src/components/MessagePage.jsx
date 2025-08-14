import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import {
  FaAngleLeft, FaPlus, FaImage, FaVideo
} from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { IoMdSend } from 'react-icons/io';


import Avatar from './Avatar';
import uploadFile from '../helpers/uploadFile';
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg';

const MessagePage = () => {
  const params = useParams(); // Get receiver userId from URL
  const socketConnection = useSelector(state => state?.user?.socketConnection);
  const user = useSelector(state => state?.user);

  const [receiver, setReceiver] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  });

  const [openUploadOptions, setOpenUploadOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });

  const [allMessages, setAllMessages] = useState([]);
  const scrollRef = useRef(null);

  // 🔽 Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessages]);

  // 🔌 Connect socket and fetch conversation
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setReceiver(data);
      });

      socketConnection.on('message', (data) => {
        setAllMessages(data);
      });
    }
  }, [socketConnection, params.userId, user]);

  // 📤 Upload image
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const upload = await uploadFile(file);
    setMessage(prev => ({ ...prev, imageUrl: upload.url }));
    setOpenUploadOptions(false);
    setLoading(false);
  };

  // 📤 Upload video
  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const upload = await uploadFile(file);
    setMessage(prev => ({ ...prev, videoUrl: upload.url }));
    setOpenUploadOptions(false);
    setLoading(false);
  };

  // 🧽 Remove image/video
  const clearImage = () => setMessage(prev => ({ ...prev, imageUrl: "" }));
  const clearVideo = () => setMessage(prev => ({ ...prev, videoUrl: "" }));

  // 💬 Handle text input
  const handleChange = (e) => {
    setMessage(prev => ({ ...prev, text: e.target.value }));
  };

  // 📨 Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const { text, imageUrl, videoUrl } = message;

    if (text || imageUrl || videoUrl) {
      socketConnection.emit('new message', {
        sender: user._id,
        receiver: params.userId,
        text,
        imageUrl,
        videoUrl,
        msgByUserId: user._id
      });
      setMessage({ text: "", imageUrl: "", videoUrl: "" });
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className="bg-no-repeat bg-cover">

      {/* 🧭 Header */}
      <header className="sticky top-0 bg-white h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <Avatar width={50} height={50} imageUrl={receiver.profile_pic} name={receiver.name} userId={receiver._id} />
          <div>
            <h3 className="font-semibold text-lg">{receiver.name}</h3>
            <p className="text-sm text-slate-400">
              {receiver.online ? <span className="text-primary">Online</span> : "Offline"}
            </p>
          </div>
        </div>
        <button className="hover:text-primary">
          <HiDotsVertical />
        </button>
      </header>

      {/* 💬 Message Area */}
      <section className="h-[calc(100vh-128px)] overflow-y-scroll p-2 relative  bg-slate-200 bg-opacity-50">
        <div className="flex flex-col gap-2" ref={scrollRef}>
          {allMessages.map((msg, idx) => {
            const isMine = user._id === msg.msgByUserId;
            return (
              <div
                key={idx}
                className={`p-2 rounded max-w-md w-fit ${isMine ? 'ml-auto bg-teal-100' : 'bg-white'}`}
              >
                {msg.imageUrl && <img src={msg.imageUrl} className="object-scale-down w-full" />}
                {msg.videoUrl && <video src={msg.videoUrl} controls className="object-scale-down w-full" />}
                {msg.text && <p>{msg.text}</p>}
                <p className="text-xs text-right">{moment(msg.createdAt).format('hh:mm A')}</p>
              </div>
            );
          })}
        </div>

        {/* 🖼️ Preview Image Upload */}
        {message.imageUrl && (
          <div className="sticky bottom-0 bg-slate-700 bg-opacity-40 p-2 flex justify-center">
            <div className="relative bg-white p-3 rounded max-w-sm">
              <button onClick={clearImage} className="absolute top-2 right-2 text-red-600">
                <IoClose size={24} />
              </button>
              <img src={message.imageUrl} alt="Preview" className="object-scale-down w-full" />
            </div>
          </div>
        )}

        {/* 📹 Preview Video Upload */}
        {message.videoUrl && (
          <div className="sticky bottom-0 bg-slate-700 bg-opacity-40 p-2 flex justify-center">
            <div className="relative bg-white p-3 rounded max-w-sm">
              <button onClick={clearVideo} className="absolute top-2 right-2 text-red-600">
                <IoClose size={24} />
              </button>
              <video src={message.videoUrl} controls autoPlay muted className="object-scale-down w-full" />
            </div>
          </div>
        )}

        {/* ⏳ Loading */}
        {loading && (
          <div className="sticky bottom-0 flex justify-center">
            <Loading />
          </div>
        )}
      </section>

      {/* 📤 Message Input Area */}
      <section className="h-16 bg-white flex items-center px-4  gap-2">
        {/* ➕ Upload Options */}
        <div className="relative">
          <button onClick={() => setOpenUploadOptions(!openUploadOptions)} className="w-11 h-11 rounded-full hover:bg-primary hover:text-white flex items-center justify-center">
            <FaPlus />
          </button>

          {openUploadOptions && (
            <div className="absolute bottom-14 left-0 bg-white rounded shadow-md w-36">
              <label htmlFor="uploadImage" className="flex items-center gap-2 px-3 py-2 hover:bg-slate-200 cursor-pointer">
                <FaImage className="text-primary" /> Image
              </label>
              <label htmlFor="uploadVideo" className="flex items-center gap-2 px-3 py-2 hover:bg-slate-200 cursor-pointer">
                <FaVideo className="text-purple-500" /> Video
              </label>
              <input type="file" id="uploadImage" className="hidden" onChange={handleUploadImage} />
              <input type="file" id="uploadVideo" className="hidden" onChange={handleUploadVideo} />
            </div>
          )}
        </div>

        {/* 📝 Message Input */}
        <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full h-full px-4 py-2 outline-none"
            value={message.text}
            onChange={handleChange}
          />
          <button type="submit" className="text-primary hover:text-secondary">
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
