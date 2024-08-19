'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/router'
import { useUser } from '@your/auth/package' // Replace with the correct import for `useUser`
import { doc, collection, getDoc, setDoc } from "firebase/firestore" // Ensure you import Firestore functions correctly
import { Card, Container, Grid, CardActionArea, CardContent, Typography } from "@mui/material"
import { db } from '../path/to/firebase/config' // Adjust the import path to your Firebase config

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()
    
    // When a user clicks on a flashcard set, they are navigated to a detailed view of that set:
    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`)
    }
  
    useEffect(() => {
        async function getFlashcards() {
            if (!user) return

            try {
                const docRef = doc(collection(db, 'users'), user.id)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const collections = docSnap.data().flashcards || []
                    setFlashcards(collections)
                } else {
                    await setDoc(docRef, { flashcards: [] })
                }
            } catch (error) {
                console.error("Error fetching flashcards:", error)
            }
        }

        getFlashcards()
    }, [user])

    return (
        <Container maxWidth="md">
            <Grid container spacing={3} sx={{ mt: 4 }}>
                {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {flashcard.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}
