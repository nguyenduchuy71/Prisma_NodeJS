import {Router} from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//POST
router.post('/', async (req, res) => {
    const {content, image} = req.body;
    // @ts-ignore
    const user = req.user;
    try {
        const result = await prisma.tweet.create({
            data: {
                content,
                image,
                userId: user.id,
            }
        });
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({erorr: `User with id: ${user?.id} not existed.`});
    }
});

//GET
router.get('/', async (req, res)=>{
    const allTweet = await prisma.tweet.findMany({include: {user: true}});
    res.json(allTweet);
});

//GET one
router.get('/:id', async (req, res)=>{
    const { id } = req.params;
    const newTweet = await prisma.tweet.findUnique({where: {id: Number(id)}});
    if(newTweet){
        res.json(newTweet);
    }
    else{
        res.status(404).json({erorr: `Tweet with id:${id} not found`});
    }
});

//DELETE one
router.delete('/:id',  async (req, res)=>{
    const { id } = req.params;
    try {
        await prisma.tweet.delete({where: {id: Number(id)}});
        res.status(204).json({message: `Tweet with id:${id} is deleted`});
    } catch (error) {
        res.status(404).json({erorr: `Tweet with id:${id} not found`});
    }
});

//PUT one
router.put('/:id', async (req, res)=>{
    const { id } = req.params;
    const {content, image} = req.body;
    try {
        const result = await prisma.tweet.update({
            where: {id: Number(id)},
            data: {content, image}
        });
        res.status(201).json(result); 
    } catch (error) {
        res.status(400).json({error: `Failed to update the tweet with id: ${id}`});
    }
});

export default router;
