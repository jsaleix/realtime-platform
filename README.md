## Start the web app

Execute the following commands at the root of the project ./

    docker compose up -d
    docker compose exec app npm i && npm run dev


## Launch whole projet

Execute the following commands at the root of the project ./

    docker compose up --build -d
    docker compose exec server npm run migrate
