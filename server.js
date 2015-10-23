'use strict';

//
// Start the log server.
//
var startServer = function (config, outputPlugin) {

	if (!outputPlugin) {
		throw new Error("'outputPlugin' argument not specified.");
	}

	var argv = require('yargs').argv;
	var E = require('linq');
	var moment = require('moment');
	var conf = require('confucious');
	conf.pushJsonFile('config.json');

	var express = require('express');
	var app = express();

	var bodyParser = require('body-parser')
	app.use(bodyParser.json()); 

	app.get("/", function (req, res) {
		res.send("Hello");
	});

	//
	// Preprocess log to our expected structure.
	//
	var transformLog = function (log) {
		return {
			Timestamp: moment(log.Timestamp).toDate(),
			Level: log.Level,
			MessageTemplate: log.MessageTemplate,
			RenderedMessage: log.RenderedMessage,
			Properties: E.from(Object.keys(log.Properties))
				.toObject(
					function (propertyName) {
						return propertyName;
					},
					function (propertyName) {
						return log.Properties[propertyName].Value;
					}
				),
		};	
	}

	app.post('/log', function (req, res) {
		if (!req.body) {
			throw new Error("Expected 'body'");
		}

		if (!req.body.Logs) {
			throw new Error("Expected 'Logs' property on body");
		}

		var logs = E.from(req.body.Logs)
			.select(transformLog)
			.toArray();

		outputPlugin.emit(logs);

		res.status(200).end();
	});

	var server = app.listen(argv.port || conf.get("port"), "0.0.0.0", function () {
		var host = server.address().address;
		var port = server.address().port;
		console.log("Receiving logs at " + host + ":" + port + "/log");
	});
};

//
// http://stackoverflow.com/a/6398335/25868
// 
if (require.main === module) { 
	
	console.log('Starting from command line.');

	//
	// Run from command line.
	//
	startServer({}, require('./mongodb-output')({}));
}
else {
	// 
	// Required from another module.
	//
	module.exports = startServer;
}