import { Fragment } from "react";
import { Grid, Box, Button, Typography, Modal, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ScenarioInfoCard from "./ScenarioInfoCard";

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

const ScenarioModal = ({ modalOpen, setModalOpen, name, description, category, difficulty, image, author, targets, bot }) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));

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

    return (
        <Fragment>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h4" component="h2" sx={{ pb: 2 }}>
                        Details
                    </Typography>
                    <Grid container>
                        <Grid item xs={12} md={9}> {/* When in small devices, spacing = 0*/}
                            <Grid container spacing={1} pr={isSmall ? "0em" : "1em"}>
                                {items.map(item => (<Grid item key={item.meta} xs={item.size}><ScenarioInfoCard {...item} isSmall={isSmall} /></Grid>))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ mt: isSmall ? 2 : 0 }}>
                            <Typography variant="body1" fontWeight="bold" marginTop="1em" sx={{ mt: 0 }}>
                                Submit Flag
                            </Typography>
                            <TextField
                                sx={{ width: "100%", ':focus-within fieldset': { borderColor: 'darkorange !important' } }}
                                id="minimum-contribution"
                                type="text"
                                value={"a"}
                            // onChange={(event) => setAmountToContribute(event.target.value)}
                            />
                            <Button sx={{ ':hover': { bgcolor: 'black' }, backgroundColor: 'darkorange', fontWeight: "bold", mt: 3 }} onClick={() => { }} variant="contained" component="span">
                                Contribute
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </Fragment >
    );
};

export default ScenarioModal;