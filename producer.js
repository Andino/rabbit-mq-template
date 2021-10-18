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
    const message = [
        {"name": "customer checking", "section": "product"},
        {"name": "product detail", "section": "product"},
        {"name": "customer register", "section": "product"},
        {"name": "product added to shopping cart", "section": "checkout"},
        {"name": "checkout visited", "section": "checkout"},
    ]
    try{
        const conn = await amqp.connect(rabbitSettings);
        console.log("connection created");

        const channel = await conn.createChannel();
        console.log("channel created");

        const res = await channel.assertQueue(queue);
        console.log("queue created");

        message.map(async (item) => {
            await channel.sendToQueue(queue, Buffer.from(JSON.stringify(item)));
            console.log(`Message ${item.name} sent to queue ${queue}`);
        })

    } catch (err){
        console.error(`Error->${err}`);
    }
}