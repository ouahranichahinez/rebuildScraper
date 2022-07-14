import express from 'express'
import {bot,getLinkedinUrls} from './bot.js'


const app = express()
const PORT = process.env.PORT || 3000

app.get('/', async (req, res)=>{
    await bot()
    await getLinkedinUrls()
    res.send("Your Script has finished... see you next time :) !")
})

app.listen(PORT, () => {
    console.log(`listening on port khra ${PORT}`)
})


