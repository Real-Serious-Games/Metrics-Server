'use strict';

//
// Start the log server.
//
var startServer = function (config, outputPlugin) {

	if (!outputPlugin) {
		throw new Error("'outputPlugin' argument not specified.");
	}

	var E = require('linq');
	var moment = require('moment');
	var fs = require('fs');
	var conf = require('confucious');
	if (fs.existsSync('config.json') {
		conf.pushJsonFile('config.json');		
	}
	conf.pushArgv();

	var express = require('express');
	var app = express();

	var bodyParser = require('body-parser')
	app.use(bodyParser.json()); 

	app.get("/", function (req, res) {
		res.send("Hello");
	});

	//
	// Preprocess metric to our expected structure.
	//
	var transformMetric = function (metric, properties, timeReceived) {
        // Update the date and add the properties to the metric.
        var transformedMetric = metric;
        transformedMetric.TimeStamp = moment(metric.TimeStamp).toDate();
        transformedMetric.TimeReceived = timeReceived;
        transformedMetric.Properties = properties;
        return transformedMetric;
	}

	app.post('/emit', function (req, res) {
		if (!req.body) {
			throw new Error("Expected 'body'");
		}

		if (!req.body.Metrics) {
			throw new Error("Expected 'Metrics' property on body");
		}

        if (!req.body.Properties) {
            throw new Error("Expected 'Properties' property on body");
        }

		var timeReceived = moment().toDate();
		var metrics = E.from(req.body.Metrics)
			.select(function (metric) {
                return transformMetric(metric, req.body.Properties, timeReceived);
            })
			.toArray();

		outputPlugin.emit(metrics);

		res.status(200).end();
	});

	var server = app.listen(conf.get("port"), "0.0.0.0", function () {
		var host = server.address().address;
		var port = server.address().port;
		console.log("Receiving metrics at " + host + ":" + port + "/emit");
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
	var conf = require('confucious');
	startServer({}, require('./mongodb-output')(conf));
}
else {
	// 
	// Required from another module.
	//
	module.exports = startServer;
}
