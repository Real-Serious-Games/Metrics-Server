# Metrics-Server

A tiny server for receiving metrics by HTTP post.

The metrics are stored to MongoDB.

## Install

	npm install -g rsg-metrics-server

## Run

	rsg-metrics-server [--port <portno>]


## Configuration

Edit the file config.json where you can set the database, collections and port for the server.

The port can be optionally specified on the command line.


## Post metrics

The body of the HTTP post should look like this

	{
		"Metrics": [
			// Array of metrics posted to the server.
		],
		"Properties": [
			// Key/value pairs attached to this set of metrics. 
		]
	} 

Each metric in the array is stored in the database as a separate document.

Each metric has time stamp and properties attached before being stored in the database.