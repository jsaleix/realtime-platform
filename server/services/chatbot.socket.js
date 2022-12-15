const { UniqueConstraintError, fn, col, Op } = require('sequelize');
const { CHATBOT_RECEIVED_EVENTS, CHATBOT_EMITTED_EVENTS } = require("../constants/ws-events");
const { QUESTIONS } = require("./utils/questions");

const clientsQuestion = [];

exports.chatbotHandler = async (io) => {
  io.of('/chatbot').on('connection', async (socket) => {
    let notes = {};
    socket.emit("message_received", {id: "origin", ...(await QUESTIONS["origin"]())});
    //Setting the current question for each client
    clientsQuestion[socket.id] = "origin";
  
    socket.on("answer", async answer => {
      const currentQuestion = await QUESTIONS[clientsQuestion[socket.id]](answer, notes);
      if(!currentQuestion){
        socket.emit("message_received", {id: "origin", ...(await QUESTIONS["origin"]())});
        clientsQuestion[socket.id] = "origin";
        return;
      }

      let next = "origin";
      if(!currentQuestion?.prompt){
        if(currentQuestion?.next){
          next = currentQuestion.next;
        }
        //If the current question doesn't have neither a prompt or a next,  we go back to the origin
      }else{
        if(currentQuestion.prompt.type === "Controlled"){
          if(currentQuestion.prompt.next){
              next = currentQuestion.prompt.next;
          }else if(currentQuestion.prompt.answers[answer.value].next){
            next = currentQuestion.prompt.answers[answer.value].next;
          }
        }else{
            next = currentQuestion.prompt.next;
        }
      }
      // saving the current question for the client
      clientsQuestion[socket.id] = next;
      setTimeout(async () => {
        socket.emit("message_received", {id: next, ...(await QUESTIONS[next](answer, notes))});
      }, 0);
    })
  });
};
