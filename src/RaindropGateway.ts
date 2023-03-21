import fetch from 'node-fetch'

interface GetRaindropsResponse {
    result: boolean
    items: Raindrop[]
    count: number
    collectionId: number
}

interface Raindrop {
    excerpt: string
    note: string
    type: string // An enum
    cover: string // A URL
    tags: string[]
    removed: boolean
    title: string
    link: string
    created: string // ISO timestamp
    lastUpdate: string // ISO timestamp
}

export class RaindropGateway {
    private token: string

    constructor(token: string) {
        this.token = token
    }

    public async getSavedRaindrops({ page, count }: { page: number, count: number }) {
        const results = await fetch(`https://api.raindrop.io/rest/v1/raindrops/0?page=${page}&perpage=${count}`, {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })

        const data = await results.json() as GetRaindropsResponse

        return data.items
    }

    public async addRaindrop({ link }: { link: string }) {
        const results = await fetch(`https://api.raindrop.io/rest/v1/raindrop`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            body: JSON.stringify({
                link,
                pleaseParse: {},
                tags: ["sync"]
            })
        })

        const data = await results.json()

        return data
    }
}