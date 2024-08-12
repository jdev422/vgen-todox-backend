import { ObjectId } from 'mongodb';

export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findByUserID(userID) {
        return await collection.find({ userID }).sort({ createdAt: 1 }).toArray()
    }

    async function toggleStatus({ userID, todoID }) {
        try {
            const result = await collection.findOneAndUpdate(
                {
                    _id: new ObjectId(todoID),
                    userID,
                },
                [
                    {
                        $set: { completed: { $not: "$completed" } }
                    }
                ],
                { returnDocument: 'after' }
            )
            return result.value
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    return {
        insertOne,
        findByUserID,
        toggleStatus
    };
};