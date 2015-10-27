'use strict';

//
// Output plugin that stores logs in MongoDB database.
//

module.exports = function (config) {

	var conf = require('confucious');
	var pmongo = require('promised-mongo');
	conf.pushJsonFile('config.json');

	var db = pmongo(conf.get('db'));
	var metricsCollection = db.collection(conf.get('mainCollection'));

	return {

		//
		// Emit an array of logs to the database.
		//
		emit: function (metrics) {
			metrics.forEach(function (metric) {

				metricsCollection.save(metric);
			});			
		},

	};
};