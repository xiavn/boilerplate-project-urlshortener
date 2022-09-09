require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urlEncodedParser = bodyParser.urlencoded({ extended: false });

const shortUrls = [];

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", urlEncodedParser, function (req, res) {
    const url = req.body.url;
    const urlObject = new URL(url);
    dns.lookup(urlObject.hostname, (err) => {
        console.log(err);
        if (err) {
            res.json({ error: "invalid url" });
        } else {
            shortUrls.push(req.body.url);
            res.json({
                original_url: req.body.url,
                short_url: shortUrls.length - 1,
            });
        }
    });
});

app.get("/api/shorturl/:shortUrl", function (req, res) {
    const fullUrl = shortUrls[Number(req.params.shortUrl)];
    res.redirect(fullUrl);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
