import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { phone, script } = JSON.parse(event.body || '{}');
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsApiKey) {
      console.warn('ELEVENLABS_API_KEY not configured - simulating call');
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Voice call simulated (API key not configured)',
          callId: `sim_${Date.now()}`,
          phone,
          script,
        }),
      };
    }

    // Call ElevenLabs Conversational AI API
    // Documentation: https://elevenlabs.io/docs/conversational-ai/overview
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: process.env.ELEVENLABS_AGENT_ID || 'default',
        phone_number: phone,
        initial_message: script,
      }),
    });

    if (!elevenLabsResponse.ok) {
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.statusText}`);
    }

    const result = await elevenLabsResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Voice call initiated successfully',
        callId: result.conversation_id,
        phone,
      }),
    };
  } catch (error: any) {
    console.error('Error triggering voice call:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to trigger voice call',
        message: error.message,
      }),
    };
  }
};
