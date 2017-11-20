(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = function () {
  var events = {}
  var eventsystem = {
    on: function (id, fn) {
      events[id] = events[id] || []
      events[id].push(fn)
    },
    off: function (id, fn) {
      if (events[id] === undefined) { return }
      var i = events[id].findIndex(function (g) {
        return g = fn
      })
      if (i !== -1) {
        events[id].splice(i, 1)
      }
    },
    emit: function (id, data) {
      if (events[id]) {
        events[id].forEach(function (fn) {
          fn(data)
        })
      }
    }
  }
  eventsystem.events = events
  return eventsystem
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var books, o;

books = __webpack_require__(12);

o = {};

o.find = function (query, pagenum) {
  var limit, offset, options;
  if (isNaN(pagenum)) {
    pagenum = 0;
  }
  limit = 20;
  offset = limit * pagenum;
  options = {
    offset: offset,
    limit: limit,
    type: 'books',
    order: 'relevance',
    lang: 'en'
  };
  return new Promise(function (resolve, reject) {
    books.search(query, options, function (err, books, apires) {
      var count;
      if (err) {
        return reject({
          err: err
        });
      }
      count = offset + limit;
      if (apires !== void 0 && apires.totalItems !== void 0) {
        count = apires.totalItems;
      }
      return resolve({
        books: books,
        query: query,
        pagenum: pagenum + 1,
        pages: Math.ceil(count / limit)
      });
    });
  });
};

o.findId = function (id) {
  return new Promise(function (resolve, reject) {
    books.lookup(id, function (err, book) {
      if (err || book === void 0) {
        console.log('db.js bookshelf__add err:', err);
        return reject({
          err_msg: 'book_id not found',
          err: err
        });
      }
      return resolve(book);
    });
  });
};

o._api = books;

module.exports = o;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _http = __webpack_require__(3);

var _http2 = _interopRequireDefault(_http);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

var _express = __webpack_require__(5);

var _express2 = _interopRequireDefault(_express);

var _bodyParser = __webpack_require__(6);

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = __webpack_require__(7);

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _user = __webpack_require__(8);

var _user2 = _interopRequireDefault(_user);

var _book = __webpack_require__(11);

var _book2 = _interopRequireDefault(_book);

var _index = __webpack_require__(13);

var _index2 = _interopRequireDefault(_index);

var _keys = __webpack_require__(17);

var _keys2 = _interopRequireDefault(_keys);

var _db = __webpack_require__(18);

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app, body_parser_json, bookapi, cookie_parser, dao, port, sNow, server, tw, ws;

sNow = new Date().toISOString();

console.log(`server started ${sNow}`);

app = (0, _express2.default)();

server = _http2.default.Server(app);

port = process.argv[2] || 3000;

cookie_parser = (0, _cookieParser2.default)();

body_parser_json = _bodyParser2.default.json();

dao = new _db2.default({
  mongourl: _keys2.default.mongourl
});

app.use(cookie_parser);

app.use(body_parser_json);

app.use('/', _express2.default.static(_path2.default.resolve(__dirname + '/dist')));

tw = (0, _user2.default)({ app, port, dao, k: _keys2.default, 'bookclub_sessions': 'bookclub_sessions' });

bookapi = (0, _book2.default)({ app, dao });

ws = (0, _index2.default)({ app, server, cookie_parser, tw, dao });

app.get('*', function (req, res) {
  return res.sendFile(_path2.default.resolve(__dirname + '/dist/index.html'));
});

dao.connect().then(function () {
  return server.listen(port, function () {
    return console.log('server listening at http://localho.st:' + port);
  });
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("cookie-parser");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Twitter_session;

Twitter_session = __webpack_require__(9);

module.exports = function ({ app, dao, port, k, sessiondb_name }) {
  var tw;
  tw = Twitter_session({
    dao,
    port,
    coll_name: sessiondb_name,
    consumerKey: k.twitter.consumerKey,
    consumerSecret: k.twitter.consumerSecret,
    callbackUrl: 'https://booktrade.blogjono.com/tw.login_cb'
  });
  app.get('/tw.login', tw.login);
  app.post('/tw.logout', tw.logout);
  app.get('/tw.login_cb', tw.login_cb, async function (req, res, next) {
    var user;
    console.log(req.twuser);
    if (!req.twuser) {
      return res.redirect('/');
    }
    user = await dao.user__findOne({
      user_id: req.twuser
    });
    if (!user) {
      user = await dao.user__add({
        user_id: req.twuser
      });
    }
    if (!user.loci) {
      user = await dao.user__add_loci_fromip({
        user_id: user._id,
        ip: req.ip
      });
    }
    return res.redirect('/?user_id=' + req.twuser);
  });
  app.get('/user', tw.is_logged_in, async function (req, res, next) {
    var user;
    user = await dao.user__findOne({
      user_id: req.twuser
    });
    return res.json(user);
  });
  app.post('/user/:user_id', async function (req, res) {
    var user;
    user = await dao.user__findOne({
      user_id: req.params.user_id
    });
    if (!user) {
      return res.json({
        err: 'notfound'
      });
    } else {
      return res.json(user);
    }
  });
  app.post('/user_loci__change', tw.is_logged_in, async function (req, res, next) {
    var result;
    result = await dao.user__change_loci({
      user_id: req.twuser,
      loci: req.body.loci
    });
    return res.json(result);
  });
  return tw;
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var es, logtwit;

// https://apps.twitter.com/app/new
logtwit = __webpack_require__(10);

es = __webpack_require__(0);

module.exports = function ({ dao, port, coll_name, consumerKey, consumerSecret, callbackUrl }) {
  var _tw_tokens, events, out, tw;
  events = es();
  tw = new logtwit({ consumerKey, consumerSecret, callbackUrl });
  _tw_tokens = {};
  return out = {
    events: events,
    login: function (req, res, next) {
      return tw.login(function (err, tokenSecret, url) {
        var oauth_token;
        // console.log('tw.login', err, tokenSecret, url)
        if (err) {
          return res.redirect('/');
        }
        oauth_token = url.split('oauth_token=')[1];
        _tw_tokens[oauth_token] = tokenSecret;
        return res.redirect(url);
      });
    },
    login_cb: function (req, res, next) {
      var oauth_token, oauth_token_secret;
      oauth_token = req.query.oauth_token;
      oauth_token_secret = _tw_tokens[oauth_token];
      if (oauth_token_secret === void 0) {
        req.twerr = 'no oauth_token_secret';
        return next();
      }
      return tw.callback({
        oauth_token: oauth_token,
        oauth_verifier: req.query.oauth_verifier
      }, oauth_token_secret, async function (err, user) {
        var options, query, result, update;
        // console.log('tw.callback', err, user)
        if (err) {
          return next(err);
        }
        delete _tw_tokens[oauth_token];
        res.cookie('twitter', user.userToken, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 360),
          httpOnly: true
        });
        query = {
          _id: user.userToken
        };
        update = {
          $set: {
            creation_date: new Date(),
            user_id: user.userName
          }
        };
        options = {
          upsert: true,
          returnOriginal: false
        };
        result = await dao.db.collection(coll_name).findOneAndUpdate(queyr, update, options);
        console.log('tw', result);
        req.twuser = user.userName;
        return next();
      });
    },
    logout: async function (req, res, next) {
      // console.log('tw.logout',req.cookies)
      events.emit('logout', {
        user_id: req.twuser,
        req: req
      });
      await dao.db.collection(coll_name).remove({
        _id: req.cookies.twitter
      });
      res.clearCookie('twitter', {
        path: '/'
      });
      return res.json({
        logout: true
      });
    },
    is_logged_in: async function (req, res, next) {
      var result;
      if (!req.cookies || !req.cookies.twitter) {
        return res.status(400).send('jog on');
      }
      try {
        result = await is_logged_in_prom(req.cookies.twitter);
        if (result === void 0) {
          return res.clearCookie('twitter', {
            path: '/'
          });
        }
        req.twuser = result.user_id;
        return next();
      } catch (error) {
        return next();
      }
    },
    is_logged_in_prom: async function (cookie) {
      var result;
      result = await dao.db.collection(coll_name).findOne({
        _id: cookie
      });
      if (result === null) {
        return void 0;
      } else {
        return result;
      }
    }
  };
};

/* Usage
app.get('/twitter', tw.login)
  // populates req.twerr
  // redirects user to twitter.com
app.get('/twitter-callback', tw.login_cb)
  // populates req.twuser or req.twerr
  // stores data in mongodb collection
app.post('/twitter-logout')
  // clears the twitter cookie
*/

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("login-with-twitter");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bookapi;

bookapi = __webpack_require__(1);

module.exports = function ({ app, dao }) {
  var endpoints;
  app.get('/book_search/:query/:pagenum', async function (req, res) {
    var data, err, pagenum;
    if (typeof req.params.query !== 'string') {
      return res.status(400);
    }
    pagenum = Number(req.params.pagenum) - 1;
    try {
      data = await bookapi.find(req.params.query, pagenum);
      return res.json(data);
    } catch (error) {
      err = error;
      console.log('express book_search', err);
      return res.status(400);
    }
  });
  app.get('/book_id/:book_id', async function (req, res, next) {
    var data;
    data = await dao.book__get({
      book_id: req.params.book_id
    });
    if (data) {
      return res.json(data);
    }
    data = await bookapi.findId(req.params.book_id);
    return res.json(data);
  });
  app.get('/bookshelf/:user_id', async function (req, res, next) {
    var result;
    result = await dao.bookshelf({
      user_id: req.params.user_id
    });
    return res.json(result);
  });
  app.get('/tradeshelf/:user_id', async function (req, res, next) {
    var result;
    result = await dao.tradeshelf({
      user_id: req.params.user_id
    });
    return res.json(result);
  });
  app.get('/bookowners/:book_id', async function (req, res, next) {
    var result;
    result = await dao.bookowners({
      book_id: req.params.book_id
    });
    return res.json(result);
  });
  app.get('/market/:page_n', function (req, res, next) {
    var result;
    result = dao.market({
      page_n: req.params.page_n
    });
    return res.json(result);
  });
  endpoints = ['bookshelf__add', 'bookshelf__remove', 'trade__list', 'trade__unlist', 'trade__request', 'trade__request_remove', 'note__mark__read', 'note__mark__opened', 'trade_requests__get', 'trade_respond'];
  endpoints.forEach(function (name) {
    return app.post('/' + name, async function (req, res, next) {
      var err, result;
      try {
        result = await dao[name](req.body);
        return res.json(result);
      } catch (error) {
        err = error;
        console.log(err);
        return res.json({
          err: err,
          err_req: req.body
        });
      }
    });
  });
  return bookapi;
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("google-books-search");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Comms, handle_user_connects;

handle_user_connects = __webpack_require__(14);

Comms = __webpack_require__(15);

module.exports = function ({ app, server, cookie_parser, tw, dao }) {
  var comms, get_user, get_user__comms, user_auth, users_online;
  comms = Comms(server);
  users_online = [];
  get_user = function (ws, user_id) {
    return users_online.find(function (a) {
      return a.ws === ws;
    });
  };
  get_user__comms = function (user_id) {
    return users_online.filter(function (a) {
      return a.user_id === user_id;
    });
  };
  user_auth = function (o, user_id) {
    return user_id !== void 0 && user_id !== null && o.user_id !== void 0 && o.user_id !== null && o.user_id === user_id;
  };
  handle_user_connects({ comms, cookie_parser, tw, users_online });
  comms.on('request', function ({ data, ws }) {
    var a, b, message;
    // for handling req response
    // console.log('comms.request', data)
    // example helloworld
    a = get_user(ws);
    b = data.data;
    if (b.cmd === 'hello_world') {
      message = '';
      if (a.user_id === void 0) {
        message = 'Hello! says mister express+ws server';
      }
      if (a.user_id !== void 0) {
        message = 'Hello ' + a.user_id + '! hope your having a great time';
      }
      // send as a response
      return comms.send({
        ws: ws,
        data: {
          req_res: data.req_res,
          data: {
            message: message
          }
        }
      });
    }
  });
  comms.on('message', function ({ data, ws }) {
    var user, valid_user;
    console.log('data', data);
    user = get_user(ws);
    return valid_user = user_auth(user, data.user_id);
  });
  dao.e.on('notify', function (data) {
    var channels;
    channels = get_user__comms(data.user._id);
    return channels.forEach(function (channel) {
      return comms.send({
        ws: channel.ws,
        data: data
      });
    });
  });
  dao.e.on('book.update', function (book) {
    return comms.sendAll({
      book: book,
      cmd: 'book.update'
    });
  });
  return { users_online, comms };
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function ({ comms, tw, cookie_parser, users_online }) {
  var cook_p;
  cook_p = function (req) {
    return new Promise(function (resolve) {
      // req.headers.cookies
      return cookie_parser(req, {}, function () {
        return resolve(req.cookies);
      });
    });
  };
  comms.on('connection', async function (ws) {
    var cookies, headers, i, user_id;
    console.log('comm.connection', ws._socket.remotePort);
    // ip === ws._socket.remoteAddress
    // add nome to a list
    users_online.push({
      ws: ws,
      user_id: void 0
    });
    headers = ws.upgradeReq.headers;
    cookies = await cook_p(ws.upgradeReq);
    if (cookies.twitter === void 0) {
      comms.send({
        ws,
        data: {
          user_id: null
        }
      });
      return;
    }
    ({ user_id } = await tw.is_logged_in_prom(cookies.twitter));
    if (user_id === void 0) {
      comms.send({
        ws: ws,
        data: {
          user_id: null
        }
      });
      return;
    }
    i = users_online.findIndex(function (o) {
      return ws === o.ws;
    });
    if (i > -1) {
      users_online[i].user_id = user_id;
    }
    return comms.send({
      ws: ws,
      data: {
        user_id: user_id
      }
    });
  });
  comms.on('close', function (ws) {
    var i;
    // remove from list
    i = users_online.findIndex(function (o) {
      return ws === o.ws;
    });
    console.log('comm.closed', users_online[i].user_id);
    return users_online.splice(i, 1);
  });
  // used for live updating browser tabs when login or login
  tw.events.on('logout', function (user) {
    console.log('tw.logut', user);
    return comms.sendAll({
      reconnect: true
    });
  });
  return tw.events.on('login', function () {
    // give, 1s for twitter, 1s for browsers to set cookies
    return setTimeout(function () {
      return comms.sendAll({
        reconnect: true
      });
    }, 2000);
  });
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var WebSocket, eve, sendBSON;

WebSocket = __webpack_require__(16);

// const BSON = require('bson')
// const bson = new BSON()
eve = __webpack_require__(0);

// http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
// function ArrayBuffertoBuffer(ab) {
//   var buf = new Buffer(ab.byteLength)
//   var view = new Uint8Array(ab)
//   for (var i = 0; i < buf.length; ++i) {
//     buf[i] = view[i]
//   }
//   return buf
// }
// ws code
sendBSON = function ({ ws, data }) {
  if (ws.readyState === WebSocket.OPEN) {
    return ws.send(JSON.stringify(data));
  }
};

// ws.send( bson.serialize(data, {ignoreUndefined: false}))
module.exports = function (server) {
  var e, o, wss;
  e = eve();
  o = {};
  wss = new WebSocket.Server({
    server: server
  });
  wss.on('connection', function (ws) {
    e.emit('connection', ws);
    ws.on('message', function (data, flags) {
      var conn, err;
      conn = this;
      try {
        data = JSON.parse(data);
        // data = bson.deserialize(ArrayBuffertoBuffer(data))
        if (typeof data.req_res === 'number') {
          e.emit('request', {
            data,
            ws: conn
          });
        }
        return e.emit('message', {
          data,
          ws: conn
        });
      } catch (error) {
        err = error;
      }
    });
    return ws.on('close', function () {
      return e.emit('close', ws);
    });
  });
  o.send = sendBSON;
  o.sendAll = function (data) {
    return wss.clients.forEach(function (ws) {
      return sendBSON({
        ws: ws,
        data: data
      });
    });
  };
  o.sendAllExcept = function ({ ws, data }) {
    return wss.clients.filter(function (client) {
      return client === ws;
    }).map(function (client) {
      return sendBSON({
        ws: client,
        data: data
      });
    });
  };
  o.wss = wss;
  o.on = e.on;
  o.off = e.off;
  return o;
};

/*
comms.on('connection', ws)
comms.on('close', ws)
comms.on("message", {data, ws})

comms.send({ws, data})
comms.sendAll(data)
comms.sendAllBut({ws, data})
*/

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("uws");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys;

keys = {
  mongourl: 'mongodb://lee182:Mlab+jonomakesAgreatteam1@ds135577.mlab.com:35577/picput',
  twitter: {
    consumerKey: 'FDa4QaYtWHKN6nbEAJnbuVkk2',
    consumerSecret: 'zrB2M41vnghzqBOsvkUZbB93kaaPHnBkwCnlpimAx5uw7xQjQf'
  }
};

if (process.env.ENVIRONMENT !== 'production') {
  keys.mongourl = 'mongodb://127.0.0.1:27017';
}

module.exports = keys;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongodb = __webpack_require__(19);

var _mongodb2 = _interopRequireDefault(_mongodb);

var _book = __webpack_require__(1);

var _book2 = _interopRequireDefault(_book);

var _ip2loci = __webpack_require__(20);

var _ip2loci2 = _interopRequireDefault(_ip2loci);

var _eventSystem = __webpack_require__(0);

var _eventSystem2 = _interopRequireDefault(_eventSystem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// data acess object
var DB, MongoClient, booksdb_name, usersdb_name;

MongoClient = _mongodb2.default.MongoClient;

booksdb_name = 'bookshelf';

usersdb_name = 'bookshelf_users';

exports.default = DB = class DB {
  constructor({ mongourl }) {
    var five_mins;
    this.e = (0, _eventSystem2.default)();
    this.db = null;
    this.mongourl = mongourl;
    this.ObjectId = _mongodb2.default.ObjectId;
    ['bookshelf__add', 'bookshelf__remove', 'bookshelf__garbage_collection', 'trade__list', 'trade__unlist', 'trade__request',
    // 'trade__request_remove'
    'user__findOne', 'user__add', 'user__add_loci_fromip', 'user__change_loci', 'book__get', 'note__mark__read', 'note__mark__opened', 'trade_requests__get', 'trade_respond'].forEach(name => {
      return this[name] = this.ensureConnected(this[name]);
    });
    five_mins = 5 * 60 * 1000;
    setInterval(this.bookshelf__garbage_collection.bind(this), five_mins);
    this.e.on('trade.request', function (info) {
      return this.notification__add({
        user_id: info.owner_id,
        info: info
      });
    });
    this.e.on('trade.respond', function (d) {
      console.log(d);
      return this.notification__add({
        user_id: d.request._id.request.user_id,
        info: {
          type: 'trade.respond',
          path: '/book/' + d.book._id,
          message: '@${d.request._id.owner_id} ${d.words[0]}ed your trade request for "${d.request.book.title}"'
        }
      });
    });
  }

  ensureConnected(fn) {
    if (typeof fn !== 'function') {
      debugger;
      throw Error('ensureConnected passed fn');
    }
    return function () {
      if (this.db === null) {
        ({
          err: 'db disconnected'
        });
      }
      return fn.apply(this, arguments);
    };
  }

  async db_paging({ db, coll, query, project, limit, page_n, sort }) {
    var docs, skip;
    if (limit === void 0) {
      limit = 30;
    }
    if (page_n === void 0) {
      page_n = 1;
    }
    if (sort === void 0) {
      sort = {
        _id: -1
      };
    }
    if (project === void 0) {
      project = {};
    }
    skip = (page_n - 1) * limit;
    docs = await db.collection(coll).find(query, project).sort(sort).limit(limit).skip(skip).toArray();
    return { docs, limit, page_n, query };
  }

  async connect() {
    var err;
    console.log('mongo connnecting...');
    try {
      this.db = await MongoClient.connect(this.mongourl);
      return console.log('mongo connected');
    } catch (error) {
      err = error;
      this.db = null;
      return console.log('mongo connection error:', err);
    }
  }

  async user__findOne({ user_id }) {
    var user;
    user = await this.db.collection(usersdb_name).findOne({
      _id: user_id
    });
    if (user === null) {
      return void 0;
    } else {
      return user;
    }
  }

  user__add({ user_id }) {
    var result;
    // TODO make sure user_id valid
    result = this.db.collection(usersdb_name).insert({
      _id: user_id,
      user_id: user_id
    }, {
      returnOriginal: false
    });
    return result.ops[0];
  }

  async user__add_loci_fromip({ user_id, ip }) {
    var loci;
    loci = await (0, _ip2loci2.default)(ip);
    return await this.user__change_loci({
      user_id: user_id,
      loci: loci
    });
  }

  async user__change_loci({ user_id, loci }) {
    var res;
    // TODO make sure loci valid, then
    res = await this.db.collection(usersdb_name).findOneAndUpdate({
      _id: user_id
    }, {
      $set: {
        loci: loci
      }
    }, {
      returnOriginal: false,
      upsert: false
    });
    return res.value;
  }

  bookshelf({ user_id }) {
    return this.db.collection(booksdb_name).find({
      'users.user_id': user_id
    }).sort({
      'users.creation_date': -1
    }).toArray();
  }

  bookshelf__add({ book_id, user_id }) {
    var book, err, result;
    book = _book2.default.findId(book_id);
    try {
      result = this.db.collection(booksdb_name).findOneAndUpdate({
        _id: book_id,
        'users.user_id': {
          $ne: user_id
        }
      }, {
        $set: {
          book: book,
          updated: new Date()
        },
        $push: {
          users: {
            user_id: user_id,
            creation_date: new Date()
          }
        }
      }, {
        returnOriginal: false,
        upsert: true
      });
      e.emit('book.update', result.value);
      return result.value;
    } catch (error) {
      err = error;
      console.log('db.js bookshelf__add err:', err);
      return err;
    }
  }

  async bookshelf__remove({ book_id, user_id }) {
    var result;
    try {
      result = await this.db.collection(booksdb_name).findOneAndUpdate({
        _id: book_id
      }, {
        $pull: {
          users: {
            user_id: user_id
          }
        }
      }, {
        returnOriginal: false
      });
      return result.value;
    } catch (error) {
      console.log('db.js bookshelf__remove err:', err);
      return err;
    }
  }

  bookshelf__garbage_collection() {
    debugger;
    return this.db.collection(booksdb_name).remove({
      users: {
        $size: 0
      }
    });
  }

  trade__list({ book_id, user_id }) {
    var result;
    result = this.db.collection(booksdb_name).findOneAndUpdate({
      _id: book_id,
      'users.user_id': user_id
    }, {
      $set: {
        'users.$.trade': {
          creation_date: new Date(),
          fullfilled: false,
          requests: []
        }
      }
    }, {
      returnOriginal: false,
      upsert: false
    });
    e.emit('book.update', result.value);
    return result.value;
  }

  async trade__unlist({ book_id, user_id }) {
    var result;
    result = await this.db.collection(booksdb_name).findOneAndUpdate({
      _id: book_id,
      'users.user_id': user_id
    }, {
      $unset: {
        'users.$.trade': ''
      }
    }, {
      returnOriginal: false,
      upsert: false
    });
    e.emit('book.update', result.value);
    return result.value;
  }

  tradeshelf({ user_id }) {
    return this.db.collection(booksdb_name).find({
      'users.user_id': user_id,
      'users.trade': {
        $exists: 1
      }
    }).toArray();
  }

  books_for_trade() {
    return this.db.collection(booksdb_name).find({
      'users.trade.fullfilled': false
    });
  }

  async trade__request({ book_id, owner_id, user_id }) {
    var result;
    result = await this.db.collection(booksdb_name).findOneAndUpdate({
      _id: book_id,
      users: {
        $elemMatch: {
          user_id: owner_id,
          'trade.fullfilled': false,
          'trade.requests.user_id': {
            $ne: user_id
          }
        }
      }
    }, {
      $push: {
        'users.$.trade.requests': {
          user_id: user_id,
          creation_date: new Date()
        }
      }
    }, {
      returnOriginal: false,
      upsert: false
    });
    // new notifycation
    this.e.emit('trade.request', {
      book_id: book_id,
      owner_id: owner_id,
      user_id: user_id,
      type: 'trade.request',
      result: result.value
    });
    return result.value;
  }

  async trade_respond({ request, accept_or_decline }) {
    var doc, i, j, result, words;
    request._id.request.creation_date = new Date(request._id.request.creation_date);
    words = ['accept', 'decline'];
    if (accept_or_decline === false) {
      words = words.reverse();
    }
    doc = await this.db.collection(booksdb_name).findOne({
      _id: request.book._id,
      users: {
        $elemMatch: {
          user_id: request._id.owner_id,
          'trade.requests': {
            $elemMatch: request._id.request
          }
        }
      }
    });
    if (doc === null) {
      return Promise.reject();
    }
    i = doc.users.findIndex(function (user) {
      return request._id.owner_id === user.user_id;
    });
    if (i === -1) {
      return Promise.reject();
    }
    j = doc.users[i].trade.requests.findIndex(function (user) {
      return request._id.request.user_id === user.user_id;
    });
    if (j === -1) {
      return Promise.reject();
    }
    doc.users[i].trade.requests[j][words[0]] = true;
    doc.users[i].trade.requests[j][words[0] + '_date'] = new Date();
    delete doc.users[i].trade.requests[j][words[1]];
    delete doc.users[i].trade.requests[j][words[1] + '_date'];
    result = await this.db.collection(booksdb_name).findOneAndReplace({
      _id: doc._id
    }, doc, {
      returnOriginal: false
    });
    this.e.emit('book.update', result.value);
    this.e.emit('trade.respond', {
      book: result.value,
      request: request,
      words: words
    });
    return result.value;
  }

  trade_requests__get({ user_id, owner_id }) {
    var firstPipe, lastPipe;
    firstPipe = {
      $match: {
        'users.trade.requests': {
          $exists: 1
        }
      }
    };
    lastPipe = {
      $match: {}
    };
    if (owner_id) {
      firstPipe.$match['users.user_id'] = owner_id;
      lastPipe.$match['_id.owner_id'] = owner_id;
    }
    if (user_id) {
      lastPipe.$match['_id.request.user_id'] = user_id;
    }
    return this.db.collection(booksdb_name).aggregate([firstPipe, {
      $project: {
        _id: {
          _id: '$_id',
          title: '$book.title'
        },
        user: '$users'
      }
    }, {
      $unwind: '$user'
    }, {
      $unwind: '$user.trade.requests'
    }, {
      $project: {
        _id: {
          owner_id: '$user.user_id',
          request: '$user.trade.requests'
        },
        book: '$_id'
      }
    }, lastPipe]).toArray();
  }

  async book__get({ book_id }) {
    var res;
    res = await this.db.collection(booksdb_name).findOne({
      _id: book_id
    });
    if (res === null) {
      return void 0;
    } else {
      return res;
    }
  }

  bookowners({ book_id }) {
    return this.db.collection('bookshelf').aggregate([{
      $match: {
        _id: book_id
      }
    }, {
      $unwind: '$users'
    }, {
      $project: {
        _id: {
          user_id: '$users.user_id',
          book_id: '$_id'
        },
        trade: '$users.trade'
      }
    }, {
      $match: {
        trade: {
          $exists: 1
        }
      }
    }, {
      $lookup: {
        from: 'bookshelf_users',
        localField: '_id.user_id',
        foreignField: '_id',
        as: 'loci'
      }
    }, {
      $unwind: '$loci'
    }, {
      $project: {
        _id: 0,
        user_id: '$_id.user_id',
        book_id: '$_id.book_id',
        trade: '$trade',
        loci: '$loci.loci'
      }
    }]).toArray();
  }

  market({ page_n }) {
    return this.db_paging({
      db: this.db,
      coll: 'bookshelf',
      query: {
        'users.trade': {
          $exists: 1
        }
      },
      limit: 20,
      page_n: page_n,
      sort: {
        'users.trade.creation_date': -1
      }
    });
  }

  async notification__add({ user_id, info }) {
    var note, result;
    note = {
      creation_date: new Date(),
      read: false,
      opened: false
    };
    if (info.type === 'trade.request') {
      note.path = '/book/' + info.book_id;
      note.message = '@' + info.user_id + ' requests "' + info.result.book.title + '"';
    }
    if (info.type === 'trade.respond') {
      note.path = info.path;
      note.message = info.message;
    }
    result = await this.db.collection(usersdb_name).findOneAndUpdate({
      _id: user_id
    }, {
      $push: {
        notifcations: note
      }
    }, {
      returnOriginal: false
    });
    this.e.emit('notify', {
      user: result.value,
      note: note
    });
    return result.value;
  }

  async note__mark__read({ note, user_id }) {
    var result;
    console.log(user_id);
    result = await this.db.collection(usersdb_name).findOneAndUpdate({
      _id: user_id,
      notifcations: {
        $elemMatch: {
          creation_date: new Date(note.creation_date),
          message: note.message
        }
      }
    }, {
      $set: {
        'notifcations.$.read': true
      }
    }, {
      returnOriginal: false
    });
    if (result.value === null) {
      return;
    }
    e.emit('notify', {
      user: result.value,
      note: note
    });
    return result.value;
  }

  async note__mark__opened({ note, user_id }) {
    var result;
    result = await this.db.collection(usersdb_name).findOneAndUpdate({
      _id: user_id,
      notifcations: {
        $elemMatch: {
          creation_date: new Date(note.creation_date),
          message: note.message
        }
      }
    }, {
      $set: {
        'notifcations.$.opened': true,
        'notifcations.$.read': true
      }
    }, {
      returnOriginal: false
    });
    if (result.value === null) {
      return;
    }
    console.log('opend', result.value);
    e.emit('notify', {
      user: result.value,
      note: note
    });
    return result.value;
  }

};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("mongodb");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var curl;

curl = __webpack_require__(21);

module.exports = function (ip) {
  var url;
  url = 'http://ipinfo.io/' + ip + '/json';
  console.log('ip', ip);
  if (ip === '::1' || ip === '127.0.0.1' || ip === void 0 || ip.match(/^\:\:/) !== null) {
    url = 'http://ipinfo.io/json';
  }
  return new Promise(function (resolve, reject) {
    return curl.getJSON(url, {}, function (err, response, data) {
      var lat, loci, lon;
      //console.log(data)
      if (err) {
        return reject(err);
      }
      [lat, lon] = data.loc.split(',');
      loci = {
        name: `${data.city}, ${data.region}, ${data.country}\``,
        coords: { lat, lon },
        address: {
          city: data.city,
          region: data.region,
          country_code: data.country.toLowerCase()
        }
      };
      return resolve(loci);
    });
  });
};

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("curl");

/***/ })
/******/ ])));
//# sourceMappingURL=server.js.map