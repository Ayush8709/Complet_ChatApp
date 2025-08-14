// uploadFile.js

// Cloudinary config
const CLOUD_NAME = "dmwidq4go"; // your Cloudinary name
const UPLOAD_PRESET = "chat-app-file"; // must be an unsigned upload preset

// Cloudinary upload endpoint
const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

// File upload function
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET); // only works with unsigned preset

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    return responseData; // includes URL of uploaded file
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};

export default uploadFile;
