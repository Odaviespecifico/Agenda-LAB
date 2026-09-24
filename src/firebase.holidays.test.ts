import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseLocalDate } from "./dates.js";

const sdk = vi.hoisted(() => ({
  getDocsFromServer: vi.fn(), addDoc: vi.fn(), updateDoc: vi.fn(), deleteDoc: vi.fn(),
  onSnapshot: vi.fn(), unsubscribe: vi.fn(), auth: { currentUser: { uid: "user" } as { uid: string } | null },
}));
vi.mock("firebase/app", () => ({ initializeApp: () => ({}) }));
vi.mock("firebase/auth", () => ({ getAuth: () => sdk.auth, GoogleAuthProvider: class {}, signInWithPopup: vi.fn(), signInWithRedirect: vi.fn() }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}), collection: (_db: unknown, path: string) => path,
  doc: (_db: unknown, path: string, id: string) => `${path}/${id}`,
  Timestamp: { fromDate: (date: Date) => date },
  getDocsFromServer: sdk.getDocsFromServer, addDoc: sdk.addDoc, updateDoc: sdk.updateDoc,
  deleteDoc: sdk.deleteDoc, onSnapshot: sdk.onSnapshot,
}));
vi.mock("./components/schedule/Utils.js", () => ({ Agendamento: class {}, Semana: class {}, getDate: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { loading: vi.fn(() => "toast"), update: vi.fn() } }));

import { addSession, deleteHoliday, listenToHolidays, saveHoliday, updateSchedule } from "./firebase.js";
import type { Agendamento } from "./components/schedule/Utils.js";

const holiday = { name: "Feriado", date: "2026-09-23", allDay: false, startTime: "14:15", endTime: "16:30" };
const snapshot = (fromCache = false, hasPendingWrites = false) => ({
  docs: [{ id: "holiday", data: () => holiday }], metadata: { fromCache, hasPendingWrites },
});
const booking = (time = "14:00", fixo = false): Agendamento => ({
  id: "booking", nome: "Aluno", estágio: "Teen up 1", conteúdo: "", tipo: "Revisão",
  responsável: "User", data: parseLocalDate("2026-09-23", time), fixo,
});

beforeEach(() => {
  vi.resetAllMocks();
  sdk.auth.currentUser = { uid: "user" };
  sdk.getDocsFromServer.mockResolvedValue(snapshot());
  sdk.addDoc.mockResolvedValue({ id: "new" });
  sdk.updateDoc.mockResolvedValue(undefined);
  sdk.deleteDoc.mockResolvedValue(undefined);
  sdk.onSnapshot.mockReturnValue(sdk.unsubscribe);
});

describe("holiday storage", () => {
  it("creates, edits, and removes only holiday documents", async () => {
    await saveHoliday(holiday);
    expect(sdk.addDoc).toHaveBeenCalledWith("feriados", holiday);
    await saveHoliday({ ...holiday, allDay: true }, "holiday");
    expect(sdk.updateDoc).toHaveBeenCalledWith("feriados/holiday", { ...holiday, allDay: true, startTime: null, endTime: null });
    await deleteHoliday("holiday");
    expect(sdk.deleteDoc).toHaveBeenCalledWith("feriados/holiday");
  });
  it("rejects invalid periods and signed-out writes", async () => {
    await expect(saveHoliday({ ...holiday, endTime: "13:00" })).rejects.toThrow();
    sdk.auth.currentUser = null;
    await expect(saveHoliday(holiday)).rejects.toThrow();
    await expect(deleteHoliday("holiday")).rejects.toThrow();
    expect(sdk.addDoc).not.toHaveBeenCalled();
    expect(sdk.deleteDoc).not.toHaveBeenCalled();
  });
  it("synchronizes add/edit/delete snapshots and waits for server confirmation", () => {
    const changed = vi.fn(), failed = vi.fn();
    const unsubscribe = listenToHolidays(changed, failed);
    const notify = sdk.onSnapshot.mock.calls[0]![2];
    notify(snapshot(true));
    expect(changed).toHaveBeenLastCalledWith([{ ...holiday, id: "holiday" }], false);
    notify(snapshot(false, true));
    expect(changed).toHaveBeenLastCalledWith([{ ...holiday, id: "holiday" }], false);
    notify(snapshot());
    expect(changed).toHaveBeenLastCalledWith([{ ...holiday, id: "holiday" }], true);
    notify({ ...snapshot(), docs: [] });
    expect(changed).toHaveBeenLastCalledWith([], true);
    unsubscribe();
    expect(sdk.unsubscribe).toHaveBeenCalledOnce();
  });
  it("reports invalid stored data instead of silently ignoring a holiday", () => {
    const changed = vi.fn(), failed = vi.fn();
    listenToHolidays(changed, failed);
    sdk.onSnapshot.mock.calls[0]![2]({ ...snapshot(), docs: [{ id: "invalid", data: () => ({ ...holiday, date: "invalid" }) }] });
    expect(changed).not.toHaveBeenCalled();
    expect(failed).toHaveBeenCalledOnce();
  });
});

describe("booking persistence guards", () => {
  it("rejects a holiday added before submission without writing an appointment", async () => {
    expect(await addSession("Aluno", "Teen", "Revisão", "", 2026, 23, "14h", 9, "User")).toBe(false);
    expect(sdk.addDoc).not.toHaveBeenCalled();
  });
  it("allows a recurring series spanning holidays", async () => {
    expect(await addSession("Aluno", "Teen", "Revisão", "", 2026, 23, "14h", 9, "User", true,
      parseLocalDate("2026-09-01"), parseLocalDate("2026-10-31"))).toBe(true);
    expect(sdk.addDoc).toHaveBeenCalledWith("agendamentos", expect.objectContaining({ fixo: true }));
  });
  it("allows bookings at the exact end of a holiday", async () => {
    expect(await addSession("Aluno", "Teen", "Revisão", "", 2026, 23, "16h30", 9, "User")).toBe(true);
  });
  it("fails closed when holidays cannot be fetched", async () => {
    sdk.getDocsFromServer.mockRejectedValue(new Error("permission-denied"));
    expect(await addSession("Aluno", "Teen", "Revisão", "", 2026, 23, "17h", 9, "User")).toBe(false);
    expect(sdk.addDoc).not.toHaveBeenCalled();
  });
  it("rejects rescheduling into a holiday while allowing details to be edited", async () => {
    expect(await updateSchedule(booking("17:00"), booking())).toBe(false);
    expect(sdk.updateDoc).not.toHaveBeenCalled();
    expect(await updateSchedule(booking(), { ...booking(), nome: "Nome atualizado" })).toBe(true);
    expect(sdk.updateDoc).toHaveBeenCalledWith("agendamentos/booking", expect.objectContaining({ nome: "Nome atualizado" }));
  });
  it("does not report success when the update fails", async () => {
    sdk.updateDoc.mockRejectedValue(new Error("permission-denied"));
    expect(await updateSchedule(booking(), booking("17:00"))).toBe(false);
  });
});
