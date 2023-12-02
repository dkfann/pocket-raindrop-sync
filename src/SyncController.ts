import { PocketGateway } from "./PocketGateway";
import { RaindropGateway, Raindrop } from "./RaindropGateway";
import { DateTime } from "luxon";

export class SyncController {
  private pocketGateway: PocketGateway;
  private raindropGateway: RaindropGateway;
  private lastSyncTime: number;

  constructor(pocketGateway: PocketGateway, raindropGateway: RaindropGateway) {
    this.pocketGateway = pocketGateway;
    this.raindropGateway = raindropGateway;
    this.lastSyncTime = parseInt(
      DateTime.now()
        .setZone("America/Los_Angeles")
        .minus({ hours: 1 })
        .toSeconds()
        .toFixed(0),
      10
    );

    console.log(
      `The last sync time: ${DateTime.fromSeconds(this.lastSyncTime)
        .setZone("America/Los_Angeles")
        .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}`
    );
  }

  async getPocketItemsSinceLastSyncTime() {
    try {
      const newItemsSinceLastSync = await this.pocketGateway.getSavedItems(20, {
        since: this.lastSyncTime,
      });

      return newItemsSinceLastSync;
    } catch (error) {
      console.error(
        `Something went wrong in getPocketItemsSinceLastSyncTime: ${error}`
      );
    }
  }

  async getRaindropsSinceLastSyncTime() {
    try {
      let lastRaindropSinceSyncFound = false;

      let page = 0;

      const unsyncedRaindrops: Raindrop[] = [];

      do {
        const latestRaindrops = await this.raindropGateway.getSavedRaindrops({
          page,
          count: 5,
        });

        for (const raindrop of latestRaindrops) {
          const raindropSyncTimeInSeconds = parseInt(
            DateTime.fromISO(raindrop.lastUpdate).toSeconds().toFixed(0),
            10
          );
          if (raindropSyncTimeInSeconds > this.lastSyncTime) {
            unsyncedRaindrops.push(raindrop);
          } else {
            lastRaindropSinceSyncFound = true;
            break;
          }
        }

        page += 1;
      } while (!lastRaindropSinceSyncFound);

      return unsyncedRaindrops;
    } catch (error) {
      console.error(
        `Something went wrong in getRaindropsSinceLastSyncTime: ${error}`
      );
    }
  }

  async syncPocketAndRaindrop() {
    const pocketItemsSinceLastSyncTime =
      (await this.getPocketItemsSinceLastSyncTime()) || [];
    const raindropsSinceLastSynctime =
      (await this.getRaindropsSinceLastSyncTime()) || [];

    // Sync new Pocket items to Raindrop
    for (const item of pocketItemsSinceLastSyncTime) {
      await this.raindropGateway.addRaindrop({ link: item.resolved_url });
    }

    console.log(
      `Syncing these pocket items: ${pocketItemsSinceLastSyncTime.map(
        item => item.given_url
      )}`
    );
    console.log(
      `The current time is: ${DateTime.now()
        .setZone("America/Los_Angeles")
        .toLocaleString(DateTime.DATETIME_MED)}`
    );

    // Sync new raindrops to Pocket
    for (const raindrop of raindropsSinceLastSynctime) {
      await this.pocketGateway.addItem({ url: raindrop.link });
    }

    console.log(
      `Syncing these raindrop items: ${raindropsSinceLastSynctime.map(
        raindrop => raindrop.link
      )}`
    );
    console.log(
      `The current time is: ${DateTime.now()
        .setZone("America/Los_Angeles")
        .toLocaleString(DateTime.DATETIME_MED)}`
    );

    // Update last sync time after all items have been synced.
    this.lastSyncTime = parseInt(
      DateTime.now().setZone("America/Los_Angeles").toSeconds().toFixed(0),
      10
    );
  }

  async manualSyncPocketToRaindrop(since: number) {
    try {
      const pocketItemsSinceSyncTime =
        (await this.pocketGateway.getSavedItems(100, { since })) || [];

      for (const item of pocketItemsSinceSyncTime) {
        const raindrop = await this.raindropGateway.addRaindrop({
          link: item.resolved_url,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
