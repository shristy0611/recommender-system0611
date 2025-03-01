# Gemini API Context Caching Guide

Context caching is a powerful feature in the Gemini API that allows you to preprocess and save input content for repeated use across multiple API requests. This guide explains how to use it effectively in your applications.

## What is Context Caching?

Context caching lets you:
- **Preprocess and store** content that you want to analyze multiple times
- **Save costs** by avoiding repeatedly sending the same large content
- **Improve response times** by reusing already processed input tokens
- **Maintain context** across multiple queries about the same content

This is especially useful when:
- Analyzing large documents, images, or videos
- Creating chatbots that answer multiple questions about the same material
- Building applications where users can query the same content repeatedly

## How It Works

1. **Create a Cached Content Resource**: You send the content (text, images, etc.) to be preprocessed once
2. **Receive a Reference**: The API returns a unique identifier for your cached content
3. **Use in Requests**: Include this reference in subsequent API calls instead of resending the full content
4. **Manage Lifecycle**: Update expiration times or delete when no longer needed

## Python Implementation

The example below demonstrates basic context caching operations:

```python
# Create cached content
def create_cached_content(content_text, model_name="gemini-1.5-pro"):
    client = genai.Client()
    
    content = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": content_text}]
            }
        ],
        "model": f"models/{model_name}",
        "ttl": "86400s",  # 24 hour expiry
        "displayName": "My cached content"
    }
    
    cached_content = client.cached_contents.create(content)
    return cached_content

# Generate using cached content
def generate_with_cached_content(cached_content_name, prompt):
    client = genai.Client()
    
    response = client.generate_content(
        model="models/gemini-1.5-pro",
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
        cached_content=cached_content_name
    )
    
    return response
```

## Key API Endpoints

The Gemini API provides these endpoints for managing cached content:

- **`POST /v1beta/cachedContents`**: Create a new cached content resource
- **`GET /v1beta/cachedContents`**: List all cached content resources
- **`GET /v1beta/cachedContents/{name}`**: Get a specific cached content resource
- **`PATCH /v1beta/cachedContents/{name}`**: Update a cached content resource (e.g., expiration)
- **`DELETE /v1beta/cachedContents/{name}`**: Delete a cached content resource

## Creating Cached Content

When creating cached content, you can specify:

- **`contents`**: The content to cache (text, images, etc.)
- **`model`**: The model to use for processing the content
- **`displayName`**: A human-readable name for the cached content
- **`ttl` or `expireTime`**: When the cached content should expire

Example request:

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Your content here..."
        }
      ]
    }
  ],
  "model": "models/gemini-1.5-pro",
  "ttl": "86400s",
  "displayName": "Movie analysis cache"
}
```

## Managing Expiration

Cached content automatically expires after the specified time. You can:

- Set an initial TTL (time-to-live) when creating the cache
- Update the TTL later to extend or shorten the expiration time
- Set an absolute expiration timestamp (`expireTime`)

Example to update expiry:

```python
client.cached_contents.patch(
    cached_content_name="cachedContents/123abc",
    cached_content={"ttl": "604800s"},  # 7 days
    update_mask=["ttl"]
)
```

## Best Practices

1. **Set appropriate expiration times** based on how long you need the content
2. **Use descriptive display names** to easily identify cached content
3. **Delete cached content** when no longer needed to free up resources
4. **Monitor usage** to understand cost savings and performance improvements
5. **Handle errors gracefully** if cached content expires

## Cost Considerations

- You're charged for tokens during the initial content caching
- Subsequent queries using cached content avoid re-tokenizing, reducing costs
- The longer and more complex your content, the more cost-efficient caching becomes
- The more queries you make against the same cached content, the greater your savings

## Limitations

- Cached content has a maximum size (check the API documentation for current limits)
- Cached content expires based on the TTL you set (max 30 days)
- There may be a limit to how many cached contents you can store per project

## Complete Example

For a complete working example, see the accompanying `gemini_caching_example.py` script, which demonstrates:

1. Creating cached content
2. Listing available cached contents
3. Generating responses using cached content
4. Updating expiration times
5. Deleting cached content

This example measures response times to show the potential performance improvements when using cached content. 