// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();

// const authController = {
//     getToken: async (req, res) => {
//         try {
//             const { email, password } = req.body;
//             const user = await prisma.user.findUnique({ where: { email } });
//             if (!user) return res.status(400).json({ error: 'Invalid credentials' });
//             const valid = await bcrypt.compare(password, user.password);
//             if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
//             const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
//             res.json({ token });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     },
//     register: async (req, res) => {

//         try {
//             console.log(req.body);
//             const { name, email, password, role } = req.body;

//             if(!name || !email || !password || !role) {
//                 return res.status(400).json({ error: 'All fields are required' });
//             }

//             const hashedPassword = await bcrypt.hash(password, 10);

//             const user = await prisma.user.create({
//                 data: { name, email, password: hashedPassword, role },
//             });

//             const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

//             res.status(201).json({ message: 'User registered', user, token });

//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     },
//     login: async (req, res) => {
//         try {
//             const { email, password } = req.body;

//             const user = await prisma.user.findUnique({ where: { email } });
            
//             if (!user) return res.status(400).json({ error: 'Invalid credentials' });
            
//             const valid = await bcrypt.compare(password, user.password);

//             if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

//             const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

//             res.status(200).json({ success: true, token });
            
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }
// };

// export default authController;


// ---------oct 1-------------------------

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// In-memory blacklist (use Redis/DB in production)
let tokenBlacklist = [];

const authController = {
    getToken: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            res.json({ token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword, role },
            });

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(201).json({ message: 'User registered', user, token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(200).json({ success: true, token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    logout: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.split(' ')[1];
            tokenBlacklist.push(token);

            res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get subscriptions for authenticated user
    getSubscriptions: async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const subscriptions = await prisma.subscription.findMany({
                where: { userId: Number(userId) },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json({ success: true, data: subscriptions });
        } catch (error) {
            res.status(500).json({ success: false,error: error.message });
        }
    },
};

// Middleware to verify token & check blacklist
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    if (tokenBlacklist.includes(token)) {
        return res.status(401).json({ error: 'Token is invalid (logged out)' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

export default authController;
