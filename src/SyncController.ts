import { PocketGateway } from './PocketGateway'
import { RaindropGateway } from './RaindropGateway'
import { DateTime } from 'luxon'

export class SyncController {
    private pocketGateway: PocketGateway
    private raindropGateway: RaindropGateway
    private lastSyncTime: number

    constructor(pocketGateway: PocketGateway, raindropGateway: RaindropGateway) {
        this.pocketGateway = pocketGateway
        this.raindropGateway = raindropGateway
        this.lastSyncTime = parseInt(DateTime.now().minus({ hours: 24 }).toSeconds().toFixed(0), 10)
    }

    async getPocketItemsSinceLastSyncTime() {
        try {
            const newItemsSinceLastSync = await this.pocketGateway.getSavedItems(20, { since: this.lastSyncTime })

            return newItemsSinceLastSync
        } catch (error) {
            console.error(`Something went wrong in getPocketItemsSinceLastSyncTime: ${error}`)
        }
    }

    async getRaindropsSinceLastSyncTime() {
        try {
            let lastRaindropSinceSyncFound = false

            let page = 0

            const unsyncedRaindrops: any[] = []

            do {
                const latestRaindrops = await this.raindropGateway.getSavedRaindrops({ page, count: 5 })

                for (const raindrop of latestRaindrops) {
                    const raindropSyncTimeInSeconds = parseInt(DateTime.fromISO(raindrop.lastUpdate).toSeconds().toFixed(0), 10)
                    if (raindropSyncTimeInSeconds > this.lastSyncTime) {
                        unsyncedRaindrops.push(raindrop)
                    } else {
                        lastRaindropSinceSyncFound = true
                        break
                    }
                }

                page += 1
            } while (!lastRaindropSinceSyncFound)

            return unsyncedRaindrops
        } catch (error) {
            console.error(`Something went wrong in getRaindropsSinceLastSyncTime: ${error}`)
        }
    }

    async syncPocketAndRaindrop() {
        const pocketItemsSinceLastSyncTime = await this.getPocketItemsSinceLastSyncTime() || []
        const raindropsSinceLastSynctime = await this.getRaindropsSinceLastSyncTime() || []

        // Sync new Pocket items to Raindrop
        for (const item of pocketItemsSinceLastSyncTime) {
            await this.raindropGateway.addRaindrop({ link: item.resolved_url })
        }

        // Sync new raindrops to Pocket
        for (const raindrop of raindropsSinceLastSynctime) {
            await this.pocketGateway.addItem({ url: raindrop.link })
        }

        // Update last sync time after all items have been synced.
        this.lastSyncTime = parseInt(DateTime.now().toSeconds().toFixed(0), 10)
    }
}