import puppeteer from "puppeteer"
import excel from "exceljs"
import fs from 'fs'
/* scrollToBottom function : To scroll down linkedin page until no node element appears(end) */
		  	
async function scrollToBottom(page) {
  const distance = 200; // should be less than or equal to window.innerHeight
  const delay = 800;
  while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
    await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
    await page.waitForTimeout(delay);
  }
  }

/*FUNCTION TO CHECK IF WE CAN SCRAPE WITH THE CURRENT COOKIE */

async function checkCookie(cookie){

  const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox','--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setCookie({
      'name': 'li_at',
      'value':cookie,
      'domain':".www.linkedin.com"
  })
  const promise = page.waitForNavigation({ waitUntil: 'networkidle2' })
  page.goto('https://www.linkedin.com/company/product-live/people/')
  await promise

  try{
      const total = await page.evaluate(()=>{
      const m= document.querySelectorAll('#main > div.org-grid__content-height-enforcer > div > div.artdeco-card.pv5.pl5.pr1.mt4 > div > div.scaffold-finite-scroll__content > ul > li ').length
      return m ===0 ? true : false
  })
  browser.close()
  if(total){
    console.log('The cookie is expired, please set a new one.')
  }
  else{
    console.log('The cookie still can be used')
  }
  return total
  }catch(e){console.log(e)}
}

async function getCompaniesPageUrl (page){

   /* const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
      })
      const page = await browser.newPage()*/
      const promise = page.waitForNavigation({ waitUntil: 'networkidle2' })	
      try {
      await page.goto('https://www.welcometothejungle.com/fr/jobs?groupBy=job&sortBy=mostRecent&query=&aroundQuery=France%2C+France&refinementList%5Boffice.country_code%5D%5B%5D=FR&refinementList%5Bprofession_name.fr.Tech%5D=&page=1');
      await promise
      }catch(e){
          console.log(e)}
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
              console.log(`getting companies page url is done (% of companies : ${links.length})`)
              await browser.close()	
              return links
      }
      catch(e){
          console.log(e)
      }	
  }

/* searchIngoogle : search in google for eployee name when it is equal to 'user linkedin' */

	async function searchInGoogle(page,text){
    try{
      
      await page.goto('https://www.google.com/');
    }catch(e){console.log(e)}
    try{
      const promise = page.waitForNavigation({ waitUntil: 'networkidle2' })
      await page.waitForSelector('.gLFyf', {visible: true});
      await page.type('.gLFyf', text)
      page.waitForNavigation()
      await page.keyboard.press('Enter')
      await promise
    }catch(e){console.log(e)
      await page.reload({waitUntil:'networkidle2'})
    }
    //	try{await page.waitForSelector(".LC20lb", {visible: true});}catch(e){console.log(e)}
    try{	const total= await page.evaluate(()=>{
        if(document.querySelector('div.g > div > div > div > div:nth-child(1) > div > a > h3')?.textContent){
                  return document.querySelector('div.g > div > div > div > div:nth-child(1) > div > a > h3')?.textContent
              }else if( document.querySelector('div.g > div > div:nth-child(1) > div > a > h3')?.textContent){
                  return document.querySelector('div.g > div > div:nth-child(1) > div > a > h3')?.textContent
              }
      })
      if(total){
        const firstHalf = total.split(' ',2);
        const mm = `${firstHalf[0]} ${firstHalf[1]}`
        return mm
      }else{return ''}
//  	
    }catch(e){console.log(e)}
    }
	/*Get linkedin url for each company         */
		  	
