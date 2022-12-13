const { UniqueConstraintError, fn, col, Op } = require('sequelize');
const { Appointment } = require('../../models');
const { APPOINTMENT_TYPE } = require('../../constants/enums');
const email = "contact@chatbot.com";
const phoneNumber = "0000000000";
const  workingHours = {
    start: 9,
    end: 18,
};
const maxAppointmentTimeByDay = ((workingHours.end - workingHours.start)*60);
const maxAppointmentTimeByWeek = (maxAppointmentTimeByDay * 5);

const checkLastService = (serviceDateString, questionA, questionB) => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    const serviceDate = new Date(serviceDateString);
    if(serviceDate < minDate){
        return questionA;
    }
    return questionB;
};

const checkKilometers = (kilometers, questionA, questionB) => {
    if(kilometers >= 10000){
        return questionA;
    }else{
        return questionB;
    }
}

const getAvailableDays = async (appointmentType) => {
    if( !Object.keys(APPOINTMENT_TYPE).includes(appointmentType)){
        return [
            {
                "label": "The service type doesn't exists",
                "next": "origin",
            }
        ]
    }
    serviceTime = APPOINTMENT_TYPE[appointmentType];
    let data = await getApppointmentDaysDisponibility(appointmentType).then((days) => {
        return Object.entries(days).map(([key, value]) => {
            return {
                "label": key,
            }
        });
    });
    return data;
    // return [ 
    //     {
    //         "label": "2022-12-12 00:00:00",
    //     },
    //     {
    //         "label": "2022-12-13 00:00:00",
    //     },
    //     {
    //         "label": "2022-12-14 00:00:00",
    //     }
    // ];
}

const getAvailableHours = (appointmentType, day) => {
    return [ 
        {
            "label": "08:00:00",
        },
        {
            "label": "09:00:00",
        },
        {
            "label": "10:00:00",
        }
    ];
}

const getApppointmentDaysDisponibility = async (appointmentType) => {
    if(!appointmentType || Object.keys(APPOINTMENT_TYPE).indexOf(appointmentType) === -1){
        return;
    }
    const options = {
        where: {},
        raw: true,
    };
    if(appointmentType === Object.keys(APPOINTMENT_TYPE)[0]){
        options.where.type = Object.keys(APPOINTMENT_TYPE)[0]
    }else{
        options.where.type = {
            [Op.ne]: Object.keys(APPOINTMENT_TYPE)[0]
        }
    }
    let curr = new Date;
    let dayLeftTime;
    let availableDays = {};
    curr.setHours(0, 0, 0, 0);
    curr.setDate(curr.getDate() - 1);
    iteration = 0;
    while(iteration < 5){
        for(let i = 0; i < 7; i++){
            let date = new Date(curr.setDate(curr.getDate() + 1));
            if(date.getDay() === 0 || date.getDay() === 6){
                continue;
            }
            options.where.date = {
                [Op.gte]: new Date(date.setHours(workingHours.start, 0, 0, 0)),
                [Op.lt]: new Date(date.setHours(workingHours.end, 0, 0, 0)),
            }
            let appointments = await Appointment.findAll(options);
            dayLeftTime = appointments.reduce((acc, appointment) => acc -= appointment.duration, maxAppointmentTimeByDay);
    
            if(dayLeftTime > APPOINTMENT_TYPE[appointmentType]){
                availableDays[date.toDateString()] = appointments;
            } else {
                delete availableDays[date.toDateString()];
            }
            dayLeftTime = maxAppointmentTimeByDay;
        }
        if(availableDays && Object.keys(availableDays).length > 0 && Object.keys(availableDays)[0].length > 0){
            return availableDays;
        }
        iteration ++;
    };
}

