require('dotenv').config();

const app = require('./app');


async function main() {
    await app.listen(app.get('port'));
    console.log(`Server is running on port ${app.get('port')}`);
}

main();






