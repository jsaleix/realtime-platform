## Launch whole projet

Execute the following commands at the root of the project ./

    cp ./server/.env.example ./server/.env && cp ./app/.env.example ./app/.env
    docker compose up --build -d
    docker compose exec server npm run migrate