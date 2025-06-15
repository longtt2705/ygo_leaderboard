# Image Upload Setup Guide

This application now supports image uploads for user avatars using Cloudinary. Follow these steps to set up image upload functionality.

## Cloudinary Setup

1. **Create a Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com) and create a free account
   - Note your Cloud Name from the dashboard

2. **Create an Upload Preset**
   - Go to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Set the preset name (e.g., `yugioh_avatars`)
   - Set Signing Mode to "Unsigned"
   - Configure folder (optional): `avatars/`
   - Set transformation options if needed:
     - Width: 400px
     - Height: 400px
     - Crop: Fill
     - Quality: Auto
     - Format: Auto

3. **Environment Variables**
   Add these to your `.env.local` file:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
   ```

## Features

### ImageUpload Component
- **File Validation**: Supports JPEG, PNG, WebP formats
- **Size Limit**: Maximum 5MB per image
- **Preview**: Shows image preview before and after upload
- **Error Handling**: Displays upload errors and validation messages
- **Responsive**: Works on desktop and mobile devices

### Usage Locations
1. **Admin - Add Player**: Upload avatar when creating new players
2. **Admin - Manage Players**: Edit existing player avatars
3. **User Profile**: Users can upload/change their own avatars

### Image Sizes
- **Small (sm)**: 64x64px - For compact displays
- **Medium (md)**: 96x96px - Default size for forms
- **Large (lg)**: 128x128px - For profile pages

## Security Considerations

1. **Upload Preset Security**
   - Use unsigned presets for client-side uploads
   - Configure folder restrictions in Cloudinary
   - Set up auto-moderation if needed

2. **File Validation**
   - Client-side validation for file type and size
   - Cloudinary also validates on server-side
   - Consider adding virus scanning for production

3. **Storage Management**
   - Monitor Cloudinary usage and storage limits
   - Set up auto-deletion policies for old images
   - Consider image optimization settings

## Troubleshooting

### Common Issues

1. **Upload Failed**
   - Check environment variables are set correctly
   - Verify upload preset exists and is unsigned
   - Check network connectivity

2. **Images Not Displaying**
   - Verify Cloudinary URLs are accessible
   - Check CORS settings if needed
   - Ensure images haven't been deleted from Cloudinary

3. **File Size Errors**
   - Default limit is 5MB
   - Adjust validation in `validateImageFile()` if needed
   - Check Cloudinary account limits

### Development Tips

1. **Testing Uploads**
   - Use Cloudinary's media library to verify uploads
   - Check browser network tab for upload requests
   - Monitor console for error messages

2. **Image Optimization**
   - Cloudinary automatically optimizes images
   - Use transformation parameters for consistent sizing
   - Consider lazy loading for better performance

## Alternative Setup (Without Cloudinary)

If you prefer not to use Cloudinary, you can:

1. **Use URL Input Only**
   - Remove ImageUpload components
   - Keep the simple URL input fields
   - Users provide direct image URLs

2. **Local File Storage**
   - Implement Next.js API routes for file upload
   - Store images in `public/uploads/` directory
   - Handle file validation server-side

3. **Other Cloud Providers**
   - Adapt the upload logic for AWS S3, Google Cloud Storage, etc.
   - Update the `uploadImageToCloudinary` function
   - Modify environment variables accordingly 