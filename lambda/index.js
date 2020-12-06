// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require("ask-sdk-s3-persistence-adapter");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello! Welcome to Budget Tracker. I help you track your daily expenditures and incomes.';

        return handlerInput.responseBuilder
            .addDelegateDirective({
                name : 'restartIntent'
            })
            .speak(speakOutput)
            //.reprompt(repromptText)
            .getResponse();
    }
};
const restartIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'restartIntent';
    },
    handle(handlerInput) {
        var restartOrNot = "";
        var restart = handlerInput.requestEnvelope.request.intent.slots.restart.value;
        if (restart === 'restart') {
        return handlerInput.responseBuilder
            .addDelegateDirective({
                name : 'budgetCaptureIntent'
            })
            //.speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
        }
        else {
        return handlerInput.responseBuilder
            .addDelegateDirective({
                name : 'budgetContinueIntent'
            })
            //.speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
        }
    }
};
const budgetContinueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'budgetContinueIntent';
    },
    async handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        
        const oldSpend = sessionAttributes.hasOwnProperty("spend") ? sessionAttributes.spend :0; 
        const oldEarn = sessionAttributes.hasOwnProperty("earn") ? sessionAttributes.earn : 0; 
        
        const newSpend = handlerInput.requestEnvelope.request.intent.slots.spendCont.value;
        const newEarn = handlerInput.requestEnvelope.request.intent.slots.earnCont.value;
        
        const totalSpend = parseFloat(oldSpend) + parseFloat(newSpend);
        const totalEarn = parseFloat(oldEarn) + parseFloat(newEarn);
        
        const budgetAttributes = {
            "spend": totalSpend, 
            "earn": totalEarn
        };
        
        attributesManager.setPersistentAttributes(budgetAttributes);
        
        await attributesManager.savePersistentAttributes();
        
        const speakOutput = `Your previous entries were ${oldSpend} euros on spending and ${oldEarn} euros on earnings. Till now, your total spending and earnings are ${totalSpend} and  ${totalEarn} euros, respectively. That makes your account up to this moment ${(totalEarn)-(totalSpend)} euros. `;
        
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
        
    }
};
const budgetCaptureIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'budgetCaptureIntent';
    },
    async handle(handlerInput) {
        const spend = handlerInput.requestEnvelope.request.intent.slots.spend.value;
        const earn = handlerInput.requestEnvelope.request.intent.slots.earn.value;
        
        const attributesManager = handlerInput.attributesManager;
        
        const budgetAttributes = {
            "spend": spend, 
            "earn": earn
        };
        
        attributesManager.setPersistentAttributes(budgetAttributes);
        
        await attributesManager.savePersistentAttributes();
        
        const speakOutput = `Thanks, I'll remember that you spent ${spend} and earned ${earn} euros. That makes your current account ${(earn)-(spend)} euros.`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoadBudgetInterceptor = {
    async process(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
        
        const spend = sessionAttributes.hasOwnProperty("spend") ? sessionAttributes.spend : 0;
        const earn = sessionAttributes.hasOwnProperty("earn") ? sessionAttributes.earn :0; 
        
        if (spend && earn) {
            attributesManager.setSessionAttributes(sessionAttributes)
        }
    }
}
// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
        )
    .addRequestHandlers(
        LaunchRequestHandler,
        restartIntentHandler,
        budgetContinueIntentHandler,
        budgetCaptureIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addRequestInterceptors(
        LoadBudgetInterceptor
        )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
