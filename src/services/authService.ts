export class AuthService {
  private cognitoToken: string | null = null;

  async authenticateWithCognito(clientId: string, mesType: string): Promise<string> {
    const payload = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: `Eng-${mesType}-User`,
        PASSWORD: "P@ssw0rd!"
      }
    };

    const response = await fetch("https://cognito-idp.us-east-1.amazonaws.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "Connection": "keep-alive",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Cognito auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.cognitoToken = data.AuthenticationResult.IdToken;
    
    if (this.cognitoToken) {
      localStorage.setItem("cognitoToken", this.cognitoToken);
      localStorage.setItem(
        "tokenExpiry",
        (Date.now() + data.AuthenticationResult.ExpiresIn * 1000).toString()
      );
    }
    
    return this.cognitoToken!;
  }

  async authenticateUser(baseUrl: string, email: string, password: string): Promise<{ useremail: string; accesslevel: string }> {
    const payload = {
      actionType: "getUserInfo",
      email,
      password
    };

    const response = await fetch(`${baseUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.cognitoToken || ""
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`User auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    if ("error" in data) {
      throw new Error(data.error);
    }

    localStorage.setItem("userInfo", JSON.stringify(data));
    return data;
  }

  async login(
    clientId: string,
    mesType: string,
    baseUrl: string,
    email: string,
    password: string
  ) {
    const cognitoToken = await this.authenticateWithCognito(clientId, mesType);
    const userInfo = await this.authenticateUser(baseUrl, email, password);
    return { cognitoToken, userInfo };
  }

  getToken(): string | null {
    const token = localStorage.getItem("cognitoToken");
    const expiry = localStorage.getItem("tokenExpiry");
    if (!token || !expiry) return null;
    if (Date.now() >= parseInt(expiry)) return null;
    return token;
  }
}
