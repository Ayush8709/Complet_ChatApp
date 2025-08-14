import express from 'express';
import registerUser from '../controller/registerUser.js';
import checkEmail from '../controller/chekEmail.js';
import checkPassword from '../controller/checkPassword.js';
import userDetails from '../controller/userDetails.js';
import logout from '../controller/logout.js';
import updateUserDetails from '../controller/updateDetails.js';
import searchUser from '../controller/searchUser.js';

const router = express.Router();

// Create user API
router.post('/register', registerUser);

// Check user email
router.post('/email', checkEmail);

// Check user password
router.post('/password', checkPassword);

// Login user details
router.get('/user-details', userDetails);

// Logout user
router.get('/logout', logout);

// Update user details
router.post('/update-user', updateUserDetails);

// Search user
router.post('/search-user', searchUser);

export default router;
