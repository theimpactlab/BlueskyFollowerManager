# Bluesky Follower Manager

This is a web application for managing followers on Bluesky social network. It allows users to automatically follow and unfollow accounts based on their existing followers.

## Features

- Login with Bluesky credentials
- Automatically follow followers of your followers
- Unfollow previously followed accounts

## Tech Stack

- Next.js 13 with App Router
- TypeScript
- Tailwind CSS
- Supabase for data storage
- @atproto/api for Bluesky interactions

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up a Supabase project and add the following tables:
   - `users` table:
     - `id` (int8, primary key)
     - `handle` (text)
     - `app_password` (text)
   - `followed_accounts` table:
     - `id` (int8, primary key)
     - `user_did` (text)
     - `follow_record_uri` (text)
4. Create a `.env.local` file with the following variables:

