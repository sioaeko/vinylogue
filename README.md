# Vinylogue

Vinylogue is a React component library for beautifully rendering album/record information in README files. It allows developers to showcase their favorite music collections with style, combining the warmth of vinyl records with modern web aesthetics.

## Usage

Simply add the following markdown to your README or any markdown file:

```markdown
![Album Card](https://vinylogue-render.onrender.com/album-card?artist=ROSÉ&album=APT.)
```

## Examples

### ROSÉ - APT.
![Album Card](https://vinylogue-render.onrender.com/album-card?artist=ROSÉ&album=APT.)

### Pink Floyd - Dark Side of the Moon
![Album Card](https://vinylogue-render.onrender.com/album-card?artist=Pink%20Floyd&album=The%20Dark%20Side%20of%20the%20Moon)

## Features

- Beautiful gradient backgrounds
- Album artwork display
- Artist and album information
- Track listings
- Release year and track count
- Spotify integration
- No authentication required
- Fully markdown compatible
- Cached responses for better performance

## API

The service provides a simple API endpoint:

```
GET /album-card?artist={artist}&album={album}
```

Parameters:
- `artist`: The name of the artist (required)
- `album`: The name of the album (required)

The API returns a PNG image that can be embedded directly in markdown.