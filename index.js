const PORT = 3000;

const http = require("http");
const app = require("./src/app.js");

const server = http.createServer(app);

function onError(err) {
    console.error(err);
    process.exit(1);
}

function onListening() {
    console.log("Sever is listening on " + PORT);
}

server.on("error", onError);
server.on("listening", onListening);
server.listen(PORT);