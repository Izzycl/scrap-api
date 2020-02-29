const axios = require('axios');
const cheerio = require('cheerio')
const productCtrl = {};

productCtrl.getProducts = async (req, res) => {

    //obtencion de busqueda por url
    const { key }  = req.params
    var uriorigin = `https://www.yapo.cl/chile?q=${key}&cmn=&o=`;
    console.log(uriorigin);

    try {
        const response = await axios({
            url: uriorigin,
        })
        const html = response.data;
        var $ = cheerio.load(html);

        //checkeo si existen productos para la busqueda
        var checkproducts = await $('table[class="TabContainer"] > tbody > tr').find('td > h1').html();

        if (checkproducts === 'No se encontraron entradas') {
            res.send({ 'message': 'no entries found' })
        } else {
            extractProduct();
        }


        async function extractProduct() {
            //busqueda de cantidad de productos 
            var productquantity = await $('li[class="tab_country"]').find('h1 > span ').next().html().trim();
            const regexfil = /1.-.([1-9]|[1-4][0-9]|50).de./mg
            productquantity = productquantity.replace(regexfil, '');
            const regex = /\./gm
            productquantity = productquantity.replace(regex, '');

            console.log('cantidad final de productos:' + productquantity);

            var qpag = Math.floor(productquantity / 50);

            if (qpag === 0) {
                qpag = qpag + 1;
            }

            var alldata = [];

            async function getall(qpag) {
                for (let index = 1; index <= qpag; index++) {
                    const uri = uriorigin + index;
                    var data = await getData(uri);
                    alldata.push.apply(alldata, data);
                }
                res.send(alldata)
                console.log(alldata.length);
            }
            getall(qpag);
        }

    } catch (error) {
        console.log(error);
    }


    async function getData(uri) {
        try {
            const response = await axios({
                url: uri,
            })
            const html = response.data;
            const $ = cheerio.load(html);

            var aData = [];

            function Data(id, title, thumbs, link, price) {
                this.id = id;
                this.title = title;
                this.thumbs = thumbs;
                this.link = link;
                this.price = price;
            }



            $('tr[class="ad listing_thumbs"]').each(function (index, element) {

                var refId = "";
                var refTitle = "";
                var refThumbs = "";
                var refLink = "";
                var refPrice = "";


                try {
                    refId = $(element).attr('id');
                    refTitle = $(element).find('td > a[class="title"]').html();
                    refLink = $(element).find('a[class="redirect-to-url"]').attr('href');

                    if (!$(element).find('td > div > div > div > img[class="image"]').attr('src')) {
                        refThumbs = "assets/prod_default.png";
                    } else {
                        refThumbs = $(element).find('td > div > div > div > img[class="image"]').attr('src').trim()
                    }

                    if (!$(element).find('td > span[class="price"]').html()) {
                        refPrice = 'no price'
                    } else {
                        refPrice = $(element).find('td > span[class="price"]').html().trim();
                    }


                } catch (error) {
                    console.log(error);
                }

                aData.push(new Data(refId, refTitle, refThumbs, refLink, refPrice));


            });
            return aData;
        } catch (error) {
            res.send(error)
        }
    }



}


module.exports = productCtrl;