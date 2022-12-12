//Modules
const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
let numHash = 10;
const session = require("express-session");

const app = express();


app.use(cookieSession({
  name: 'session', 
  keys: ['secret key'],
  saveUninitialized: true
}));

app.set("view engine", "ejs");

//Helper Functions

function generateRandomString() {
  let str = (Math.random() + 1).toString(36).substring(7);
  return (str);
}

function emailAlready(email) {
  for (item in usersDatabase) {
    if (email === usersDatabase[item].email) {
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

function valueHelp(id) {
  if (urlDatabase[id]) {
    return true;
  }
  return false
}

function urlsForUser(id) {
  result = [];
    for (let item in urlDatabase) {
      if (urlDatabase[item]['userID'] === id) {
        result.push({shortURL:item,...urlDatabase[item]})
      }
    }
    return result
  };

//Databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "id123",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "id456",
  },
};

const usersDatabase = {
  id123: {
    id: "id123",
    email: "user@example.com",
    password: "$2b$10$BL3JjgIK0wqXMmlh0Hg8deu6ctQvjA9OSub9g5Rq7/Oh7lRQP00t2",

  },
  id456: {
    id: "id456",
    email: "user2@example.com",
    password: "2b$10$3HBwpShW3JJI7N1yF.ZmaO4Xel0N/NoXUi0ZBDTD7njanfj8BxkIi",
  },
};


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
  let userNow = req.session.userId
  if (!userNow) {
    req.session.error = 'Please Login To Access All Pages';
    res.redirect('/login')
  } else {
  const templateVars = { 
    userId: req.session.userId,
    urls: urlsForUser(userNow),
  };
  res.render("urls_index", templateVars);
}
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userNow = req.session.userId
  if (!userNow) {
    res.redirect('/login')
  } else {
  const templateVars = { 
    userId: req.session.userId,
  };
  res.render("urls_new", templateVars);
}
});

app.get("/urls/:id", (req, res) => {
  let userId = req.params.userId;
  let shortURL = req.params.id;
  if (valueHelp(req.params.id) !== true) {
    res.sendStatus(403)
    console.log("shortURL does not exist in database")
  } else if (valueHelp(req.params.id) === true) {
    const longURL = urlDatabase[shortURL].longURL
    const templateVars = {shortURL, longURL, userId}
    res.render("urls_show", templateVars)
    }
  })

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let userNow = req.session.userId
  console.log("error message", req.session.error)
  if (userNow) {
    res.redirect('/urls')
  } else {
  let templateVars = {
  userId: req.session.userId,
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
  userId = req.session.userId;
  const templateVars = {
    userId: req.session.userId,
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
    res.sendStatus(400);
    console.log('missing email or password')
  } else if (emailAlready(req.body.email)) {
    res.sendStatus(400);
    console.log('email is already registered')
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
    console.log("user has to register")
    res.sendStatus(403);
  } else if (!bcrypt.compareSync(password, usersDatabase[userId]["password"])) {
      console.log("wrong password")
      res.sendStatus(403);
  } else {
    req.session.userId = userId;
    req.session.error = null;
    res.redirect("/urls")
  }
  });

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let userId = req.session.userId;
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL:longURL, userID: userId}
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => { 
  const newUrl = req.body.longURL
  const shortUrl = req.params.id
  urlDatabase[shortUrl].longURL = newUrl;
  res.redirect("/urls"); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});