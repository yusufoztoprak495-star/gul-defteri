import { describe, it, expect } from "vitest";
import request, { makeTestApp } from "./helpers.js";
import { netOf } from "../../src/data/stats.js";

// Yerel saatle (saat dilimi fark etmeksizin) bir çalışma kaydı ekler
async function addSession(app, { subjectId = 1, local, seconds }) {
  const res = await request(app)
    .post("/api/sessions")
    .send({
      subjectId,
      startedAt: new Date(...local).toISOString(),
      durationSeconds: seconds,
      entryType: "manual",
    });
  expect(res.status).toBe(201);
}

async function addQuestions(
  app,
  { subjectId = 1, date, correct, wrong, blank },
) {
  const res = await request(app)
    .post("/api/questions")
    .send({ subjectId, date, correct, wrong, blank });
  expect(res.status).toBe(201);
}

describe("GET /api/stats/daily", () => {
  it("veri yokken boş dizi döner", async () => {
    const { app } = makeTestApp();
    const res = await request(app).get(
      "/api/stats/daily?from=2026-10-01&to=2026-10-31",
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("gece 00:30'da başlayan çalışma yerel güne yazılır", async () => {
    const { app } = makeTestApp();
    await addSession(app, { local: [2026, 9, 12, 0, 30], seconds: 600 });
    const res = await request(app).get(
      "/api/stats/daily?from=2026-10-11&to=2026-10-12",
    );
    expect(res.body).toEqual([
      {
        date: "2026-10-12",
        totalSeconds: 600,
        correct: 0,
        wrong: 0,
        blank: 0,
        net: 0,
      },
    ]);
  });

});

describe("GET /api/stats/by-subject", () => {
  it("veri yokken 15 dersin hepsi sıfırlarla döner (NaN yok; doğruluk oranı bilinçli olarak null)", async () => {
    const { app } = makeTestApp();
    const res = await request(app).get(
      "/api/stats/by-subject?from=2026-10-01&to=2026-10-31",
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(15);
    for (const row of res.body) {
      expect(row).toEqual({
        subjectId: expect.any(Number),
        subjectName: expect.any(String),
        examType: expect.stringMatching(/^(TYT|AYT)$/),
        totalSeconds: 0,
        correct: 0,
        wrong: 0,
        blank: 0,
        net: 0,
        accuracy: null,
      });
    }
  });

  it("from/to eksik veya from > to ise 400 döner", async () => {
    const { app } = makeTestApp();
    expect((await request(app).get("/api/stats/by-subject")).status).toBe(400);
    const res = await request(app).get(
      "/api/stats/by-subject?from=2026-10-13&to=2026-10-12",
    );
    expect(res.status).toBe(400);
  });
});

describe("netOf", () => {
  it("net = doğru − yanlış / 4", () => {
    expect(netOf(10, 4)).toBe(9);
    expect(netOf(0, 0)).toBe(0);
  });

  it("2 ondalığa yuvarlar", () => {
    expect(netOf(3, 1)).toBe(2.75);
    expect(netOf(1, 1)).toBe(0.75);
    expect(netOf(0, 1)).toBe(-0.25);
    expect(netOf(1, 2)).toBe(0.5);
  });
});
