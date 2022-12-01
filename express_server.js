const { name } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser')
const session = require('express-session')

app.use(session({
  secret: "some secret",
  cooks: {maxAge: 30000},
  saveUninitialized: true,
}))

app.set("view engine", "ejs");

function generateRandomString() {
  let str = (Math.random() + 1).toString(36).substring(7);
  return (str);
}

function emailAlready(email) {
  for (item in users) {
    if (email === users[item].email) {
      return  true;
    } else {
      result = false;
    }
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => { //new form connects back to this (need to update the database..)
  const newUrl = req.body.longURL
  const shortUrl = req.params.id
  urlDatabase[shortUrl] = newUrl
  console.log('label',newUrl); // Log the POST request body to the console
  console.log('shortUrl',shortUrl); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(urlDatabase);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// app.post("/login", (req, res) => {
//   res.cookie("username", req.body.login);
//   const cookiez = req.body.login
//   console.log("login",cookiez)
//   res.redirect("/urls");
// });

app.post("/login", (req, res) => {
  console.log("reqSessID",req.sessionID);
  res.cookie(req.body.login, req.sessionID)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.clearCookie(req.body.login, req.sessionID);
  const outie = req.body.login
  console.log("logout", outie)
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
  password: req.body.password,
  email: req.body.email,
  };
  res.render("reg_page", templateVars);
});

app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password) {
    res.sendStatus(400);
    console.log('hello')
  } else if (emailAlready(req.body.email)) {
    res.sendStatus(400);
    console.log('email is already registered')
  } else {
  const password = req.body.password
  let id = "";
  let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: password,
  };
  req.session.userID = randomID
  console.log("user_id2", users[randomID].id)
  res.redirect("/urls");
}
});