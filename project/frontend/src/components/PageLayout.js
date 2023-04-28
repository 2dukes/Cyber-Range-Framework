import { Box, Grid, Typography, Container, useMediaQuery } from '@mui/material';
import TopBar from './TopBar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import { green, yellow, red } from '@mui/material/colors';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';

const PageLayout = ({ children }) => {
    const [checkedCategoryBoxes, setCheckedCategoryBoxes] = useState([]);
    const [checkedDifficultyBoxes, setCheckedDifficultyBoxes] = useState([]);
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('xl'));
    const checkboxLabels = ['Pwn', 'Crypto', 'Misc', 'Rev', 'Windows', 'Log4j'];
    const difficultyLabels = ['Easy', 'Medium', 'Hard'];
    const colors = {
        "Easy": green[700],
        "Medium": yellow[700],
        "Hard": red[500]
    };

    const handleFilterChange = (checkedBoxes, setCheckedBoxes, item) => {
        if (checkedBoxes.includes(item))
            setCheckedBoxes(checkedBoxes.filter(box => box !== item));
        else
            setCheckedBoxes(checkedBoxes.concat(item));
    };

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
                                <Typography>Category</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormGroup>
                                    {checkboxLabels.map(item => (
                                        <FormControlLabel control={<Checkbox
                                            onChange={handleFilterChange.bind(null, checkedCategoryBoxes, setCheckedCategoryBoxes, item)}
                                            sx={{
                                                color: 'black',
                                                '&.Mui-checked': {
                                                    color: 'black',
                                                },
                                            }} />} label={item} />

                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Difficulty</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormGroup>
                                    {difficultyLabels.map(item => (
                                        <FormControlLabel control={<Checkbox
                                            onChange={handleFilterChange.bind(null, checkedDifficultyBoxes, setCheckedDifficultyBoxes, item)}
                                            sx={{
                                                color: colors[item],
                                                '&.Mui-checked': {
                                                    color: colors[item],
                                                },
                                            }} />} label={item} />
                                    ))}
                                </FormGroup>
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