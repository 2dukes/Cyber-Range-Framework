import * as React from 'react';
import { Stack, Typography, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';
import { green, yellow, red } from '@mui/material/colors';
import GridViewIcon from '@mui/icons-material/GridView';

const ScenarioCard = ({ setModalOpen, name, description, category, difficulty, image, author, targets, bot }) => {
    const colors = {
        "Easy": green[500],
        "Medium": yellow[700],
        "Hard": red[600]
    };

    return (
        <Card sx={{ maxWidth: 500, margin: "auto" }}>
            <CardActionArea onClick={() => { setModalOpen(true); }}>
                <CardMedia
                    component="img"
                    height="140"
                    image={image}
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
                    <Stack direction="row" alignItems="center" gap={1} marginTop="0.5em">
                        <GridViewIcon sx={{ color: colors[difficulty] }} />{category}
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ScenarioCard;