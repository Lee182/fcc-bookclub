# fcc-bookclub

## description
goal is to reach these user stories.
  - I can view all books posted by every user.
  - I can add a new book.
  - I can update my settings to store my full name, city, state
  - I can propose a trade and wait for the other user to accept the trade.
  - I can accept trades and send my contact details in a message to the other user.
  - I can view messages from other users when i login.

## install & starting up
```shell
# if NODE_ENV isn't set to 'PRODUCTION' devDependencies will be installed
$ npm install

```
### server/keys.js file
```
module.exports = {
  mongourl: 'mongodb://[user]:[pwd]@yourdomain.com:[port]/[db_name]',
  twitter: {
    consumerKey: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    consumerSecret:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }
}
```
twitter oauth keys can be obtainend from https://apps.twitter.com/app/new

### run
app/** file changes are watched then compiled to dist
```
$ npm run start-dev
# or
$ npm run start
```

## Licence & Author
Author: Jonathan T L Lee, <jono-lee@hotmail.co.uk>

Licence: MIT
