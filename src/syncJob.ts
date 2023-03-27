import fetch from 'node-fetch'

(async () => {
    console.log('Running sync job!')

    const sync = await fetch('http://localhost:8080/sync', {
        method: 'POST'
    })

    process.exit(0)
})()