// npm install next-auth
// npm install bcrypt
// npm i --save-dev @types/bcrypt
import NextAuth, { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";            // 비밀번호 암호화용
import { connectDB } from "@/utils/db";

// 구글로그인 OAuth
// 깃허브로그인 OAuth
// 자체DB로그인

const nextauthSecret = process.env.NEXTAUTH_SECRET || "kbook_backend";
const DBName = process.env.DB_NAME || "kbook_backend";

export const authOptions = {
    providers: [
       
        CredentialsProvider({
            // 자체DB 로그인
            name : "credentials",
            credentials:{
                email:{label:"email", type:"text"},
                password:{label:"password", type:"password"}
            },
            
            // 로그인 시도
            async authorize(credentials){
                let db = (await connectDB).db(DBName)
                let user = await db.collection('user').findOne({email:credentials?.email});
                if(!user) return null;

                const ok = await bcrypt.compare(credentials?.password ?? "", user.password);
                if(!ok) return null;

                return{
                    id:String((user )._id),
                    name:(user ).name,
                    email:(user ).email
                 } ;
            }
        }),
    ],
    session:{
        strategy:'jwt',
        maxAge: 2 * 60 * 60
    },
    callbacks:{
        jwt: async({token, user} ) =>{
            if(user){
                token.user={};
                token.user.name = user.name;
                token.user.email = user.email;
            }
            return token;
        },
        session: async({session, token} )=>{
            session.user = token.user;
            return session;
        }
    },
    secret:nextauthSecret
}

export default NextAuth(authOptions);