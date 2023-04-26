import TopBar from "./components/TopBar";
import Box from '@mui/material/Box';

function App() {
    return (
        <Box sx={{ display: 'flex' }}>
            <TopBar />
            <Box component="main" sx={{ py: 5, px: 1 }}>
                <h1>asdassd</h1>
            </Box>
        </Box>
    );
}

export default App;
