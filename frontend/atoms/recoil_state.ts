import { generateProblem } from '@/pages/api/lambda';
import { Problem, TextStep } from '@/typings';
import { atom } from 'recoil';

export const problemListState = atom({
    key: 'problemListState',
    default: 
    [
        {
            premises: [],
            conclusion: "Q",
            problemID: 0,
            problemName: "Basic Modus Ponens",
            solution: [
                {stepID: 0, statement: 'P', justification: 'Premise', evidence: ''},
                {stepID: 1, statement: 'P→Q', justification: 'Premise', evidence: ''},
                {stepID: 2, statement: 'Q', justification: 'Modus Ponens', evidence: '1,2'}
            ] as TextStep[]
        },
        {
            premises: ["¬Q", "P→Q"],
            conclusion: "¬P",
            problemID: 1,
            problemName: "Basic Modus Tollens",
            solution: [
                {stepID: 0, statement: '¬Q', justification: 'Premise', evidence: ''},
                {stepID: 1, statement: 'P→Q', justification: 'Premise', evidence: ''},
                {stepID: 2, statement: '¬P', justification: 'Modus Tollens', evidence: '1,2'}
            ] as TextStep[]
        },
        {
            premises: ["P→Q", "Q→R"],
            conclusion: "P→R",
            problemID: 2,
            problemName: "Basic Hypothetical Syllogism",
            solution: [
                {stepID: 0, statement: 'P→Q', justification: 'Premise', evidence: ''},
                {stepID: 1, statement: 'Q→R', justification: 'Premise', evidence: ''},
                {stepID: 2, statement: 'P→Q', justification: 'Hypothetical Syllogism', evidence: '1,2'}
            ] as TextStep[]
        },
        {
            premises: ["P→Q", "P∧Q"],
            conclusion: "Q",
            problemID: 2,
            problemName: "Demo Problem - Modus Ponens",
            solution: [
                {stepID: 0, statement: 'P→Q', justification: 'Premise', evidence: ''},
                {stepID: 1, statement: 'P∧Q', justification: 'Premise', evidence: ''},
                {stepID: 2, statement: 'P', justification: 'Simplification', evidence: '2'},
                {stepID: 3, statement: 'Q', justification: 'Modus Ponens', evidence: '1,3'}
            ] as TextStep[]
        }, 
        {
            premises: ['¬A', '¬P→A', 'B', 'B→(P→Q)'],
            conclusion: "Q",
            problemID: 4, 
            problemName: "Demo complex nested problem",
            solution: [
                {
                  stepID: 0,
                  statement: '¬A',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 1,
                  statement: '¬P→A',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 2,
                  statement: 'P',
                  justification: 'Modus Tollens',
                  evidence: '1, 2'
                },
                { stepID: 3, statement: 'B', justification: 'Premise', evidence: '' },
                {
                  stepID: 4,
                  statement: 'B→(P→Q)',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 5,
                  statement: 'P→Q',
                  justification: 'Modus Ponens',
                  evidence: '4, 5'
                },
                {
                  stepID: 6,
                  statement: 'Q',
                  justification: 'Modus Ponens',
                  evidence: '3,6'
                }
              ]
        },

        {
            premises: [ '¬P→A', 'B', 'B→(P→Q)', 'C∨(¬A)', '¬C' ],
            conclusion: "Q",
            problemID: 5, 
            problemName: "Demo complex nested problem 2",
            solution: [
                {
                  stepID: 0,
                  statement: 'C∨(¬A)',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 1,
                  statement: '¬C',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 2,
                  statement: '¬A',
                  justification: 'Disjunctive Syllogism',
                  evidence: '1, 2'
                },
                {
                  stepID: 3,
                  statement: '¬P→A',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 4,
                  statement: 'P',
                  justification: 'Modus Tollens',
                  evidence: '3,4'
                },
                { stepID: 5, statement: 'B', justification: 'Premise', evidence: '' },
                {
                  stepID: 6,
                  statement: 'B→(P→Q)',
                  justification: 'Premise',
                  evidence: ''
                },
                {
                  stepID: 7,
                  statement: 'P→Q',
                  justification: 'Modus Ponens',
                  evidence: '6,7'
                },
                {
                  stepID: 8,
                  statement: 'Q',
                  justification: 'Modus Ponens',
                  evidence: '5,8'
                }
              ]
              
        }

    ] as Problem[]
});

export const currentProblemIDState = atom({
    key: 'currentProblemIDState',
    default: 0,
})

export const showSolutionState = atom({
    key: 'showSolution',
    default: false,
})