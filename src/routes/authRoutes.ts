import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import  jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION = 10;
const JWT_SCERECT = process.env.JWT_SCERECT || 'ndhuy@gmail.com';

function generateEmailToken():string {
    return Math.floor(1000000 + Math.random()*9000000).toString();
}

function generateAuthenToken(tokenId: number):string {
    const jwtPayload = {tokenId};
    return jwt.sign(jwtPayload, JWT_SCERECT, {
        algorithm:'HS256',
        noTimestamp: true
    });
}
// Create use if not exist
// generate the emailTOken and send it to their mail
router.post('/login', async (req, res) => {
    const { email } = req.body;
    try {
        // generate token
        const emailToken = generateEmailToken();
        const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION * 60 * 1000);
        const createdToken = await prisma.token.create({
            data:{
                type: 'EMAIL',
                emailToken,
                expiration,
                user: {
                    connectOrCreate: {
                        where: { email },
                        create: { email, name:'', username:'' },
                    },
                },
            },
        });
        return res.sendStatus(200);   
    } catch (error) {
        return res.send(400).json({error: "Couldn't start the authentication process!"});
    }
});

// validate the emailToken
// Generate a long-lived JWT token
router.post('/authenticate', async (req, res) => {
    const {email, emailToken} = req.body;
    const dbEmailToken = await prisma.token.findUnique({
        where:{
            emailToken,
        },
        include:{
            user: true,
        }
    });
    if(!dbEmailToken || !dbEmailToken.valid){
        return res.status(401).json({error: 'Unthorized'});
    }
    if(dbEmailToken.expiration < new Date()){
        return res.status(401).json({error: 'Token is expired!'});
    }
    if(dbEmailToken?.user?.email !== email){
        return res.sendStatus(401).json({error: 'Not your token'});
    }
    const expiration = new Date(
        new Date().getTime() + 360 * 60 * 1000
    );
    const apiToken = await prisma.token.create({
        data:{
            type: 'API',
            expiration,
            user: {
                connect:{
                    email,
                },
            },
        },
    });
    // Invalid the email
    await prisma.token.update({
        where:{id: dbEmailToken.id},
        data: {valid: false}
    });

    // generate JWT token
    const authenToken = generateAuthenToken(apiToken.id);

    return res.json({authenToken});
});


export default router;