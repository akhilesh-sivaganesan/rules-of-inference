import { LogicalSymbol, LogicalSymbolsToLatexMap, Problem, TextSolutionInputs } from "@/typings";
import Button from "@mui/material/Button";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { currentProblemIDState, problemListState, showSolutionState } from "@/atoms/recoil_state";
import { useRecoilState } from 'recoil';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import toast, { Toaster } from "react-hot-toast";
export default function SolutionComponent() {
    const [currentProblemID, setCurrentProblemID] = useRecoilState<number>(currentProblemIDState)
    const [problemList, setProblemList] = useRecoilState<Problem[]>(problemListState)
    const [showSolution, setShowSolution] = useRecoilState(showSolutionState)

    const defaultValues = {
        problemID: problemList[currentProblemID].problemID,
        problemName: problemList[currentProblemID].problemName,
        solutionStepList: problemList[currentProblemID].solution.map((solutionStep, index) => {
            return (
                {
                    stepID: solutionStep.stepID,
                    statement: solutionStep.statement,
                    justification: solutionStep.justification,
                    evidence: solutionStep.evidence,
                }
            )
        }),
        conclusion: problemList[currentProblemID].conclusion

    };

    const { setValue, getValues, reset, register, control, handleSubmit, formState: { errors } } = useForm<TextSolutionInputs>({ defaultValues });

    const { fields, append, remove } = useFieldArray({
        name: "solutionStepList",
        control
    });

    function escapeLogicalSymbols(statement : string) {
        const logicalSymbolsToLatex : LogicalSymbolsToLatexMap = {
            '∧': '\\land',
            '∨': '\\lor',
            '¬': '\\lnot',
            '→': '\\rightarrow',
            '↔': '\\leftrightarrow',
            // Add other logical symbols and their LaTeX equivalents as needed
        };
        return statement.split('').map(char => logicalSymbolsToLatex[char as LogicalSymbol] || char).join(' ');
    }

    function copySolutionLatex() {
        let currentProblem = problemList[currentProblemID];
        let latexCode = `\\noindent \\textbf{SOLUTION}\n\n`;
        latexCode += `\\begin{center}\n`;
        latexCode += `\\begin{tabular}{m{0.5\\textwidth} m{0.5\\textwidth}}\n`;
        latexCode += `\\textbf{STEP} & \\textbf{REASON} \\\\\n`;
    
        // Adding solution steps
        let stepNum = 1
        for (const step of currentProblem.solution) {
            let statement = `\$ ${escapeLogicalSymbols(step.statement)} \$` // Escape logical symbols
            let justification = step.justification;
            latexCode += `    ${stepNum}. ${statement} & ${justification}`;
            if (step.evidence) latexCode += ` (${step.evidence})`;
            latexCode += ` \\\\\n`;
            stepNum+=1
        }
    
        latexCode += `\\end{tabular}\n`;
        latexCode += `\\end{center}\n`;
    
        // Now copy to clipboard and alert the user
        navigator.clipboard.writeText(latexCode).then(() => {
            toast.success('Solution LaTeX code copied to clipboard.');
        }, () => {
            toast.error('Failed to copy LaTeX code to clipboard.');
        });
    }


    return (
        <div>
            <Toaster
                position="bottom-center"
                reverseOrder={false}
            />
            

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="w-[10px]">#</TableCell>
                            <TableCell>Step</TableCell>
                            <TableCell>Justification</TableCell>
                            <TableCell>Evidence</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((field, i) => {
                            return (
                                <TableRow
                                    key={i}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >


                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                        <TextField
                                            placeholder="Enter statement"
                                            {...register(`solutionStepList.${i}.statement` as const, {
                                                required: true
                                            })}
                                            defaultValue={field.statement}
                                            disabled={true}
                                            autoFocus
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Controller
                                            render={
                                                ({ field }) => <Select {...field} id={`solutionStepList.${i}.justification`} disabled={true}>
                                                    <MenuItem value={"Premise"}>Premise</MenuItem>
                                                    <MenuItem value={"Modus Ponens"}>Modus Ponens</MenuItem>
                                                    <MenuItem value={"Modus Tollens"}>Modus Tollens</MenuItem>
                                                    <MenuItem value={"Hypothetical Syllogism"}>Hypothetical Syllogism</MenuItem>
                                                    <MenuItem value={"Disjunctive Syllogism"}>Disjunctive Syllogism</MenuItem>
                                                    <MenuItem value={"Addition"}>Addition</MenuItem>
                                                    <MenuItem value={"Simplification"}>Simplification</MenuItem>
                                                    <MenuItem value={"Conjunction"}>Conjunction</MenuItem>
                                                    <MenuItem value={"Resolution"}>Resolution</MenuItem>

                                                </Select>
                                            }
                                            control={control}
                                            {...register(`solutionStepList.${i}.justification` as const, {
                                                required: true
                                            })}
                                            defaultValue={"Modus Ponens"}
                                        />
                                    </TableCell>

                                    {
                                        field.justification == 'Premise' ?
                                            <TableCell>

                                            </TableCell>
                                            :
                                            <TableCell>
                                                <TextField
                                                    placeholder="1,2"
                                                    {...register(`solutionStepList.${i}.evidence` as const)}
                                                    defaultValue={field.evidence}
                                                    disabled={true}
                                                />
                                            </TableCell>

                                    }

                                    <TableCell>
                                    </TableCell>
                                </TableRow>
                            )
                        })}


                    </TableBody>



                </Table>

            </TableContainer>
            <div className="flex flex-row space-x-3 p-3 items-center justify-center">
                <Button variant="outlined" onClick={() => { setShowSolution(false) }}>
                    View Problem
                </Button>
                <Button variant="outlined" onClick={() => { copySolutionLatex() }}>
                    Copy Latex
                </Button>
            </div>
        </div>

    )
}