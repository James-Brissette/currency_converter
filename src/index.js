var express = require('express');
var app = express();
var cors = require('cors'
)
var bodyParser = require('body-parser');
var currencyRoute = require ('./routes/currency');

app.use(cors())
app.use(bodyParser.json());
app.use(currencyRoute);
app.use(express.static('public'));

//Handler for 404 - Resource Not Found
app.use((req, res, next) => {
    res.status(404).send("You're a long way from home...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.info(`Server has started on ${PORT}`));



