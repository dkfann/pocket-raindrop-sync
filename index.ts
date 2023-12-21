import express from "express";
import { SyncController } from "./src/SyncController";
import { PocketGateway } from "./src/PocketGateway";
import { RaindropGateway } from "./src/RaindropGateway";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

const pocketConsumerKey = process.env.POCKET_CONSUMER_KEY!;
const pocketAccessToken = process.env.POCKET_ACCESS_TOKEN!;
const raindropToken = process.env.RAINDROP_TOKEN!;

const pocketGateway = new PocketGateway(pocketConsumerKey, pocketAccessToken);
const raindropGateway = new RaindropGateway(raindropToken);
const syncController = new SyncController(pocketGateway, raindropGateway);

app.get("/", (_, res) => {
  res.send("Hello world!");
});

app.get("/pocket", async (_, res) => {
  const items = await syncController.getPocketItemsSinceLastSyncTime();

  res.send(items);
});

app.get("/raindrop", async (_, res) => {
  const items = await syncController.getRaindropsSinceLastSyncTime();

  res.send(items);
});

app.post("/sync", async (_, res) => {
  try {
    await syncController.syncPocketAndRaindrop();

    res.sendStatus(200);
  } catch (error) {
    console.error(`Something went wrong with performing the sync: ${error}`);
  }
});

app.post("/manual-pocket-sync", async (req, res) => {
  try {
    await syncController.manualSyncPocketToRaindrop(req.body.since);
    res.sendStatus(200);
  } catch (error) {
    console.error(
      `Something went wrong with performing the manual pocket sync: ${error}`
    );
  }
});

app.listen(8080, async () => {
  console.log("Started server");
});
