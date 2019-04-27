var express = require('express')
var path = require('path')

var srv = express()

srv.use('/static',express.static(path.join(__dirname + '/static')))

srv.get('/',(req,res) => {
	res.sendFile(path.join(__dirname + '/index.html'))
})

var server = srv.listen(process.env.PORT, () => {
	var host = server.address().address
	var port = server.address().port
	console.log('Web server started at http://%s:%s', host, port)
})
