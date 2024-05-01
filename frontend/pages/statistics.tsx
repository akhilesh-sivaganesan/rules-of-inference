import Button from "@mui/material/Button";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Header from "@/components/header";
import { useState, useEffect } from "react";
import problemToLatex from '../components/problem'
import CircularProgress from '@mui/material/CircularProgress';
import toast, { Toaster } from "react-hot-toast";

import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";

export default function Statistics() {
    const [problemStats, setProblemStats] = useState({ 'seenEasy': 0, 'seenMedium': 0, 'attemptedEasy': 0, 'attemptedMedium': 0, 'solvedEasy': 0, 'solvedMedium': 0, 'latex': '' })



    async function setStats() {
        var cookies = document.cookie
        console.log(cookies)
        var cookieDictionary: { [key: string]: any } = {};
        if (cookies) {
            var cookieArray = cookies.split("; ");
            console.log(cookieArray);
            for (var cookie of cookieArray) {
                var splitCookie = cookie.split("=");
                cookieDictionary[splitCookie[0]] = splitCookie[1];
            }
        } else {
            cookieDictionary['seenEasy'] = 0;
            cookieDictionary['seenMedium'] = 0;
            cookieDictionary['attemptedEasy'] = 0;
            cookieDictionary['solvedEasy'] = 0;
            cookieDictionary['attemptedMedium'] = 0;
            cookieDictionary['solvedMedium'] = 0;
            cookieDictionary['latex'] = 0;
        }
        console.log(cookieDictionary);
        if (!('seenEasy' in cookieDictionary)) {
            cookieDictionary['seenEasy'] = 0;
        }
        if (!('seenMedium' in cookieDictionary)) {
            cookieDictionary['seenMedium'] = 0;
        }
        if (!('attemptedEasy' in cookieDictionary)) {
            cookieDictionary['attemptedEasy'] = 0;
        }
        if (!('attemptedMedium' in cookieDictionary)) {
            cookieDictionary['attemptedMedium'] = 0;
        }
        if (!('solvedEasy' in cookieDictionary)) {
            cookieDictionary['solvedEasy'] = 0;
        }
        if (!('solvedMedium' in cookieDictionary)) {
            cookieDictionary['solvedMedium'] = 0;
        }

        setProblemStats({ 'seenEasy': cookieDictionary['seenEasy'], 'seenMedium': cookieDictionary['seenMedium'], 'attemptedEasy': cookieDictionary['attemptedEasy'], 'attemptedMedium': cookieDictionary['attemptedMedium'], 'solvedEasy': cookieDictionary['solvedEasy'], 'solvedMedium': cookieDictionary['solvedMedium'], 'latex': cookieDictionary['latex'] });

        console.log(cookieDictionary);
        console.log(problemStats)
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
                console.log(splitCookie)
                cookieDictionary[splitCookie[0]] = splitCookie[1];
            }
            return cookieDictionary;
        }
    }


    useEffect(() => {
        setStats();
    }, []);

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

    const handleResetStatistics = () => {
        // Reset the statistics and update the state
        const resetStats = { 'seenEasy': 0, 'seenMedium': 0, 'attemptedEasy': 0, 'attemptedMedium': 0, 'solvedEasy': 0, 'solvedMedium': 0, 'latex': '' };
        setProblemStats(resetStats);

        // Reset cookies
        const resetCookies = { 'seenEasy': 0, 'seenMedium': 0, 'attemptedEasy': 0, 'attemptedMedium': 0, 'solvedEasy': 0, 'solvedMedium': 0, 'latex': '' };
        postCookies(resetCookies);
    };

    function copyProblemLatex() {
        navigator.clipboard.writeText(decodeURIComponent(decodeURIComponent(problemStats['latex']))).then(() => {
            toast.success('Up to the last 5 attempted problems\' LaTeX code copied to clipboard.');
        }, () => {
            toast.error('Failed to copy LaTeX code to clipboard.');
        });
    }

    return (
        <div>
            <Header />
            <Container maxWidth={'md'} className="flex flex-col items-center justify-center">
                <Grid container className="h-[90vh]" spacing={2}>
                    <Grid item md={6} className="flex items-center justify-center">
                        <Box position="relative" display="inline-flex">
                            <CircularProgress
                                variant="determinate"

                                value={(problemStats['attemptedEasy']+problemStats['attemptedMedium']) ? (problemStats['solvedEasy']+problemStats['solvedMedium']) / (problemStats['attemptedEasy']+problemStats['attemptedMedium']) * 100 : 0}
                                size={300}
                                thickness={5}
                                style={{ color: '#BBD686', border: '1px solid #BBD686', borderRadius: '50%' }}
                            />
                            <Box
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                                display="flex-col"
                                alignItems="center"
                                justifyContent="center"
                                position="absolute"
                            >
                                <div className="flex h-full w-full flex-col items-center justify-center">
                                    <Typography className="text-4xl" component="div" color="textSecondary">
                                        {`${Math.trunc((problemStats['attemptedEasy']+problemStats['attemptedMedium']) ? (problemStats['solvedEasy']+problemStats['solvedMedium']) / (problemStats['attemptedEasy']+problemStats['attemptedMedium']) * 100 : 0)}%`}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        accuracy
                                    </Typography>
                                </div>

                            </Box>
                        </Box>
                    </Grid>


                    <Grid item md={6} className="flex flex-col items-start justify-center p-3">
                        <div className="flex flex-col space-y-3">
                            <h1 className="text-5xl mb-4">Your Statistics</h1>
                            <TableContainer className="border border-gray-300 rounded-md overflow-hidden">
                                <Table className="min-w-full">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-xl border-b border-gray-300">You have seen {problemStats['seenEasy']} easy problems, attempted {problemStats['attemptedEasy']}, and solved {problemStats['solvedEasy']}.</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-xl border-b border-gray-300">You have seen {problemStats['seenMedium']} medium problems, attempted {problemStats['attemptedMedium']}, and solved {problemStats['solvedMedium']}.</TableCell>
                                            
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <h2 className="text-xl text-center"><Button variant="outlined" className="text-xs" onClick={() => { copyProblemLatex() }}>
                <ContentCopyIcon className="h-5 w-5 mr-1" />Copy Last 5 Problems Latex
            </Button>
            </h2>

                            <Button variant="contained" className="mt-4 text-white bg-black" onClick={handleResetStatistics}>Reset Statistics</Button>
                        </div>
                    </Grid>
                </Grid>

            </Container>

        </div>
    )

    // return (
    //     <div>
    //         <Header />
    //         <h1 className="text-3xl text-center">Your Statistics are here</h1>
    //         {/* <Button variant="contained" href="/">Back Home</Button> */}
    //         <h2 className="text-xl text-center">You have seen {problemStats['seenEasy']} easy problems, attempted {problemStats['attemptedEasy']}, and solved {problemStats['solvedEasy']}.</h2>
    //         <h2 className="text-xl text-center">You have seen {problemStats['seenMedium']} medium problems, attempted {problemStats['attemptedMedium']}, and solved {problemStats['solvedMedium']}.</h2>
            
    //     </div>
    // )
}