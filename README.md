# n8n-nodes-steemit-publisher

This is an n8n community node. It lets you use Steemit in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Steemit Node

- Create Post
  - Create a new post on Steemit
  - Parameters: title, content, tags
- Update Post
  - Update an existing post
  - Parameters: author, permlink, title, content, tags
- Get Post
  - Get post details by author and permlink
  - Parameters: author, permlink
- Search Posts
  - Search posts by tag or author
  - Parameters: searchBy (tag/author), searchTerm, limit
- Upload Image
  - Upload an image to Steemit's image hosting service
  - Parameters: binaryPropertyName (containing the image data)
  - Returns: URL of the uploaded image, which can be used in post content

## Credentials

To use this node, you need to have a Steemit account and its posting key:
1. Account Name
2. Posting Key

## Compatibility

Tested with n8n version 1.0.0 and later.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Steemit API documentation](https://developers.steem.io/)
* [Steemit Image Upload Guide](https://developers.steem.io/tutorials-recipes/image-uploading)

## Example Usage

### Creating a Post with Image

1. First, use the "Upload Image" operation to upload your image
2. Use the returned URL in your post content like this:
   ```markdown
   # My Post Title
   
   ![Image Description](https://steemitimages.com/your-image-url)
   
   Rest of your post content...
   ```
3. Use the "Create Post" operation to publish your post

### Image Upload Notes

- Supported image formats: JPG, PNG, GIF
- Maximum file size: 10MB
- Images are automatically optimized for different display sizes
- Image URLs are permanent and can be used across multiple posts
