import {
  RESTGetAPIOAuth2CurrentApplicationResult,
  RESTGetAPIOAuth2CurrentAuthorizationResult,
  RESTPostOAuth2AccessTokenURLEncodedData,
} from "discord-api-types/rest/v10/oauth2";

import { REST, makeURLSearchParams } from "@discordjs/rest";
import {
  RESTPostOAuth2AccessTokenResult,
  RESTPostOAuth2ClientCredentialsResult,
  RESTPostOAuth2ClientCredentialsURLEncodedData,
  RESTPostOAuth2RefreshTokenResult,
  RESTPostOAuth2RefreshTokenURLEncodedData,
  Routes,
} from "discord-api-types/v10";

interface OAuthOptions {
  client_id: string;
  client_secret: string;
  token: string;
  redirect_uri: string;
}

// Helper type so we dont have to pass client secret and clientin every method.
type OmitIdSecret<T> = Omit<T, "client_secret" | "client_id">;

/**
 * Class which provides a convenient interface for interacting with Discord's OAuth2 endpoints.
 * It supports key OAuth2 operations like obtaining, refreshing, and revoking access tokens, among other things.
 * {@link https://discord.com/developers/docs/topics/oauth2}
 */
export class OAuth {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  rest: REST;

  // Discord API version
  public static VERSION: string = "10";

  constructor(options: OAuthOptions) {
    this.rest = new REST({ version: OAuth.VERSION }).setToken(options.token);
    this.client_id = options.client_id;
    this.client_secret = options.client_secret;
    this.redirect_uri = options.redirect_uri;
  }

  /**
   * Returns info about the current authorization.
   * {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  async currentApplication(): Promise<RESTGetAPIOAuth2CurrentApplicationResult> {
    let res = await this.rest.get(Routes.oauth2CurrentApplication(), {});
    return res as RESTGetAPIOAuth2CurrentApplicationResult;
  }

  /**
   * Returns the bot's application object.
   * {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   */
  async currentAuthorization(): Promise<RESTGetAPIOAuth2CurrentAuthorizationResult> {
    let res = await this.rest.get(Routes.oauth2CurrentAuthorization(), {});
    return res as RESTGetAPIOAuth2CurrentAuthorizationResult;
  }

  /**
   * Exchange the code returned by discord in the query for the user access token
   * {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-exchange-example}
   */
  async accessToken(
    input: OmitIdSecret<RESTPostOAuth2AccessTokenURLEncodedData>
  ): Promise<RESTPostOAuth2AccessTokenResult> {
    let res = await this.rest.post(Routes.oauth2TokenExchange(), {
      body: makeURLSearchParams({
        ...input,
        client_id: this.client_id,
        client_secret: this.client_secret,
        redirect_uri: this.redirect_uri,
      }),
      passThroughBody: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res as RESTPostOAuth2AccessTokenResult;
  }

  /**
   * Refresh the access token associated with a refresh token
   * {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example}
   */
  async refreshToken(
    input: OmitIdSecret<RESTPostOAuth2RefreshTokenURLEncodedData>
  ): Promise<RESTPostOAuth2RefreshTokenResult> {
    let res = await this.rest.post(Routes.oauth2TokenExchange(), {
      body: makeURLSearchParams({
        ...input,
        client_id: this.client_id,
        client_secret: this.client_secret,
      }),
      passThroughBody: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res as RESTPostOAuth2RefreshTokenResult;
  }

  /**
   * Returns an access token for the bot owner.
   * {@link https://discord.com/developers/docs/topics/oauth2#client-credentials-grant}
   */
  async clientCredentials(
    input: OmitIdSecret<RESTPostOAuth2ClientCredentialsURLEncodedData>
  ): Promise<RESTPostOAuth2ClientCredentialsResult> {
    let params = new URLSearchParams(input);
    // Use fetch because discordjs REST doesnt allow Basic Authorization
    let res = await fetch(
      "https://discord.com/api/v" +
        OAuth.VERSION +
        Routes.oauth2TokenExchange(),
      {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(this.client_id + ":" + this.client_secret).toString(
              "base64"
            ),
        },
      }
    );
    let data = await res.json();
    return data as RESTPostOAuth2ClientCredentialsResult;
  }

  /**
   * Revoke an access token
   */
  async revokeToken(token: string): Promise<RESTPostOAuth2RefreshTokenResult> {
    // Use fetch because discordjs REST doesnt allow Basic Authorization
    let res = await fetch(
      "https://discord.com/api/v" +
        OAuth.VERSION +
        Routes.oauth2TokenRevocation(),
      {
        method: "POST",
        body: new URLSearchParams({ token: token }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(this.client_id + ":" + this.client_secret).toString(
              "base64"
            ),
        },
      }
    );
    let data = await res.json();
    return data as RESTPostOAuth2RefreshTokenResult;
  }
}