const getAppointmentHoursForDay = async (appointmentType, {label: day}) => {
    let date = new Date(day);
    if(!appointmentType || Object.keys(APPOINTMENT_TYPE).indexOf(appointmentType) === -1){
        return;
    }
    const options = {
        where: {
            date: {
                [Op.gte]: new Date(date.setHours(workingHours.start, 0, 0, 0)),
                [Op.lt]: new Date(date.setHours(workingHours.end, 0, 0, 0)),
            }
        },
        raw: true,
    };
    if(appointmentType === Object.keys(APPOINTMENT_TYPE)[0]){
        options.where.type = Object.keys(APPOINTMENT_TYPE)[0]
    }else{
        options.where.type = {
            [Op.ne]: Object.keys(APPOINTMENT_TYPE)[0]
        }
    }

    let appointments = await Appointment.findAll(options);
    let availableHours = [];
    for(let i = ( workingHours.start * 60 ); i < (workingHours.end * 60 ); i= i + APPOINTMENT_TYPE[appointmentType]){
        if((i + APPOINTMENT_TYPE[appointmentType]) / 60 > workingHours.end){
            break;
        }
        availableHours.push({
            "label": i / 60 + ":00:00",
        })
    }
    if(appointments.length === 0){
        return availableHours;
    }
    availableHours = Object.entries(availableHours).map(([key, value]) => {
        let splittedValue = value.label.split(":");
        date.setHours(splittedValue[0], splittedValue[1], splittedValue[2], 0);
        let appointment = appointments.find(appointment => appointment.date.getTime() === date.getTime());
        if(appointment){
            return;
        }
        return value;
    }).filter(value => value);
    return availableHours;
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

    "maintenance": ({value: answer}, notes) => {
        const date = new Date(answer, 0, 1);
        notes.vehicleObtentionDate = date.toISOString();
       
        return {
            "label": "In which year did you get your vehicle ?",
            "prompt":{
                "type": "Int",
                "next": "maintenance-ask-last-service"
            }
        }
    },

    "maintenance-ask-last-service": ({value: answer}, notes) => {
        return {
            "label": "What is the last time you got your vehicle serviced?",
            "prompt": {
                "type": "date",
                "next": (() => checkLastService(answer, "maintenance-check-appointment", "maintenance-ask-kilometers"))()
            }
        }
    },

    "maintenance-check-appointment": async ({value: answer}, notes) => {
        const days = await getAvailableDays('MAINTENANCE');
        if(days[answer]){
            notes.appointmentType = 'MAINTENANCE';
            notes.appointmentDay = days[answer];
        }

        return {
            "label": "You should get your vehicle serviced",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "next": 'appointment-hours'
            }
        }
    },

    "maintenance-ask-kilometers": ({value: answer}, notes) => {
        return {
            "label": "How many kilometers did you drive since your last service?",
            "prompt":{
                "type": "Int",
                "next": (() => checkKilometers(answer, "maintenance-check-appointment", "maintenance-ask-appointment"))()
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

    "vehicle-info-city": async ({value: answer}, notes) => {
        const days = await getAvailableDays('ESSAY-CITY');
        if(days[answer]){
            notes.appointmentType = 'ESSAY-CITY';
            notes.appointmentDay = days[answer];
        }

        return {
            "label": "We can schedule you a meeting",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "next": 'appointment-hours'
            }
        }
    },

    "vehicle-info-offroad": async ({value: answer}, notes) => {
        const days = await getAvailableDays('ESSAY-OFFROAD');
        if(days[answer]){
            notes.appointmentType = 'ESSAY-OFFROAD';
            notes.appointmentDay = days[answer];
        }

        return {
            "label": "We can schedule you a meeting",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "next":'appointment-hours'
            }
        }
    },

    "vehicle-info-sport": async ({value: answer}, notes) => {
        const days = await getAvailableDays('ESSAY-SPORT');
        if(days[answer]){
            notes.appointmentType = 'ESSAY-SPORT';
            notes.appointmentDay = days[answer];
        }

        return {
            "label": "We can schedule you a meeting",
            "prompt": {
                "type": "Controlled",
                "answers": days,
                "next": 'appointment-hours'
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

    "appointment-hours": async (answer, notes) => {
        let hours = await getAppointmentHoursForDay(notes.appointmentType, notes.appointmentDay) ?? [];

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