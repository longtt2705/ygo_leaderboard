# Cloudinary Setup for Yu-Gi-Oh Leaderboard

This project uses Cloudinary for image uploads, specifically for deck archetype images.

## Setup Instructions

1. **Create a Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account

2. **Get Your Credentials**
   - After logging in, go to your Dashboard
   - Note down your **Cloud Name** (you'll need this)

3. **Create an Upload Preset**
   - Go to Settings → Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set the following:
     - **Preset name**: `yugioh_archetypes` (or any name you prefer)
     - **Signing Mode**: `Unsigned`
     - **Folder**: `yugioh-archetypes` (optional, for organization)
     - **Allowed formats**: `jpg,png,webp`
     - **Max file size**: `5000000` (5MB)
     - **Image transformations**: You can add automatic optimizations here
   - Save the preset

4. **Update Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Cloudinary configuration:
     ```
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yugioh_archetypes
     ```

5. **Test the Upload**
   - Start your development server: `npm run dev`
   - Go to `/admin/add-archetype`
   - Try uploading an image

## Features

- **Automatic Image Optimization**: Cloudinary automatically optimizes images
- **File Validation**: Only allows JPG, PNG, and WebP files up to 5MB
- **Secure Uploads**: Uses unsigned upload presets for client-side uploads
- **CDN Delivery**: Images are served from Cloudinary's global CDN

## Troubleshooting

- **Upload fails**: Check that your cloud name and upload preset are correct
- **CORS errors**: Make sure your upload preset is set to "Unsigned"
- **File too large**: Default limit is 5MB, adjust in your upload preset if needed

## Optional Enhancements

You can enhance the Cloudinary setup by:
- Adding automatic image transformations (resize, crop, format conversion)
- Setting up webhooks for upload notifications
- Adding folder organization for different image types
- Implementing signed uploads for additional security 