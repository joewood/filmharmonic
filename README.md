# Group Binge

Movie/TV Streaming Party Voting Site

Running at [groupbinge.com](https://groupbinge.com)

## Source Breakdown

The Server is in one file, using ExpressJS

- **index.js** - NodeJS Service API (backend uses Azure Cosmos DB)

The frontend is TypeScript React, using reach-router for frontend URL routes

- **src/index.tsx** - main routes and Google Authentication callback handler
- **src/movies-api.tsx** - main frontend helpers using the backend API
- **src/movie.tsx** - movie details page, including a button to update your current proposed movie
- **src/search.tsx** - search page to search for a movie (with links to details view above)
- **src/proposals.tsx** - main page to list all current proposals and votes (with their movie details) - used as default route (home page)
- **src/profile.tsx** - user details page
- **src/header.tsx** - component for the header banner, used by all pages
- **src/index.css** - styles used by the pages
