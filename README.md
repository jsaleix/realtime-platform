## Create the database with sample data

Execute the following commands at the root of the project ./

    docker compose up -d
    docker compose exec server npm i && npm run migrate


## Start the web app

Execute the following commands at the root of the project ./

    docker compose up -d
    docker compose exec app npm i && npm run dev


## Start the API

Execute the following commands at the root of the project ./

    docker compose up -d
    docker compose exec server npm i && npm run dev
