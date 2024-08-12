import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // List User's Todo
    router.get('/', auth, async (req, res) => {
        try {
            const { userID } = verifyToken(req.cookies['todox-session']);
            const results = await todoRepository.findByUserID(userID)
            res.status(200).send(results)
        } catch (error) {
            console.error(err)
            res.status(500).send({error: "Something went wrong."})
        }
    })

    // toggle status of a TODO
    router.put('/toggle-status', auth, async(req, res) => {
        const { userID } = verifyToken(req.cookies['todox-session']);
        const { todoID } = req.body

        const result = await todoRepository.toggleStatus({ userID, todoID });
                
        if (!result) {
            return res.status(400).send({error: "An error occurred while updating the status."});
        }

        return res.status(200).send(result)
    })

    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    return router;
}
