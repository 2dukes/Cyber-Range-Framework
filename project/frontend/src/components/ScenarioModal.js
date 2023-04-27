import { Fragment } from "react";
import { Box, Typography, Modal } from '@mui/material';

const style = {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    bgcolor: 'background.paper',
    border: '2px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '20px',
    boxShadow: 24,
    p: 4
};

const ScenarioModal = ({ modalOpen, setModalOpen, name, description, image, author, targets, bot }) => {
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
                        {name}
                    </Typography>
                </Box>
            </Modal>
        </Fragment >
    );
};

export default ScenarioModal;