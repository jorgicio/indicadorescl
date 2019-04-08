const telebot = require('telegraf')
const https = require('https')
const req = require('request')
const app = new telebot(process.env.BOT_TOKEN)
const api_url = 'https://mindicador.cl/api'
const opciones_fecha = {
	weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}
const schedule = require('node-schedule')

app.command('help', (ctx) => {
    var mensaje = "Bienvenido al bot de los indicadores económicos de Chile\n"
	mensaje += "Puede iniciar el bot con el comando /start [hh:mm] y programarlo a la hora que desee (en formato 24 horas)\n"
	mensaje += "Si no la especifica, por defecto enviará alertas a las 12 horas.\n"
	mensaje += "Puede detenerlo con el comando /stop\n"
    mensaje += "Puede consultar los indicadores del día con el comando /indicadores\n"
    ctx.reply(mensaje)
})

app.command('start',(ctx) => {
	var param = ctx.message.text.split(" ")
	var d = (param[1] === undefined)? '' : param[1]
	var string, mensaje
	if (d == '') {
		string = "0 12 * * *"
		mensaje = "Hora configurada por defecto a las 12 horas"
	}
	else{
		try{
			var hora = param[1].split(":")
			string = parseInt(hora[1]) + " " + parseInt(hora[0]) + " * * *"
			mensaje = "Hora configurada a las " + param[1]
		} catch(err){
			ctx.reply("Lo siento, ha pasado un formato inválido de hora")
		}
	}
	ctx.reply(mensaje)
	schedule.scheduleJob(string, (y) => {
		https.get(api_url,(res) => {
		res.setEncoding('utf-8')
		var data = ''

		res.on('data', (chunk) => {
			data += chunk
		})
		
		res.on('end', () => {
			var dailyIndicators = JSON.parse(data)
			var fecha = new Date(dailyIndicators.fecha)
			var indic = "Buenos días, " + ctx.from.first_name + "\n"
			indic += "Éstos son los indicadores para el día de hoy " + fecha.toLocaleDateString('es',opciones_fecha) + ":\n\n"
			indic += "Dólar: CLP$ " + dailyIndicators.dolar.valor + "\n"
			indic += "Dólar intercambio: CLP$ " + dailyIndicators.dolar_intercambio.valor + "\n"
			indic += "Euro: CLP$ " + dailyIndicators.euro.valor +"\n"
			indic += "UTM: CLP$ " + dailyIndicators.utm.valor + "\n"
			indic += "UF: CLP$ " + dailyIndicators.uf.valor + "\n"
			indic += "IPC: " + dailyIndicators.ipc.valor + "%\n"
            indic += "IVP: CLP$ " + dailyIndicators.ivp.valor + "\n"
            indic += "IMACEC: " + dailyIndicators.imacec.valor + "%\n"
            indic += "Tasa Política Monetaria: " + dailyIndicators.tpm.valor + "%\n"
            indic += "Libra de cobre: USD$ " + dailyIndicators.libra_cobre.valor + "\n"
            indic += "Tasa de desempleo: " + dailyIndicators.tasa_desempleo.valor + "%\n"
            indic += "Bitcoin: USD$ " + dailyIndicators.bitcoin.valor + "\n"
			ctx.reply(indic)
			})
		}).on('error',function(err){
			console.log(err)
		})
	})
})

app.command('stop',(ctx) => {
	app.stop()
})

app.command('indicadores',(ctx) => {
	https.get(api_url,(res) => {
		res.setEncoding('utf-8')
		var data = ''

		res.on('data', (chunk) => {
			data += chunk
		})
		
		res.on('end', () => {
			var dailyIndicators = JSON.parse(data)
			var fecha = new Date(dailyIndicators.fecha)
			var indic = "Éstos son los indicadores para el día de hoy " + fecha.toLocaleDateString('es',opciones_fecha) + ":\n\n"
			indic += "Dólar: CLP$ " + dailyIndicators.dolar.valor + "\n"
			indic += "Dólar intercambio: CLP$ " + dailyIndicators.dolar_intercambio.valor + "\n"
			indic += "Euro: CLP$ " + dailyIndicators.euro.valor +"\n"
			indic += "UTM: CLP$ " + dailyIndicators.utm.valor + "\n"
			indic += "UF: CLP$ " + dailyIndicators.uf.valor + "\n"
			indic += "IPC: " + dailyIndicators.ipc.valor + "%\n"
            indic += "IVP: CLP$ " + dailyIndicators.ivp.valor + "\n"
            indic += "IMACEC: " + dailyIndicators.imacec.valor + "%\n"
            indic += "Tasa Política Monetaria: " + dailyIndicators.tpm.valor + "%\n"
            indic += "Libra de cobre: USD$ " + dailyIndicators.libra_cobre.valor + "\n"
            indic += "Tasa de desempleo: " + dailyIndicators.tasa_desempleo.valor + "%\n"
            indic += "Bitcoin: USD$ " + dailyIndicators.bitcoin.valor + "\n"
			ctx.reply(indic)
		})
	}).on('error',function(err){
		console.log(err)
	})
})

app.startPolling()
