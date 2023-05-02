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

const SCENARIOS_PER_PAGE = 4;

let scenarioList = [
    {
        name: "Scenario 1",
        description: "Description 1",
        category: "Crypto",
        difficulty: "Easy",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        // bot: "https://adminbot.mc.ax",
        downloadPath: "download.txt"
    },
    {
        name: "Scenario 2",
        description: "Description 2",
        category: "Windows",
        difficulty: "Medium",
        image: "https://jumpcloud.com/wp-content/uploads/2016/07/AD1.png",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "https://adminbot.mc.ax",
        downloadPath: "download.txt"
    },
    {
        name: "Scenario 3",
        description: "Description 3",
        category: "Windows",
        difficulty: "Medium",
        image: "https://www.malwarebytes.com/blog/news/2023/02/asset_upload_file45746_255998.jpg",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "https://adminbot.mc.ax",
        downloadPath: "download.txt"
    },
    {
        name: "Scenario 4",
        description: "Description 4",
        category: "Pwn",
        difficulty: "Hard",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "https://adminbot.mc.ax",
        downloadPath: "download.txt"
    },
    {
        name: "Scenario 5",
        description: "Description 5",
        category: "Crypto",
        difficulty: "Easy",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "https://adminbot.mc.ax",
        downloadPath: "download.txt"
    },
    {
        name: "Scenario 6",
        description: "Description 6",
        category: "Log4j",
        difficulty: "Easy",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "https://adminbot.mc.ax",
        downloadPath: "download.txt"
    }
];

const fetchScenarios = async () => {
    const scenarioResult = await fetch("http://localhost:8000/scenarios");
    const scenarioResultJSON = await scenarioResult.json();

    return {
        scenarios: scenarioResultJSON.scenarios
    };
};

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
            scenarioList = (await fetchScenarios()).scenarios;
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

        if (isCategory)
            if (boxes.length === 0 && checkedDifficultyBoxes.length === 0)
                tmpScenarios = scenarioList;
            else
                tmpScenarios = scenarioList.filter(scn => boxes.includes(scn.category) || checkedDifficultyBoxes.includes(scn.difficulty));
        else
            if (boxes.length === 0 && checkedCategoryBoxes.length === 0)
                tmpScenarios = scenarioList;
            else
                tmpScenarios = scenarioList.filter(scn => checkedCategoryBoxes.includes(scn.category) || boxes.includes(scn.difficulty));

        scenariosLen = tmpScenarios.length;
        setFilteredScenarios(tmpScenarios);

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