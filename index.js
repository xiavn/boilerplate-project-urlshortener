require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");
const mongoose = require("mongoose");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
    url: { type: String, required: true },
});

const UrlModel = mongoose.model("Url", urlSchema);

const urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", urlEncodedParser, async (req, res) => {
    const url = req.body.url;
    const saveUrl = async () => {
        try {
            const urlModel = new UrlModel({ url });
            const savedUrl = await urlModel.save();
            res.json({
                original_url: url,
                short_url: savedUrl.get("_id"),
            });
        } catch (error) {
            console.log(error);
        }
    };
    await dns.lookup(new URL(url).hostname, async (err) => {
        if (err) {
            res.json({ error: "invalid url" });
        } else {
            await saveUrl();
        }
    });
});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
    try {
        const url = await UrlModel.findById(req.params.shortUrl);
        const fullUrl = url.get("url");
        res.redirect(fullUrl);
    } catch (err) {
        console.log(err);
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
