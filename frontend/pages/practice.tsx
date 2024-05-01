import React from 'react';
import Header from "@/components/header";
import { currentProblemIDState, problemListState, showSolutionState } from "@/atoms/recoil_state";
import { useRecoilState } from 'recoil';
import Container from "@mui/material/Container";
import ProblemComponent from "@/components/problem";
import SolutionComponent from "@/components/solution";
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Modal from '@mui/material/Modal';
import { Box, Typography } from '@mui/material';
import { Problem } from "@/typings";

export default function practice() {
    const [showSolution, setShowSolution] = useRecoilState(showSolutionState);
    const [currentProblemID, setCurrentProblemID] = useRecoilState<number>(currentProblemIDState);
    const [problemList, setProblemList] = useRecoilState<Problem[]>(problemListState);
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const modalStyle = {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    let value = "";
    if (typeof window !== 'undefined') {
        value = window.location.search.substring(1);
        console.log(value);
    }

    return (
        <div>
            <Header />

            <Container maxWidth="lg">
                <div className="my-6 space-y-3">
                    <h1 className="text-4xl">{problemList[currentProblemID].problemName}</h1>
                    <p>
                        Given the following premises, use the rules of inference to arrive at conclusion <span className="font-bold px-2 py-1 text-white bg-orange-600 rounded-md">{problemList[currentProblemID].conclusion}</span>
                        <IconButton onClick={handleOpen} color="primary" aria-label="rules of inference" size="large">
                            <HelpOutlineIcon />
                        </IconButton>
                    </p>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={modalStyle} className="flex flex-row items-center justify-center">
                            <img src="/static/rules-of-inference-chart.png" alt="Rules of Inference" />
                        </Box>
                    </Modal>
                </div>

                <ProblemComponent difficulty={value} />

            </Container>
        </div>
    );
}