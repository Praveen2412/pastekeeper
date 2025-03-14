# Setting Up Deep Linking in Supabase for PasteKeeper

This guide will walk you through the necessary steps to configure deep linking in Supabase for authentication flows in your PasteKeeper app.

## Step 1: Configure Supabase Authentication Settings

1. Log in to your Supabase dashboard and navigate to your project.
2. Go to **Authentication** > **URL Configuration** in the sidebar.
3. In the **Site URL** field, enter your app's website URL. For mobile apps only, you can use:
   ```
   https://your-project-id.supabase.co
   ```

4. Under **Redirect URLs**, add the following URLs:
   - For email confirmation:
     ```
     pastekeeper://auth/confirmation
     ```
   - For password reset:
     ```
     pastekeeper://auth/reset-password
     ```

5. Save your changes.

## Step 2: Configure Email Templates

1. In the Supabase dashboard, go to **Authentication** > **Email Templates**.
2. You'll need to update two email templates:

### Confirmation Email Template

1. Click on the **Confirmation** template.
2. Copy the HTML from `docs/email_templates/confirmation_email.html` in this repository.
3. Paste it into the **Template** field in Supabase.
4. Save your changes.

### Password Reset Email Template

1. Click on the **Password Reset** template.
2. Copy the HTML from `docs/email_templates/reset_password_email.html` in this repository.
3. Paste it into the **Template** field in Supabase.
4. Save your changes.

## Step 3: Verify Your app.json Configuration

Make sure your `app.json` file in your Expo project contains the correct scheme configuration:

```json
{
  "expo": {
    "scheme": "pastekeeper",
    // other configuration...
  }
}
```

This scheme is what allows your app to be opened from deep links that start with `pastekeeper://`.

## Step 4: Test Your Deep Links

### For Email Confirmation:

1. Sign up for a new account in your app.
2. Check your email for the confirmation link.
3. Click the link - it should open your app and confirm your email.

### For Password Reset:

1. Request a password reset from your app's sign-in screen.
2. Check your email for the password reset link.
3. Click the link - it should open your app and direct you to the reset password screen.

## Troubleshooting Common Issues

### Links Not Opening the App

1. Verify your app's scheme is correctly set to `pastekeeper` in `app.json`.
2. Make sure you've rebuilt and reinstalled your app after making changes to `app.json`.
3. Double-check that the URLs in your email templates match the expected format.

### Authentication Token Issues

1. Ensure the deep linking code in your app correctly extracts tokens from the URL.
2. Verify that you're handling the authentication tokens correctly in your app's `services/deepLinking.ts` file.
3. Check Supabase logs for any authentication errors.

### Navigation Issues

1. Make sure your navigation setup correctly handles deep link routes.
2. Verify that auth state changes trigger appropriate navigation in your app.

## Best Practices

1. **Security**: Always validate authentication tokens before trusting them.
2. **User Experience**: Provide clear feedback to users after they click deep links.
3. **Error Handling**: Implement robust error handling for cases where deep links might fail.
4. **Testing**: Test deep links on both iOS and Android devices.

## Additional Resources

- [Expo Deep Linking Documentation](https://docs.expo.dev/guides/deep-linking/)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/) 