import { Fragment, useState, useEffect } from "react";
import { Card, CardContent, Grid, Box, Button, Typography, Modal, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ScenarioInfoCard from "./ScenarioInfoCard";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Link from '@mui/material/Link';
import { useSnackbar } from 'notistack';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    bgcolor: 'background.paper',
    border: '2px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '20px',
    boxShadow: 24,
    p: 4
};

const ScenarioModal = ({ solved, modalOpen, setModalOpen, removeSolvedScenario, setSelectedScenario, _id, name, description, category, difficulty, author, targets, bot, hasDownloadableFiles }) => {
    const [flag, setFlag] = useState("");
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    const isGettingSmaller = useMediaQuery(theme.breakpoints.down('lg'));

    const items = [
        {
            header: name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            meta: "Name",
            description:
                "Scenario's name.",
            size: 6
            // style: { wordWrap: "break-word" },
        },
        {
            header: author,
            meta: "Author",
            description:
                "Challenge's creator.",
            size: 6
        },
        {
            header: category,
            meta: "Category",
            description:
                "The category in which the scenario stands.",
            size: 6
        },
        {
            header: difficulty,
            meta: "Difficulty",
            description:
                "How hard the challenge is.",
            size: 6
        },
        {
            header: "Description",
            description: description,
            size: 12
        },
    ];

    const onDownload = () => {
        const link = document.createElement("a");
        link.href = `http://localhost:8000/download/${name}_download.zip`;
        link.click();
    };

    const onFlagSubmit = async () => {
        const data = { flag };

        const flagResult = await fetch(`http://localhost:8000/scenarios/${_id}/flag`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const flagResultJSON = await flagResult.json();

        if (flagResultJSON.status) {
            enqueueSnackbar('Challenge Solved!', { variant: "success", style: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" } });
            await new Promise(r => setTimeout(r, 1500)); // Wait 1.5s
            setModalOpen(false);
            setSelectedScenario(null);
            removeSolvedScenario(_id);
        } else
            enqueueSnackbar('Incorrect flag! Please try again.', { variant: "error", style: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" } });

        return flagResultJSON.status;
    };

    const [data, setData] = useState(null);

    useEffect(() => {
        // Create a new WebSocket instance
        const ws = new WebSocket('ws://localhost:8080');

        // Handle incoming messages from the server
        ws.onmessage = (event) => {
            setData(event.data);
            console.log(event.data)
        };

        // Clean up the WebSocket connection when the component unmounts
        return () => {
            ws.close();
        };
    }, []);

    // console.log(data);

    return (
        <Fragment>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    {!isSmall && (<Typography id="modal-modal-title" variant="h4" component="h2" sx={{ pb: 2 }}>
                        Details
                    </Typography>)}
                    <Grid container>
                        <Grid item xs={12} md={9}> {/* When in small devices, spacing = 0*/}
                            <Grid container spacing={1} pr={isSmall ? "0em" : "1em"}>
                                {items.map(item => (<Grid item key={item.name + item.header} xs={item.size}><ScenarioInfoCard {...item} isSmall={isSmall} /></Grid>))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box display="flex" flexDirection="column" justifyContent="space-between" sx={{ height: '100%' }}>
                                <Card>
                                    <CardContent sx={{ p: 1 }}>
                                        <Typography noWrap variant={isSmall ? "h6" : "h5"} component="div">
                                            Services
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: isSmall ? 0 : 1.5, lineHeight: 1.55 }} color="text.secondary">
                                            <Link href="#" sx={{ color: 'darkorange', textDecoration: 'inherit' }} onClick={(e) => e.preventDefault()}>{targets || "No exposed services' information."}</Link>
                                            <br />
                                            {bot !== undefined ? (<Link href="#" sx={{ color: 'darkorange', textDecoration: 'inherit' }} onClick={(e) => e.preventDefault()}>{bot}</Link>) : (!isSmall && <br />)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Box>
                                    {!solved && (<Fragment><Typography variant="body1" fontWeight="bold" marginTop="1em" sx={{ mb: 0 }}>
                                        Flag
                                    </Typography>
                                        <TextField
                                            sx={{ width: "100%", ':focus-within fieldset': { borderColor: 'darkorange !important' } }}
                                            id="minimum-contribution"
                                            type="text"
                                            value={flag}
                                            onChange={(event) => setFlag(event.target.value)}
                                        /></Fragment>)}


                                    <Box
                                        component="span"
                                        mt={1}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        flexDirection={isGettingSmaller ? "column" : "row"}
                                    >
                                        {!solved && (<Button onClick={onFlagSubmit} sx={{ ':hover': { bgcolor: 'black' }, backgroundColor: 'darkorange', fontWeight: "bold", width: !isGettingSmaller && hasDownloadableFiles ? 'auto' : '100%', mb: isGettingSmaller ? 1 : 0 }} variant="contained" component="span">
                                            Submit
                                        </Button>)}

                                        {hasDownloadableFiles && (<Button startIcon={<FileDownloadIcon />} onClick={onDownload} sx={{ ':hover': { bgcolor: 'black' }, backgroundColor: 'gray', fontWeight: "bold", width: !isGettingSmaller && !solved ? 'auto' : '100%', mb: isGettingSmaller ? 1 : 0 }} variant="contained" component="span">
                                            Files
                                        </Button>)}
                                    </Box>
                                    <Button startIcon={<RocketLaunchIcon />} onClick={() => { }} sx={{ ':hover': { bgcolor: 'black' }, backgroundColor: 'green', fontWeight: "bold", width: '100%', mt: isGettingSmaller ? 0 : 1 }} variant="contained" component="span">
                                        {!isGettingSmaller ? "Launch Scenario" : "Launch"}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </Fragment >
    );
};

export default ScenarioModal;