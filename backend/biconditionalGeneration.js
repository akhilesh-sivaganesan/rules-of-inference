// Define your rules of inference
const rulesOfInference = {
    "Modus Ponens" : {
        premise1: "P",
        premise2: "P→Q",
        conclusion: "Q"
    },
    "Modus Tollens" : {
        premise1: "¬Q",
        premise2: "P→Q",
        conclusion: "¬P"
    },
    "Hypothetical Syllogism" : {
        premise1: "P→Q",
        premise2: "Q→R",
        conclusion: "P→R"
    },
    "Disjunctive Syllogism" : {
        premise1: "P∨Q",
        premise2: "¬P",
        conclusion: "Q"
    },
    "Addition" : {
        premise1: "P",
        conclusion: "P∨Q"
    },
    "Simplification" : {
        premise1: "P∧Q",
        conclusion: "P"
    },
    "Conjunction" : {
        premise1: "P",
        premise2: "Q",
        conclusion: "P∧Q"
    },
    "Resolution" : {
        premise1: "P∨Q",
        premise2: "¬P∨R",
        conclusion: "Q∨R"
    }
};


function modusTollens(var1, var2) {
    return {
        premise1: `¬${var2}`,
        premise2: `${var1}→${var2}`,
        conclusion: `¬${var1}`
    }
}

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

function useModusTollens(premises, premise_to_replace) {
    //find set of letters already in use
    let x = 2
    const nonUniqueLetters = findXNonUniqueLetters(premises, x);
    
    let var1 = nonUniqueLetters[0]
    let var2 = nonUniqueLetters[1]

    let filledRule = modusTollens(var1, var2)

    //make rule of inference conclusion biconditional to premise_to_replace
    let biconditional = `(${filledRule.conclusion})↔(${premise_to_replace})`
    
    let newPremises = premises.filter(premise => premise != premise_to_replace)
    newPremises.push(filledRule.premise1)
    newPremises.push(filledRule.premise2)
    newPremises.push(biconditional)

    //add chain premises
    //add biconditional to premise

    //return new set of premises
    return newPremises
}

function disjunctiveSyllogism(var1, var2) {
    return {
        premise1: `${var1}∨${var2}`,
        premise2:  `¬${var1}`,
        conclusion: `${var2}`
    }
}

function useDisjunctiveSyllogism(premises, premise_to_replace) {
    let x = 2
    const nonUniqueLetters = findXNonUniqueLetters(premises, x);
    
    let var1 = nonUniqueLetters[0]
    let var2 = nonUniqueLetters[1]

    let filledRule = disjunctiveSyllogism(var1, var2)

    //make rule of inference conclusion biconditional to premise_to_replace
    let biconditional = `(${filledRule.conclusion})↔(${premise_to_replace})`
    
    //remove premise_to_replace
    let newPremises = premises.filter(premise => premise != premise_to_replace)

    //add chain premises
    //add biconditional to premise
    newPremises.push(filledRule.premise1)
    newPremises.push(filledRule.premise2)
    newPremises.push(biconditional)


    //return new set of premises
    return newPremises
}


let premises = ["P","P→Q",]
let conclusion = "Q"

console.log('----------------------------')
console.log('Original Premises')
console.log(premises)
console.log(conclusion)
console.log('----------------------------')
premises = useModusTollens(premises, premises[0])
console.log('New Premises')
console.log(premises)
console.log(conclusion)
console.log('----------------------------')
premises = useModusTollens(premises, premises[0])
console.log('New Premises')
console.log(premises)
console.log(conclusion)
console.log('----------------------------')
premises = useDisjunctiveSyllogism(premises, premises[0])
console.log('New Premises')
console.log(premises)
console.log(conclusion)




