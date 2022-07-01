const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();

var db;
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

MongoClient.connect(process.env.DB_URL, function (err, client) {
    app.listen(process.env.PORT, function () {
        if (err) {
            return console.log(err);
        }
        db = client.db("todoapp");

        console.log("Hi! This is your node.js server response and MongoDB!");
    });
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
    db.collection("post").insertOne(
        { title: req.body.title, date: req.body.date },
        function (err, res) {
            console.log("save complete!");
        }
    );

    res.send("send complete!");

    console.log("title : " + req.body.title);
    console.log("date : " + req.body.date);
});

app.get("/list", function (req, res) {
    // post라는 컬렉션안에 있는 모든 데이터를 꺼내주세요.

    db.collection("post")
        .find()
        .toArray(function (err, result) {
            console.log(result);
            res.render("list.ejs", { posts: result });
        });

    console.log("complete");
});
