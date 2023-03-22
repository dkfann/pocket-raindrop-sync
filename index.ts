import express from 'express'
import { SyncController } from './src/SyncController'
import { PocketGateway } from './src/PocketGateway'
import { RaindropGateway } from './src/RaindropGateway'
import dotenv from 'dotenv'
import Bree from 'bree'
import path from 'path'

dotenv.config()

const app = express()

app.use(express.json())

const bree = new Bree({
    jobs: [
        {
            name: 'syncJob.ts',
            path: path.join(__dirname, 'src', 'syncJob.ts'),
            interval: '1h'
        }
    ]
})

const pocketConsumerKey = process.env.POCKET_CONSUMER_KEY!
const pocketAccessToken = process.env.POCKET_ACCESS_TOKEN!
const raindropToken = process.env.RAINDROP_TOKEN!

const pocketGateway = new PocketGateway(pocketConsumerKey, pocketAccessToken)
const raindropGateway = new RaindropGateway(raindropToken)
const syncController = new SyncController(pocketGateway, raindropGateway)

app.get('/', (_, res) => {
    res.send('Hello world!')
})

app.get('/pocket', async (_, res) => {
    const items = await syncController.getPocketItemsSinceLastSyncTime()

    res.send(items)
})

app.get('/raindrop', async (_, res) => {
    const items = await syncController.getRaindropsSinceLastSyncTime()

    res.send(items)
})

app.post('/sync', async (_, res) => {
    try {
        await syncController.syncPocketAndRaindrop()

        res.sendStatus(200)
    } catch (error) {
        console.error(`Something went wrong with performing the sync: ${error}`)
    }
})

app.listen(3000, async () => {
    console.log('Started server')
    bree.start()
})
