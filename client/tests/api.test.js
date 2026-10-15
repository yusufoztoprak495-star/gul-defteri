import { describe, it, expect, beforeEach } from "vitest";
import { apiFetch, ApiError, setDatabase } from "../src/api.js";
import { createDatabase } from "../src/data/database.js";
import { memoryStorage } from "../src/data/storage.js";
import { emptyState } from "../src/data/seed.js";

// Bu sitede hazır ders listesi yok: testler bir üniversite dersiyle (ve bir konusuyla) başlar
function uniState() {
  const state = emptyState();
  state.subjects.push({ id: 1, name: "Algoritma", examType: "1. Dönem", track: "uni" });
  state.topics.push({ id: 1, subjectId: 1, name: "Döngüler" });
  state.settings = { track: "uni", seededTracks: ["uni"] };
  return state;
}


beforeEach(() => {
  setDatabase(createDatabase(memoryStorage(uniState())));
});

describe("apiFetch", () => {
  it("başarılı yanıtta gövdeyi döner", async () => {
    const subjects = await apiFetch("/api/subjects");
    expect(subjects.map((s) => s.name)).toEqual(["Algoritma"]);
  });

  it("silmede (204) null döner", async () => {
    const topic = await apiFetch("/api/topics", {
      method: "POST",
      body: { subjectId: 1, name: "Yeni konu" },
    });
    expect(
      await apiFetch(`/api/topics/${topic.id}`, { method: "DELETE" }),
    ).toBeNull();
  });

  it("geçersiz girdide ApiError fırlatır, mesaj Türkçedir", async () => {
    const error = await apiFetch("/api/sessions", {
      method: "POST",
      body: {},
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Ders tam sayı olmalı");
  });

  it("bulunamayan kayıtta ApiError fırlatır", async () => {
    const error = await apiFetch("/api/topics/9999", {
      method: "DELETE",
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Bulunamadı");
  });

  it("depolama çalışmıyorsa ApiError olmayan düz hata verir (kayıt tekrar denenebilsin)", async () => {
    const broken = {
      load: () => Promise.reject(new Error("kapalı")),
      save: () => Promise.reject(new Error("kapalı")),
    };
    setDatabase(createDatabase(broken));
    const error = await apiFetch("/api/subjects").catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(error.message).toContain("depolaması kullanılamıyor");
  });

  it("gövde kopyalanır: istek sonrası değiştirilen nesne kaydı etkilemez", async () => {
    const body = { subjectId: 1, name: "Orijinal" };
    const topic = await apiFetch("/api/topics", { method: "POST", body });
    body.name = "Değişti";
    const subjects = await apiFetch("/api/subjects");
    expect(subjects[0].topics.find((t) => t.id === topic.id).name).toBe(
      "Orijinal",
    );
  });
});
