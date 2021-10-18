import amqp from "amqplib";

const rabbitSettings = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'analytics',
    password: 'analytics',
    vhost: '/',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
}

connect();

async function connect(){
    const queue = "events";
    const section = "product"
    try{
        const conn = await amqp.connect(rabbitSettings);
        console.log("connection created");

        const channel = await conn.createChannel();
        console.log("channel created");

        const res = await channel.assertQueue(queue);
        console.log("queue created");

        console.log(`Waiting for events from section ${section}`);
        channel.consume(queue, item => {
            let event = JSON.parse(item.content.toString());
            console.log(`Received event ${event.name}`);
            console.log(event);
            if (event.section === section){
                channel.ack(item);
                console.log(`Deleted event ${event.name}`);
            }
        })

    } catch (err){
        console.error(`Error->${err}`);
    }
}