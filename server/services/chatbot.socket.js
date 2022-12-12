const { UniqueConstraintError, fn, col, Op } = require('sequelize');
const { CHATBOT_RECEIVED_EVENTS, CHATBOT_EMITTED_EVENTS } = require("../constants/ws-events");
const { Appointment } = require("../models");
const { QUESTIONS } = require("./utils/questions");
const email = "contact@chatbot.com";
const phoneNumber = "0000000000";
const  workingHours = {
    start: 9,
    end: 18,
};
const maxAppointmentTimeByDay = ((workingHours.end - workingHours.start)*60);
const maxAppointmentTimeByWeek = (maxAppointmentTimeByDay * 5);
const clientsQuestion = [];

exports.chatbotHandler = (io, socket) => {
    let notes = {};
    socket.emit("message_received", {id: "origin", ...QUESTIONS["origin"]});
    //Setting the current question for each client
    clientsQuestion[socket.id] = "origin";
  
    socket.on("answer", answer => {
      console.log(answer)
      const currentQuestion = QUESTIONS[clientsQuestion[socket.id]];
      if(!currentQuestion){
        socket.emit("message_received", {id: "origin", ...QUESTIONS["origin"]});
        clientsQuestion[socket.id] = "origin";
        return;
      }

      var next = "origin";
      if(!currentQuestion?.prompt){
        if(currentQuestion?.next){
          next = currentQuestion.next;
        }
        //If the current question doesn't have neither a prompt or a next, we go back to the origin
      }else{
        if(currentQuestion.prompt.type === "Controlled"){
          console.log(currentQuestion.prompt.answers[answer.value]);
          if (currentQuestion.prompt.dynamic && currentQuestion.prompt.next) {
            next = currentQuestion.prompt.next(currentQuestion.prompt.answers[answer.value].value, notes);
          }else{
            next = currentQuestion.prompt.answers[answer.value].next;
          }
        }else{
          if (currentQuestion.prompt.dynamic) {
            next = currentQuestion.prompt.next(answer.value);
          }else{
            next = currentQuestion.prompt.next;
          }
        }
      }
      console.log("notes is", notes);
      console.log("next is", next)
      // saving the current question for the client
      clientsQuestion[socket.id] = next;
      setTimeout(() => {
        socket.emit("message_received", {id: next, ...QUESTIONS[next]});
      }, 1000);
    })

    // socket.on(CHATBOT_RECEIVED_EVENTS.CONVERSATION_CONTACT_EMAIL, () => {
    //     socket.emit(CHATBOT_EMITTED_EVENTS.CONTACT_EMAIL, email);
    //   })
    
    //   socket.on(CHATBOT_RECEIVED_EVENTS.CONVERSATION_CONTACT_PHONE, () => {
    //     socket.emit(CHATBOT_EMITTED_EVENTS.CONTACT_PHONE, phoneNumber);
    //   })
    
      // socket.on(CHATBOT_RECEIVED_EVENTS.APPOINTMENT_DISPONIBILITY, async() => {
      //   let curr = new Date;
      //   let dayLeftTime = maxAppointmentTimeByDay;
      //   let weekLeftTime = maxAppointmentTimeByWeek;
      //   let availableDays = {};
      //   curr.setHours(0, 0, 0, 0);
      //   curr.setDate(curr.getDate() - 1);
      //   console.log("INIT WEEK", weekLeftTime);
      //   for(let i = 0; i < 7; i++){
      //     let date = new Date(curr.setDate(curr.getDate() + 1));
      //     if(date.getDay() === 0 || date.getDay() === 6){
      //       continue;
      //     }
      //     let appointments = await Appointment.findAll({
      //       where: {
      //         date: {
      //           [Op.gte]: new Date(date.setHours(workingHours.start, 0, 0, 0)),
      //           [Op.lt]: new Date(date.setHours(workingHours.end, 0, 0, 0)),
      //         }
      //       },
      //     });
      //     appointments.map(appointment => {
      //       dayLeftTime -= appointment.duration;
      //     });
      //     if(dayLeftTime > 0){
      //       availableDays[date.toDateString()] = appointments;
      //     } else {
      //       delete availableDays[date.toDateString()];
      //     }
      //     console.log(new Date(date).toISOString(), dayLeftTime);
      //     if(weekLeftTime > 0 && dayLeftTime < maxAppointmentTimeByDay){
      //       weekLeftTime -= (maxAppointmentTimeByDay - dayLeftTime);
      //     } 
      //     dayLeftTime = maxAppointmentTimeByDay;
      //   }
      //   if(weekLeftTime > 0){
      //     //SEND THE WEEK
      //     return;
      //   }
      //   //SEND NO PLACE IN THIS WEEK
      //   console.log(availableDays, weekLeftTime);
      // })
};
