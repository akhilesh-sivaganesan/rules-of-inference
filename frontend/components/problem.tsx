import { Problem, Step, TextProblemInputs, TextStep, ruleName, LogicalSymbolsToLatexMap, LogicalSymbol } from "@/typings";
import { Button, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useForm, useFieldArray, SubmitHandler, Controller } from "react-hook-form";
import { BackspaceIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import VerifiedIcon from '@mui/icons-material/Verified';
import TextField from "@mui/material/TextField";
import { currentProblemIDState, problemListState, showSolutionState } from "@/atoms/recoil_state";
import { useRecoilState } from 'recoil';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import rulesOfInference from "../pages/api/rules";
import toast, { Toaster } from "react-hot-toast";
import { generateProblem } from "@/pages/api/lambda";
import isRuleApplicable, { isConditionalDisjunctive, pullNegation, pushNegation } from "@/pages/api/structure";
import SolutionComponent from "./solution";



export default function ProblemComponent({ difficulty }: { difficulty: string }) {
    const [currentProblemID, setCurrentProblemID] = useRecoilState<number>(currentProblemIDState)
    const [problemList, setProblemList] = useRecoilState<Problem[]>(problemListState)
    const [currentInputID, setCurrentInputID] = useState('')
    const [showSolution, setShowSolution] = useRecoilState(showSolutionState)
    const [problemSolved, setProblemSolved] = useState(false)
    const [letters, setLetters] = useState(['p', 'q'])
    const [attempted, setAttempted] = useState(false)

    const defaultValues = {
        problemID: problemList[currentProblemID].problemID,
        problemName: problemList[currentProblemID].problemName,
        stepList: problemList[currentProblemID].premises.map((premise, index) => {
            return (
                {
                    stepID: index,
                    statement: premise,
                    justification: "Premise",
                    evidence: ""
                }
            )
        }),
        conclusion: problemList[currentProblemID].problemName,

    };


    const { setValue, getValues, reset, register, control, handleSubmit, formState: { errors } } = useForm<TextProblemInputs>({ defaultValues });

    const { fields, append, remove } = useFieldArray({
        name: "stepList",
        control
    });

    const onSubmit: SubmitHandler<TextProblemInputs> = async (data) => {
        if (checkLastStep(getValues(`stepList.${fields.length - 1}`), false) && getValues(`stepList.${fields.length - 1}.statement`).replace(/\s/g, '') == problemList[currentProblemID].conclusion.replace(/\s/g, '')) {
            if (problemSolved == false) {
                //updateStatistics
                let cookies = retrieveCookies();
                console.log("CURRENT COOKIES: " , cookies);
                if (problemList[currentProblemID].problemName.toLowerCase().includes("easy")) {
                    if ('solvedEasy' in cookies) {
                        cookies['solvedEasy'] = +cookies['solvedEasy'] + 1 ;
                    } else {
                        cookies['solvedEasy'] = 1;
                    }
                } else {
                    if ('solvedMedium' in cookies) {
                        cookies['solvedMedium'] = +cookies['solvedMedium'] + 1 ;
                    } else {
                        cookies['solvedMedium'] = 1;
                    }
                }
                postCookies(cookies);
                setProblemSolved(true);
            }
            toast.success("Problem Solved!")
        } else {
            toast.error("Solution Incorrect")
        }
        console.log(data)
    }

    // Map the logical symbols to LaTeX
    const logicalSymbolsToLatex: LogicalSymbolsToLatexMap = {
        '¬': '\\neg ',
        '∧': '\\land ',
        '∨': '\\lor ',
        '→': '\\to ',
        '↔': '\\leftrightarrow ',
        // Add more mappings as necessary
    };

    function handleReset() {
        reset({
            problemName: problemList[currentProblemID].problemName,
            stepList: problemList[currentProblemID].premises.map((premise, index) => {
                return (
                    {
                        stepID: index,
                        statement: premise,
                        justification: "Premise",
                        evidence: ""
                    }
                )
            }),
        }, {
            keepDefaultValues: false,
        });
        //console.log("RESET DONE")

    }


    function nextProblem() {
        fetchData()
        setCurrentProblemID((currentProblemID + 1) % problemList.length);
    }


    function updateLastTouched(str: any) {
        //console.log(getValues())
        var el = document.getElementById(currentInputID) ?? null
        if (el) {
            setValue(currentInputID as `stepList.${number}.statement`, getValues(currentInputID as `stepList.${number}.statement`) + str)

        }

    }

    function getStatement(stepNumber: number) {
        return getValues(`stepList.${stepNumber - 1}.statement`)
    }

    function removeSurrounding(str: any): string {
        // Check if the string is not empty and has at least two characters
        if (str.length >= 2 && str.charAt(0) === "(" && str.charAt(str.length - 1) === ")") {
            // Remove the first and last characters
            return str.substring(1, str.length - 1);
        } else {
            // If the string doesn't meet the criteria, return it unchanged
            return str;
        }
    }

    function checkLastStep({ stepID, statement, justification, evidence }: TextStep, showToast: boolean) {
        let isValid = false;
        if (justification != "Premise" && (!statement || !justification || !evidence)) {
            if (showToast) {
                toast.error(`Line ${stepID + 1}: Use Blank Line`);
            }
        } else if (justification == "Premise") {
            if (problemList[currentProblemID].premises.includes(statement)) {
                isValid = true;
                if (showToast) {
                    toast.success(`Line ${stepID + 1}: Valid Premise`);
                }
            }
        } else {
            const evidenceLines = evidence.split(',');
            statement = removeSurrounding(statement.replace(/\s/g, ''));
            if (evidenceLines.length > 1) {
                const evidence1 = removeSurrounding(getStatement(parseInt(evidenceLines[0]) as number).replace(/\s/g, ''));
                const evidence2 = removeSurrounding(getStatement(parseInt(evidenceLines[1]) as number).replace(/\s/g, ''));
                const conclusionApplicable = isRuleApplicable(justification as ruleName, [evidence1, evidence2]) // chance to return null

                if (conclusionApplicable) {
                    const ruleConclusion = removeSurrounding(conclusionApplicable);
                    isValid = statement === ruleConclusion;
                } 
                // check for the reverse order of conjunction
                if (!isValid && justification === "Conjunction") {
                    isValid = statement === isRuleApplicable(justification as ruleName, [evidence2, evidence1])
                }

                if (!isValid && justification === "Resolution") {
                    isValid = statement === isRuleApplicable(justification as ruleName, [evidence2, evidence1])
                }
            } else {
                const evidence1 = getStatement(parseInt(evidenceLines[0]) as number).replace(/\s/g, '');

                if (justification === "Addition") {
                    // Check if statement contains the disjunctive symbol
                    if (statement.includes('∨')) {
                        const [part1, part2] = statement.split('∨');
                        // Check if one of the parts matches evidence1
                        if (part1 === evidence1 || part2 === evidence1) {
                            isValid = true;
                        }
                    }
                }

                if (justification === "Simplification") {
                    // Check if statement is exactly one of the parts of evidence1 after splitting by the conjunction symbol
                    if (evidence1.includes('∧')) {
                        const [part1, part2] = evidence1.split('∧');
                        if (statement === part1 || statement === part2) {
                            isValid = true;
                        }
                    }
                }

                if (justification === "Pull Negation") {
                    isValid = statement === pullNegation(evidence1)
                }

                if (justification === "Push Negation") {
                    isValid = statement === pushNegation(evidence1)
                }

                if (justification === "Conditional Disjunctive") {
                    isValid = statement === isConditionalDisjunctive(evidence1)
                }

            }

            if (isValid && showToast) {
                toast.success(`Line ${stepID + 1}: Valid with ${justification}`);
            }
        }

        if (!isValid) {
            toast.error(`Line ${stepID + 1}: Invalid ${justification}`);
        }

        return isValid;
    }


    function addNextLine() {
        if (checkLastStep(getValues(`stepList.${fields.length - 1}`), false) && getValues(`stepList.${fields.length - 1}.statement`) == problemList[currentProblemID].conclusion) {
            toast.success("Problem Solved!")
            return
        }
        if (fields.length <= problemList[currentProblemID].premises.length || checkLastStep(getValues(`stepList.${fields.length - 1}`), true)) {
            append({
                stepID: fields.length,
                statement: "",
                justification: "",
                evidence: ""
            })
            setCurrentInputID(`stepList.${fields.length}.statement`)
        }
        if (attempted == false) {
            let cookies = retrieveCookies()
            if (problemList[currentProblemID].problemName.toLowerCase().includes("easy")) {
                if ('attemptedEasy' in cookies) {
                    cookies['attemptedEasy'] = +cookies['attemptedEasy'] + 1 ;
                } else {
                    cookies['attemptedEasy'] = 1;
                }
            } else {
                if ('attemptedMedium' in cookies) {
                    cookies['attemptedMedium'] = +cookies['attemptedMedium'] + 1 ;
                } else {
                    cookies['attemptedMedium'] = 1;
                }
            }
            
            if ('latex' in cookies) {
                if (cookies['saved'] == 5 ) {
                    var latex = cookies['latex'].split("\\noindent");
                    latex.shift();
                    latex.append(copyProblemLatex(false));   
                    cookies['latex'] = latex.join("\\noindent");    
                } else {
                    cookies['latex'] = cookies['latex'] + copyProblemLatex(false);
                    if ('saved' in cookies && Number.isInteger(cookies['saved'])) {
                        cookies['saved'] = cookies['saved'] + 1;
                    } else {
                        cookies['saved'] = 1;
                    }
                }
            } else {
                cookies['latex'] = copyProblemLatex(false)
                cookies['solved'] = 1
            }

            postCookies(cookies);
            setAttempted(true)
        }
    }

    function escapeLogicalSymbols(statement : string) {
        return statement.split('').map(char => logicalSymbolsToLatex[char as LogicalSymbol] || char).join(' ');
    }
    

    function copyProblemLatex(save: boolean) {
        let currentProblem = problemList[currentProblemID];
    
        let latexCode = `\\noindent Using rules of inference, show that the premises below conclude with \$ ${escapeLogicalSymbols(currentProblem.conclusion)} \$. Write each of your steps and number them.\n\n`;
        latexCode += `\\begin{center}\n`;
        latexCode += `\\begin{tabular}{c c}\n`;
        latexCode += `\\textbf{STEP} & \\textbf{REASON} \\\\\n`;
        let stepNum = 1;
        // Adding premises
        for (const premise of currentProblem.premises) {
            latexCode += `    ${stepNum}. \$ ${escapeLogicalSymbols(premise)} \$ & Premise \\\\\n`;
            stepNum += 1;
        }
    
        latexCode += `\\end{tabular}\n`;
        latexCode += `\\end{center}\n`;
    
        // Now copy to clipboard and alert the user
        if (save) {
        navigator.clipboard.writeText(latexCode).then(() => {
            toast.success('Problem LaTeX code copied to clipboard.');
        }, () => {
            toast.error('Failed to copy LaTeX code to clipboard.');
        });}
        return latexCode;
    }

    function retrieveCookies() {
        var cookies = document.cookie
        console.log(cookies)
        if (!cookies) {
            return {};
        } else {
            var cookieArray = cookies.split("; ");
            console.log(cookieArray)
            var cookieDictionary: { [key: string]: any }= {};
            for (var cookie of cookieArray) {
                console.log(cookie)
                var splitCookie = cookie.split("=");
                console.log(decodeURIComponent(splitCookie[1]))
                cookieDictionary[splitCookie[0]] = decodeURIComponent(decodeURIComponent(splitCookie[1]));
            }
            return cookieDictionary;
        }
    }

    function postCookies(dict: { [key: string]: any }) {
        console.log(dict)
        var cookieString = "";
        for (let key in dict) {
            let value = dict[key];
            cookieString = key + "=" +encodeURIComponent(value)
            document.cookie = cookieString
            console.log(cookieString)
            console.log(decodeURI(encodeURIComponent(value)))
        }
        console.log("POSTED")
        console.log(document.cookie)
    }

    async function fetchData() {
        console.log("DIFFICULTY: ", difficulty);
        const parsedProblems = await generateProblem(difficulty);
        if (parsedProblems !== null) {
            reset({
                problemName: parsedProblems[currentProblemID].problemName,
                stepList: parsedProblems[currentProblemID].premises.map((premise, index) => {
                    return (
                        {
                            stepID: index,
                            statement: premise,
                            justification: "Premise",
                            evidence: ""
                        }
                    )
                }),
            }, {
                keepDefaultValues: false,
            });
            console.log('set the new set of problems')
            console.log(parsedProblems);
            setProblemList(parsedProblems);

            //Set the letters for input buttons
            var newLetters = []
            for (var letter in parsedProblems[currentProblemID].letters) {
                //console.log("Letter", letter)
                //console.log(parsedProblems[currentProblemID].letters[letter])
                newLetters.push(parsedProblems[currentProblemID].letters[letter])
            }

            setLetters(newLetters)
            setCurrentProblemID(0)

            //updateStatistics
            let cookies = retrieveCookies();
            console.log("CURRENT COOKIES: " , cookies);
            // console.log('seen' in cookies)
            // console.log(cookies['seen'])
            if (parsedProblems[currentProblemID].problemName.toLowerCase().includes("easy")) {
                if ('seenEasy' in cookies) {
                    cookies['seenEasy'] = +cookies['seenEasy'] + 1;
                } else {
                    cookies['seenEasy'] = 1
                }    
            } else {
                if ('seenMedium' in cookies) {
                    cookies['seenMedium'] = +cookies['seenMedium'] + 1;
                } else {
                    cookies['seenMedium'] = 1
                }
            }
            postCookies(cookies);
            setProblemSolved(false);
            setAttempted(false);

        }
    }
    useEffect(() => {
        handleReset()
    }, [currentProblemID, problemList])

    useEffect(() => {
        fetchData();
        handleReset();

    }, []);

    var test = "<Button onClick={() => updateLastTouched('Q')}>Q</Button>"
    return (
        <div>
            {
                showSolution ?
                    <SolutionComponent />
                    :
                    <div className="flex flex-col items-center">
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
                                                className="h-min"
                                            >


                                                <TableCell>
                                                    <div className="bg-[orange] w-6 h-6 rounded-[50%] flex flex-row items-center justify-center text-xs text-white">
                                                        {i + 1}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        placeholder="Enter statement"
                                                        {...register(`stepList.${i}.statement` as const, {
                                                            required: true
                                                        })}
                                                        defaultValue={field.statement}
                                                        id={`stepList.${i}.statement` as const}
                                                        onClick={() => setCurrentInputID(`stepList.${i}.statement`)}
                                                        disabled={fields[i].justification == "Premise" || i < fields.length - 1 ? true : false}
                                                        autoFocus
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Controller
                                                        render={
                                                            ({ field }) => <Select {...field} id={`stepList.${i}.justification`} disabled={fields[i].justification == "Premise" || i < fields.length - 1 ? true : false}>
                                                                <MenuItem value={"Premise"}>Premise</MenuItem>
                                                                <MenuItem value={"Modus Ponens"}>Modus Ponens</MenuItem>
                                                                <MenuItem value={"Modus Tollens"}>Modus Tollens</MenuItem>
                                                                <MenuItem value={"Hypothetical Syllogism"}>Hypothetical Syllogism</MenuItem>
                                                                <MenuItem value={"Disjunctive Syllogism"}>Disjunctive Syllogism</MenuItem>
                                                                <MenuItem value={"Addition"}>Addition</MenuItem>
                                                                <MenuItem value={"Simplification"}>Simplification</MenuItem>
                                                                <MenuItem value={"Conjunction"}>Conjunction</MenuItem>
                                                                <MenuItem value={"Resolution"}>Resolution</MenuItem>
                                                                <MenuItem value={"Pull Negation"}>Pull Negation</MenuItem>
                                                                <MenuItem value={"Push Negation"}>Push Negation</MenuItem>
                                                                <MenuItem value={"Conditional Disjunctive"}>Conditional Disjunctive</MenuItem>

                                                            </Select>
                                                        }
                                                        control={control}
                                                        {...register(`stepList.${i}.justification` as const, {
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
                                                                {...register(`stepList.${i}.evidence` as const)}
                                                                defaultValue={field.evidence}
                                                                id={`stepList.${i}.evidence`}
                                                                disabled={fields[i].justification == "Premise" || i < fields.length - 1 ? true : false}
                                                            />
                                                        </TableCell>

                                                }

                                                {
                                                    i != fields.length - 1 || i < problemList[currentProblemID].premises.length ?
                                                        <TableCell>

                                                        </TableCell>
                                                        :
                                                        <TableCell>
                                                            <Button type="button" onClick={() => remove(i)}>
                                                                <BackspaceIcon className="h-5 w-5" />
                                                            </Button>
                                                        </TableCell>

                                                }

                                            </TableRow>
                                        )
                                    })}


                                </TableBody>



                            </Table>

                        </TableContainer>
                        <div className="flex flex-row space-x-2 justify-center items-center border w-min m-auto" id="input-letters">
                            {letters.map((letter, i) => {
                                return (<Button onClick={() => updateLastTouched(letter)} key={letter}>{letter}</Button>)
                            })}

                            <Button onClick={() => updateLastTouched('¬')}>
                                ¬
                            </Button>
                            <Button onClick={() => updateLastTouched('→')}>
                                →
                            </Button>
                            <Button onClick={() => updateLastTouched(' ∨ ')}>
                                ∨
                            </Button>
                            <Button onClick={() => updateLastTouched(' ∧ ')}>
                                ∧
                            </Button>
                            <Button onClick={() => updateLastTouched('↔')}>
                                ↔
                            </Button>
                        </div>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <div className="flex flex-wrap justify-center mb-1 space-x-1">
                                <Button
                                    type="button"
                                    onClick={() => addNextLine()}
                                    className="flex flex-row space-x-3 items-center text-xs" // minwidth200
                                    variant="outlined"
                                >
                                    <AddCircleOutlineIcon className="h-5 w-5 mr-1" />
                                    Add Next Line
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleReset()}
                                    className="flex flex-row space-x-3 items-center text-xs"
                                    variant="outlined"
                                >
                                    <RestartAltIcon className="h-5 w-5 mr-1" />
                                    Reset Work
                                </Button>
                                <Button type="submit" variant="outlined" className="text-xs" onClick={handleSubmit(onSubmit)}>
                                    <SendIcon className="h-5 w-5 mr-1" />
                                    Submit Inputs
                                </Button>
                                <Button variant="outlined" className="text-xs" onClick={() => { checkLastStep(getValues(`stepList.${fields.length - 1}`), true) }}>
                                    <VerifiedIcon className="h-5 w-5 mr-1" />
                                    Check Last Step
                                </Button>
                            </div>
                            <div className="flex flex-wrap justify-center space-x-1">
                                <Button variant="outlined" className="text-xs" onClick={() => nextProblem()}>
                                    <ArrowForwardIcon className="h-5 w-5 mr-1" /> Next Problem
                                </Button>
                                <Button variant="outlined" className="text-xs" onClick={() => { setShowSolution(true) }}>
                                    <VisibilityIcon className="h-5 w-5 mr-1" />View Solution
                                </Button>
                                <Button variant="outlined" className="text-xs" onClick={() => { copyProblemLatex(true) }}>
                                    <ContentCopyIcon className="h-5 w-5 mr-1" />Copy Latex
                                </Button>
                            </div>
                        </div>
                    </div>
            }

        </div>


    )
}