import * as React from 'react';
import { Typography, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';

const ScenarioCard = ({ setModalOpen, name, description, image, author, targets, bot }) => {
    return (
        <Card sx={{ maxWidth: 500, margin: "auto" }}>
            <CardActionArea onClick={() => { setModalOpen(true); }}>
                <CardMedia
                    component="img"
                    height="140"
                    image="https://www.lansweeper.com/wp-content/uploads/2021/12/Vulnerability-Apache-Log4j.png.webp"
                    alt="scenario image"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ScenarioCard;