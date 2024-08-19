'use client'

import { Toolbar, Typography, AppBar, Button, Box, Grid, MenuItem, Select, FormControl, InputLabel } from "@mui/material"
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import getStripe from 'app\api\checkout_sessions\checkout_sessions\route.js'

// Stripe integration
const handleSubmit = async (currency) => {
  try {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        origin: 'http://localhost:3000' 
      },
      body: JSON.stringify({ currency })  // Pass the selected currency in the request body
    });

    if (!checkoutSession.ok) {
      throw new Error('Failed to create checkout session');
    }

    const checkoutSessionJson = await checkoutSession.json();

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  } catch (err) {
    console.error('Error creating checkout session:', err);
  }
};

const MyApp = () => {
  const [currency, setCurrency] = useState('usd'); // Default currency

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          
          <SignedOut>
            <Button color="inherit" href="/sign-in">Login</Button>
            <Button color="inherit" href="/sign-up">Sign Up</Button>
          </SignedOut>
          
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      {/* Hero section */}
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        
        {/* Currency Selector */}
        <FormControl sx={{ mt: 2, minWidth: 120 }}>
          <InputLabel id="currency-select-label">Currency</InputLabel>
          <Select
            labelId="currency-select-label"
            id="currency-select"
            value={currency}
            label="Currency"
            onChange={handleCurrencyChange}
          >
            <MenuItem value="usd">USD</MenuItem>
            <MenuItem value="eur">EUR</MenuItem>
            <MenuItem value="gbp">GBP</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2, mr: 2 }} 
          onClick={() => handleSubmit(currency)} // Pass the selected currency
        >
          Get Started
        </Button>
        <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
          Learn More
        </Button>
      </Box>

      {/* Features section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4}>
          {/* Feature items */}
        </Grid>
      </Box>

      {/* Pricing section */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Pricing plans */}
        </Grid>
      </Box>
    </>
  );
};

export default MyApp;
