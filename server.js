require("./models/db");

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");

const fileUpload = require("express-fileupload");
const fs = require("fs");
var app = express();
app.use(express.static(path.join(__dirname, "")));
const homeController = require("./controllers/homeController");
const loginController = require("./controllers/loginController");
const employeeController = require("./controllers/employeeController");
var router = express.Router();
server = app.listen(process.env.PORT || 3000);
/*   for webrtc application */
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(bodyparser.json());
app.set("views", path.join(__dirname, "/views/"));
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    defaultLayout: "mainLayout",
    layoutsDir: __dirname + "/views/layouts/",
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");

// app.listen(3000, () => {
//   console.log("Express server started at port : 3000");
// });

// app.use("/login", employeeController);

app.use("/", homeController);
app.use("/login", loginController);

const io = require("socket.io")(server);

// io.on("connection", (socket) => {
//   console.log(socket.id);
// });

// var webSocketServ = require("ws").Server;

// var wss = new webSocketServ({
//   port: 9090,
// });

var users = {};
var otherUser;
var FileePath;
var fileeName;
// wss.on("connection", function (conn) {
//     console.log("User connected");
io.on("connection", (conn) => {
  console.log(conn.id);

  conn.on("cmessage", function (message) {
    var data;

    try {
      data = JSON.parse(message);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }
    console.log(data.type);
    switch (data.type) {
      case "login":
        if (users[data.name]) {
          sendToOtherUser(conn, {
            type: "login",
            success: false,
          });
        } else {
          users[data.name] = conn;
          conn.name = data.name;

          sendToOtherUser(conn, {
            type: "login",
            success: true,
          });
        }
        // console.log(users[data.name]);
        break;
      case "offer":
        var connect = users[data.name];
        if (connect != null) {
          conn.otherUser = data.name;

          sendToOtherUser(connect, {
            type: "offer",
            offer: data.offer,
            name: conn.name,
          });
        }
        break;

      case "answer":
        var connect = users[data.name];

        if (connect != null) {
          conn.otherUser = data.name;
          sendToOtherUser(connect, {
            type: "answer",
            answer: data.answer,
          });
        }

        break;

      case "candidate":
        var connect = users[data.name];

        if (connect != null) {
          sendToOtherUser(connect, {
            type: "candidate",
            candidate: data.candidate,
          });
        }
        break;
      case "reject":
        var connect = users[data.name];

        if (connect != null) {
          sendToOtherUser(connect, {
            type: "reject",
            name: conn.name,
          });
        }
        break;
      case "accept":
        var connect = users[data.name];

        if (connect != null) {
          sendToOtherUser(connect, {
            type: "accept",
            name: conn.name,
          });
        }
        break;
      case "filee":
        var connect = users[data.name];
        console.log("filee got");
        if (connect != null) {
          sendToOtherUser(connect, {
            type: "filee",
            name: conn.name,
            FileePath: data.FileePath,
            fileeName: data.fileeName,
          });
        }
        break;
      case "leave":
        var connect = users[data.name];
        connect.otherUser = null;

        if (connect != null) {
          sendToOtherUser(connect, {
            type: "leave",
          });
        }

        break;

      default:
        sendToOtherUser(conn, {
          type: "error",
          message: "Command not found: " + data.type,
        });
        break;
    }
  });
  conn.on("close", function () {
    console.log("Connection closed");
    if (conn.name) {
      delete users[conn.name];
      if (conn.otherUser) {
        var connect = users[conn.otherUser];
        conn.otherUser = null;

        if (conn != null) {
          sendToOtherUser(connect, {
            type: "leave",
          });
        }
      }
    }
  });

  conn.send("Hello World");
});

function sendToOtherUser(connection, message) {
  connection.emit("gmessage", JSON.stringify(message));
  // console.log(JSON.stringify(message));
}

// .........for file fileUpload.............

app.use(fileUpload());
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
var gameSchema = new mongoose.Schema({
  title: String,
  creator: String,
  width: Number,
  height: Number,
  fileName: String,
  thumbnailFile: String,
  username: String,
  filepath: String,
});

var Game = mongoose.model("Game", gameSchema);

// app.get("/addgame", function (req, res) {
//   res.render("home/addgame");
// });

app.post("/attachimg_other_info", function (req, res) {
  var meeting_idd = req.body.meeting_id;
  res.send(meeting_idd);
});

app.post("/attachimg", function (req, res) {
  var data = req.body;
  var usernamee = data.username;
  //a variable representation of the files
  // var gameFile = req.files.gamefile;
  var imageFile = req.files.zipfile;
  console.log(imageFile);
  //Using the files to call upon the method to move that file to a folder
  // gameFile.mv("public/images/" + gameFile.name, function (error) {
  //   if (error) {
  //     console.log("Couldn't upload the game file");
  //     console.log(error);
  //   } else {
  //     console.log("Game file succesfully uploaded.");
  //   }
  // });
  var dir = "public/attachment/" + usernamee + "";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  var custFilePath =
    "./../../public/attachment/" + usernamee + "/" + imageFile.name + "";
  console.log("custFilePath", custFilePath);
  imageFile.mv(
    "public/attachment/" + usernamee + "/" + imageFile.name,
    function (error) {
      if (error) {
        console.log("Couldn't upload the image file");
        console.log(error);
      } else {
        console.log("Image file succesfully uploaded.");
      }
    }
  );

  Game.create(
    {
      title: data.title,
      creator: data.creator,
      width: data.width,
      height: data.height,
      thumbnailFile: imageFile.name,
      username: usernamee,
      filepath: custFilePath,
    },
    function (error, data) {
      if (error) {
        console.log("There was a problem adding this game to the database");
      } else {
        console.log("Game added to database");
        console.log(data);
      }
    }
  );
  // res.redirect("/?meetingID=324234324");
  res.send(data.creator);
  // return true;
  // res.writeHead(200, { "Content-Type": "text/plain" });
  // res.write("feeling cool");
  // res.end();
});
