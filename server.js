const app = require('./app');
const port = process.env.PORT || 3001;

let server = app.listen(port, ()=> {
  console.log('Express server listening on port ' + port);
});