import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ScenarioCard from "./components/ScenarioCard";
import PageLayout from "./components/PageLayout";
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';

import { styled, createTheme, ThemeProvider } from '@mui/system';

const Test = styled('pagination');

function App() {
    return (
        <PageLayout>
            <Typography variant="h3" marginTop="2em" textAlign="center" gutterBottom >
                All Scenarios
            </Typography>
            <Grid container
                alignItems="center"
                justify="center" spacing={3}>
                <Grid item xs={12} md={6}><ScenarioCard /></Grid>
                <Grid item xs={12} md={6}><ScenarioCard /></Grid>
                <Grid item xs={12} md={6}><ScenarioCard /></Grid>
                <Grid item xs={12} md={6}><ScenarioCard /></Grid>

                <Grid item xs={12} display="flex" justifyContent="center">
                    <Stack spacing={2}>
                        <Pagination
                            count={10}
                            renderItem={(item) => {
                                if (item.selected)
                                    return (<PaginationItem
                                        sx={{ backgroundColor: "darkorange !important" }}
                                        {...item}
                                    />);
                                else
                                    return (<PaginationItem                                        
                                        {...item}
                                    />);
                            }}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </PageLayout>
    );
}

export default App;
