import { setupServer } from './server.js';
import dotenv from 'dotenv';
import { initMongoConnection } from './db/initMongoConnection.js';

dotenv.config();

const start = async () => {
  await initMongoConnection();
  setupServer();
};

start();
