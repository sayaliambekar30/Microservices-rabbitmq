const express = require('express');
var app = express();
const PORT = 9990;
const { createProxyMiddleware } = require('http-proxy-middleware')


// define routes and their ports
const routes = {
    "/auth": "http://localhost:7070",
    "/product": "http://localhost:8090",
    "/order": "http://localhost:9090",

}

// create a proxy for each route
for(const route in routes){
    const target = routes[route];
    app.use(route, createProxyMiddleware({target}))
}


app.listen(PORT, ()=>{
    console.log(`API GATEWAY STARTED ON PORT ${PORT}`)
})