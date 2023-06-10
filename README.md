# ts-oauth2-discord

This library provides an easy-to-use interface for interacting with Discord's OAuth2 endpoints, encapsulating key operations such as obtaining, refreshing, and revoking access tokens.

## Quick Start

First, install the library via npm:

```
npm install discord-oauth-library
```

Then, use the `OAuth` class as follows:

```typescript
import { OAuth, OAuthOptions } from "discord-oauth-library";

// Define your OAuth options
const options: OAuthOptions = {
  token: "your-token",
  client_id: "your-client-id",
  client_secret: "your-client-secret",
  redirect_uri: "your-redirect-uri",
};

// Create an instance of the OAuth class
const oauth = new OAuth(options);
```

## Features

The `OAuth` class provides the following methods:

- `accessToken(input)`: Exchanges the code returned by Discord for a user access token.
- `refreshToken(input)`: Refreshes the access token using a refresh token.
- `clientCredentials(input)`: Retrieves an access token for the bot owner.
- `revokeToken(token)`: Revokes an access token.
- `currentApplication()`: Fetches information about the current authorization.
- `currentAuthorization()`: Fetches the bot's application object.

Please refer to the official [Discord OAuth2 documentation](https://discord.com/developers/docs/topics/oauth2) for further details on each operation.

## License

[MIT](LICENSE)
