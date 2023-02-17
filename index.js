const http = require("http");
const port = process.env.PORT || 3000

const response = [{
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@wp.pl"
}, {
    "id": 2,
    "name": "Katerina Pavelkova",
    "email": "k.pav@nevi.cz"
}];

const requestListener = function (req, res) {
    console.log("Call service :", req.method, req.url);
    if (req.method === "GET" && req.url === "/") {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(response));
    } else {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(`{ "message": "Not found"}`);
    }
};

const server = http.createServer(requestListener);
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});