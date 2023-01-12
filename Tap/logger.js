const { connection } = require("websocket");

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

        /*
        
            {
                consumerID : {
                    connection : connection,
                    topics : {
                        'topicName' : log index to handle,
                    }
                }
            }

        */
        this.consumerNextID = 0;
        this.consumers = [];

        this.log('general', 'Tap server started');

    }

    terminalConsume(topic){
        if(this.terminalConsumer[topic] === undefined){
            // console.log(`Terminal consumer has not the right to read the topic "${topic}"`);
        }else{

            const log = this.logs[topic][this.terminalConsumer[topic]];
            this.terminalConsumer[topic]++;

            console.log(`[${log.date.toLocaleString()}] ${log.type} : ${log.message}`);
        
        }
    }

    addConsumer(connectRequest, topicNames = ['general']){
        
        const consumerID = this.consumerNextID++;

        this.consumers[consumerID] = {
            connection : connectRequest.accept(null, connectRequest.origin),
            topics : {}
        }

        this.consumers[consumerID].connection.on('close', ()=>{
            delete this.consumers[consumerID];
        })

        topicNames.forEach((topicName)=>{

            this.consumers[consumerID].topics[topicName] = 0;
            
            if(this.logs[topicName]){

                this.logs[topicName].forEach((log)=>{

                    this.consumers[consumerID].topics[topicName]++;
                    
                    const msg = {
                        'ruleID': topicName,
                        'type': log.type,
                        'msg': `[${log.date.toLocaleString()}] ${log.type} : ${log.message}`
                    }
    
                    this.consumers[consumerID].connection.send(JSON.stringify(msg));
    
                })

            }

        });

    }

    provide(consumer, topic){
        if(consumer[topic] === undefined){
            // console.log(`A consumer has not the right to read the topic "${topic}"`);
        }else{

            const log = this.logs[topic][consumer[topic]];
            if(log){

                consumer[topic]++;

                const msg = {
                    'ruleID': topic,
                    'type': log.type,
                    'msg': `[${log.date.toLocaleString()}] ${log.type} : ${log.message}`
                }

                consumer.connection.send(JSON.stringify(msg));

            }
        
        }
    }

    providingTrigger(topic){

        this.terminalConsume(topic);
        
        Object.keys(this.consumers).forEach((consumerID)=>{
            provide(this.consumers[consumerID], topic)
        });
    
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