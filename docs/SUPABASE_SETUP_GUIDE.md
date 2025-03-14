# Supabase Setup Guide for PasteKeeper

This guide will walk you through setting up Supabase as the backend for your PasteKeeper app. Supabase provides authentication, database, and storage services that will enable cloud sync functionality in your app.

## Step 1: Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one already.
2. Once logged in, click on "New Project" to create a new project.
3. Fill in the project details:
   - **Name**: PasteKeeper (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Choose a region closest to your users
4. Click "Create New Project" and wait for the project to be created (this may take a few minutes).

## Step 2: Set Up Database Tables and Policies

1. In your Supabase project dashboard, navigate to the "SQL Editor" section.
2. Click on "New Query" to create a new SQL query.
3. Copy and paste the contents of the `supabase_setup.sql` file (located in the `docs` folder of your project) into the SQL editor.
4. Click "Run" to execute the SQL script. This will create all the necessary tables and security policies for your app.

## Step 3: Configure Authentication

1. In your Supabase project dashboard, navigate to the "Authentication" section.
2. Under "Settings", ensure that "Email Auth" is enabled.
3. Configure any additional authentication providers you want to support (Google, GitHub, etc.).

### Setting Up Password Reset and Email Confirmation Deep Linking

For password reset and email confirmation to work properly with your mobile app, you need to configure deep linking:

1. In your Supabase dashboard, go to "Authentication" > "URL Configuration".
2. Set the "Site URL" to your app's website URL (for web) or leave it as is for mobile apps.
3. Under "Redirect URLs", add the following URLs:
   - For web: 
     - `https://yourdomain.com/auth/reset-password` (for password reset)
     - `https://yourdomain.com/auth/confirmation` (for email confirmation)
   - For mobile: 
     - `pastekeeper://auth/reset-password` (for password reset)
     - `pastekeeper://auth/confirmation` (for email confirmation)

4. In your Supabase dashboard, go to "Authentication" > "Email Templates".
5. Edit both the "Password Reset" and "Confirmation" templates:
   - Customize the email content as needed
   - Make sure the action buttons use the magic links that will redirect to your app
   - For the confirmation template, ensure it uses the correct redirect URL

### Mobile App Configuration for Deep Linking

1. Make sure your `app.json` file has the correct scheme configured:
   ```json
   {
     "expo": {
       "scheme": "pastekeeper",
       // other configuration...
     }
   }
   ```

2. For iOS, you need to configure Associated Domains:
   - Register your app with Apple Developer Program
   - Add the Associated Domains capability in Xcode
   - Add `applinks:yourdomain.com` to the Associated Domains

3. For Android, add the following to your `AndroidManifest.xml`:
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="pastekeeper" android:host="auth" android:pathPrefix="/reset-password" />
   </intent-filter>
   ```

4. Test the deep linking by sending yourself a password reset email and clicking the link.

## Step 4: Get Your API Keys

1. In your Supabase project dashboard, navigate to the "Settings" section.
2. Click on "API" in the sidebar.
3. You'll find your "Project URL" and "anon" public key. You'll need these to configure your app.

## Step 5: Update Your App Configuration

1. Open the `services/supabase.ts` file in your project.
2. Replace the placeholder values with your actual Supabase URL and anon key:

```typescript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual key
```

## Step 6: Test Your Setup

1. Run your app and try to sign up for a new account.
2. After signing up, check the "Authentication" > "Users" section in your Supabase dashboard to confirm that the user was created.
3. Try using the sync functionality in your app to test if data is being properly stored in and retrieved from your Supabase database.
4. Check the "Table Editor" in your Supabase dashboard to see if clipboard items are being synced correctly.
5. Test the password reset functionality by requesting a password reset and clicking the link in the email.

## Troubleshooting

If you encounter any issues with your Supabase setup, here are some common troubleshooting steps:

### Authentication Issues

- Make sure your Supabase URL and anon key are correctly set in `services/supabase.ts`.
- Check if the authentication provider you're using is enabled in the Supabase dashboard.
- Verify that your app's URL is correctly set in the "URL Configuration" section.
- For password reset issues, check that the redirect URLs are correctly configured.

### Deep Linking Issues

- Ensure your app's scheme is correctly set in `app.json`.
- For iOS, verify that Associated Domains are properly configured.
- For Android, check that the intent filters are correctly set up in the manifest.
- Test deep linking using the `npx uri-scheme open pastekeeper://auth/reset-password --android` or `--ios` command.

### Database Issues

- Check if the tables were created correctly by going to the "Table Editor" in your Supabase dashboard.
- Verify that the Row Level Security (RLS) policies are correctly set up by checking the "Authentication" > "Policies" section.
- If you're getting permission errors, make sure the user is authenticated before trying to access the database.

### Sync Issues

- Check the console logs for any error messages related to syncing.
- Verify that the user is authenticated before trying to sync.
- Check if the network is available before trying to sync.
- Make sure the data format matches the expected format in the database.

## Advanced Configuration

### Custom Email Templates

You can customize the email templates for authentication emails (sign-up, password reset, etc.) in the "Authentication" > "Email Templates" section of your Supabase dashboard.

### Storage

If you want to store files (like images) in Supabase, you'll need to set up storage buckets in the "Storage" section of your Supabase dashboard.

### Edge Functions

For advanced server-side logic, you can use Supabase Edge Functions. These are serverless functions that run on the edge, close to your users.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Deep Linking in Expo](https://docs.expo.dev/guides/deep-linking/) 