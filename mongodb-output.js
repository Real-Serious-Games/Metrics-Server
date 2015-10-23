'use strict';

//
// Output plugin that stores logs in MongoDB database.
//

module.exports = function (config) {

	var conf = require('confucious');
	var pmongo = require('promised-mongo');
	conf.pushJsonFile('config.json');

	var db = pmongo(conf.get('db'));
	var logsCollection = db.collection(conf.get('logsCollection'));
	var errorsCollection = db.collection(conf.get('errorsCollection'));


	return {

		//
		// Emit an array of logs to the database.
		//
		emit: function (logs) {
			logs.forEach(function (log) {

				if (log.Level === 'Fatal' || log.Level === 'Error') {
					errorsCollection.save(logEntry);
				}

				logsCollection.save(log);
			
				console.log(log.Properties.UserName + " | " + log.RenderedMessage);
			});			
		},

	};
};