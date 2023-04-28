import { Typography, Container } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { green, yellow, red } from '@mui/material/colors';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const FilterBar = ({ isSmall, handleFilterChange, checkedCategoryBoxes, checkedDifficultyBoxes, setCheckedCategoryBoxes, setCheckedDifficultyBoxes }) => {
    const checkboxLabels = ['Pwn', 'Crypto', 'Misc', 'Rev', 'Windows', 'Log4j'];
    const difficultyLabels = ['Easy', 'Medium', 'Hard'];
    const colors = {
        "Easy": green[700],
        "Medium": yellow[700],
        "Hard": red[500]
    };

    return (
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
                            <FormControlLabel key={item} control={<Checkbox
                                onChange={handleFilterChange.bind(null, checkedCategoryBoxes, setCheckedCategoryBoxes, true, item)}
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
                            <FormControlLabel key={item} control={<Checkbox
                                onChange={handleFilterChange.bind(null, checkedDifficultyBoxes, setCheckedDifficultyBoxes, false, item)}
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
    );
};

export default FilterBar;