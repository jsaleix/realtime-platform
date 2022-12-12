const { APPOINTMENT_TYPE } = require('../../constants/enums');
const email = "contact@chatbot.com";
const phoneNumber = "0000000000";

checkLastService = (serviceDateString, questionA, questionB) => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    const serviceDate = new Date(serviceDateString);
    if(serviceDate < minDate){
        return questionA;
    }
    return questionB;
};

checkKilometers = (kilometers, questionA, questionB) => {
    console.log(kilometers);
    if(kilometers >= 10000){
        return questionA;
    }else{
        return questionB;
    }
}

getAvalaibleDays = (appointmentType) => {
    let serviceTime = 0;
    console.log(appointmentType, APPOINTMENT_TYPE);
    if( !Object.keys(APPOINTMENT_TYPE).includes(appointmentType)){
        return [
            {
                "label": "The service type doesn't exists",
                "next": "origin",
            }
        ]
    }
    serviceTime = APPOINTMENT_TYPE[appointmentType];
    // if(!data || data.length === 0){
    //     return [
    //         {
    //             "label": "No appointment available",
    //             "next": "origin",
    //         },
    //         {
    //             "label": "End",
    //             "next": "end"
    //         }
    //     ]
    // }

    return [ 
        {
            "label": "2022-12-12 00:00:00",
            "value": "2022-12-12 00:00:00",
        },
        {
            "label": "2022-12-13 00:00:00",
            "value": "2022-12-13 00:00:00",
        },
        {
            "label": "2022-12-14 00:00:00",
            "value": "2022-12-14 00:00:00",
        },
        {
            "label": "Appointment Date", 
            "next": "appointment-saved"
        } 
    ];
}

getAvalaibleHours = (appointmentType, day) => {
    console.log(appointmentType, day);
    return [ 
        {
            "label": "08:00:00",
            "value": "08:00:00",
        },
        {
            "label": "09:00:00",
            "value": "09:00:00",
        },
        {
            "label": "10:00:00",
            "value": "10:00:00",
        },
        {
            "label": "Appointment Date", 
            "next": "appointment-saved"
        } 
    ];
}

askRdvDate = (appointmentType) => {
    let serviceTime = 0;
    console.log(appointmentType, APPOINTMENT_TYPE);
    if( !Object.keys(APPOINTMENT_TYPE).includes(appointmentType)){
        return [
            {
                "label": "The service type doesn't exists",
                "next": "origin",
            }
        ]
    }
    serviceTime = APPOINTMENT_TYPE[appointmentType];
    // if(!data || data.length === 0){
    //     return [
    //         {
    //             "label": "No appointment available",
    //             "next": "origin",
    //         },
    //         {
    //             "label": "End",
    //             "next": "end"
    //         }
    //     ]
    // }

    return [ 
        {

        },
        {
            "label": "Appointment Date", 
            "next": "appointment-saved"
        } 
    ];
}

