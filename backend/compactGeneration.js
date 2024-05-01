

//give modusTollens, the desired conclusion = premise to replace and var2

function findUniqueAlphabetLetters(premises) {
    // Create a Set to store unique letters
    const uniqueLetters = new Set();

    // Iterate through the premises
    for (const premise of premises) {
        // Use a regular expression to match alphabet letters
        const letters = premise.match(/[A-Za-z]+/g);

        if (letters) {
            // Add the matched letters to the uniqueLetters Set
            for (const letter of letters) {
                uniqueLetters.add(letter);
            }
        }
    }

    return uniqueLetters;
}

function findXNonUniqueLetters(premises, x) {
    // Find the unique letters
    const uniqueLetters = findUniqueAlphabetLetters(premises);
    
    // Generate an array of non-unique capital letters
    const nonUniqueLetters = [];
    for (let letter = 'A'; nonUniqueLetters.length < x; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
        if (!uniqueLetters.has(letter)) {
            nonUniqueLetters.push(letter);
        }
    }

    return nonUniqueLetters;
}


function toggleNegation(expression) {
    // Check if the expression starts with "¬" (negation)
    if (expression.startsWith("¬")) {
        // If it does, remove the "¬" symbol and return the variable without negation
        return expression.slice(1);
    } else {
        // If there's no "¬" symbol, add "¬" to negate the variable
        return expression.length == 1 ? "¬" + expression:"¬(" + expression + ")";
    }
}

function modusTollens(premise_to_replace, var2) {

    //if premise_to_replace = conclusion
    //var1 = not premise_to_replace
    // toggle ¬
    //var2 is unused letter

    //say premise_to_replace = P
    /////conclusion = premise_to_replace
    /////p = ¬var1
    /////var1 = (¬p)

    //say premsie_to_replace = p --> q
    /////conclusion = premise_to_replace
    /////p --> q = ¬var1
    /////var1 = ¬(p-->q)

    //The letters used in the premise_to_replace are known, var2 will be new letter
    //however code does NOT cancel double negatives

    let var1 = toggleNegation(premise_to_replace)
    return {
        premise1: toggleNegation(var2),
        premise2: `${var1}→${var2}`,
        conclusion: `${premise_to_replace}`
    }
}


function modusPonens(premise_to_replace, var2) {
    return {
        premise1: var2,
        premise2: `${var2}→(${premise_to_replace})`,
        conclusion: premise_to_replace
    }
}

function disjunctiveSyllogism(premise_to_replace, var2) {
    return {
        premise1: `${var2}∨(${premise_to_replace})`,
        premise2: toggleNegation(var2),
        conclusion: premise_to_replace
    }
}


function useModusTollens(premises, premise_to_replace, solution) {
    //find set of letters already in use
    let x = 1
    const nonUniqueLetters = findXNonUniqueLetters(premises, x);
    
    let var2 = nonUniqueLetters[0]

    let filledRule = modusTollens(premise_to_replace, var2)

    const indexToReplace = solution.findIndex((step) => step.statement === premise_to_replace);
    solution.splice(indexToReplace, 1, 
        {stepID: indexToReplace, statement:filledRule.premise1, justification: 'Premise', evidence: ''},
        {stepID: indexToReplace + 1, statement: filledRule.premise2, justification: 'Premise', evidence: ''},
        {stepID: indexToReplace + 2, statement: premise_to_replace, justification: 'Modus Tollens', evidence: `${indexToReplace + 1}, ${indexToReplace + 2}`},
    )

    for (let i = indexToReplace + 3; i < solution.length; i++) {
        solution[i].stepID = i
        if (solution[i].evidence !== '') {
            const numbers = solution[i].evidence.split(',').map(Number);
            // Add the value to each number
            const updatedNumbers = numbers.map((number) => {
                if (number >= indexToReplace + 1) {
                    return number + 2
                } else {
                    return number
                }
                //return number + 2 //when both of the lines referring to are shifted forward
            });
            // Join the updated numbers back into a string
            const updatedEvidenceString = updatedNumbers.join(',');
            solution[i].evidence = updatedEvidenceString
        }
    }

    // change the stepID of all proceeding steps
    
    let newPremises = premises.filter(premise => premise != premise_to_replace)
    newPremises.push(filledRule.premise1)
    newPremises.push(filledRule.premise2)

    return newPremises
}


