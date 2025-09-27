import bcrypt from 'bcrypt'
import { connectDB } from '@/utils/db'

const dbName = process.env.DB_NAME || "kbook_backend";

export default async function handler(req, res) {
    console.log('/api/auth/signin');
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // OPTIONS 요청 처리 (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        
        if (req.method === 'POST') {
            const { email, password } = req.body;
            
            // 이메일과 비밀번호가 제공되었는지 확인
            if (!email || !password) {
                res.status(400).json({ 
                    success: false, 
                    message: '이메일과 비밀번호를 입력해주세요.' 
                });
                return;
            }
            
            // 데이터베이스에서 사용자 찾기
            let db = (await connectDB).db(dbName);
            let user = await db.collection('user').findOne({ email: email });
            
            if (!user) {
                res.status(401).json({ 
                    success: false, 
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
                });
                return;
            }
            
            // 비밀번호 확인
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                res.status(401).json({ 
                    success: false, 
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
                });
                return;
            }
            
            // 로그인 성공 - 사용자 정보 반환 (비밀번호 제외)
            const { password: _, ...userWithoutPassword } = user;
            
            res.status(200).json({ 
                success: true, 
                message: '로그인이 완료되었습니다.',
                user: userWithoutPassword
            });
            return;
        }
        
        // POST가 아닌 다른 메서드 요청
        res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
        
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ 
            success: false, 
            message: '로그인 중 오류가 발생했습니다.',
            error: error.message 
        });
        return;
    }
}
