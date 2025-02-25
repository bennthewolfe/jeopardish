// 100% AI generated code. This has not been checked yet. Please review before using.

// This script checks for duplicated questions in a Jeopardy game JSON file.

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../content/full-games/tech1.json');
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