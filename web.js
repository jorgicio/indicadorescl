var express = require('express')
var packageInfo = require('./package.json')

var app = express()

app.get('/',(req,res) => {
	res.json({ version: packageInfo.version })
})

var server = app.listen(process.env.PORT, () => {
	var host = server.address().address
	var port = server.address().port
	console.log('Web server started at http://%s:%s', host, port)
})
