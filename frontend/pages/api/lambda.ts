import { Problem, TextStep } from "@/typings";

export async function generateProblem(difficulty: string) {
    try {
        console.log(`https://6tucgqc7sh.execute-api.us-east-1.amazonaws.com/dev/getproblem?difficulty=${difficulty}`);
        const response = await fetch(`https://6tucgqc7sh.execute-api.us-east-1.amazonaws.com/dev/getproblem?difficulty=${difficulty}`, { method: 'GET'});

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const apiResponse = await response.json();
        // console.log(apiResponse)
        
        const parsedResponse = JSON.parse(JSON.stringify(apiResponse.body))
        console.log("Parsed Response: ", parsedResponse)
        // console.log(parsedResponse)

        

        // Map the parsed response to the Problem[] type
        const mappedProblems: Problem[] = parsedResponse.map((apiProblem: Problem) => ({
            premises: apiProblem.premises,
            conclusion: apiProblem.conclusion,
            letters:apiProblem.letters,
            problemID: apiProblem.problemID,
            problemName: difficulty.slice(0,1).toUpperCase() + difficulty.slice(1) + " API Problem",
            solution: apiProblem.solution.map((step: TextStep) => ({
                stepID: step.stepID,
                statement: step.statement,
                justification: step.justification,
                evidence: step.evidence,
            })),
        }));
        console.log('mapped problems')
        console.log(mappedProblems);
        return mappedProblems;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null; // Handle the error as needed
    }
}