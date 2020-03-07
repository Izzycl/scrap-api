const axios = require('axios');
const cheerio = require('cheerio')
const iconv = require('iconv-lite');
const productCtrl = {};
productCtrl.getProducts = async (req, res) => {

    //obtencion de busqueda por url
    var key = req.query.key
    var sortby = req.query.sortby;
    console.log(sortby);
    var uriorigin = `https://www.yapo.cl/chile?q=${key}&cmn=&o=`;
    console.log(uriorigin);

    try {
        const response = await axios({
            url: uriorigin,
            responseType: 'arraybuffer'
        })
        const html = response.data;
        var $ = cheerio.load(html);

        //checkeo si existen productos para la busqueda
        var checkproducts = await $('table[class="TabContainer"] > tbody > tr').find('td > h1').html();

        if (checkproducts === 'No se encontraron entradas') {
            res.send({"notfound": "https://http.cat/204"});
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

            const resto = productquantity % 50;
            console.log('ewa ' + resto);

            console.log(qpag);
            if (resto < 50 && resto > 0) {
                qpag = qpag + 1;
            }

            var alldata = []

            async function getall(qpag) {
                for (let index = 1; index <= qpag; index++) {
                    const uri = uriorigin + index;
                    var data = await getData(uri);
                    alldata.push.apply(alldata, data);
                }


                if (sortby === 'max') {
                    alldata.sort(function (a, b) { return b.price - a.price });
                    res.send(alldata)
                } else if (sortby === 'min') {
                    alldata.sort(function (a, b) { return a.price - b.price });
                    res.send(alldata)
                } else if (sortby === 'none') {
                    res.send(alldata)
                }


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
                responseType: 'arraybuffer'
            })

            const html = iconv.decode(response.data, 'ISO-8859-1');
            const $ = cheerio.load(html, { decodeEntities: false });


            var aData = [];

            function Data(id, title, thumbs, link, price, place, date) {
                this.id = id;
                this.title = title;
                this.thumbs = thumbs;
                this.link = link;
                this.price = price;
                this.place = place;
                this.date = date;
            }

            $('tr[class="ad listing_thumbs"]').each(function (index, element) {

                var refId = "";
                var refTitle = "";
                var refThumbs = "";
                var refLink = "";
                var refPrice = "";
                var refPlace = "";
                var refDate = "";


                try {
                    refId = $(element).attr('id');
                    refTitle = $(element).find('td > a[class="title"]').html();
                    refLink = $(element).find('a[class="redirect-to-url"]').attr('href');
                    refPlace = $(element).find('td > p > span[class="region"]').html() + ' en la comuna de ' + $(element).find('td > p > span[class="commune"]').html();
                    refDate = $(element).find('td > span[class="date"]').html() + ' a las ' + $(element).find('td > span[class="hour"]').html();
                    if (!$(element).find('td > div > div > div > img[class="image"]').attr('src')) {
                        refThumbs = "https://www.yapo.cl/img/prod_default.jpg";
                    } else {
                        refThumbs = $(element).find('td > div > div > div > img[class="image"]').attr('src').trim().replace('thumbsli', 'images')
                    }

                    if (!$(element).find('td > span[class="price"]').html()) {
                        refPrice = '0'
                    } else {
                        refPrice = $(element).find('td > span[class="price"]').html().trim();
                        const regprice = /[^0-9]/gm;
                        refPrice = refPrice.replace(regprice, '');
                    }

                } catch (error) {
                    console.log(error);
                }

                aData.push(new Data(refId, refTitle, refThumbs, refLink, refPrice, refPlace, refDate));


            });
            return aData;
        } catch (error) {
            res.send(error)
        }
    }

}


module.exports = productCtrl;