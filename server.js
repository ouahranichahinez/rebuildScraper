import express from 'express'
import {bot} from './index.js'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', async (req, res)=>{
    await bot()
    res.send("finished !!!")
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})


