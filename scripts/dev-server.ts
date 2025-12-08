#!/usr/bin/env bun

import { serve } from "bun";

const port = process.env.PORT || 3000;

console.log(`🚀 Starting LiveCalendar dev server...`);
console.log(`📅 Server running at http://localhost:${port}`);

serve({
  port,
  fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Serve index.html for root
    if (pathname === "/") {
      pathname = "/index.html";
    }

    // Try to serve the file
    const file = Bun.file(`.${pathname}`);

    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback to index.html for SPA routing
    return new Response(Bun.file("./index.html"), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

