import { describe, it, expect } from "vitest";
import request, { makeTestApp } from "./helpers.js";

// Üniversite derslerinde konu istatistiği yalnızca çalışma süresidir
describe("GET /api/stats/by-topic (üniversite)", () => {
  it("konulara çalışma süresini dağıtır; konusuz kayıt hiçbir konuya sayılmaz", async () => {
    const { app, db } = makeTestApp();
    const subject = db.subjects[0];
    const [first, second] = db.topics.filter((t) => t.subjectId === subject.id);
    const add = (topicId, seconds) =>
      request(app).post("/api/sessions").send({
        subjectId: subject.id,
        topicId,
        startedAt: new Date(2026, 9, 12, 10).toISOString(),
        durationSeconds: seconds,
        entryType: "manual",
      });
    await add(first.id, 1200);
    await add(first.id, 600);
    await add(null, 900);
    const res = await request(app).get(
      `/api/stats/by-topic?subjectId=${subject.id}&from=2026-10-01&to=2026-10-31`,
    );
    expect(res.status).toBe(200);
    const byId = Object.fromEntries(res.body.map((t) => [t.topicId, t.totalSeconds]));
    expect(byId[first.id]).toBe(1800);
    expect(byId[second.id]).toBe(0);
  });

  it("soru kaydı ve kaynak uçları bu sitede yoktur", async () => {
    const { app } = makeTestApp();
    expect((await request(app).get("/api/questions")).status).toBe(404);
    expect((await request(app).get("/api/resources")).status).toBe(404);
  });
});
