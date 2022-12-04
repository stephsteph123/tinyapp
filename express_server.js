//Modules

const { name } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session')
var cookieSession = require('cookie-session');


app.use(session({
  secret: '34SDgsdgspxxxxxxxdfsG', // just a long random string
  resave: true,
  saveUninitialized: true
}));

app.set("view engine", "ejs");

//Helper Functions

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

function pWord(password) {
  for (item in users) {
    if (password === users[item].password) {
      return  true;
    } else {
      result = false;
    }
  }
  return result;
}

// function urlsForUser(id){
//   let currentUser = id;
//  for(id in urlDatabase) {
//   if (currentUser = id ){
//    let urls = urlDatabase.currentUser;
//   return urls;
//   }
//  }
// };


//Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "test",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Routes Helps

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(express.urlencoded({ extended: true }));


//Get Routes

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    email: req.body.email,
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    email: req.body.email,
    email2: req.session.email
  };
  console.log(templateVars)
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
  password: req.body.password,
  email: req.body.email
  };
  res.render("reg_page", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
  password: req.body.password,
  email: req.body.email,
  };
  res.render("login_page", templateVars);
});

//Post Routes

app.post("/urls/:id/delete", (req, res) => {
  console.log(urlDatabase);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => { //new form connects back to this (need to update the database..)
  const newUrl = req.body.longURL
  const shortUrl = req.params.id
  urlDatabase[shortUrl] = newUrl
  console.log('label',newUrl); // Log the POST request body to the console
  console.log('shortUrl',shortUrl); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
  if(!emailAlready(req.body.email)) {
    res.sendStatus(403);
    console.log("email cannot be found")
  } else if (!pWord(req.body.password)) {
    res.sendStatus(403);
    console.log("Password does not match")
  } else {
 let randomID = generateRandomString();
   users[randomID] = {
     id: randomID,
     email: req.body.email,
     password: req.body.password,
   }
   console.log(req.body.email)
   res.cookie(users[randomID].id, req.sessionID)
   res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let randomID = generateRandomString()
  if(!req.body.email || !req.body.password) {
    res.sendStatus(400);
    console.log('hello')
  } else if (emailAlready(req.body.email)) {
    res.sendStatus(400);
    console.log('email is already registered')
  } else {
  users[randomID] = {
    id: randomID,
    email: email,
    password: password,
  }
  users[randomID] = { }
}
  req.session.userID = randomID
  console.log("user_id2", users[randomID].id)
  console.log(users)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const templateVars = {
  email: ""
  }
  req.session = null;
  res.render("login_page", templateVars);
});

app.post("/urls/:id", (req, res) => { //new form connects back to this (need to update the database..)
  const newUrl = req.body.longURL
  const shortUrl = req.params.id
  urlDatabase[shortUrl] = newUrl
  console.log('label',newUrl); // Log the POST request body to the console
  console.log('shortUrl',shortUrl); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

// too complicated "/login"
// app.post("/login", (req, res) => {
//   let id = "";
//   let password = "";
//   let email = "";
//   res.cookie(req.body.login, req.sessionID)
//   let randomID = generateRandomString();
//   users[randomID] = {
//     id: randomID,
//     email: req.body.email,
//     password: req.body.password,
//   };
//   console.log(id)
//   console.log(email)
//   console.log(password)
//   res.redirect("/urls")
// });

// app.post("/login", (req, res) => {
//   res.cookie("username", req.body.login);
//   const cookiez = req.body.login
//   console.log("login",cookiez)
//   res.redirect("/urls");
// });

// Commented out - old /login post
// app.post("/login", (req, res) => {
//   console.log("reqSessID",req.sessionID);
//   res.cookie(req.body.login, req.sessionID)
//   res.redirect("/urls");
// });