function useModusPonens(premises, premise_to_replace) {
    //find set of letters already in use
    let x = 1
    const nonUniqueLetters = findXNonUniqueLetters(premises, x);
    let var2 = nonUniqueLetters[0]

    let filledRule = modusPonens(premise_to_replace, var2)

    const indexToReplace = solution.findIndex((step) => step.statement === premise_to_replace);
    solution.splice(indexToReplace, 1, 
        {stepID: indexToReplace, statement:filledRule.premise1, justification: 'Premise', evidence: ''},
        {stepID: indexToReplace + 1, statement: filledRule.premise2, justification: 'Premise', evidence: ''},
        {stepID: indexToReplace + 2, statement: premise_to_replace, justification: 'Modus Ponens', evidence: `${indexToReplace + 1}, ${indexToReplace + 2}`},
    )

    for (let i = indexToReplace + 3; i < solution.length; i++) {
        solution[i].stepID = i
        if (solution[i].evidence !== '') {
            const numbers = solution[i].evidence.split(',').map(Number);
            // Add the value to each number
            const updatedNumbers = numbers.map((number) => {
                if (number >= indexToReplace + 1) {
                    return number + 2
                } else {
                    return number
                }
                //return number + 2 //when both of the lines referring to are shifted forward
            });
            // Join the updated numbers back into a string
            const updatedEvidenceString = updatedNumbers.join(',');
            solution[i].evidence = updatedEvidenceString
        }
    }

    let newPremises = premises.filter(premise => premise != premise_to_replace)
    newPremises.push(filledRule.premise1)
    newPremises.push(filledRule.premise2)

    return newPremises
}


function useDisjunctiveSyllogism(premises, premise_to_replace) {
    //find set of letters already in use
    let x = 1
    const nonUniqueLetters = findXNonUniqueLetters(premises, x);
    let var2 = nonUniqueLetters[0]

    let filledRule = disjunctiveSyllogism(premise_to_replace, var2)

    const indexToReplace = solution.findIndex((step) => step.statement === premise_to_replace);
    solution.splice(indexToReplace, 1, 
        {stepID: indexToReplace, statement:filledRule.premise1, justification: 'Premise', evidence: ''},
        {stepID: indexToReplace + 1, statement: filledRule.premise2, justification: 'Premise', evidence: ''},
        {stepID: indexToReplace + 2, statement: premise_to_replace, justification: 'Disjunctive Syllogism', evidence: `${indexToReplace + 1}, ${indexToReplace + 2}`},
    )

    for (let i = indexToReplace + 3; i < solution.length; i++) {
        solution[i].stepID = i
        if (solution[i].evidence !== '') {
            const numbers = solution[i].evidence.split(',').map(Number);
            // Add the value to each number
            const updatedNumbers = numbers.map((number) => {
                if (number >= indexToReplace + 1) {
                    return number + 2
                } else {
                    return number
                }
                //return number + 2 //when both of the lines referring to are shifted forward
            });
            // Join the updated numbers back into a string
            const updatedEvidenceString = updatedNumbers.join(',');
            solution[i].evidence = updatedEvidenceString
        }
    }
    let newPremises = premises.filter(premise => premise != premise_to_replace)
    newPremises.push(filledRule.premise1)
    newPremises.push(filledRule.premise2)

    return newPremises
}

let premises = ["P","P→Q",]
let conclusion = "Q"
let solution = [
    {stepID: 0, statement: 'P', justification: 'Premise', evidence: ''},
    {stepID: 1, statement: 'P→Q', justification: 'Premise', evidence: ''},
    {stepID: 2, statement: 'Q', justification: 'Modus Ponens', evidence: '1,2'}
]

console.log("Original Premises")
console.log(premises)
console.log(solution)

console.log("============================================")
premises = useModusTollens(premises, premises[0], solution)
console.log("Modus Tollens Premises")
console.log(premises)
console.log(solution)

console.log("============================================")
premises = useModusPonens(premises, premises[0])
console.log("Modus Ponens Premises")
console.log(premises)
console.log(solution)


console.log("============================================")
premises = useDisjunctiveSyllogism(premises, premises[0])
console.log("Disjunctive Syllogism Premises")
console.log(premises)
console.log(solution)
