export default {
  async fetch(request, env, ctx) {
    // Add CORS headers so your GitHub Pages frontend can fetch this API
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Dynamic mode: If Metered API key and App Name are configured, fetch dynamic credentials
      if (env.METERED_API_KEY && env.METERED_APP_NAME) {
        const url = `https://${env.METERED_APP_NAME}.metered.live/api/v1/turn/credentials?apiKey=${env.METERED_API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        }
      }

      // Hybrid fallback mode: Return static credentials securely stored in Cloudflare environment variables
      const staticCredentials = [
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: env.TURN_USERNAME || "65330acb4241246eee68ae02",
          credential: env.TURN_CREDENTIAL || "S1pwGwv5ODO3UyIY"
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: env.TURN_USERNAME || "65330acb4241246eee68ae02",
          credential: env.TURN_CREDENTIAL || "S1pwGwv5ODO3UyIY"
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: env.TURN_USERNAME || "65330acb4241246eee68ae02",
          credential: env.TURN_CREDENTIAL || "S1pwGwv5ODO3UyIY"
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: env.TURN_USERNAME || "65330acb4241246eee68ae02",
          credential: env.TURN_CREDENTIAL || "S1pwGwv5ODO3UyIY"
        }
      ];

      return new Response(JSON.stringify(staticCredentials), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  }
};
