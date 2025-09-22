import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const authController = {
    getToken: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
            const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    register: async (req, res) => {

        try {
            console.log(req.body);
            const { name, email, password, role } = req.body;

            if(!name || !email || !password || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword, role },
            });

            const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

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

            const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(200).json({ success: true, token });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default authController;
