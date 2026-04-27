const IMAGE_PROMPT_SYSTEM = `You create image prompts for LinkedIn post visuals. Given a post, generate a single image prompt that would create a scroll-stopping, professional visual for LinkedIn.

Rules:
- Describe a specific scene, not abstract concepts
- Use bold colors, clean composition, professional feel
- Avoid text in the image — LinkedIn overlays handle text
- Think: infographic-style backgrounds, metaphorical scenes, professional situations
- Photorealistic or high-quality illustration style
- Keep under 200 words
- Return ONLY the image prompt, nothing else`;

async function generateImagePrompt(text) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: IMAGE_PROMPT_SYSTEM,
      messages: [{ role: 'user', content: `LinkedIn post:\n${text}` }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text.trim();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateImage(prompt) {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error('FAL_API_KEY not configured');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Key ${key}`,
  };

  // Submit to queue
  const submitRes = await fetch('https://queue.fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_4_3',
      num_images: 1,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`fal.ai submit error ${submitRes.status}: ${err}`);
  }

  const { request_id, response_url, status_url } = await submitRes.json();

  // Poll for completion (timeout after 60s)
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await sleep(2000);

    const statusRes = await fetch(status_url, { headers });
    if (!statusRes.ok) {
      const err = await statusRes.text();
      throw new Error(`fal.ai status error ${statusRes.status}: ${err}`);
    }

    const status = await statusRes.json();

    if (status.status === 'COMPLETED') {
      // Fetch the final result
      const resultRes = await fetch(response_url, { headers });
      if (!resultRes.ok) {
        const err = await resultRes.text();
        throw new Error(`fal.ai result error ${resultRes.status}: ${err}`);
      }
      const result = await resultRes.json();
      return result.images[0].url;
    }

    if (status.status === 'FAILED') {
      throw new Error('Image generation failed');
    }
  }

  throw new Error('Image generation timed out');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Step 1: Generate an image prompt from the post text
    const imagePrompt = await generateImagePrompt(text.trim());

    // Step 2: Generate the image
    const imageUrl = await generateImage(imagePrompt);

    return res.status(200).json({ imageUrl, prompt: imagePrompt });
  } catch (err) {
    console.error('Image generation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
