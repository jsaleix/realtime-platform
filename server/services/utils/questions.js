checkLastService = (serviceDate, questionA, questionB) => {
    const today = new Date();
    const service = new Date(serviceDate);
    const diffTime = Math.abs(today - service);
    const diffYear = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffYear > 30) {
        return questionA;
    }
    return questionB;
};

checkLastService = (kilometers, questionA, questionB) => {
    if(kilometers >= 10000){
        return questionA;
    }else{
        return questionB;
    }
}

askRdvDate = (serviceDate) => {
    return [ {label: "test", next: "maintenance-date-saved"} ];
}

exports.QUESTIONS = {
    "origin": {
        "label": "What do you need?",
        "prompt":{
            "type": "Controlled",
            answers: [
                {
                    "label": "Maintenance",
                    "next": "maintenance-1"
                },
                {
                    "label": "Vehicle information",
                    "next": "vehicle-info-1"
                },
                {
                    "label": "Contact information",
                    "next": "contact-info-1"
                },
                {
                    "label": "End",
                    "next": "end"
                }
            ]
        }
    },

    "maintenance-1": {
        "label": "When did you get your vehicle?",
        "prompt":{
            "type": "Int",
            "next": "maintenance-2"
        }
    },

    "maintenance-2": {
        "label": "What is the last time you got your vehicle serviced?",
        "prompt":{
            "type": "Int",
            "next": "maintenance-3"
        }
    },

    "maintenance-3": {
        "label": "What is the last time you got your vehicle serviced?",
        "prompt": {
            "type": "Int",
            "dynamic": true,
            "next": answer => checkLastService(answer, "maintenance-4", "maintenance-5")
        }
    },

    "maintenance-4": {
        "label": "Ask rdv date",
        "prompt": {
            "type": "Controlled",
            "answers": [
                ...askRdvDate()
            ]
        }
    },

    "maintenance-date-saved": {
        "label": "Date successfully saved",
        "next": "origin"
    },

    "maintenance-5": {
        "label": "How many kilometers did you drive since your last service?",
        "prompt":{
            "type": "Int",
            "next": answer => checkKilometers(answer, "maintenance-4", "maintenance-6")
        }
    },

    "maintenance-6": {
        "label": "Do you want to schedule an appointment?",
        "prompt":{
            "type": "Controlled",
            "answers": [
                {
                    "label": "Yes",
                    "next": "maintenance-4"
                },
                {
                    "label": "No",
                    "next": "origin"
                }
            ]
        }
    }
}