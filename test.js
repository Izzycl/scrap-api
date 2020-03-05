const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const iconv = require('iconv-lite')
async function main() {
    try {
        const response = await axios({
            url: 'https://www.yapo.cl/magallanes_antartica/todos_los_avisos?ca=14_s&l=0&q=g27&w=1&cmn=',
            responseType: 'arraybuffer'
        })

        const html = iconv.decode(response.data, 'ISO-8859-1');

        const dom = new JSDOM(html);
        console.log(dom.window.document.querySelector(".region").textContent)

      
    } catch (error) {
        
    }
}

main();