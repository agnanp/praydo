# GitHub Actions Workflow Guide

This directory contains GitHub Actions workflows for automating the build and release process of Praydo.

## Release Workflow

The `release.yml` workflow automatically builds Praydo for multiple platforms and creates a GitHub release with downloadable installers.

### Supported Platforms

- **macOS**: Intel (x86_64) and Apple Silicon (ARM64)
- **Linux**: Ubuntu 22.04 (x86_64)
- **Windows**: x86_64

### Triggering a Release

There are two ways to trigger a release:

#### 1. Tag-based Release (Recommended)

Create and push a version tag:

```bash
# Create a tag matching your version (e.g., v0.4.3)
git tag v0.4.3

# Push the tag to GitHub
git push origin v0.4.3
```

The workflow will automatically:
- Build the app for all platforms
- Create a draft GitHub release
- Upload all installers as release assets

#### 2. Manual Trigger

You can also manually trigger the workflow from GitHub:
1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select "Release" workflow
4. Click "Run workflow"
5. Choose the branch and click "Run workflow"

### What Gets Built

For each platform, the workflow generates:

- **macOS**: `.dmg` installer (both Intel and ARM64)
- **Linux**: `.deb` and `.AppImage` packages
- **Windows**: `.msi` installer and `.exe` setup

### Release Settings

The workflow creates a **draft release** by default. This means:
- The release won't be published immediately
- You can review the release notes and assets
- You can edit the release description before publishing
- You manually publish the release when ready

To change this behavior, edit `.github/workflows/release.yml`:
```yaml
releaseDraft: false  # Change to false to auto-publish
```

### Repository Permissions

The workflow needs write permissions to create releases. This should be enabled by default, but if you encounter errors:

1. Go to your repository Settings
2. Navigate to Actions → General
3. Under "Workflow permissions"
4. Select "Read and write permissions"
5. Click "Save"

### Version Synchronization

**Important**: Keep these version numbers in sync:
- `package.json` → `version: "0.4.3"`
- `src-tauri/tauri.conf.json` → `version: "0.4.3"`
- `src-tauri/Cargo.toml` → `version = "0.4.3"`

The tag should match: `v0.4.3`

### Environment Variables

The workflow uses these environment variables:
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions (no setup needed)

### Code Signing (Optional)

For production releases, you may want to add code signing:

#### macOS
Add these secrets to your repository:
- `APPLE_CERTIFICATE`: Base64-encoded signing certificate
- `APPLE_CERTIFICATE_PASSWORD`: Certificate password
- `APPLE_SIGNING_IDENTITY`: Signing identity name
- `APPLE_ID`: Your Apple ID
- `APPLE_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Your team ID

#### Windows
Add these secrets:
- `TAURI_SIGNING_PRIVATE_KEY`: Your private key
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: Key password

Then update the workflow to include signing configuration.

### Troubleshooting

**Build fails on Ubuntu**
- Ensure all required system dependencies are installed in the workflow
- Current dependencies: `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`

**Release not created**
- Check repository permissions (see "Repository Permissions" above)
- Verify `GITHUB_TOKEN` has write access

**Version mismatch**
- Ensure all version fields match across `package.json`, `tauri.conf.json`, and `Cargo.toml`
- Tag should match with `v` prefix (e.g., `v0.4.3`)

### Workflow Customization

To customize the workflow:

**Change trigger method**: Edit the `on:` section
```yaml
on:
  push:
    branches:
      - release  # Trigger on push to release branch instead
```

**Modify release notes**: Edit the `releaseBody` field
**Add more platforms**: Add entries to the `matrix.include` array
**Change build arguments**: Modify the `args` field for each platform

## Next Steps

1. Enable GitHub Actions in your repository (if not already enabled)
2. Verify repository permissions
3. Create a version tag to test the workflow
4. Review the draft release before publishing
