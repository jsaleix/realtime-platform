# Realtime-platform

## First of all

This project is a motorcycle-related platform implementing different types of realtime methods such as websocket and Server-sent events. 
On it:
- users can communicate with a chatbot for the maintenance of a motorcycle, which requires some conditions. 
- users can communicate directly with an administrator
- users can communicate with each other by text in real time by joining channels. 

The said channels are predefined by the administrators, and can be created, modified and deleted by them. Also, administrator can broadcast notification to every users.

## Technologies:

- Docker
- React
- Express
- Sequelize
- Websockets
- Socket.io

## Seeds

If you want to test with up to date data :
Modify the file **/server/fixtures/data.json** since there are Date based data (the appointments).
You can use the **fullWeek.json** example to make the chatbot give you appointments for the next week, do not forget to update data to your current week Date.
You can use **sampleWeek.json** to have an example with only some appointments in your chatbot.

The fixtures are loaded automatically on migration run.
Only data in data.json is loaded.

Basic accounts are :

|Email| Password |
|--|--|
| admin@admin.com | admin |
| user@user.com | user|
| user1@user1.com | user1|


## Launch whole projet

Execute the following commands at the root of the project ./
```
cp ./server/.env.example ./server/.env
cp ./app/.env.example ./app/.env
docker compose up --build -d
```
Then, after a few seconds:
```
docker compose exec server npm run migrate
```
And finally:
```
docker compose restart server
```