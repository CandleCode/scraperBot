const { createLogger, format, transports } = require('winston');


const logger = createLogger({
	level: 'info',
	json: true,
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new transports.File({ filename: 'logger/logs/error.log', level: 'error' }),
		new transports.File({ filename: 'logger/logs/combined.log' }),
	],
	exceptionHandlers: [
		new transports.File({ filename: 'logger/logs/exceptions.log' }),
	],
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console(
		{
			format: format.combine(
				format.colorize({ all:true }),
				format.timestamp({
					format: 'YYYY-MM-DD hh:mm:ss.SSS A',
				}),
				format.align(),
				format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
			),
			handleExceptions:true,
		},
	));
}


module.exports = {
	logger,
};
