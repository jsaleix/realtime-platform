const { UniqueConstraintError, fn, col, Op } = require('sequelize');
const { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS, GLOBAL_EVENTS, CHATBOT_RECEIVED_EVENTS, CHATBOT_EMITTED_EVENTS } = require("../constants/ws-events");
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

exports.chatbotHandler = (io, socket) => {
    socket.emit("message_received", {id: "origin", ...QUESTIONS["origin"]});

    socket.on("answer", answer => {
        const requested_question = QUESTIONS[answer.next];
        if( !requested_question?.prompt ){
          socket.emit("message_received", {id: "origin", ...QUESTIONS["origin"]});
          return;
        }else{
          // if (typeof nextQuestion === "function") {
          //     const next = nextQuestion(answer.value);
          //     socket.emit("message_received", {id: next, ...QUESTIONS[next]});
          // } else {
          //     socket.emit("message_received", {id: nextQuestion, ...QUESTIONS[nextQuestion]});
          // }
          let next = requested_question.prompt.next;
          if(requested_question.prompt.dynamic) {
              next = requested_question.prompt.next(answer.value);
          }
          setTimeout(() => {
            socket.emit("message_received", {id: next, ...requested_question});
          }, 1000);
        }
    })

    socket.on(CHATBOT_RECEIVED_EVENTS.CONVERSATION_CONTACT_EMAIL, () => {
        socket.emit(CHATBOT_EMITTED_EVENTS.CONTACT_EMAIL, email);
      })
    
      socket.on(CHATBOT_RECEIVED_EVENTS.CONVERSATION_CONTACT_PHONE, () => {
        socket.emit(CHATBOT_EMITTED_EVENTS.CONTACT_PHONE, phoneNumber);
      })
    
      socket.on(CHATBOT_RECEIVED_EVENTS.APPOINTMENT_DISPONIBILITY, async() => {
        let curr = new Date;
        let dayLeftTime = maxAppointmentTimeByDay;
        let weekLeftTime = maxAppointmentTimeByWeek;
        let availableDays = {};
        curr.setHours(0, 0, 0, 0);
        curr.setDate(curr.getDate() - 1);
        console.log("INIT WEEK", weekLeftTime);
        for(let i = 0; i < 7; i++){
          let date = new Date(curr.setDate(curr.getDate() + 1));
          if(date.getDay() === 0 || date.getDay() === 6){
            continue;
          }
          let appointments = await Appointment.findAll({
            where: {
              date: {
                [Op.gte]: new Date(date.setHours(workingHours.start, 0, 0, 0)),
                [Op.lt]: new Date(date.setHours(workingHours.end, 0, 0, 0)),
              }
            },
          });
          appointments.map(appointment => {
            dayLeftTime -= appointment.duration;
          });
          if(dayLeftTime > 0){
            availableDays[date.toDateString()] = appointments;
          } else {
            delete availableDays[date.toDateString()];
          }
          console.log(new Date(date).toISOString(), dayLeftTime);
          if(weekLeftTime > 0 && dayLeftTime < maxAppointmentTimeByDay){
            weekLeftTime -= (maxAppointmentTimeByDay - dayLeftTime);
          } 
          dayLeftTime = maxAppointmentTimeByDay;
        }
        if(weekLeftTime > 0){
          //SEND THE WEEK
          return;
        }
        //SEND NO PLACE IN THIS WEEK
        console.log("FINAL WEEK", weekLeftTime);
      })
};
