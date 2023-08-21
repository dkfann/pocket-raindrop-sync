import fetch from "node-fetch";

export interface GetRaindropsResponse {
  result: boolean;
  items: Raindrop[];
  count: number;
  collectionId: number;
}

export interface Raindrop {
  excerpt: string;
  note: string;
  type: string; // An enum
  cover: string; // A URL
  tags: string[];
  removed: boolean;
  title: string;
  link: string;
  created: string; // ISO timestamp
  lastUpdate: string; // ISO timestamp
}

export class RaindropGateway {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async getSavedRaindrops({
    page,
    count,
  }: {
    page: number;
    count: number;
  }) {
    const results = await fetch(
      `https://api.raindrop.io/rest/v1/raindrops/0?page=${page}&perpage=${count}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );

    const data = (await results.json()) as GetRaindropsResponse;

    return data.items;
  }

  public async addRaindrop({ link }: { link: string }) {
    try {
      const results = await fetch(`https://api.raindrop.io/rest/v1/raindrop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link,
          pleaseParse: {},
          tags: ["sync"],
        }),
      });

      const data: any = await results.json();

      if (data.status > 399) {
        throw new Error(
          `Something went wrong with the sync: ${data.errorMessage}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
}
