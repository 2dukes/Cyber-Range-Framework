import { Box, Container } from '@mui/material';
import TopBar from './TopBar';

const PageLayout = ({ children }) => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <TopBar />
            <Container sx={{ marginTop: "5em" }} maxWidth="lg">
                {children}
            </Container>
        </Box>
    );
};

export default PageLayout;