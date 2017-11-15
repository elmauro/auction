# Auction System

Allow working with Auctions

## Asumptions

1. Postgres installed with the properly configuration https://gist.github.com/p1nox/4953113
2. docker installed
3. docker-compose installed


## Instalation

a. Install with npm

1. npm install
2. npm start
3. open https://localhost:8080

b. Install with Docker (assuming docker installed on current machine)

1. docker build -t auction_web .
2. docker-compose up
3. open https://localhost:8080


## How Use the API

GET
  https://localhost:8080/api/users

GET
  https://localhost:8080/api/users/username/[username]

POST
  https://localhost:8080/api/users
  
  {
    "username": "elmauro",
    "coins": 100,
    "breads": 30,
    "carrots": 18,
    "diamond": 1
  }

PUT
  https://localhost:8080/api/users/[user_id]
  
  {
    "username": "elmauro",
    "coins": 2000,
    "breads": 30,
    "carrots": 18,
    "diamond": 1
  }

DEL
  https://localhost:8080/api/users/[user_id]


## For Testing

	Execute:

	1. npm test
	2. npm run coverage


## Future Work

1. work into cloud server (AWS - Google Cloude - Azure). The deploy can be doing with Docker and 
   mapping with public IP

