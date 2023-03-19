import { PocketGateway } from './PocketGateway'
import { DateTime } from 'luxon'

export class SyncController {
    private pocketGateway: PocketGateway
    private lastSyncTime: number

    constructor(pocketGateway: PocketGateway) {
        this.pocketGateway = pocketGateway
        this.lastSyncTime = parseInt(DateTime.now().minus({ hours: 24 }).toSeconds().toFixed(0), 10)
    }

    async getPocketItemsSinceLastSyncTime() {
        try {
            const newItemsSinceLastSync = await this.pocketGateway.getSavedItems(20, { since: this.lastSyncTime })

            console.log(newItemsSinceLastSync)

            return newItemsSinceLastSync
        } catch (error) {
            console.error(`Something went wrong in getPocketItemsSinceLastSyncTime: ${error}`)
        }
    }
}