import fetch from "node-fetch";

(async () => {
  console.log("Running sync job!");

  const sync = await fetch("http://localhost:3000/sync", {
    method: "POST",
  });

  process.exit(0);
})();
