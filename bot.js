import puppeteer from "puppeteer"

async function getCompaniesPageUrl (){
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox','--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      const promise = page.waitForNavigation({ waitUntil: 'networkidle2' })	
      /*await page.evaluateOnNewDocument(() => {
          enterPressed = false
          document.addEventListener("keydown", e => {
            if (e.code === "Enter") {
              enterPressed = true;
            }
          })
        })*/
      try {
      await page.goto('https://www.welcometothejungle.com/fr/jobs?groupBy=job&sortBy=mostRecent&query=&aroundQuery=France%2C+France&refinementList%5Boffice.country_code%5D%5B%5D=FR&refinementList%5Bprofession_name.fr.Tech%5D=&page=1');
      await promise
      }catch(e){
          console.log(e)}
  /*	try {
          await page.waitForFunction("enterPressed");		
      }catch(e){
          console.log(e)
      }*/
      try{

              const links= await page.evaluate(()=>{
                  const total =[]
                  linkslist= document.querySelectorAll('li.ais-Hits-list-item article div:nth-child(1) a')
                  if(linkslist.length===0){
                      console.log('no posts for now')
                      return
                  }
                  for(let e of linkslist)
                      {total.push(e.href)}	
                  return total
              })
              console.log("getting companies page url is done")
              await browser.close()	
              return links
      }
      catch(e){
          console.log(e)
      }	
  }
  



  export const bot = async ()=>{
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox','--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      const pagesUrls= await getCompaniesPageUrl()
      //const linkedinUrls = await getLinkedinUrls(page,pagesUrls)
      //await update()
      //const data=fs.readFileSync('./cookies.json')
      //const c=JSON.parse(data)
      //await linkedinScraper(browser,page,c.cookie, linkedinUrls)
      await browser.close()	
  }
