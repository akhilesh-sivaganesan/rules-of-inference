import { ruleName } from "@/typings";
// General function to check if a rule is applicable
export default function isRuleApplicable(ruleName: ruleName, premises: string[]): string | null {
    switch (ruleName) {
        case "Modus Ponens":
            return isModusPonensMatch(premises);
        case "Modus Tollens":
            return isModusTollensMatch(premises);
        case "Hypothetical Syllogism":
            return isHypotheticalSyllogismMatch(premises);
        case "Disjunctive Syllogism":
            return isDisjunctiveSyllogismMatch(premises);
        case "Addition":
            return null;
        case "Simplification":
            return null;
        case "Conjunction":
            return isConjunctionMatch(premises);
        case "Resolution":
            return isResolutionMatch(premises);
        default:
            return null; // Rule not recognized
    }
}

function toggleNegation(expression: string): string {
    if (expression === "∧") {
        return "∨";
    } else if (expression === "∨") {
        return "∧";
    } else if (expression.startsWith("¬") && expression.length === 2) {
        return expression.slice(1);
    } else {
        return "¬" + expression;
    }
}

export function pullNegation(expression: string): string {
    //  (a or b) and (c or d)
    const parts = customSplit(expression, "→∨∧")
    let result = ""
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        result += toggleNegation(part)
    }
    return `¬(${result})`
}

export function pushNegation(expression: string): string | null {
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

function validParentheses(line: string): boolean {
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

export function isConditionalDisjunctive(expression: string): string | null {
    if (expression.indexOf("→") !== -1) {
        const [antecedent1, middle1, consequent1] = customSplit(expression, "→");
        return toggleNegation(antecedent1) + "∨" + consequent1
    } else {
        return null
    }
}

// custom split function to handle nested special characters
function customSplit(line: string, specialCharacter: string): string[] {
    const stack: string[] = [];
    const result: string[] = [];
    let currentTerm: string = "";

    for (let i = 0; i < line.length; i++) {
        const char: string = line[i];

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

// Modus Ponens
function isModusPonensMatch(premises: string[]): string | null {
    if (premises.length === 2) {
        const [premise1, premise2] = premises;
        if (premise1.includes('→') && customSplit(premise1, '→')[0] === premise2) {
            return customSplit(premise1, '→')[2];
        }
        if (premise2.includes('→') && customSplit(premise2, '→')[0] === premise1) {
            return customSplit(premise2, '→')[2];
        }
    }
    return null;
}

// Modus Tollens (Handles negation case using toggleNegation)
function isModusTollensMatch(premises: string[]): string | null {
    if (premises.length === 2) {
        const [premise1, premise2] = premises;

        // Check if one premise contains implication and the other is a potential negation of the consequent
        if (premise1.includes('→') && (toggleNegation(customSplit(premise1, '→')[2]) === premise2 || toggleNegation(premise2) === customSplit(premise1, '→')[2])) {
            return toggleNegation(customSplit(premise1, '→')[0])
        }
        if (premise2.includes('→') && (toggleNegation(customSplit(premise2, '→')[2]) === premise1 || toggleNegation(premise1) === customSplit(premise2, '→')[2])) {
            return toggleNegation(customSplit(premise2, '→')[0])
        }
    }
    return null;
}

// Hypothetical Syllogism
function isHypotheticalSyllogismMatch(premises: string[]): string | null {
    if (premises.length === 2) {
        const [premise1, premise2] = premises;
        if (premise1.includes('→') && premise2.includes('→')) {
            const [antecedent1, middle1, consequent1] = customSplit(premise1, '→');
            const [antecedent2, middle2, consequent2] = customSplit(premise2, '→');
            if (antecedent1 === consequent2) {
                return antecedent2 + '→' + consequent1
            }
            if (consequent1 === antecedent2) {
                return antecedent1 + '→' + consequent2
            }
        }
    }
    return null;
}


// Disjunctive Syllogism (Handles both orders of premises and negation)
function isDisjunctiveSyllogismMatch(premises: string[]): string | null {
    if (premises.length === 2) {
        const [premise1, premise2] = premises;

        // Check if one premise contains a disjunction and the other is a potential negation of either disjunct

        if (premise1.includes('∨') && (toggleNegation(customSplit(premise1, '∨')[0]) === premise2)) {
            return customSplit(premise1, '∨')[2]
        }

        if (premise1.includes('∨') && toggleNegation(customSplit(premise1, '∨')[2]) === premise2) {
            return customSplit(premise1, '∨')[0]
        }

        if (premise2.includes('∨') && (toggleNegation(customSplit(premise2, '∨')[0]) === premise1)) {
            return customSplit(premise2, '∨')[2]
        }

        if (premise2.includes('∨') && (toggleNegation(customSplit(premise2, '∨')[2]) === premise1)) {
            return customSplit(premise2, '∨')[0]
        }
    }
    return null;
}

function isConjunctionMatch(premises: string[]): string | null {
    if (premises.length === 2) {
        return premises[0] + '∧' + premises[1]
    }
    return null;
}

function isResolutionMatch(premises: string[]): string | null {
    if (premises.length === 2) {
        const [premise1, premise2] = premises;
        const [antecedent1, middle1, consequent1] = customSplit(premise1, '∨');
        const [antecedent2, middle2, consequent2] = customSplit(premise2, '∨');

        // check for all the negation combinations return appropriate one
        if (antecedent1 === toggleNegation(antecedent2)) {
            return consequent1 + '∨' + consequent2
        }

        if (antecedent1 === toggleNegation(consequent2)) {
            return consequent1 + '∨' + consequent1
        }

        if (consequent1 === toggleNegation(antecedent2)) {
            return antecedent1 + '∨' + consequent2
        }

        if (consequent1 === toggleNegation(consequent2)) {
            return antecedent1 + '∨' + antecedent2
        }
    }
    return null;
}
