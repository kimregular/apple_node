const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true }));
require("dotenv").config();

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
    session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

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
    res.render(__dirname + "/views/index.ejs");
});
app.get("/write", function (req, res) {
    res.render(__dirname + "/views/write.ejs");
});

app.post("/add", function (req, res) {
    db.collection("counter").findOne(
        { name: "게시물개수" },
        function (err, result) {
            console.log("result : " + result.totalPost);
            var 총게시물개수 = result.totalPost;
            db.collection("post").insertOne(
                {
                    _id: 총게시물개수 + 1,
                    title: req.body.title,
                    date: req.body.date,
                },
                function (err, res) {
                    console.log("save complete!");
                    db.collection("counter").updateOne(
                        { name: "게시물개수" },
                        { $inc: { totalPost: 1 } },
                        function (err, result) {
                            if (err) {
                                return console.log(err);
                            } else {
                                return console.log(result);
                            }
                        }
                    );
                }
            );
        }
    );

    res.send("send complete!");

    // res.redirect("/write");

    console.log("title : " + req.body.title);
    console.log("date : " + req.body.date);
});

app.get("/list", function (req, res) {
    // post라는 컬렉션안에 있는 모든 데이터를 꺼내주세요.

    db.collection("post")
        .find()
        .toArray(function (err, result) {
            // console.log(result);
            res.render("list.ejs", { posts: result });
        });

    // console.log("complete");
});

app.delete("/delete", function (req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection("post").deleteOne(req.body, function (err, result) {
        console.log("삭제완료");
        res.status(200).send({ message: "성공했습니다." });
    });
});

app.get("/detail/:id", function (req, res) {
    db.collection("post").findOne(
        { _id: parseInt(req.params.id) },
        function (err, result) {
            console.log(result);
            res.render("detail.ejs", { data: result });
        }
    );
});

app.get("/edit/:id", function (req, res) {
    db.collection("post").findOne(
        { _id: parseInt(req.params.id) },
        function (err, result) {
            res.render("edit.ejs", { post: result });
        }
    );
});

app.put("/edit", function (req, res) {
    db.collection("post").updateOne(
        { _id: parseInt(req.body.id) },
        { $set: { title: req.body.title, date: req.body.date } },
        function (err, result) {
            console.log("수정완료");
            res.redirect("/list");
        }
    );
});

app.get("/login", function (req, res) {
    res.render("login.ejs");
});

app.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/fail",
    }),
    function (req, res) {
        res.redirect("/");
    }
);

app.get("/mypage", isLogin, function (req, res) {
    console.log(req.user);
    res.render("mypage.ejs", { 사용자: req.user });
});

function isLogin(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send("you didn't be loged in");
    }
}

passport.use(
    new LocalStrategy(
        {
            usernameField: "id",
            passwordField: "pw",
            session: true,
            passReqToCallback: false,
        },
        function (입력한아이디, 입력한비번, done) {
            //console.log(입력한아이디, 입력한비번);
            db.collection("login").findOne(
                { id: 입력한아이디 },
                function (에러, 결과) {
                    if (에러) return done(에러);

                    if (!결과)
                        return done(null, false, {
                            message: "존재하지않는 아이디요",
                        });
                    if (입력한비번 == 결과.pw) {
                        return done(null, 결과);
                    } else {
                        return done(null, false, { message: "비번틀렸어요" });
                    }
                }
            );
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (아이디, done) {
    db.collection("login").findOne({ id: 아이디 }, function (err, result) {
        done(null, result);
    });
});

app.get("/search", (req, res) => {
    console.log(req.query.value);
    db.collection("post")
        .find({ title: req.query.value })
        .toArray((err, result) => {
            console.log(result);
            res.render("search.ejs", { posts: result });
        });
});
