import express from 'express';
import userRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import authRoutes from './routes/authRoutes';
import { authenticateToken } from './routes/middlewares/authMiddleware';
 
const app = express();
app.use(express.json());
app.use('/user', authenticateToken, userRoutes);
app.use('/tweet', authenticateToken, tweetRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) =>{
    res.send('Hello! Welcome to NodJS Backend');
});

app.listen(3005, () => {
    console.log('Server is ready at localhost:3005');
});