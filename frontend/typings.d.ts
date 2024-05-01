export interface Step {
    inputs: [],
    stepID: number,
    justification: string,
}

export interface TextStep {
    stepID: number,
    statement: string,
    justification: string,
    evidence: string,
}

export interface TextProblemInputs {
    problemName: string,
    stepList: TextStep[]
}

export interface TextSolutionInputs {
    problemName: string,
    solutionStepList: TextStep[]
}

export interface Problem {
    premises: string[],
    conclusion: string,
    letters: string[],
    problemID: number,
    problemName: string,
    solution: TextStep[],
}

export type ruleName = "Modus Ponens" | "Modus Tollens" | "Hypothetical Syllogism" | "Disjunctive Syllogism" | "Addition" | "Simplification" | "Conjunction" | "Resolution"

export type rules = { [k in ruleName]?: any }

export type LogicalSymbol = '¬' | '∧' | '∨' | '→' | '↔';
export type LogicalSymbolsToLatexMap = { [k in LogicalSymbol]: string };