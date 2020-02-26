var express = require('express');
var router = express.Router();
var Promise = require('promise');
var xml2js = require('xml2js');
var parser = xml2js.Parser();
var parseString = Promise.denodeify(parser.parseString);
var https = require('https');


/**
*  GET Route for the '/currency' endpoint
*  @param  {JSON Object} req Takes in a JSON request body in the format:
*   {
*     base_currency:   XXX,
*     base_amount:   XXXXX,
*     target_currency: XXX
*   }
*
*  @return {JSON String} The target currency and amount in the format:
*   {
*     results: {
*         target_amount: XXXXX,
*         target_currency: XXX
*     }
*   }
*
*/
router.get('/currency', (req, res) => {
     
    if (!req.body.base_currency) {
        return res.send("Please specify a valid base currency");
    }
    if (!req.body.base_amount || isNaN(req.body.base_amount)) {
        return res.send("Please specify a base amount as a number");
    }
    if (!req.body.target_currency) {
        return res.send("Please specify a target currency");
    }
    
    var base_currency = req.body.base_currency;
    var base_amount = req.body.base_amount;
    var target_currency = req.body.target_currency;
    var xml = __dirname + '/../../public/xmlfiles/eurofxref-daily.xml';

    var xml_req = https.get("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", function (result) {
        let xml = '';
        // Stream xml data into variable
        result.on('data', function(input) {
            xml += input;
        });

        // Pass resulting xml variable into function convertCurrency and return value as 'result'
        result.on('end', function() {
            convertCurrency(xml, base_currency, base_amount, target_currency).then(function (result) {
                if (result === 'target_currency_error') {
                    res.send('Please select a valid target currency');
                } else if (result === 'base_currency_error') {
                    res.send('Please select a valid base currency');
                } else {
                    //Output final response to end user as JSON
                    res.json({ results: { target_currency: target_currency, target_amount: result } });
                }
            });
        });
    });
});

async function convertCurrency(xml, base_currency, base_amount, target_currency) {
    // Await asynchronous parseString call xml2js.Parser().parseString
    var asyncParseString = async (xml) => {
        try {
            var wait = await parseString(xml);
        } catch(e) {
          return e;
        }
        return wait;
    }
    
    // Await results of asynchronous parseString call
    var result = async (xml) => {
        var parsedString = await asyncParseString(xml);
        return parsedString;
    }
    
    out = await result(xml);
    
    //Extract relevant data from standardized XML template
    rates = out['gesmes:Envelope'].Cube[0].Cube[0].Cube;
    
    var currencies = rates.map(row => row.$);
    if (base_currency === 'EUR') {
        var baseRate = 1;
    } else {
        var baseIdx = currencies.map(a => a.currency).indexOf(base_currency);
        if (baseIdx == -1) {
            return ('base_currency_error');
        }
        var baseRate = currencies[baseIdx].rate * 1
    }
    
    if (target_currency === 'EUR') {
        var targetRate = 1;
    } else {
        var targetIdx = currencies.map(a => a.currency).indexOf(target_currency);
        if (targetIdx == -1) {
            return ('target_currency_error');
        }
        var targetRate = currencies[targetIdx].rate * 1
    } 


    var convertedAmount = base_amount / baseRate * targetRate;
    
    return convertedAmount;
}

module.exports = router;