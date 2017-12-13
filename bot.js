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
    mensaje += "O bien, puede consultar por separado con los siguientes comandos:\n\n"
    mensaje += "/dolar El dólar observado (desde 1984)\n"
    mensaje += "/acuerdo El dólar acuerdo (desde 1988)\n"
    mensaje += "/euro El euro (desde 1999)\n"
    mensaje += "/ipc El Índice de Precios al Consumidor (IPC; desde 1928)\n"
    mensaje += "/imacec El Indicador Mensual de Actividad Económica (IMACEC; desde 2004)\n"
    mensaje += "/ivp El Índice de Valor Promedio (IVP; desde 1990)\n"
    mensaje += "/utm La Unidad Tributaria Mensual (UTM; desde 1990)\n"
    mensaje += "/uf La Unidad de Fomento (UF; desde 1977)\n"
    mensaje += "/tpm La Tasa Política Monetaria (TPM; desde 2001)\n"
    mensaje += "/cobre El valor de la libra de cobre (en dólares; desde 2012)\n"
    mensaje += "/desempleo La tasa de desempleo (desde 2009)\n\n"
    mensaje += "Los comandos anteriores se pueden consultar opcionalmente dando una fecha específica\n"
    mensaje += "ya sea en el formato dd-mm-aaaa (separado por guión) o un año de cuatro cifras. Por ejemplo:\n"
    mensaje += "/dolar 4-3-2017 para consultar el valor del dólar al 4 de Marzo del 2017"
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
			indic += "Dólar: $" + dailyIndicators.dolar.valor + "\n"
			indic += "Dólar acuerdo: $" + dailyIndicators.dolar_intercambio.valor + "\n" 
			indic += "UTM: $" + dailyIndicators.utm.valor + "\n"
			indic += "UF: $" + dailyIndicators.uf.valor + "\n"
			indic += "Euro: $" + dailyIndicators.euro.valor +"\n"
			indic += "IPC: " + dailyIndicators.ipc.valor + "%\n"
			indic += "Índice de Valor Promedio: $" + dailyIndicators.ivp.valor + "\n"
			indic += "IMACEC: " + dailyIndicators.imacec.valor + "%\n"
			indic += "Tasa Política Monetaria: " + dailyIndicators.tpm.valor + "%\n"
			indic += "Libra de cobre: USD$" + dailyIndicators.libra_cobre.valor + "\n"
			indic += "Tasa de desempleo: " + dailyIndicators.tasa_desempleo.valor + "%"
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
			indic += "Dólar: $" + dailyIndicators.dolar.valor + "\n"
			indic += "Dólar acuerdo: $" + dailyIndicators.dolar_intercambio.valor + "\n" 
			indic += "UTM: $" + dailyIndicators.utm.valor + "\n"
			indic += "UF: $" + dailyIndicators.uf.valor + "\n"
			indic += "Euro: $" + dailyIndicators.euro.valor +"\n"
			indic += "IPC: " + dailyIndicators.ipc.valor + "%\n"
			indic += "Índice de Valor Promedio: $" + dailyIndicators.ivp.valor + "\n"
			indic += "IMACEC: " + dailyIndicators.imacec.valor + "%\n"
			indic += "Tasa Política Monetaria: " + dailyIndicators.tpm.valor + "%\n"
			indic += "Libra de cobre: USD$" + dailyIndicators.libra_cobre.valor + "\n"
			indic += "Tasa de desempleo: " + dailyIndicators.tasa_desempleo.valor + "%"
			ctx.reply(indic)
		})
	}).on('error',function(err){
		console.log(err)
	})
})

app.command('dolar', (ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/dolar' + args
	var full_url = api_url + args
	https.get(full_url,(res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data', (chunk) => {
			data += chunk
		})
		res.on('end', () => {
			var dailyIndicators = JSON.parse(data)
			try {
                var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El valor del dólar observado para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de $" + dailyIndicators.serie[0].valor)
			} catch (err){
				return ctx.reply("No se pudo encontrar un valor para esa fecha")
			}
		})
	}).on('error',(err) => {
		console.log(err)
	})
})

app.command('acuerdo',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/dolar_intercambio' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El valor del dólar acuerdo para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de $" + dailyIndicators.serie[0].valor)
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para esa fecha")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('euro',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/euro' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El valor del euro para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de $" + dailyIndicators.serie[0].valor)
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para esa fecha")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('uf',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/uf' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El valor de la UF para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de $" + dailyIndicators.serie[0].valor)
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para esa fecha")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('utm',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/utm' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El valor de la UTM para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de $" + dailyIndicators.serie[0].valor)
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para esa fecha")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('imacec',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/imacec' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El IMACEC para " + fecha.toLocaleDateString('es',opciones_fecha) + " es del " + dailyIndicators.serie[0].valor + "%")
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para esa fecha")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('ipc',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/ipc' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El IPC para " + fecha.toLocaleDateString('es',opciones_fecha) + " es del " + dailyIndicators.serie[0].valor + "%")
			}catch(err){
				return ctx.reply("No se puede encontrar un valor para ese día")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('ivp',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/ivp' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("El Índice de Valor Promedio para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de $" + dailyIndicators.serie[0].valor)
			}catch(err){
				return ctx.reply("No se puede encontrar un valor para ese día")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('tpm',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/tpm' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("La Tasa Política Monetaria para " + fecha.toLocaleDateString('es',opciones_fecha) + " es del " + dailyIndicators.serie[0].valor + "%")
			}catch(err){
				return ctx.reply("No se puede encontrar un valor para ese día")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('cobre',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/libra_cobre' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("La libra de cobre para " + fecha.toLocaleDateString('es',opciones_fecha) + " está a USD$" + dailyIndicators.serie[0].valor)
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para ese día")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})

app.command('desempleo',(ctx) => {
	var spl_txt = ctx.message.text.split(" ")
	var args = (spl_txt[1] === undefined)? '' : '/' + spl_txt[1]
	args = '/tasa_desempleo' + args
	var full_url = api_url + args
	https.get(full_url, (res) => {
		res.setEncoding('utf-8')
		var data = ''
		res.on('data',(chunk) => {
			data += chunk
		})
		res.on('end',() => {
			var dailyIndicators = JSON.parse(data)
			try{
				var fecha = new Date(dailyIndicators.serie[0].fecha)
				return ctx.reply("La tasa de desempleo para " + fecha.toLocaleDateString('es',opciones_fecha) + " es de un " + dailyIndicators.serie[0].valor + "%" )
			}catch(err){
				return ctx.reply("No se pudo encontrar un valor para ese día")
			}
		})
	}).on('error', (err) => {
		console.log(err)
	})
})


app.startPolling()
