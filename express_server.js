//Modules
const express = require('express');
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
let numHash = 10;
const {generateRandomString} =  require ('./helper');
const {emailAlready} = require ('./helper');
const {urlsForUser} = require ('./helper');
const {usersDatabase} = require ('./user');
const {urlDatabase} = require ('./database')

const app = express();


app.use(cookieSession({
  name: 'session', 
  keys: ['secret key'],
  saveUninitialized: true
}));

app.use((req, res, next) => {
  console.log("sessionListner", req.session)
  next()
})

app.set("view engine", "ejs");

//Get Routes
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let userNow = usersDatabase[req.session.userId]
  if (!userNow) {
    req.session.error = 'Please Login To Access All Pages';
    res.redirect('/login')
  } else {
  const templateVars = { 
    user: usersDatabase[req.session.userId],
    urls: urlsForUser(userNow.id),
  };
  res.render("urls_index", templateVars);
}
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userNow = usersDatabase[req.session.userId]
  if (!userNow) {
    res.redirect('/login')
  } else {
  const templateVars = { 
    user: userNow,
  };
  res.render("urls_new", templateVars);
}
});

app.get("/urls/:id", (req, res) => {
  let userNow = usersDatabase[req.session.userId];
  let shortURL = req.params.id;
  if (!userNow) {
    res.status(400).send("please login to access this page")
    // return res.redirect("/login")
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("short url does not exist")
  }
  if (userNow.id !== urlDatabase[shortURL].userID) {
    return res.status(400).send ("this is not your URL")
  }
  const longURL = urlDatabase[shortURL].longURL
  const templateVars = {shortURL, longURL, user: userNow}
  res.render("urls_show", templateVars)
  });

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  if (longURL) {
    res.redirect(longURL['longURL']);
  } else {
    return res.status(400).send ("Does Not Exist")
  }
});

app.get("/login", (req, res) => {
  let userNow = usersDatabase[req.session.userId]
  if (userNow) {
    res.redirect('/urls')
  } else {
  let templateVars = {
  user: userNow,
  email: "",
  error: req.session.error || null,
};
req.session.error = null;
res.render("login_page",templateVars)
}
});

app.get("/register", (req, res) => {
  email = req.body.email;
  password = req.body.password;
  userId = usersDatabase[req.session.userId];
  const templateVars = {
    user: userId,
    email: req.body.email,
  };
  if (!userId) {
    res.render("reg_page", templateVars);
    } else {
      res.redirect("/urls");
    }
});

//Post Routes

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let randomID = generateRandomString()
  let hashedPassword = bcrypt.hashSync(password, 10);
  if(!req.body.email || !req.body.password) {
    res.status(400).send('missing email or password');
  } else if (emailAlready(req.body.email)) {
    res.status(400).send('email is already registered');
  } else {
  usersDatabase[randomID] = {
    id: randomID,
    email: email,
    password: hashedPassword,
  }
}
req.session.userId = randomID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userId = "";
  for (let id in usersDatabase) {
    if (usersDatabase[id]["email"] === email) {
      userId= usersDatabase[id]["id"];
    }
  }
  if (userId === "") {
    return res.status(403).send('user has to register');
  }
  if (!bcrypt.compareSync(password, usersDatabase[userId]["password"])) {
    return res.status(403).send("wrong password")
  }
    req.session.userId = userId;
    req.session.error = null;
    req.body.email = email;
    res.redirect("/urls")
  });

app.post("/logout", (req, res) => {
  delete req.session.userId;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userNow = usersDatabase[req.session.userId]
  if (!userNow) {
    res.status(400).send("please login to access this page")
  } 
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL:longURL, userID: userNow.id}
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userNow = usersDatabase[req.session.userId]
  if (!userNow) {
    res.status(400).send("please login to access this page")
  } 
  if (userNow.id !== urlDatabase[shortURL].userID) {
    return res.status(400).send ("this is not your URL")
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userNow = usersDatabase[req.session.userId]
  if (!userNow) {
    res.status(400).send("please login to access this page")
  } 
  if (userNow.id !== urlDatabase[shortURL].userID) {
    return res.status(400).send ("this is not your URL")
  }
  const newUrl = req.body.longURL
  const shortUrl = req.params.id
  urlDatabase[shortUrl].longURL = newUrl;
  res.redirect("/urls"); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});