let express = require('express');
let router = express.Router();
let fs = require('fs');
let xml2js = require('xml2js');
let parser = xml2js.Parser();
let Promise = require('promise');
var readFile = Promise.denodeify(require('fs').readFile);
var parseString = Promise.denodeify(parser.parseString);


/* 
Request Parameters:
- base_currency
- base_amount
- target_currency

Response Parameters:
- target_currency
- target_amount 
*/


async function convertCurrency(xml, base_currency, base_amount, target_currency) {
    
    var asyncParseString = async (xml) => {
        try {
            var wait = await parseString(xml);
        } catch(e) {
          return e;
        }
        return wait;
    }
    
    var result = async (xml) => {
        let parsedString = await asyncParseString(xml);
        return parsedString;
    }
    
    out = await readFile(xml, 'utf-8').then(result);

    rates = out['gesmes:Envelope'].Cube[0].Cube[0].Cube;
    
    let currencies = rates.map(row => row.$);
    if (base_currency === 'EUR') {
        var baseRate = 1;
    } else {
        var baseIdx = currencies.map(a => a.currency).indexOf(base_currency);
        if (baseIdx == -1) {
            res.send("Please enter a valid base currency");
        }
        var baseRate = currencies[baseIdx].rate * 1
    }
    
    if (target_currency === 'EUR') {
        var targetRate = 1;
    } else {
        var targetIdx = currencies.map(a => a.currency).indexOf(target_currency);
        if (targetIdx == -1) {
            res.send("Please enter a valid target currency");
        }
        var targetRate = currencies[targetIdx].rate * 1
    } 

    var convertedAmount = base_amount / baseRate * targetRate;
    
    return convertedAmount;
}

router.get('/currency', (req, res) => {
    //req.query or req.params.{param}
     
    if (!req.query.base_currency) {
        return res.send("Please Specify a Base Currency");
    }
    if (!req.query.base_amount) {
        return res.send("Please Specify a Base Amount");
    }
    if (!req.query.target_currency) {
        return res.send("Please Specify a Target Currency");
    }
    
    var base_currency = req.query.base_currency;
    var base_amount = req.query.base_amount;
    var target_currency = req.query.target_currency;
    var xml = __dirname + '/../../public/xmlfiles/eurofxref-daily.xml';

    convertCurrency(xml, base_currency, base_amount, target_currency).then(function (result) {
        res.json({ target_currency: target_currency, target_amount: result });
    });
    

});

module.exports = router;