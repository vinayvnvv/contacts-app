var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var http = require('http').Server(app);
var path = require('path');
var port = (process.env.PORT || 3000);
var timeout = 3000;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = "mongodb://localhost:27017/";
const dbName = 'contacts';


app.use(express.static(path.join(__dirname, '/')));


//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var sendRes = function(ref, obj, status, code) {
	if(status == 1) {
		ref.send(obj);
	} else {
		ref.status(code).send(obj);
	}
}

app.get('/api/getContacts', function(req, res) {
	setTimeout(function() { 
		MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function(err, client) {
		  assert.equal(null, err);
		  if(err) {
		  	sendRes(res, err, 0, 500);
		  	return;
		  } 
		   const db = client.db(dbName);
		   var collection = db.collection('contacts');
				  collection.find().toArray( function(err, docs) {
				  	console.log("docs>>>>>>>>>>>>", docs)
				  	 if(err) { sendRes(res, err, 0, 500); return }

                     sendRes(res, docs, 1, 200);
				  	
				});
			});
	}, timeout);
})


app.post('/api/login', function(req, res) {
	setTimeout(function() {
		var email = req.body.email;
		var password = req.body.password;
		if(email != 'test@gmail.com') {
			sendRes(res, {msg: 'Email does not exist', code: 0}, 0, 403);
			return;
		}
		if(password != '123456') {
			sendRes(res, {msg: 'Password is invalid', code: 1}, 0, 403);
			return;
		}
		sendRes(res, {msg: 'success', code: 3}, 1, 200);
	}, timeout);
})




app.post('/api/addContact', function(req, res) {
	setTimeout(function() { 
		MongoClient.connect(mongoUrl, function(err, client) {
		  var doc = req.body;
		  console.log(JSON.stringify(req.body))
		  assert.equal(null, err);
		  if(err) {
		  	sendRes(res, err, 0, 500);
		  	return; 
		  }
		   const db = client.db(dbName);
		   var collection = db.collection('contacts');
				  collection.insert(doc,  function(err, result) {
				  	 if(err) { sendRes(res, err, 0, 500); return }
				  	 
                     sendRes(res, result, 1, 200);
				  	
				});
			});
	}, timeout);
})

app.delete('/api/deleteContact/:id', function(req, res) {
	const id = req.params.id;
	setTimeout(function() {
		MongoClient.connect(mongoUrl, function(err, client) {
		  
		  assert.equal(null, err);
		  if(err){
		  	sendRes(res, err, 0, 500);
		  	return;
		  }
		   const db = client.db(dbName);
		   var collection = db.collection('contacts');
				  collection.remove(
				  	        {"_id": ObjectId(id)},
				  	        function(err, result) {
							  	 if(err) { sendRes(res, err, 0, 500); return }
			                     sendRes(res, result, 1, 500);
								}
							);
			});

	}, timeout)
});

app.put('/api/editContact/:id', function(req, res) {
	const doc = req.body;
	const id = req.params.id;
	setTimeout(function() {
		MongoClient.connect(mongoUrl, function(err, client) {
		  
		  assert.equal(null, err);
		  if(err){
		  	sendRes(res, err, 0, 500);
		  	return;
		  }
		   const db = client.db(dbName);
		   var collection = db.collection('contacts');
				  collection.update(
				  	        {"_id": ObjectId(id)},
				  	        { $set : doc },
				  	        function(err, result) {
							  	 if(err) { sendRes(res, err, 0, 500); return }
			                     sendRes(res, result, 1, 200);
								}
							);
			});

	}, timeout)
});

// connect
http.listen(port, function(){
				   console.log('listening on :' + port);
				});

//errr handling
process.on('uncaughtException', err => {
	console.log('\n\n\n', '\x1b[31m', '<---------- ERR ---------->\n', err, '\x1b[30m')
})



