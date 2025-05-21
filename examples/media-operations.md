# DokuWiki Media Operations Examples

This document provides examples of how to use the DokuWiki Manager plugin for media operations in natural language conversations with TypingMind.

## Listing Media Files

### Example 1: List all media in a namespace
```
List all media files in the "documentation" namespace of my wiki.
```

### Example 2: List media with a pattern
```
Show me all PNG images in the "projects:logos" namespace.
```

### Example 3: Deep listing
```
List all media files in the "training" namespace and all its sub-namespaces.
```

## Retrieving Media Files

### Example 1: Get a specific image
```
Get the "documentation:diagrams:architecture.png" image from my wiki.
```

### Example 2: Get document content
```
Retrieve the content of the "procedures:templates:report.docx" file from my wiki.
```

### Example 3: Get a specific revision of a file
```
Get the previous version of the "projects:presentations:quarterly.pptx" file from last month.
```

## Uploading Media Files

### Example 1: Uploading a new image
```
Upload this base64-encoded image as "team:photos:company-picnic.jpg" in my wiki.
[BASE64 STRING WOULD BE HERE]
```

### Example 2: Updating an existing file
```
Update the "documentation:guides:user-manual.pdf" with this new version:
[BASE64 STRING WOULD BE HERE]
```

### Example 3: Conditional upload
```
Only if it doesn't already exist, upload this image as "logos:partner-companies.png":
[BASE64 STRING WOULD BE HERE]
```

## Deleting Media Files

### Example 1: Simple deletion
```
Delete the outdated "projects:old-logo.png" file from my wiki.
```

### Example 2: Confirming deletion
```
Please confirm that you want to permanently delete the file "archive:2023:reports:q3.xlsx" from the wiki.
```

## Advanced Operations

### Example 1: List and then retrieve
```
First, list all PDF files in the "manuals" namespace, then get the most recent one.
```

### Example 2: Search and replace
```
Find all diagrams in the "architecture" namespace that contain "v1" in their name and help me update them to "v2" versions.
```

### Example 3: Media information
```
Get information about the "documentation:videos:tutorial.mp4" file, including when it was uploaded and by whom.
```