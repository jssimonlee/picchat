export default {
  async fetch(request, env, ctx) {
    // Add CORS headers so your GitHub Pages frontend can fetch this API
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET /api/vocabularies - Fetch word collections list
      if (request.method === "GET" && path === "/api/vocabularies") {
        const result = await env.VOCAB_DB.prepare(`
          SELECT v.id AS id, v.name AS name, COUNT(w.id) AS word_count
          FROM vocabularies v
          LEFT JOIN words w ON v.id = w.vocabulary_id
          GROUP BY v.id
          ORDER BY v.id
        `).all();
        return new Response(JSON.stringify(result.results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // GET /api/words/speedrun - Fetch words for speedrun game
      if (request.method === "GET" && path === "/api/words/speedrun") {
        const vocabularyId = parseInt(url.searchParams.get("vocabularyId"));
        const limit = parseInt(url.searchParams.get("limit")) || 20;
        const exclude = url.searchParams.get("exclude") || "";

        if (!vocabularyId) {
          return new Response(JSON.stringify({ error: "Missing vocabularyId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const excludeIds = exclude.split(",")
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));

        let query = "SELECT id, english, korean FROM words WHERE vocabulary_id = ?";
        if (excludeIds.length > 0) {
          query += ` AND id NOT IN (${excludeIds.join(",")})`;
        }
        query += " ORDER BY RANDOM() LIMIT ?";

        const result = await env.VOCAB_DB.prepare(query)
          .bind(vocabularyId, limit)
          .all();

        return new Response(JSON.stringify(result.results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 1. GET /api/rooms/:code - Fetch active peer list for a room
      if (request.method === "GET" && path.startsWith("/api/rooms/")) {
        // Strip trailing slash if present
        let roomCode = path.substring("/api/rooms/".length).toUpperCase();
        if (roomCode.endsWith("/")) {
          roomCode = roomCode.slice(0, -1);
        }

        if (!roomCode) {
          return new Response(JSON.stringify({ error: "Missing room code" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Query SQLite D1 Database
        const result = await env.DB.prepare(
          "SELECT peer_ids FROM picchat_rooms WHERE room_code = ?"
        ).bind(roomCode).first();

        const peerIds = result ? JSON.parse(result.peer_ids) : [];

        return new Response(JSON.stringify({ peerIds }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 2. POST /api/rooms/:code/sync - Update active peer list for a room
      if (request.method === "POST" && path.startsWith("/api/rooms/") && path.endsWith("/sync")) {
        const parts = path.split("/");
        const roomCode = parts[3].toUpperCase();

        if (!roomCode) {
          return new Response(JSON.stringify({ error: "Missing room code" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const body = await request.json();
        const peerIds = body.peerIds;
        if (!Array.isArray(peerIds)) {
          return new Response(JSON.stringify({ error: "Invalid peerIds array" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const now = Date.now();
        const peerIdsJson = JSON.stringify(peerIds);

        // Upsert database row
        await env.DB.prepare(`
          INSERT INTO picchat_rooms (room_code, peer_ids, updated_at) 
          VALUES (?1, ?2, ?3) 
          ON CONFLICT(room_code) 
          DO UPDATE SET peer_ids=?2, updated_at=?3
        `).bind(roomCode, peerIdsJson, now).run();

        // Background cleanup of rooms inactive for more than 24 hours
        ctx.waitUntil(cleanupOldRooms(env.DB));

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 3. GET / - Fetch TURN credentials (original fallback behavior)
      if (env.METERED_API_KEY && env.METERED_APP_NAME) {
        const url = `https://${env.METERED_APP_NAME}.metered.live/api/v1/turn/credentials?apiKey=${env.METERED_API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // Return static credentials securely stored in Cloudflare environment variables
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

async function cleanupOldRooms(db) {
  try {
    const ageLimit = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    await db.prepare("DELETE FROM picchat_rooms WHERE updated_at < ?").bind(ageLimit).run();
  } catch (e) {
    console.error("Cleanup error:", e);
  }
}
