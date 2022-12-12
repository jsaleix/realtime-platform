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
    "origin": {
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
    },

    "maintenance": {
        "label": "When did you get your vehicle?",
        "prompt":{
            "type": "Int",
            "next": "maintenance-ask-last-service"
        }
    },

    "maintenance-ask-last-service": {
        "label": "What is the last time you got your vehicle serviced?",
        "prompt": {
            "type": "date",
            "dynamic": true,
            "next": answer => checkLastService(answer, "maintenance-check-appointment", "maintenance-ask-kilometers")
        }
    },

    "maintenance-check-appointment": {
        "label": "You should get your vehicle serviced",
        "prompt": {
            "type": "Controlled",
            "dynamic": true,
            "answers": [
                ...getAvalaibleDays('MAINTENANCE')
            ],
            "next": (answer, notes) => {
                notes.appointmentType = 'MAINTENANCE';
                notes.appointmentDay = answer;
                return 'appointment-saved';
            }
        }
    },

    "maintenance-ask-kilometers": {
        "label": "How many kilometers did you drive since your last service?",
        "prompt":{
            "type": "Int",
            "dynamic": true,
            "next": answer => checkKilometers(answer, "maintenance-check-appointment", "maintenance-ask-appointment")
        }
    },

    "maintenance-ask-appointment": {
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
    },

    "vehicle-info": {
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
    },

    "vehicle-info-city": {
        "label": "We can schedule you a meeting",
        "prompt": {
            "type": "Controlled",
            "dynamic": true,
            "answers": [
                ...getAvalaibleDays('ESSAY-CITY')
            ],
            "next": (answer, notes) => {
                notes.appointmentType = 'ESSAY-CITY';
                notes.appointmentDay = answer;
                return 'appointment-saved';
            }
        }
    },

    "vehicle-info-offroad": {
        "label": "We can schedule you a meeting",
        "prompt": {
            "type": "Controlled",
            "dynamic": true,
            "answers": [
                ...getAvalaibleDays('ESSAY-OFFROAD')
            ],
            "next": (answer, notes) => {
                notes.appointmentType = 'ESSAY-OFFROAD';
                notes.appointmentDay = answer;
                return 'appointment-saved';
            }
        }
    },

    "vehicle-info-sport": {
        "label": "We can schedule you a meeting",
        "prompt": {
            "type": "Controlled",
            "dynamic": true,
            "answers": [
                ...getAvalaibleDays('ESSAY-SPORT')
            ],
            "next": (answer, notes) => {
                notes.appointmentType = 'ESSAY-SPORT';
                notes.appointmentDay = answer;
                return 'appointment-saved';
            }
        }
    },

    "contact-info": {
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
    },

    "contact-info-phone": {
        "label": "Here is your phone number : " + phoneNumber,
        "next": "origin"
    },

    "contact-info-email": {
        "label": "Here is your email : " + email,
        "next": "origin"
    },

    "appointment-hours": {
        "label": "What time do you want to come ?",
        "prompt":{
            "type": "Controlled",
            "answers": [
                
            ],
        }
    },

    "appointment-saved": {
        "label": "Appointment successfully saved",
        "next": "origin"
    },

    "end": {
        "label": "Bye bye",
        "next": "origin"
    }
}