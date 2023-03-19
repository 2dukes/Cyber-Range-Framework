import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useState } from 'react';

function App() {
  const [url, setURL] = useState('');
  const test = (event) => {
    event.preventDefault();

    fetch('http://localhost:8000/bot?' + new URLSearchParams({
      url: encodeURIComponent(url)
    })).then((response) => response.json())
      .then((data) => console.log(data));
  };

  return (
    <Grid container style={{ position: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh' }}>
      <Grid item xs={12} md={4}>
        <form onSubmit={test} style={{ padding: '3em', paddingTop: '1em' }}>
          <Typography variant="h4" mt={4}>Welcome to Admin Bot!</Typography>
          <Typography mt={1}>Enter a URL and the bot will navigate to it.</Typography>
          <InputLabel htmlFor="my-input">Email address</InputLabel>
          <TextField value={url} onChange={(e) => setURL(e.target.value)} style={{ color: 'white', backgroundColor: 'lightgray', width: '100%' }} placeholder="https://example.com" label="URL" variant="filled" />
          <Button variant="contained" type="submit" style={{ width: '100%', marginTop: "2em" }}>Submit</Button>
        </form>
      </Grid>
    </Grid>
  );
}

export default App;;
