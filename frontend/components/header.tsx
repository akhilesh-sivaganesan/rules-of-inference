import Button from "@mui/material/Button";

export default function Header() {
    return (
        <div>
            <div className='flex flex-row items-center justify-end p-3 bg-white space-x-2'>
                <Button variant="contained" href="/" style={{ border: '2px solid black', color: 'black', backgroundColor: 'transparent' }}>
                    Back Home
                </Button>
                <Button variant='contained' href="/statistics" style={{ border: '2px solid black', color: 'black', backgroundColor: 'transparent' }}>
                    Statistics
                </Button>
            </div>
        </div>
    )
}
