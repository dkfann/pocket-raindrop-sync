import express from 'express'
import { SyncController } from './src/SyncController'
import { PocketGateway } from './src/PocketGateway'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())

const consumerKey = process.env.CONSUMER_KEY!
const accessToken = process.env.ACCESS_TOKEN!

const pocketGateway = new PocketGateway(consumerKey, accessToken)
const syncController = new SyncController(pocketGateway)

app.get('/', (_, res) => {
    res.send('Hello world!')
})

app.get('/pocket', async (_, res) => {
    const items = await syncController.getPocketItemsSinceLastSyncTime()

    res.send(items)
})

app.listen(3000, () => {
    console.log('Started server')
})
