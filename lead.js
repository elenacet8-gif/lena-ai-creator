export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    if (data.website) return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    const name = String(data.name || "").trim().slice(0, 80);
    const contact = String(data.contact || "").trim().slice(0, 120);
    const service = String(data.service || "").trim().slice(0, 100);
    const details = String(data.details || "").trim().slice(0, 1500);
    if (!name || !contact || !service) {
      return Response.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return Response.json({ error: "Приём заявок ещё не настроен" }, { status: 503 });
    }
    const message = [
      "🟡 НОВАЯ ЗАЯВКА — LENA AI CREATOR",
      `Имя: ${name}`,
      `Контакт: ${contact}`,
      `Услуга: ${service}`,
      details ? `Идея: ${details}` : ""
    ].filter(Boolean).join("\n");
    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message })
    });
    if (!tg.ok) return Response.json({ error: "Не удалось передать заявку в Telegram" }, { status: 502 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
}