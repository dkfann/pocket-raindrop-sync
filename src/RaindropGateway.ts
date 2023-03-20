import fetch from 'node-fetch'

interface GetRaindropsResponse {
    result: boolean
    items: any[]
    count: number
    collectionId: number
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
}