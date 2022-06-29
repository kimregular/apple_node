const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));

app.listen(8080, function () {
    console.log("Hi! This is your node.js server response!");
});

app.get("/pet", function (req, res) {
    res.send("this is where you asked '/pet'");
});

app.get("/beauty", function (req, res) {
    res.send("This is where you can buy beauty stuffs.");
});
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get("/write", function (req, res) {
    res.sendFile(__dirname + "/write.html");
});

app.post("/add", function (req, res) {
    res.send("send complete!");
    console.log(req.body);
});
