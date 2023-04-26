import * as React from 'react';
import { Typography, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';

const ScenarioCard = () => {
    return (
        <Card sx={{ maxWidth: 500, margin: "auto" }}>
            <CardActionArea onClick={() => {}}>
                <CardMedia
                    component="img"
                    height="140"
                    image="https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp"
                    alt="scenario image"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Test title
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        mb: "1em"
                    }}>
                        description
                    </Typography>
                    
                    {/* <Stack direction="row" alignItems="center" gap={1} marginTop="0.5em">
                        <WatchLaterIcon color="disabled" /> 1
                        <Typography variant="body2" component="div" color="text.secondary">
                        </Typography>
                    </Stack> */}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ScenarioCard;