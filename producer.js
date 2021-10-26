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

    const message = [
        {"name": "customer checking", "section": "product", "severity": severity_array[Math.floor(Math.random() * severity_array.length)]},
        {"name": "product detail", "section": "product", "severity": severity_array[Math.floor(Math.random() * severity_array.length)]},
        {"name": "customer register", "section": "product", "severity": severity_array[Math.floor(Math.random() * severity_array.length)]},
        {"name": "product added to shopping cart", "section": "checkout", "severity": severity_array[Math.floor(Math.random() * severity_array.length)]},
        {"name": "checkout visited", "section": "checkout", "severity": severity_array[Math.floor(Math.random() * severity_array.length)]},
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

        message.map(async (item) => {
            channel.publish(exchange, item.severity, Buffer.from(JSON.stringify(item)));
            console.log(" [x] Sent %s: '%s'", item.severity, item.name);
            console.log(`Message ${item.name} sent to queue ${queue}`);
        })

        setTimeout(function() {
            conn.close();
            process.exit(0)
          }, 500);

    } catch (err){
        console.error(`Error->${err}`);
    }
}