import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { parseLocalDate } from "../../dates.js";
import type { Holiday } from "../../holidays.js";

const state = vi.hoisted(() => ({ holidays: [] as Holiday[], ready: true, error: "" }));
vi.mock("./HolidayContext.js", () => ({ useHolidays: () => state }));
vi.mock("../../firebase.js", () => ({ deletefromDB: vi.fn(), setScheduleStatusFixo: vi.fn(), setScheduleStatus: vi.fn() }));
vi.mock("../../Agenda.js", async () => {
  const { createContext } = await import("react");
  return { SemanaContext: createContext(null), ModalContext: createContext(null) };
});

import { ModalContext, SemanaContext } from "../../Agenda.js";
import { Agendamento, Semana } from "./Utils.js";
import { TableRow } from "./TableRow.js";

const holiday: Holiday = { id: "holiday", name: "Feriado local", date: "2026-09-23", allDay: false, startTime: "14:15", endTime: "16:30" };
const recurring = new Agendamento("Aluno fixo", "Teen", "Revisão", "", "User", parseLocalDate("2026-09-16", "14:00"), true, "", "recurring");
const regular = new Agendamento("Aluno avulso", "Teen", "Revisão", "", "User", parseLocalDate("2026-09-23", "14:00"), false, "", "regular");
function render(appointments: Agendamento[] = []) {
  return renderToStaticMarkup(
    <SemanaContext.Provider value={{ semana: new Semana(appointments), setSemana: vi.fn() }}>
      <ModalContext.Provider value={{ showRegisterModal: vi.fn(), setModalUpdateSchedule: vi.fn() }}>
        <table><tbody><TableRow startTime="14h" endTime="14h45" /></tbody></table>
      </ModalContext.Provider>
    </SemanaContext.Provider>,
  );
}

beforeEach(() => {
  state.holidays = [holiday]; state.ready = true;
  vi.stubGlobal("window", { location: { search: "?date=23-9-2026" } });
});

describe("holiday calendar display", () => {
  it("labels a partial overlap and removes its booking control", () => {
    const html = render();
    expect(html).toContain("Feriado local");
    expect(html).toContain("14:15 – 16:30");
    expect(html.match(/Agendar Aluno/g)).toHaveLength(5);
  });
  it("keeps existing bookings visible and disables attendance for skipped occurrences", () => {
    const html = render([regular, recurring]);
    expect(html).toContain("Aluno avulso");
    expect(html).toContain("Conflito com feriado");
    expect(html).toContain("Aluno fixo");
    expect(html).toContain("Ignorado por feriado");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Presença indisponível: ignorado por feriado"/);
  });
  it("restores recurring occurrences and booking controls when a holiday is removed", () => {
    state.holidays = [];
    const html = render([recurring]);
    expect(html).not.toContain("Ignorado por feriado");
    expect(html).toContain("Alterar presença de Aluno fixo");
    expect(html.match(/Agendar Aluno/g)).toHaveLength(6);
  });
  it("disables booking and attendance while holiday data is unavailable", () => {
    state.ready = false; state.holidays = [];
    const html = render([recurring]);
    expect(html.match(/<button disabled=""/g)).toHaveLength(6);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Alterar presença de Aluno fixo"/);
  });
  it("does not show other weeks or recurring dates outside their range", () => {
    const expired = new Agendamento("Expired", "Teen", "Revisão", "", "User", parseLocalDate("2026-09-16", "14:00"), true, "", "expired", [], parseLocalDate("2026-09-01"), parseLocalDate("2026-09-22"));
    const otherWeek = { ...regular, nome: "Other week", data: parseLocalDate("2026-09-16", "14:00") };
    const html = render([expired, otherWeek]);
    expect(html).not.toContain("Expired");
    expect(html).not.toContain("Other week");
  });
});
