import fetch from 'node-fetch'

interface GetPocketItemsResponse {
    status: number
    complete: number
    list: any
    error: any
    search_meta: any
    since: number
}

export class PocketGateway {
    private consumerKey: string
    private accessToken: string

    constructor(consumerKey: string, accessToken: string) {
        this.consumerKey = consumerKey
        this.accessToken = accessToken
    }

    public async getSavedItems(count: number, options: {
        since?: number,
        offset?: number
    } = {}) {
        const { since, offset } = options

        const results = await fetch("https://getpocket.com/v3/get", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumer_key: this.consumerKey,
                access_token: this.accessToken,
                count,
                ...(since ? { since } : {}),
                ...(offset ? { offset } : {})
            })
        })

        const data = await results.json() as GetPocketItemsResponse

        if (data.error) {
            throw new Error(`Something went wrong with fetching the items: ${data.error}`)
        }

        const { list } = data

        const items = Object.keys(list).map((itemId) => {
            return list[itemId]
        })

        return items
    }
}