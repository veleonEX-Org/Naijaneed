import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for secure cookies on Render/Heroku
app.set('trust proxy', 1);

app.use('/uploads', express.static('uploads'));

// Security Middleware
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://192.168.56.1:3000',
  'http://192.168.56.1:3001',
  'http://localhost:3001',
  "https://naija-need.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { error: 'Too many registration attempts. Please try again after 15 minutes.' }
});

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate Limit sensitive routes
app.use('/api/auth/register', authLimiter);
app.use('/api/admin/auth/login', authLimiter);
app.use('/api/partner/auth/login', authLimiter);

// Use Routes
app.use('/api', routes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'NaijaNeed API Running - v1.0.2' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
