import { Grid, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterBar from './FilterBar';

const PageLayout = ({ children, handleFilterChange, checkedCategoryBoxes, checkedDifficultyBoxes, setCheckedCategoryBoxes, setCheckedDifficultyBoxes }) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('xl'));

    return (
        <Grid container>
            <Grid item xs={12} md={2}>
                <FilterBar isSmall={isSmall} handleFilterChange={handleFilterChange} checkedCategoryBoxes={checkedCategoryBoxes} checkedDifficultyBoxes={checkedDifficultyBoxes} setCheckedCategoryBoxes={setCheckedCategoryBoxes} setCheckedDifficultyBoxes={setCheckedDifficultyBoxes} />
            </Grid>
            <Grid item xs={12} md={8}>
                <Container sx={{ marginTop: !isSmall ? "5em" : "2em" }} maxWidth="lg">
                    {children}
                </Container>
            </Grid>
        </Grid>
    );
};

export default PageLayout;