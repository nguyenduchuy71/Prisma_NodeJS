import {Request, Response, NextFunction} from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const JWT_SCERECT = process.env.JWT_SCERECT || 'ndhuy@gmail.com';

type AuthRequest = Request & {user?: User}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction){
    const authenHeader = req.headers['authorization'];
    const jwtToken = authenHeader?.split(' ')[1];
    if(!jwtToken){
        return res.sendStatus(401);
    }

    // decode the jwt token
    try {
        const payload = await jwt.verify(jwtToken, JWT_SCERECT) as {tokenId: number};
        const dbToken = await prisma.token.findUnique({
            where: { id: payload?.tokenId },
            include:{
                user: true
            }
        });
        if(!dbToken?.valid){
            return res.status(401).json({error: 'API token not valid!'});
        }
        if(dbToken.expiration < new Date()){
            return res.status(401).json({error: 'API token is expired!'});
        }
        req.user = dbToken.user;
    } catch (error) {
        return res.sendStatus(401).json({error: 'Error when authorized!'});
    }
    next();
}