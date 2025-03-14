# Deep Linking Guide for PasteKeeper

This guide explains how to set up and test deep linking in your PasteKeeper app, which is essential for handling authentication flows like email confirmation and password reset.

## What is Deep Linking?

Deep linking allows external applications (like email clients) to open your app and navigate to a specific screen. In PasteKeeper, we use deep linking for:

1. Email confirmation after sign-up
2. Password reset

## Configuration

### 1. Supabase Configuration

In your Supabase dashboard:

1. Go to **Authentication** > **URL Configuration**
2. Set the **Site URL** to your app's website URL (for web) or leave as is for mobile apps
3. Under **Redirect URLs**, add:
   - `pastekeeper://auth/confirmation` (for email confirmation)
   - `pastekeeper://auth/reset-password` (for password reset)

4. Go to **Authentication** > **Email Templates**
5. Edit both templates:
   - **Confirmation Email**: Make sure the action button links to your app
   - **Password Reset Email**: Make sure the action button links to your app

### 2. App Configuration

Your app.json already has the correct scheme:

```json
{
  "expo": {
    "scheme": "pastekeeper",
    // other configuration...
  }
}
```

## Testing Deep Links

### Method 1: Using the Terminal

You can test deep links using the Expo CLI:

```bash
# For iOS
npx uri-scheme open pastekeeper://auth/confirmation --ios

# For Android
npx uri-scheme open pastekeeper://auth/confirmation --android
```

### Method 2: Using a Real Email

1. Sign up for a new account in your app
2. Check your email for the confirmation link
3. Click the link - it should open your app and confirm your email

### Method 3: Creating a Test HTML File

Create a test.html file with links to test:

```html
<!DOCTYPE html>
<html>
<head>
  <title>PasteKeeper Deep Link Test</title>
</head>
<body>
  <h1>PasteKeeper Deep Link Test</h1>
  
  <p>
    <a href="pastekeeper://auth/confirmation?token=test">
      Test Email Confirmation
    </a>
  </p>
  
  <p>
    <a href="pastekeeper://auth/reset-password?token=test">
      Test Password Reset
    </a>
  </p>
</body>
</html>
```

Open this file in a browser on your device and click the links.

## Troubleshooting

### Deep Links Not Working on Android

1. Check your AndroidManifest.xml:
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="pastekeeper" />
   </intent-filter>
   ```

2. Make sure you've rebuilt your app after making changes

### Deep Links Not Working on iOS

1. Check that you've set up Associated Domains correctly
2. Verify your app's Bundle Identifier matches what's in your Apple Developer account
3. Make sure you're using a real device or a properly configured simulator

## How It Works in PasteKeeper

1. When a user clicks a deep link in an email:
   - The link contains authentication tokens in the URL
   - The app opens to the specified route

2. Our `useDeepLinking` hook in `services/deepLinking.ts`:
   - Extracts tokens from the URL
   - Sets the session in Supabase
   - Navigates to the appropriate screen
   - Shows a success message

3. For email confirmation:
   - The user is automatically logged in
   - They're redirected to the home screen

4. For password reset:
   - The user is taken to the reset password screen
   - They can enter a new password

## Additional Resources

- [Expo Deep Linking Documentation](https://docs.expo.dev/guides/deep-linking/)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) 