export async function getLinkedinUrls(page,pagesUrls){
     const links= []	
    for (let i = 0; i < pagesUrls.length; i++) {
        const url = pagesUrls[i]; 
        try{         		
           const status =await page.goto(`${url}`, {waitUntil: 'networkidle2'});
           await page.waitForTimeout(3000)
          if(status.status() >= 400)
          {await page.reload({ waitUntil: ["networkidle2", "domcontentloaded"] })}
        }
        catch(e){await page.reload({ waitUntil: ["networkidle2", "domcontentloaded"] })
        }
        try{
        const companyLink= await page.$eval('main > section > div > a',el=>el.href)
        if(companyLink){
          let exist=false
          for(let i=0; i<links.length;i++){
            if(companyLink === links[i])
            {exist=true}
          }
          if(!exist){links.push(companyLink)}
        }	
    }	
    catch(e){console.log(e)}	
  }
    const linkedinurl=[]
    for(let i=0; i< links.length; i++){
      try{
      await page.goto(`${links[i]}`,{waitUntil: 'networkidle2'})
      let total= await page.evaluate(()=>{
        const linksList= document.querySelectorAll('li.ommjf1-5')
        for (e of linksList){
          if((e.querySelector('a i').getAttribute('name') === 'linkedin'))
          {
            return  e.querySelector('a')?.href
          }
        }		
      })
      linkedinurl.push(total)
    }catch(e){console.log(e)}
    }
    console.log('getting linkedin urls is done')
    return linkedinurl
  }
/*Scrape all c-level employees for each company     */
		  	
async function linkedinScraper(browser,page,cookie,linkedinUrls){
		  	
  const page2 = await browser.newPage()
  const fileName = 'LinkedInEmp.xlsx';
  const wb = new excel.Workbook();
  const ws = wb.addWorksheet('employees');
  const headers = [
      { header: 'Company', key: 'fn', width: 25 },
      { header: 'Employee', key: 'ln', width: 35 },
    { header: 'Position', key: 'lm', width: 40 },
  ]
  ws.columns = headers;
    try{	
    await page.setCookie({
      'name': 'li_at',
      'value':cookie,
      'domain':".www.linkedin.com"
    })
    const results=[]
    await page.exposeFunction("searchInGoogle", searchInGoogle);
    for (let i = 0; i < linkedinUrls.length; i++) {
      const url = linkedinUrls[i];
      try{
      await page.goto(`${url}/people`,{waitUntil:'networkidle2'});
      }catch(e){
        console.log(e) 
        await page.reload({waitUntil:'networkidle2'})
      }
      await page.waitForTimeout(1000)
      let title =''
      try{
        title = await page.$eval('div h1 span',el=> el.textContent.trim())
      }catch(e){console.log(e)}
      await scrollToBottom(page)
      const  employeesBio= await page.evaluate(async ()=>{
        const c=[]
        try{
        const lists= document.querySelectorAll('#main > div.org-grid__content-height-enforcer > div > div.artdeco-card.pv5.pl5.pr1.mt4 > div > div.scaffold-finite-scroll__content > ul > li >section > div > div > div:nth-child(2)')
        const dictionary= /founder|fondateur|co-founder|co-fondateur|co founder|co fondateur|director|directeur|ceo|cto|chief \w+ officer/i;
        for(let e of lists){
          const bio= e.querySelector('div:nth-child(2) > div > div')?.textContent.trim()
          if(dictionary.test(bio.toLowerCase())){
            const nameE= e.querySelector('div:nth-child(1)')?.textContent.trim()
            c.push({name: nameE, bio: bio})
          }
        }
      }catch(e){console.log(e)}
        return c
      })
      ws.addRow([title,'-','-'])
      for(let i=0; i<employeesBio.length; i++){
        try{
      if(employeesBio[i].name === 'Utilisateur LinkedIn'){
        const researches = await searchInGoogle(page2,employeesBio[i].bio)
        await page2.waitForTimeout(500)
        ws.addRow(['-',researches, employeesBio[i].bio])
      }else{
      ws.addRow(['-',employeesBio[i].name,employeesBio[i].bio])}
      }catch(e){console.log(e)}
      wb.xlsx
      .writeFile(fileName)
      .then(() => {
        console.log('new employee has been added');
      })
      .catch(err => {
        console.log(err.message);
      });
    }
    }
  }
  catch(e){
    console.log(e)
  }

  
}

  export const bot = async ()=>{
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
      })
    const data=fs.readFileSync('./data.json')
		const c=JSON.parse(data)
    const page = await browser.newPage()
    const pagesUrls= await getCompaniesPageUrl(page)
    const linkedinUrls = await getLinkedinUrls(page,pagesUrls)
	//  const checkin = await checkCookie(c.cookie)
  //  if(!checkin){
  //    //const data=fs.readFileSync('./data.json')
  //    //const c=JSON.parse(data)
  //    //await linkedinScraper(browser,page,c.cookie, linkedinUrls)
  //  }
      await browser.close()	
  }
