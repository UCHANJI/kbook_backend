import bcrypt from 'bcrypt'
import { connectDB } from '@/utils/db'


const dbName = process.env.DB_NAME || "kbook_backend";

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // OPTIONS 요청 처리 (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        console.log('/api/auth/signup');
        
        if (req.method === 'POST') {
            let hash = await bcrypt.hash(req.body?.password, 10);
            req.body.password = hash;
            
            let db = (await connectDB).db(dbName);
            await db.collection('user').insertOne(req.body);
            
            // 리다이렉트 대신 JSON 응답으로 변경
            res.status(201).json({ 
                success: true, 
                message: '회원가입이 완료되었습니다.' 
            });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: 'signup failed: ' + error });
        return;
    }
}