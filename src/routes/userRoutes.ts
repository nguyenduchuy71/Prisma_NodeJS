import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//POST
router.post('/', async (req, res) => {
    const {email, name, username} = req.body;
    try {
        const result = await prisma.user.create({
            data: {
                email,
                name,
                username,
                bio: "Hello, I am coder"
            }
        });
        res.json(result);
    } catch (error) {
        res.status(400).json({erorr: 'Username and email should be unique!'});
    }
});

//GET
router.get('/', async (req, res)=>{
    const allUser = await prisma.user.findMany({include: {tweets: true}});
    res.json(allUser);
});

//GET one
router.get('/:id', async (req, res)=>{
    const { id } = req.params;
    const user = await prisma.user.findUnique({where: {id: Number(id)}, include: {tweets: true}});
    if(user){
        res.json(user);
    }
    else{
        res.status(404).json({erorr: `User with id:${id} not found`});
    }
});

//DELETE one
router.delete('/:id',  async (req, res)=>{
    const { id } = req.params;
    try {
        await prisma.user.delete({where: {id: Number(id)}});
        res.sendStatus(204).json({message: `User with id:${id} is deleted`});
    } catch (error) {
        res.status(404).json({erorr: `User with id:${id} not found`});
    }
});

//PUT one
router.put('/:id', async (req, res)=>{
    const { id } = req.params;
    const {bio, name, image} = req.body;
    try {
        const result = await prisma.user.update({
            where: {id: Number(id)},
            data: {bio, name, image}
        });
        res.json(result); 
    } catch (error) {
        res.status(400).json({error: `Failed to update the user with id: ${id}`});
    }
});

export default router;