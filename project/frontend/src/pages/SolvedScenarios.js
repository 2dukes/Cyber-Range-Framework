import PageLayout from "../components/PageLayout";
import { Box, Typography } from '@mui/material';
import TopBar from '../components/TopBar';

const SolvedScenarios = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <TopBar />
            <Box sx={{ boxShadow: 5, mt: '-0.5em', mx: -1, p: '0.1em' }}>
                <Typography variant="h3" marginTop="2em" marginBottom="0.5em" textAlign="center" gutterBottom >
                    Solved Scenarios
                </Typography>
            </Box>
            <PageLayout>
                <h1>TBD</h1>
            </PageLayout>
        </Box>
    );
};

export default SolvedScenarios;;