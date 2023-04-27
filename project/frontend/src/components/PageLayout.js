import { Box, Grid, Typography, Container } from '@mui/material';
import TopBar from './TopBar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const PageLayout = ({ children }) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('xl'));

    return (
        <Box sx={{ flexGrow: 1 }}>
            <TopBar />
            <Box sx={{ boxShadow: 5, mt: '-0.5em', mx: -1, p: '0.1em' }}>
                <Typography variant="h3" marginTop="2em" marginBottom="0.5em" textAlign="center" gutterBottom >
                    Scenarios
                </Typography>
            </Box>

            <Grid container>
                <Grid item xs={12} md={2}>
                    <Container sx={{ marginTop: !isSmall ? "5em" : "2em" }}>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Accordion 1</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </Container>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Container sx={{ marginTop: !isSmall ? "5em" : "2em" }} maxWidth="lg">
                        {children}
                    </Container>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PageLayout;