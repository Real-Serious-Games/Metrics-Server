'use strict';

//
// Output plugin that stores logs in MongoDB database.
//

module.exports = function (conf) {

	var pmongo = require('promised-mongo');	
	var db = pmongo(conf.get('db'));
	var metricsCollection = db.collection(conf.get('metricsCollection'));

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