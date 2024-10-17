const express = require("express");
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(express.json())

const getBtcRate = async () =>
{
    const btcUrl = "https://api.coindesk.com/v1/bpi/currentprice.json";

    try
    {
        const res = await fetch(btcUrl);
        const json = await res.json();
        return json.bpi.USD.rate_float;
    }
    catch(err)
    {
        console.log("Error");
    }
}

app.get("/", (req, res) => {
  res.send("Bonjour, mon nom est Hicham");
});

app.post("/api/converter", async (req, res) => {
    const body = req.body;

    let result = 0;
    let unit = "";
    let code = 200;

    const btcRate = await getBtcRate();

    if(!isNaN(body.value))
    {
        switch(body.type)
        {
            case "feet2meter":
                result = body.value / 3.281;
                unit = "meters"
                break;
            case "meter2feet":
                result = body.value * 3.281;
                unit = "feet"
                break;
            case "celsius2f":
                result = (body.value * 9 / 5) + 32
                unit = "F"
                break;
            case "f2celsius":
                result = (body.value - 32) * 5 / 9
                unit = "C"
                break;
            case "btc2usd":
                result = body.value * btcRate;
                unit = "$"
                break;
            case "usd2btc":
                result = body.value / btcRate;
                unit = "BTC"
                break;
            default:
                result = "Erreur: type de conversion inconnu";
                code = 400;
                break;
        }
    }
    else
    {
        result = "Erreur: valeur non numérique";
        code = 400;
    }

    if(!isNaN(result) && body.type != "btc2usd" && body.type != "usd2btc")
    {
        result = Math.round(result * 100) / 100;
    }

    res.status(code).send(result + " " + unit);
});

app.listen(3000, () => console.log("Mon app écoute bien sur le port 3000."));
