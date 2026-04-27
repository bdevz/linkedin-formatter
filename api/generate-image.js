const IMAGE_PROMPT_SYSTEM = `You create image prompts for LinkedIn post visuals. The user provides their post text and optional direction hints. Generate a prompt that produces a real-looking photo — NOT an AI-generated image.

Prompt structure: background/scene → subject → key details → constraints.

CRITICAL — avoid AI artifacts:
- NEVER include people's hands, fingers, or full human bodies unless the user specifically asks. Hands are the #1 giveaway of AI images.
- Prefer: objects, environments, flat lays, screens, landscapes, over-the-shoulder shots where hands are out of frame
- If people are needed, show them from behind, silhouetted, or at a distance where details blur naturally

Style — look like a real smartphone photo:
- Shot on iPhone 15, natural lighting, slight depth of field
- Include imperfections: minor grain, ambient shadows, slightly off-center framing
- Real textures: worn notebook edges, scratched desk surface, wrinkled fabric
- AVOID: ultra-HD, 8K, studio lighting, symmetrical compositions, stock photo feel, glossy renders
- No text, words, or legible writing in the image

LinkedIn scene ideas (pick one that fits the post):
- Top-down flat lay: laptop, coffee, notebook, pen on a wooden desk
- Environment: cafe window, co-working space, airport lounge, city skyline at golden hour
- Objects: phone showing a graph, whiteboard with blurred sketches, stack of books, sticky notes
- Nature metaphors: path through fog, single tree, sunrise over water, open road
- Screens: laptop screen with blurred content, phone notification, monitor with charts

Composition:
- Specify one framing: close-up, top-down, wide shot, over-the-shoulder
- Specify one lighting: golden hour, overcast daylight, warm lamp, window light
- Keep the scene simple — one focal point, not cluttered

If the user provides direction hints, prioritize those over your own scene choice.

Keep under 120 words. Return ONLY the image prompt, nothing else.`;

const VALID_MODELS = ['gpt', 'flux-dev', 'flux-pro'];

async function generateImagePrompt(text, direction) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');

  let userMessage = `LinkedIn post:\n${text}`;
  if (direction) {
    userMessage += `\n\nUser's image direction: ${direction}`;
  }

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
      messages: [{ role: 'user', content: userMessage }],
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

async function generateWithGPT(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1792x1024',
      quality: 'hd',
      n: 1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data[0].url;
}

async function generateWithFal(prompt, model) {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error('FAL_API_KEY not configured');

  const endpoint = model === 'flux-pro'
    ? 'https://queue.fal.run/fal-ai/flux-pro/v1.1'
    : 'https://queue.fal.run/fal-ai/flux/dev';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Key ${key}`,
  };

  // Submit to queue
  const submitRes = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_4_3',
      num_images: 1,
      num_inference_steps: model === 'flux-pro' ? 25 : 28,
      guidance_scale: 3.5,
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`fal.ai submit error ${submitRes.status}: ${err}`);
  }

  const { response_url, status_url } = await submitRes.json();

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

  const { text, model, direction } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!model || !VALID_MODELS.includes(model)) {
    return res.status(400).json({ error: 'Model must be "gpt", "flux-dev", or "flux-pro"' });
  }

  try {
    // Step 1: Generate an image prompt from the post text + user direction
    const imagePrompt = await generateImagePrompt(text.trim(), direction?.trim() || '');

    // Step 2: Generate the image with the selected model
    const imageUrl = model === 'gpt'
      ? await generateWithGPT(imagePrompt)
      : await generateWithFal(imagePrompt, model);

    return res.status(200).json({ imageUrl, prompt: imagePrompt });
  } catch (err) {
    console.error('Image generation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
