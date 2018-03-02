const telebot = require('telegraf')
const https = require('https')
const req = require('request')
const app = new telebot(process.env.BOT_TOKEN)
const api_url = 'https://indicadoresdeldia.cl/webservice/indicadores.json'
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
			var fecha = new Date(dailyIndicators.date)
			var indic = "Buenos días, " + ctx.from.first_name + "\n"
			indic += "Éstos son los indicadores para el día de hoy " + fecha.toLocaleDateString('es',opciones_fecha) + ":\n\n"
			indic += "Dólar: $" + dailyIndicators.moneda.dolar + "\n"
			indic += "UTM: $" + dailyIndicators.moneda.utm + "\n"
			indic += "UF: $" + dailyIndicators.moneda.uf + "\n"
			indic += "Euro: $" + dailyIndicators.moneda.euro +"\n"
			indic += "IPC: " + dailyIndicators.moneda.ipc + "%\n"
			indic += "Índice General de Precios de Acciones (IGPA): " + dailyIndicators.bolsa.igpa + "\n"
			indic += "Índice de Precio Selectivo de Acciones (IPSA): " + dailyIndicators.bolsa.ipsa + "\n"
			indic += "Índice Inter-10: " + dailyIndicators.bolsa.inter10 + "\n"
			indic += "Banca:" + dailyIndicators.bolsa.banca + "\n"
			indic += "Commodities: " + dailyIndicators.bolsa.commodities + "\n"
			indic += "Constructora e Inmobiliarias: " + dailyIndicators.bolsa.const_inmob + "\n"
			indic += "Industrial: " + dailyIndicators.bolsa.industrial + "\n"
			indic += "Retail: " + dailyIndicators.bolsa.retail + "\n"
			indic += "Utilidades: " + dailyIndicators.bolsa.utilities + "\n"
			indic += "Santoral del día de hoy:" + dailyIndicators.santoral.hoy + "\n"
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
			var fecha = new Date(dailyIndicators.date)
			var indic = "Éstos son los indicadores para el día de hoy " + fecha.toLocaleDateString('es',opciones_fecha) + ":\n\n"
			indic += "Dólar: $" + dailyIndicators.moneda.dolar + "\n"
			indic += "UTM: $" + dailyIndicators.moneda.utm + "\n"
			indic += "UF: $" + dailyIndicators.moneda.uf + "\n"
			indic += "Euro: $" + dailyIndicators.moneda.euro +"\n"
			indic += "IPC: " + dailyIndicators.moneda.ipc + "%\n"
			indic += "Índice General de Precios de Acciones (IGPA): " + dailyIndicators.bolsa.igpa + "\n"
			indic += "Índice de Precio Selectivo de Acciones (IPSA): " + dailyIndicators.bolsa.ipsa + "\n"
			indic += "Índice Inter-10: " + dailyIndicators.bolsa.inter10 + "\n"
			indic += "Banca:" + dailyIndicators.bolsa.banca + "\n"
			indic += "Commodities: " + dailyIndicators.bolsa.commodities + "\n"
			indic += "Constructora e Inmobiliarias: " + dailyIndicators.bolsa.const_inmob + "\n"
			indic += "Industrial: " + dailyIndicators.bolsa.industrial + "\n"
			indic += "Retail: " + dailyIndicators.bolsa.retail + "\n"
			indic += "Utilidades: " + dailyIndicators.bolsa.utilities + "\n"
			indic += "Santoral del día de hoy:" + dailyIndicators.santoral.hoy + "\n"
			ctx.reply(indic)
		})
	}).on('error',function(err){
		console.log(err)
	})
})

app.startPolling()
