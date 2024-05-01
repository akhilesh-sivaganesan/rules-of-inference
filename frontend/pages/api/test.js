// Function to toggle negation
function toggleNegation(expression) {
    if (expression ===  "∧") {
        return "∨";
    } else if (expression === "∨") {
        return "∧";
    } else if (expression.startsWith("¬") && expression.length === 2) {
        return expression.slice(1);
    } else {
        return "¬" + expression;
    }
}

function pullNegation(expression) {
    //  (a or b) and (c or d)
    const parts = customSplit(expression, "→∨∧")
    let result = ""
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        result += toggleNegation(part)
    }
    return `¬(${result})`
}

function pushNegation(expression) {
    // ¬(A∧B) --> ¬A∨¬B
    // ¬(¬A∧¬B) --> A∨B
    // ¬(¬A∨¬B) --> A∧B
    // add valid parentheses check after removing for something like () and ()
    if (expression.startsWith("¬(") && expression.endsWith(")") && validParentheses(expression.slice(2, -1))) {
        const innerExpression = expression.slice(2, -1); // Remove ¬ and outer parentheses
        const parts = customSplit(innerExpression, "∧∨"); // Split the inner expression by ∧
        const negatedParts = parts.map(part => toggleNegation(part));
        return negatedParts.join("")
    } else {
        return null
    }
   
}

function validParentheses(line) {
    const stack = [];
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '(') {
            stack.push(char)
            continue
        }
        if (char === ')' && !stack.length) {
            return false
        }
        if (char === ')') {
            stack.pop()
        }
    }
    return true
}

function isConditionalDisjunctive(expression) {
    if (expression.indexOf("→") !== -1) {
        const [antecedent1, middle1, consequent1] = customSplit(expression, "→");
        return toggleNegation(antecedent1) + "∨" + consequent1
    } else {
        return null
    }
}

// custom split function to handle nested special characters
function customSplit(line, specialCharacter) {
    const stack = [];
    const result = [];
    let currentTerm = "";

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '(') {
            currentTerm += char;
            stack.push(char);
        } else if (char === ')') {
            stack.pop();
            currentTerm += char;
        } else if (!stack.length && specialCharacter.indexOf(char) !== -1) {
            result.push(currentTerm);
            currentTerm = "";
            result.push(char);
        } else {
            currentTerm += char;
        }
    }

    if (currentTerm) {
        result.push(currentTerm);
    }

    return result;
}

const output1 = isConditionalDisjunctive("h→l")
console.log(output1)
console.log("¬h∨l")
console.log(output1 === "¬h∨l")
