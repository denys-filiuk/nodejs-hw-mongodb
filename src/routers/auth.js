import express from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../controllers/auth.js';

import { validateBody } from '../middlewares/validateBody.js';
import { sendResetEmailController } from '../controllers/sendResetEmailController.js';
import { sendResetEmailSchema } from '../schemas/sendResetEmailSchema.js';
import { resetPasswordController } from '../controllers/resetPasswordController.js';
import { resetPasswordSchema } from '../schemas/resetPasswordSchema.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshSession);
router.post('/logout', logoutUser);

router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  sendResetEmailController,
);

router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

export default router;
