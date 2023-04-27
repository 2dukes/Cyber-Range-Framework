import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ScenarioCard from "../components/ScenarioCard";
import PageLayout from "../components/PageLayout";
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ScenarioModal from '../components/ScenarioModal';

const SCENARIOS_PER_PAGE = 4;

const scenarios = [
    {
        name: "Scenario 1",
        description: "Description 1",
        category: "Crypto",
        difficulty: "Easy",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "adminbot.mc.ax"
    },
    {
        name: "Scenario 2",
        description: "Description 2",
        category: "Windows",
        difficulty: "Medium",
        image: "https://jumpcloud.com/wp-content/uploads/2016/07/AD1.png      ",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "adminbot.mc.ax"
    },
    {
        name: "Scenario 3",
        description: "Description 3",
        category: "Misc",
        difficulty: "Medium",
        image: "https://www.malwarebytes.com/blog/news/2023/02/asset_upload_file45746_255998.jpg",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "adminbot.mc.ax"
    },
    {
        name: "Scenario 4",
        description: "Description 4",
        category: "Web",
        difficulty: "Hard",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "adminbot.mc.ax"
    },
    {
        name: "Scenario 5",
        description: "Description 5",
        category: "Crypto",
        difficulty: "Easy",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "adminbot.mc.ax"
    },
    {
        name: "Scenario 6",
        description: "Description 6",
        category: "Log4j",
        difficulty: "Easy",
        image: "https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp",
        author: "notMe",
        targets: "https://unfinished.mc.ax",
        bot: "adminbot.mc.ax"
    }
];

const AvailableScenarios = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [page, setPage] = useState(1);

    const updateSelectedScenario = (selectedScenario) => {
        setSelectedScenario(selectedScenario);
    };

    const changePage = (_, newPage) => {
        setPage(newPage);
    };

    let indexOfLastResult = page * SCENARIOS_PER_PAGE;
    const indexOfFirstResult = indexOfLastResult - SCENARIOS_PER_PAGE;
    indexOfLastResult = (indexOfLastResult + 1 > scenarios.length) ? scenarios.length : indexOfLastResult;

    return (
        <PageLayout>
            {selectedScenario && <ScenarioModal {...scenarios.find(scenario => scenario.name === selectedScenario)} modalOpen={modalOpen} setModalOpen={setModalOpen}></ScenarioModal>}
            <Typography variant="h3" marginTop="2em" marginBottom="0.5em" textAlign="center" gutterBottom >
                Scenarios
            </Typography>
            <Grid container
                alignItems="center"
                justify="center" spacing={3}>
                {scenarios.slice(indexOfFirstResult, indexOfLastResult).map(scenario => <Grid item xs={12} md={6} key={scenario.name} onClick={updateSelectedScenario.bind(null, scenario.name)}><ScenarioCard {...scenario} setModalOpen={setModalOpen} /></Grid>)}
                <Grid item xs={12} display="flex" justifyContent="center">
                    <Stack spacing={2}>
                        <Pagination
                            page={page}
                            count={Math.ceil(scenarios.length / SCENARIOS_PER_PAGE)}
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
            </Grid>
        </PageLayout>
    );
};

export default AvailableScenarios;