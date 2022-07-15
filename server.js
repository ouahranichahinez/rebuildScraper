import express from 'express'
import {getCompaniesPageUrl, getLinkedinUrls} from './bot.js'


const app = express()
const PORT = process.env.PORT || 3000

app.get('/', async (req, res)=>{
    //await bot ()
    const m= await getCompaniesPageUrl()
    res.send("step 1 is finished")
    const n = await getLinkedinUrls(m)
    res.send("Your Script has finished... see you next time :) !")
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})


