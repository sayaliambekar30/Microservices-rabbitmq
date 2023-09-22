-Microservices Project
-- api-gateway
The API Gateway can route requests, transform protocols, aggregate data and implement shared logic like authentication and rate-limiters.

-3 services

1. auth-service
2. order-service
3. product-service

routes:-
post - http://localhost:9990/auth/register
{
"name":"sayali",
"email":"sayali@gamil.com",
"password":"sayali"
}

post - http://localhost:9990/auth/login
{
"email":"sayali@gamil.com",
"password":"sayali"
}

post - localhost:9990/product/create
{
"name":"product 2",
"description":"product 2 description aaa",
"price":1000
}

post - localhost:9990/product/buy
{
"ids" : [
"64f842765c5a519bac0a4568",
"64f842765c5a519bac0a4569"
]
}

get - localhost:9990/product/allProduct

get - localhost:9990/order/user/example@gamil.com

delete - localhost:9990/order/{orderId}
ex:-
delete - localhost:9990/order/64f8428c300e677a52c20e06

put - localhost:9990/product/update/{productId}
{
"name":"Updated product",
"description":"product 1 descriptionj updated",
"price":1000
}
