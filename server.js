const express = require('express');
const sequelize = require('./db');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const logger=require('./logger')


app.use(express.json());



const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
// Setup CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.225.77:5173'
    
 
  ];
const corsOptions = {
     credentials: true,
     origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    
  };

app.use(cors(corsOptions));


  app.use(morgan("dev"));
  app.use(express.urlencoded({extended:true}))

  const EmpRoute = require('./Route/EmpRoute');
app.use('/api/emp', EmpRoute);

sequelize.sync({ alter: true })
    .then(() => {
        console.log("Database & tables altered!");
        app.listen(3000, () => {
            console.log(`Server running on port 3000`);
        });
    })
    .catch(err => {
        console.error(err);
    });