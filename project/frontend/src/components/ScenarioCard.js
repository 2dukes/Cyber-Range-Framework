import * as React from 'react';
import { Stack, Typography, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';
import WatchLaterIcon from '@mui/icons-material/WatchLater';

const ScenarioCard = ({ raisedValue, targetValue, remainingDays, imageURL, title, description, setModalOpen }) => {
    return (
        <Card sx={{ maxWidth: 500, margin: "auto" }}>
            <CardActionArea onClick={() => setModalOpen(true)}>
                <CardMedia
                    component="img"
                    height="140"
                    image={imageURL}
                    alt="campaign image"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        mb: "1em"
                    }}>
                        {description}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary">
                        <b>{raisedValue} ETH</b> raised
                    </Typography>
                    
                    <Stack direction="row" alignItems="center" gap={1} marginTop="0.5em">
                        <WatchLaterIcon color="disabled" /> {remainingDays}
                        <Typography variant="body2" component="div" color="text.secondary">
                        </Typography>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ScenarioCard;