import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { deleteHoliday, saveHoliday } from "../../firebase.js";
import { dateKey, parseLocalDate } from "../../dates.js";
import { holidayPeriod, validateHoliday, type Holiday, type HolidayInput } from "../../holidays.js";
import { getDate } from "./Utils.js";
import { useHolidays } from "./HolidayContext.js";

function emptyHoliday(): HolidayInput {
  return { name: "", date: dateKey(getDate(1, "date") as Date), allDay: true, startTime: "09:00", endTime: "18:00" };
}

export function HolidayManager({ onClose }: { onClose: () => void }) {
  const { holidays, ready, error: loadError } = useHolidays();
  const [draft, setDraft] = useState<HolidayInput>(emptyHoliday);
  const [editingId, setEditingId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  function reset() { setDraft(emptyHoliday()); setEditingId(undefined); setError(""); }
  function edit(holiday: Holiday) {
    setEditingId(holiday.id);
    setDraft({ ...holiday, startTime: holiday.startTime ?? "09:00", endTime: holiday.endTime ?? "18:00" });
    setError("");
    nameInput.current?.focus();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setError("");
    try {
      const value = validateHoliday(draft);
      setBusy(true);
      await saveHoliday(value, editingId);
      toast.success(editingId ? "Feriado atualizado." : "Feriado cadastrado.");
      reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o feriado."); }
    finally { setBusy(false); }
  }
  async function remove(holiday: Holiday) {
    if (!window.confirm(`Excluir o feriado “${holiday.name}”? Os horários serão liberados se não houver outro feriado.`)) return;
    setBusy(true); setError("");
    try {
      await deleteHoliday(holiday.id);
      if (editingId === holiday.id) reset();
      toast.success("Feriado excluído.");
    } catch { setError("Não foi possível excluir o feriado. Tente novamente."); }
    finally { setBusy(false); }
  }

  const inputClass = "w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-300";
  return (
    <dialog ref={dialog} aria-labelledby="holiday-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl p-6 shadow-xl backdrop:bg-black/30">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 id="holiday-title" className="text-2xl font-semibold">Feriados</h2>
        <button type="button" aria-label="Fechar feriados" disabled={busy} onClick={onClose} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">✕</button>
      </div>
      <p className="text-sm text-gray-600 mb-5">Bloqueie um dia inteiro ou um período. Agendamentos fixos serão ignorados nas datas afetadas.</p>
      {(loadError || !ready) && <p role="status" className="mb-4 rounded bg-amber-50 p-3 text-amber-900">{loadError || "Sincronizando feriados… Aguarde a conexão para agendar ou alterar feriados."}</p>}
      <form onSubmit={submit}>
        <fieldset disabled={busy || !ready} className="space-y-4 disabled:opacity-60">
          <legend className="font-semibold mb-3">{editingId ? "Editar feriado" : "Cadastrar feriado"}</legend>
          <label className="block">Nome do feriado
            <input ref={nameInput} autoFocus required maxLength={120} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
          </label>
          <label className="block">Data
            <input type="date" required value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} className={inputClass} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.allDay} onChange={e => setDraft({ ...draft, allDay: e.target.checked })} className="size-5 accent-purple-600" /> Dia inteiro
          </label>
          {!draft.allDay && <fieldset className="rounded-lg bg-purple-50 p-3">
            <legend className="text-sm font-medium">Período personalizado</legend>
            <div className="grid grid-cols-2 gap-3">
              <label>Início<input type="time" required step="60" value={draft.startTime ?? ""} onChange={e => setDraft({ ...draft, startTime: e.target.value })} className={inputClass} /></label>
              <label>Fim<input type="time" required step="60" value={draft.endTime ?? ""} onChange={e => setDraft({ ...draft, endTime: e.target.value })} className={inputClass} /></label>
            </div>
            <p className="text-xs mt-2 text-gray-600">Informe os horários no mesmo dia, por exemplo, 14:15 até 16:30.</p>
          </fieldset>}
          <div className="flex gap-3">
            <button type="submit" className="bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700">{busy ? "Salvando…" : editingId ? "Salvar alterações" : "Cadastrar feriado"}</button>
            {editingId && <button type="button" onClick={reset} className="rounded-md border px-4 py-2">Cancelar edição</button>}
          </div>
        </fieldset>
      </form>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      <section aria-labelledby="holiday-list-title" className="mt-6 border-t pt-4">
        <h3 id="holiday-list-title" className="font-semibold mb-3">Feriados cadastrados</h3>
        {ready && holidays.length === 0 && <p className="text-gray-500">Nenhum feriado cadastrado.</p>}
        <ul className="space-y-2">
          {[...holidays].sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? "").localeCompare(b.startTime ?? "")).map(holiday => (
            <li key={holiday.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
              <div className="min-w-0"><p className="font-medium break-words">{holiday.name}</p><p className="text-sm text-gray-600">{parseLocalDate(holiday.date).toLocaleDateString("pt-BR")} · {holidayPeriod(holiday)}</p></div>
              <div className="flex gap-3 text-sm">
                <button type="button" disabled={busy || !ready} aria-label={`Editar ${holiday.name}`} onClick={() => edit(holiday)} className="text-purple-800 underline disabled:opacity-50">Editar</button>
                <button type="button" disabled={busy || !ready} aria-label={`Excluir ${holiday.name}`} onClick={() => remove(holiday)} className="text-red-700 underline disabled:opacity-50">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </dialog>
  );
}
