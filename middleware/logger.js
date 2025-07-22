import winston from "winston";


// Define custom log levels and their colors
winston.addColors({
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    verbose: "blue",
    debug: "magenta",
    silly: "cyan",
  });
  
  // Initialize Winston logger
 export const logger = winston.createLogger({
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      verbose: 4,
      debug: 5,
      silly: 6,
    },
    // level: "info", // Set your desired log level
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      // winston.format.json(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(), // Log to the console
      new winston.transports.File({ filename: "app.log" }), // Log to a file
    ],
  });

  