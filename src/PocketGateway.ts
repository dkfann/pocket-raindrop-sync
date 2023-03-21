import fetch from 'node-fetch'

interface GetPocketItemsResponse {
    status: number
    complete: number
    list: any
    error: any
    search_meta: any
    since: number
}

// Partial interface with properties that might be used
interface PocketItem {
    item_id: string
    resolved_id: string
    given_url: string
    given_title: string
    favorite: string // Represented as a digit (ex. "0")
    status: string // Represented as a digit (ex. "0")
    time_added: string // Epoch seconds
    time_updated: string // Epoch seconds
    sort_id: number
    resolved_title: string
    resolved_url: string
    domain_metadata: {
        name: string
        logo: string
        greyscale_logo: string
    }
    excerpt: string
}

interface AddItemResponse {
    item: any
    status: string
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
            return list[itemId] as PocketItem
        })

        return items
    }

    public async addItem({ url }: { url: string }) {
        const results = await fetch("https://getpocket.com/v3/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumer_key: this.consumerKey,
                access_token: this.accessToken,
                url: encodeURI(url),
                tags: ['sync']
            })
        })

        const data = await results.json() as AddItemResponse

        if (!results.ok) {
            throw new Error(`(${results.status}) Something went wrong with adding the item: ${results.body}`)
        }

        return data
    }
}