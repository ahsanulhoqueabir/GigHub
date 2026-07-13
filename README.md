# Gighub

Gighub is a modern freelance and job marketplace application built with Next.js and React. It provides a platform for users to create gigs, post jobs, submit proposals, and manage orders seamlessly.

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI Library:** React, Shadcn UI, Radix UI
- **Styling:** Tailwind CSS v4, Framer Motion
- **State Management:** Zustand
- **Database & Auth:** Supabase
- **Storage:** Cloudflare R2, Cloudinary
- **Notifications:** Firebase Cloud Messaging

## Architecture Overview

```mermaid
graph TD
    Client([Client / Browser])
    
    subgraph "Frontend (Next.js App Router)"
        UI[Shadcn UI Components]
        State[Zustand Store]
        Pages[Next.js Pages & API Routes]
        
        Client <--> UI
        UI <--> State
        Pages <--> UI
    end
    
    subgraph "Backend Services"
        Supabase[(Supabase DB & Auth)]
        Storage[Cloudflare R2]
        Media[Cloudinary]
        FCM[Firebase Cloud Messaging]
    end
    
    State <--> Supabase
    Pages <--> Supabase
    Pages <--> Storage
    Pages <--> Media
    Pages <--> FCM
```

## Key Features

- **Gig & Job Management:** Create, view, and manage gigs and job postings.
- **Order Management:** Track order statuses, accept, or cancel orders directly from the dashboard.
- **User Profiles:** Comprehensive profile management for both buyers and sellers.
- **Real-time Notifications:** Integrated with Firebase Cloud Messaging for timely updates.
- **Media Optimization:** Fast image delivery and processing via Cloudinary and Cloudflare R2.