exports.QUESTIONS = {
    "origin": () => {
        return {
            "label": "What do you need?",
            "prompt":{
                "type": "Controlled",
                "answers": [
                    {
                        "label": "Maintenance",
                        "next": "maintenance"
                    },
                    {
                        "label": "Vehicle information",
                        "next": "vehicle-info"
                    },
                    {
                        "label": "Contact information",
                        "next": "contact-info"
                    },
                    {
                        "label": "End",
                        "next": "end"
                    }
                ]
            }
        }
    },

    "maintenance": () => {
        return {
            "label": "In which year did you get your vehicle ?",
            "prompt":{
                "type": "Int",
                "next": "maintenance-ask-last-service"
            }
        }
    },

    "maintenance-ask-last-service": ({value: answer}, notes) => {
        const date = new Date(answer, 0, 1);
        console.log(date);
        notes.vehicleObtentionDate = date;
        // date.setFullYear(minDate.getFullYear() - answer);
        return {
            "label": "What is the last time you got your vehicle serviced?",
            "prompt": {
                "type": "date",
                "dynamic": true,
                "next": (lastAnswer) => checkLastService(lastAnswer.value, "maintenance-check-appointment", "maintenance-ask-kilometers")
            }
        }
    },

    "maintenance-check-appointment": (answer, notes) => {
        const days = getAvalaibleDays('MAINTENANCE');

        return {
            "label": "You should get your vehicle serviced",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "dynamic": true,
                "next": (lastAnswer) => {
                    notes.appointmentType = 'MAINTENANCE';
                    notes.appointmentDay = days[lastAnswer.value].value;
                    return 'appointment-hours'
                }
            }
        }
    },

    "maintenance-ask-kilometers": (answer, notes) => {
        return {
            "label": "How many kilometers did you drive since your last service?",
            "prompt":{
                "type": "Int",
                "dynamic": true,
                "next": (lastAnswer) => checkKilometers(lastAnswer.value, "maintenance-check-appointment", "maintenance-ask-appointment")
            }
        }
    },

    "maintenance-ask-appointment": (answer, notes) => {
        return {
            "label": "Do you want to schedule an appointment?",
            "prompt":{
                "type": "Controlled",
                "answers": [
                    {
                        "label": "Yes",
                        "next": "maintenance-check-appointment"
                    },
                    {
                        "label": "No",
                        "next": "origin"
                    }
                ]
            }
        }
    },

    "vehicle-info": (answer, notes) => {
        return {
            "label": "For what use of your vehicle do you need information ?",
            "prompt":{
                "type": "Controlled",
                "answers": [
                    {
                        "label": "City",
                        "next": "vehicle-info-city",
                    },
                    {
                        "label": "Off-road",
                        "next": "vehicle-info-offroad",
                    },
                    {
                        "label": "Sport",
                        "next": "vehicle-info-sport",
                    },
                ]
            }
        }
    },

    "vehicle-info-city": (answer, notes) => {
        const days = getAvalaibleDays('ESSAY-CITY');
        notes.appointmentType = 'ESSAY-CITY';
        notes.appointmentDay = days[answer.value].value;

        return {
            "label": "We can schedule you a meeting",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "dynamic": true,
                "next": (lastAnswer) => {
                    notes.appointmentType = 'ESSAY-CITY';
                    notes.appointmentDay = days[lastAnswer.value].value;
                    return 'appointment-hours'
                }
            }
        }
    },

    "vehicle-info-offroad": (answer, notes) => {
        const days = getAvalaibleDays('ESSAY-OFFROAD');
        notes.appointmentType = 'ESSAY-OFFROAD';
        notes.appointmentDay = days[answer.value].value;

        return {
            "label": "We can schedule you a meeting",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "dynamic": true,
                "next": (lastAnswer) => {
                    notes.appointmentType = 'ESSAY-OFFROAD';
                    notes.appointmentDay = days[lastAnswer.value].value;
                    return 'appointment-hours'
                }
            }
        }
    },

    "vehicle-info-sport": (answer, notes) => {
        const days = getAvalaibleDays('ESSAY-SPORT');
        notes.appointmentType = 'ESSAY-SPORT';
        notes.appointmentDay = days[answer.value].value;

        return {
            "label": "We can schedule you a meeting",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "dynamic": true,
                "next": (lastAnswer) => {
                    notes.appointmentType = 'ESSAY-SPORT';
                    notes.appointmentDay = days[lastAnswer.value].value;
                    return 'appointment-hours'
                }
            }
        }
    },

    "contact-info": () => {
        return {
            "label": "What info do you need ?",
            "prompt":{
                "type": "Controlled",
                "answers": [
                    {
                        "label": "Phone number",
                        "next": "contact-info-phone"
                    },
                    {
                        "label": "Email",
                        "next": "contact-info-email"
                    },
                ]
            }
        }
    },

    "contact-info-phone": (answer, notes) => {
        return {
            "label": "Here is your phone number : " + phoneNumber,
            "next": "origin"
        }
    },

    "contact-info-email": (answer, notes) => {
        return {
            "label": "Here is your email : " + email,
            "next": "origin"
        }
    },

    "appointment-hours": (answer, notes) => {
        const hours = getAvalaibleHours(notes.appointmentType, notes.appointmentDay);
        return {
            "label": "What time do you want to come ?",
            "prompt":{
                "type": "Controlled",
                "answers": hours,
                "next": "appointment-saved"
            }
        }
    },

    "appointment-saved": (answer, notes) => {
        return {
            "label": "Appointment successfully saved",
            "next": "origin"
        }
    },

    "end": (answer, notes) => {
        return {
            "label": "Bye bye",
            "next": "origin"
        }
    }
}