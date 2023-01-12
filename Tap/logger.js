class Logger{
    constructor(){

        // this.dateFormat = {

        // }

        /*
            {
                'topicName' : [
                    {
                        date : new Date(),
                        type : 'Log' | 'Error' | 'Warning' | 'RuleExec' ,
                        message : 'message'
                    },
                    ...
                ],
            }
        */
        this.logs = {};

        /*
            {
                'topicName' : log index to handle,
            }
        */
        this.terminalConsumer = {
            'general' : 0,
        }

        this.consumers = [];

        this.log('general', 'Tap server started');

    }

    terminalConsume(topic){
        if(this.terminalConsumer[topic] === undefined){

            console.log(`Terminal consumer has not the right to read the topic "${topic}"`);
        
        }else{

            const log = this.logs[topic][this.terminalConsumer[topic]];
            this.terminalConsumer[topic]++;

            console.log(`[${log.date.toLocaleString()}] ${log.type} : ${log.message}`);
        
        }
    }

    providingTrigger(topic){
        this.terminalConsume(topic);
    }

    log(topic, message, type='Log'){
        
        if(!this.logs[topic]){
            this.logs[topic] = [];
        }

        this.logs[topic].push(
            {
                date : new Date(),
                type : type,
                message : message
            }
        );

        this.providingTrigger(topic);
    }
}

const logger = new Logger();

module.exports.logger = logger;