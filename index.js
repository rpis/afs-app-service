const { CosmosClient } = require("@azure/cosmos");
const { DefaultAzureCredential } = require("@azure/identity");
const http = require("http");
const port = process.env.PORT || 3000

let container = null;
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOSDB_CONNECTION_STRING,
    aadCredentials: new DefaultAzureCredential()
});

const requestListener = async function (req, res) {
    console.log("Call service :", req.method, req.url);
    if (req.method === "GET" && req.url === "/") {
        var users = (await container.items.readAll().fetchAll()).resources
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(users));
    } else if (req.method === "GET" && req.url.startsWith("/") && req.url.length > 1) {
        var id = req.url.substring(1);
        var user = (await container.item(id, id).read()).resource
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(user));
    } else if (req.method === "POST" && req.url === "/") {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', async function () {
            try {
                var b = JSON.parse(body);
                var user = {
                    id: b.id,
                    partitionKey: b.id,
                    name: b.name,
                    email: b.email,
                    status: "INACTIVE",
                };
                var ret = (await container.items.create(user)).resource;
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify(ret));
            } catch (err) {
                console.log(err);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(`{ "message": "Internal server error"}`);
            }
        });

    } else {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(`{ "message": "Not found"}`);
    }
};

const server = http.createServer(requestListener);
server.listen(port, async () => {
    const { database } = await cosmosClient.databases.createIfNotExists({
        id: 'users',
    });
    container = (await database.containers.createIfNotExists({
        id: 'users',
        partitionKey: '/partitionKey',
    })).container;
    console.log(`Server is running on http://localhost:${port}`);
});