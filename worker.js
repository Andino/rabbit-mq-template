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
    const severity_array = [
        "customer",
        "counter",
        "error"
    ]
    try{
        
        const conn = await amqp.connect(rabbitSettings);
        console.log("connection created");

        const channel = await conn.createChannel();
        console.log("channel created");

        let exchange = "event_type";

        channel.assertExchange(exchange, 'direct', {
            durable: false
        });
        const res = await channel.assertQueue(queue);
        console.log(' [*] Waiting for events. To exit press CTRL+C');

        severity_array.forEach(function(severity) {
            channel.bindQueue(res.queue, exchange, severity);
        });

        channel.consume(res.queue, function(msg) {
            if(severity_array.includes(msg.fields.routingKey)){
                console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
            }
          }, {
            noAck: true
          });

        setTimeout(function() {
            conn.close();
            process.exit(0)
          }, 500);

    } catch (err){
        console.error(`Error->${err}`);
    }
}