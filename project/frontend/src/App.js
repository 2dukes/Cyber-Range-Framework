import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ScenarioCard from "./components/ScenarioCard";
import PageLayout from "./components/PageLayout";

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

                {/* <Grid item xs={12} display="flex" justifyContent="center">
                        <Pagination size={isReallySmall ? "small" : "medium"} count={Math.ceil(totalCampaigns / CAMPAIGNS_PER_PAGE)} page={page} onChange={changePage} color="primary" />
                    </Grid> */}
            </Grid>
        </PageLayout>
    );
}

export default App;
