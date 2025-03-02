// This script checks for duplicated questions in a Jeopardy game JSON file.
// Usage: node dup-checker.js <file-name>
// Example: node dup-checker.js wings-of-fire1.json

const fs = require('fs');
const path = require('path');

var filePath = '';

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide the path to the JSON file.  Usage: node dup-checker.js <file-name>');
    process.exit(1);
} else if (fs.existsSync(path.join(__dirname, '../content/full-games',args[0]))) {
    filePath = path.join(__dirname, '../content/full-games',args[0]);
} else {
    console.error('The file does not exist.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const questions = new Set();
const duplicates = [];

function checkDuplicates(categories) {
    categories.forEach(category => {
        Object.values(category).forEach(item => {
            if (item.question) {
                if (questions.has(item.question)) {
                    duplicates.push(item.question);
                } else {
                    questions.add(item.question);
                }
            }
        });
    });
}

checkDuplicates(data['single-jeopardy'].categories);
checkDuplicates(data['double-jeopardy'].categories);
if (data['final-jeopardy'] && data['final-jeopardy'].category && data['final-jeopardy'].category.question) {
    if (questions.has(data['final-jeopardy'].category.question)) {
        duplicates.push(data['final-jeopardy'].category.question);
    } else {
        questions.add(data['final-jeopardy'].category.question);
    }
}

if (duplicates.length > 0) {
    console.log('Duplicated questions found:');
    duplicates.forEach(question => console.log(question));
} else {
    console.log('No duplicated questions found.');
}