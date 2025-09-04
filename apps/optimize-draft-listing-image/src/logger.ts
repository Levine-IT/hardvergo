/** biome-ignore-all lint/suspicious/noExplicitAny: <winston has the same method definations> */
import type winston from "winston";

export abstract class BaseLogger {
	protected winston: winston.Logger;

	constructor(winston: winston.Logger) {
		this.winston = winston;
	}

	info(message: string, ...meta: any[]): BaseLogger;
	info(message: any): BaseLogger;
	info(infoObject: object): BaseLogger;
	info(message: any, ...meta: any[]): BaseLogger {
		this.winston.info(message, ...meta);
		return this;
	}

	error(message: string, ...meta: any[]): BaseLogger;
	error(message: any): BaseLogger;
	error(infoObject: object): BaseLogger;
	error(message: any, ...meta: any[]): BaseLogger {
		this.winston.error(message, ...meta);
		return this;
	}

	warn(message: string, ...meta: any[]): BaseLogger;
	warn(message: any): BaseLogger;
	warn(infoObject: object): BaseLogger;
	warn(message: any, ...meta: any[]): BaseLogger {
		this.winston.warn(message, ...meta);
		return this;
	}

	debug(message: string, ...meta: any[]): BaseLogger;
	debug(message: any): BaseLogger;
	debug(infoObject: object): BaseLogger;
	debug(message: any, ...meta: any[]): BaseLogger {
		this.winston.debug(message, ...meta);
		return this;
	}

	child(context: object): winston.Logger {
		return this.winston.child(context);
	}
}
