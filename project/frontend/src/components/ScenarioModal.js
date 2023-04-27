import { Fragment, useState } from "react";
import { Card, CardContent, Grid, Box, Button, Typography, Modal, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ScenarioInfoCard from "./ScenarioInfoCard";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Link from '@mui/material/Link';

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

const ScenarioModal = ({ modalOpen, setModalOpen, name, description, category, difficulty, image, author, targets, bot, downloadPath }) => {
    const [flag, setFlag] = useState("");
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    const isGettingSmaller = useMediaQuery(theme.breakpoints.down('lg'));

    const items = [
        {
            header: name,
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
            description:
                "Number of people who have already donated to this campaign.Number of people who have already donated to this campaign.Number of people who have already donated to this campaign.Number of people who have already donated to this campaign.Number of people who have already donated to this campaign.Number of people who have already donated to this campaign.",
            size: 12
        },
    ];

    const onDownload = () => {
        const link = document.createElement("a");
        link.download = downloadPath;
        link.href = `/${downloadPath}`;
        link.click();
    };

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
                                {/* <Grid item key={"test"} xs={12} sx={{heigth: '80%'}}> */}
                                <Card>
                                    <CardContent sx={{ p: 1, }}>
                                        <Typography noWrap variant={isSmall ? "h6" : "h5"} component="div">
                                            Services
                                        </Typography>
                                        {/* <Typography sx={{ mb: isSmall ? 0 : 1.5 }} color="text.secondary">
                                            Exposed Services
                                        </Typography> */}
                                        <Typography variant="body2" sx={{ mt: isSmall ? 0 : 1.5, lineHeight: 1.55 }} color="text.secondary">
                                            <Link href="#" sx={{ color: 'darkorange', textDecoration: 'inherit' }} onClick={(e) => e.preventDefault()}>{targets}</Link>
                                            <br />
                                            {bot !== undefined ? (<Link href="#" sx={{ color: 'darkorange', textDecoration: 'inherit' }} onClick={(e) => e.preventDefault()}>{bot}</Link>) : (!isSmall && <br />)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                {/* </Grid> */}
                                <Box>
                                    <Typography variant="body1" fontWeight="bold" marginTop="1em" sx={{ mb: 0 }}>
                                        Flag
                                    </Typography>
                                    <TextField
                                        sx={{ width: "100%", ':focus-within fieldset': { borderColor: 'darkorange !important' } }}
                                        id="minimum-contribution"
                                        type="text"
                                        value={flag}
                                        onChange={(event) => setFlag(event.target.value)}
                                    />

                                    <Box
                                        component="span"
                                        mt={1}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        flexDirection={isGettingSmaller ? "column" : "row"}
                                    >
                                        <Button sx={{ ':hover': { bgcolor: 'black' }, backgroundColor: 'darkorange', fontWeight: "bold", width: !isGettingSmaller ? 'auto' : '100%', mb: isGettingSmaller ? 1 : 0 }} onClick={() => { }} variant="contained" component="span">
                                            Submit
                                        </Button>
                                        <Button startIcon={<FileDownloadIcon />} onClick={onDownload} sx={{ ':hover': { bgcolor: 'black' }, backgroundColor: 'gray', fontWeight: "bold", width: !isGettingSmaller ? 'auto' : '100%' }} variant="contained" component="span">
                                            Files
                                        </Button>
                                    </Box>
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