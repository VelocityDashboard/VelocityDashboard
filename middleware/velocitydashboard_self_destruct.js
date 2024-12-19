const fs = require('fs');
const path = require('path');
const readline = require('readline');

const targetDirectory = '/var/www/VelocityDashboard';

function deleteDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach(file => {
            const filePath = path.join(directoryPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                deleteDirectory(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        });
        fs.rmdirSync(directoryPath);
    } else {
        console.error(`Directory not found: ${directoryPath}`);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(`Are you sure you want to delete everything in ${targetDirectory}? (yes/no): `, answer => {
    if (answer.toLowerCase() === 'yes') {
        deleteDirectory(targetDirectory);
        console.log(`All contents of ${targetDirectory} have been removed.`);
    } else {
        console.log('Operation cancelled.');
    }
    rl.close();
});
