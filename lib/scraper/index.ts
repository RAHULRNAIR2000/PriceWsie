import axios from "axios";
import * as cheerio from 'cheerio';
import { extractPrice } from "../utils";

export async function scrapAmazonProduct(url:string) {
    if(!url) return;


    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_a7aec018-zone-pricewise:4g7tv8me62l5 -k "http://lumtest.com/myip.json"

    //BrightData proxy config

    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id =(1000000*Math.random()) |0;


    const options = {
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host:'brd.superproxy.io',
        port,
        rejectUnauthorized:false,
    }

    try{
//fetch the product page
const response = await axios.get(url,options);
const $ = cheerio.load(response.data);

//extracting the product title
const title =$('#productTitle').text().trim();
const currentPrice=extractPrice(
$('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay span.a-price-whole'),
$('a.size.base.a-color-price'),
$('.a-button-selected .a-color-base')
);

const originalPrice = extractPrice(
$('#priceblock_ourprice'),
$('.a-price.a-text-price span.a-offscreen'),
$('listPrice'),
$('#priceblock_dealprice'),
$('.a-size-base.a-color-price')
);

const outOfStock = $('#availability span').text().trim().toLowerCase
()==='currently unavailable';
const images = 
$('#imgBlkFront').attr('data-a-dynamic-image') ||
$('#landingImage').attr('data-a-dynamic-image')||
'{}'        

const imageUrls = Object.keys(JSON.parse(images));

console.log({title,currentPrice,originalPrice,outOfStock,imageUrls})

    } catch(error:any){
        throw new Error(`Failed to scrap product: ${error.message}`)
    }
}