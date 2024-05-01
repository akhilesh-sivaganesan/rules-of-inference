import { rules } from "@/typings"

const rulesOfInference : rules = {
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
    },
}

export default rulesOfInference

