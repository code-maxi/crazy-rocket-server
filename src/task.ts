process.on('message', f => {
    (f as () => void)()
    process.send('done')
})