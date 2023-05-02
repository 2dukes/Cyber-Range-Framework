import { Fragment, useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import TopBar from '../components/TopBar';
import ScenarioCard from "../components/ScenarioCard";
import PageLayout from "../components/PageLayout";
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ScenarioModal from '../components/ScenarioModal';
import LoadingSpinner from '../components/LoadingSpinner';
import fetchScenarios from '../utils/fetchData';

const SCENARIOS_PER_PAGE = 4;

let scenarioList;

const AvailableScenarios = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [checkedCategoryBoxes, setCheckedCategoryBoxes] = useState([]);
    const [checkedDifficultyBoxes, setCheckedDifficultyBoxes] = useState([]);
    const [page, setPage] = useState(1);
    const [filteredScenarios, setFilteredScenarios] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            scenarioList = (await fetchScenarios(false)).scenarios;
            setFilteredScenarios(scenarioList);
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const updateSelectedScenario = (selectedScenario) => {
        setSelectedScenario(selectedScenario);
    };

    const changePage = (_, newPage) => {
        setPage(newPage);
    };

    const handleFilterChange = (checkedBoxes, setCheckedBoxes, isCategory, item) => {
        let boxes, scenariosLen, tmpScenarios;

        if (checkedBoxes.includes(item)) // Remove Filter
            boxes = checkedBoxes.filter(box => box !== item);
        else // Add Filter
            boxes = checkedBoxes.concat(item);

        setCheckedBoxes(boxes);

        if (isCategory) {
            if (boxes.length === 0 && checkedDifficultyBoxes.length === 0)
                tmpScenarios = scenarioList;
            else if (checkedDifficultyBoxes.length > 0 && boxes.length === 0)
                tmpScenarios = scenarioList.filter(scn => checkedDifficultyBoxes.includes(scn.difficulty));
            else if (checkedDifficultyBoxes.length > 0 && boxes.length > 0)
                tmpScenarios = scenarioList.filter(scn => boxes.includes(scn.category) && checkedDifficultyBoxes.includes(scn.difficulty));
            else
                tmpScenarios = scenarioList.filter(scn => boxes.includes(scn.category) || checkedDifficultyBoxes.includes(scn.difficulty));
        } else {
            if (boxes.length === 0 && checkedCategoryBoxes.length === 0)
                tmpScenarios = scenarioList;
            else if (boxes.length === 0)
                tmpScenarios = scenarioList.filter(scn => checkedCategoryBoxes.includes(scn.category));
            else {
                if (checkedCategoryBoxes.length > 0)
                    tmpScenarios = scenarioList.filter(scn => checkedCategoryBoxes.includes(scn.category) && boxes.includes(scn.difficulty));
                else
                    tmpScenarios = scenarioList.filter(scn => checkedCategoryBoxes.includes(scn.category) || boxes.includes(scn.difficulty));
            }
        }

        scenariosLen = tmpScenarios.length;
        setFilteredScenarios(tmpScenarios);
        setSelectedScenario(null);

        if (Math.ceil(scenariosLen / SCENARIOS_PER_PAGE) < page)
            setPage(1);
    };

    let indexOfLastResult = page * SCENARIOS_PER_PAGE;
    const indexOfFirstResult = indexOfLastResult - SCENARIOS_PER_PAGE;
    indexOfLastResult = (indexOfLastResult + 1 > filteredScenarios.length) ? filteredScenarios.length : indexOfLastResult;

    return (
        <Box sx={{ flexGrow: 1 }}>
            <TopBar />
            <Box sx={{ boxShadow: 5, mt: '-0.5em', mx: -1, p: '0.1em' }}>
                <Typography variant="h3" marginTop="2em" marginBottom="0.5em" textAlign="center" gutterBottom >
                    Scenarios
                </Typography>
            </Box>
            {isLoading ? <LoadingSpinner /> : (
                <PageLayout handleFilterChange={handleFilterChange} checkedCategoryBoxes={checkedCategoryBoxes} checkedDifficultyBoxes={checkedDifficultyBoxes} setCheckedCategoryBoxes={setCheckedCategoryBoxes} setCheckedDifficultyBoxes={setCheckedDifficultyBoxes}>
                    {filteredScenarios.length !== 0 ? (
                        <Fragment>
                            {selectedScenario && <ScenarioModal {...filteredScenarios.find(scenario => scenario.name === selectedScenario)} modalOpen={modalOpen} setModalOpen={setModalOpen}></ScenarioModal>}
                            <Grid container
                                alignItems="center"
                                justify="center" spacing={3}>
                                {filteredScenarios.slice(indexOfFirstResult, indexOfLastResult).map(scenario => <Grid item xs={12} md={6} key={scenario.name} onClick={updateSelectedScenario.bind(null, scenario.name)}><ScenarioCard {...scenario} setModalOpen={setModalOpen} /></Grid>)}
                                <Grid item xs={12} display="flex" justifyContent="center">
                                    <Stack spacing={2}>
                                        <Pagination
                                            page={page}
                                            count={Math.ceil(filteredScenarios.length / SCENARIOS_PER_PAGE)}
                                            onChange={changePage}
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
                            </Grid></Fragment>) : (
                        <Typography variant="h4" marginTop="2em" marginBottom="0.5em" textAlign="center" gutterBottom >
                            No items to show.
                        </Typography>
                    )}

                </PageLayout>)}
        </Box>
    );
};

export default AvailableScenarios;