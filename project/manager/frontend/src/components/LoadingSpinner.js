import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingSpinner = ({ borderRadius = "0px" }) => {
    return (
        <div>
            <Backdrop
                sx={{ borderRadius , color: 'darkorange', zIndex: (theme) => theme.zIndex.drawer + 1000 }}
                open={true}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default LoadingSpinner;