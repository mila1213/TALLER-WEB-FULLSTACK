// netlify/functions/mensajes.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function respuesta(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
}

exports.handler = async function(event) {
  if (event.httpMethod === "GET") {
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return respuesta(500, { ok:false, error:error.message });
    return respuesta(200, { ok:true, data });
  }

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    const { nombre, email, mensaje } = body;

    if (!nombre || !email || !mensaje) {
      return respuesta(400, { ok:false, error:"Datos incompletos" });
    }

    const { data, error } = await supabase
      .from("mensajes")
      .insert([{ nombre, email, mensaje }])
      .select()
      .single();

    if (error) return respuesta(500, { ok:false, error:error.message });
    return respuesta(201, { ok:true, message:"Guardado en Supabase", data });
  }

  return respuesta(405, { ok:false, error:"Método no permitido" });
};