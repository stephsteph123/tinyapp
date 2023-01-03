const {usersDatabase} = require ('./user');
const {urlDatabase} = require ('./database')

//used for generating a new ID for a user registering 
function generateRandomString() {
  let str = (Math.random() + 1).toString(36).substring(7);
  return (str);
};

// //checks if the email already exist within the database
function emailAlready(email) {
  for (item in usersDatabase) {
    if (email === usersDatabase[item].email) {
      return  true;
    } else {
      result = false;
    }
  }
  return result;
};

//provides the an array was URLs allowed for each user
function urlsForUser(id) {
  result = [];
    for (let item in urlDatabase) {
      if (urlDatabase[item]['userID'] === id) {
        result.push({shortURL:item,...urlDatabase[item]})
      }
    }
    return result
  };

 module.exports = {generateRandomString, emailAlready, urlsForUser};

