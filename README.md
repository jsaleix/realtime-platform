# First of all

If you want to test with up to date data :
```
    Modify the file /server/fixtures/data.json since there are Date based data (the appointments).
    You can use the fullWeek.json example to make the chatbot give you appointments for the next week, dont forget to update data to your current week Date.
    You can use sampleWeek.json to have an example with only some appointments in your chatbot.
```


The fixtures are loaded automatically on migration run.
Only data in data.json is loaded.
Basic accounts are :
```
    email                           pwd
    admin@admin.com                 admin
    user@user.com                   user
    user1@user1.com                 user1
```

## Launch whole projet

Execute the following commands at the root of the project ./

    cp ./server/.env.example ./server/.env
    cp ./app/.env.example ./app/.env
    docker compose up --build -d
    docker compose exec server npm run migrate