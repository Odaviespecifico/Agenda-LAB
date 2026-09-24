import { toast } from "react-toastify";
import { dateKey, parseLocalDate } from "../../dates.js";
import { useHolidays } from "./HolidayContext.js";
import { slotDate } from "../../holidays.js";
import { ModalContext, SemanaContext } from "../../Agenda.js";
import { useContext, useEffect, useState, useRef, type RefCallback, type FormEvent } from "react";
import { Agendamento, getDate } from "./Utils.js";
import { addSession, updateSchedule } from "../../firebase.js";

export function RegisterStudentModal({ ref, scheduleDate }) {
  const { ready: holidaysReady } = useHolidays();
  const [saving, setSaving] = useState(false);
  let semanaContext = useContext(SemanaContext);
  let formRef = useRef(null);
  let estagioRef = useRef<HTMLInputElement|null>(null)
  let [day, setDay] = useState<string | null>("testando");
  let [time, setTime] = useState<string | null>("testando");
  let [fixo, setFixo] = useState(false)
  let [filter, setFilter] = useState<string>('NOTHING')
  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener('keydown', handleEsc)
    setDay(getDate(parseInt(localStorage.getItem("day")!), "string") as string);
    setTime(localStorage.getItem("startTime"));
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);
  
  function handleStorageChange() {
    setDay(getDate(parseInt(localStorage.getItem("day")!), "string") as string);
    setTime(localStorage.getItem("startTime"));
  }

  function closeModal() {
  if (ref && "current" in ref && ref.current instanceof HTMLDialogElement) {
    ref.current.close();
    ref.current.classList.replace("flex", "hidden");
  }
}

  function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }

  function handleclose(e) {
    let target: HTMLDialogElement = e.target;
    target.close();
    target.classList.replace("flex", "hidden");
  }

  function handleSelectChange(e) {}

  type formAnswer = {
    name: string;
    estágio: string;
    destalhes: string;
    tipo: string;
    fixo?: boolean,
    inicio_fixo?: Date,
    fim_fixo?: Date,
    day_index?: Number,
  };

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.currentTarget;
    if (!holidaysReady || saving || !target.reportValidity()) return;
    const rawData = Object.fromEntries(new FormData(target));
    try {
      const date = slotDate(getDate(Number(localStorage.getItem("day")), "date") as Date, localStorage.getItem("startTime") ?? "");
      const inicioFixo = fixo ? parseLocalDate(String(rawData.inicio_fixo)) : undefined;
      const fimFixo = fixo ? parseLocalDate(String(rawData.fim_fixo)) : undefined;
      if (inicioFixo && fimFixo && inicioFixo > fimFixo) {
        toast.error("A data final não pode ser menor que a inicial!");
        return;
      }
      setSaving(true);
      const success = await addSession(
        String(rawData.name ?? ""), String(rawData.estágio ?? ""), String(rawData.tipo ?? ""),
        String(rawData.detalhes ?? ""), date.getFullYear(), date.getDate(),
        `${date.getHours()}h${date.getMinutes()}`, date.getMonth() + 1,
        localStorage.getItem("user") ?? "", fixo, inicioFixo, fimFixo,
      );
      if (success) {
        target.reset();
        closeModal();
        setFixo(false);
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar o agendamento."); }
    finally { setSaving(false); }
  }

  function togleFixo(e) {
    let checked:boolean = e.target.checked
    if(checked) {
      setFixo(true)
    }
    else{
      setFixo(false)
    }
  }

  function renderEstagios() {
    let estagios = ['Yard 1a', 'Yard 1b', 'Yard 2a', 'Yard 2b', 'Garden 1', 'Garden 2', 'Garden 3', 'Garden 4', 'Fun 1', 'Fun 2', 'Fun 3', 'Fun 4', 'Kids 1', 'Kids 2', 'Kids 3', 'Kids 4','Teen up 1', 'Teen up 2', 'Teen up 3', 'Teen up 4', 'Teen up 5', 'Teen up 6',
      'Essentials 1', 'Essentials 2', 'Progression 1', 'Progression 2', 'Expansion 1', 'Expansion 2', 'Gold 1', 'Gold 2', 'Platinum 1', 'Platinum 2', 'Fly 1', 'Fly 2'
    ]
    if (filter != '' && !estagios.includes(filter)) {
      return(
        estagios.filter((estagio) => estagio.toLowerCase().indexOf(filter.toLowerCase()) != -1).slice(0,5).map((estagio) => {
          return <button type="button" className="hover:bg-neutral-200 active:neutral-300 transition-all" onClick={() => {estagioRef.current!.value = estagio
            setFilter(estagio)
          }}>{estagio}</button>
        })
      )
    }
    else {
      return ('')
    }
  }

  function optionsFixo() {
    if(fixo) {
      return(
        <>
        <div className="flex gap-4 items-center">
          <label htmlFor="incio_fixo">Semana de início do reforço Fixo:</label>
          <input type="date" id="inicio_fixo" name="inicio_fixo" required className="border-1 rounded-sm p-1"/>
        </div>
        <div className="flex gap-4 items-center">
          <label htmlFor="incio_fixo">Semana de fim do reforço Fixo:</label>
          <input type="date" id="fim_fixo" name="fim_fixo" required className="border-1 rounded-sm p-1"/>
        </div>
        </>
      )
    }
  }
  return (
<dialog
  ref={ref}
  className="fixed top-0 left-0 z-40 h-screen w-screen items-center justify-center bg-white/20 backdrop-blur-xs p-4 hidden m-0"
  onMouseMove={handleStorageChange}
  onClick={handleStorageChange}
  onMouseOver={handleStorageChange}
  onClose={handleclose}
>
  
  <form
    ref={formRef}
    onSubmit={handleFormSubmit}
    className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md max-h-10/12 overflow-y-auto flex flex-col gap-4 text-lg"
  >
    
    <h1 className="flex justify-center text-center text-2xl font-semibold">
      Criar agendamento - {day} às {localStorage.getItem("startTime")}
      <button
    type="button"
    onClick={closeModal}
    className="ml-auto text-gray-500 hover:text-gray-700 text-xl"
  >
    ✕
  </button>
    </h1>

    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="font-medium">Nome:</label>
      <input
        type="text"
        name="name"
        required
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
      />
    </div>

    <div className="flex relative flex-col gap-2">
      <label htmlFor="estágio" className="font-medium">Estágio:</label>
      <input
        type="text"
        name="estágio"
        required
        autoComplete="off"
        ref={estagioRef}
        onInput={() => {setFilter(estagioRef.current!.value)}}
        className="peer border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
      />
      <div className={"flex flex-col absolute top-19 bg-white text-xl w-full border-0 border-t-0 peer-focus:border-1 shadow-lg"}>
        {renderEstagios()}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="tipo" className="font-medium">Conteúdo:</label>
      <select
        name="tipo"
        id="tipo"
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
      >
        <option value="Reposição">Reposição</option>
        <option value="Escolar">Escolar</option>
        <option value="Revisão">Revisão</option>
        <option value="Homework">Homework</option>
        <option value="Final Test">Final Test</option>
        <option value="Midterm Test">Midterm Test</option>
        <option value="Online">Online</option>
        <option value="Outro">Outro</option>
      </select>
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="detalhes" className="font-medium">Detalhes:</label>
      <input
        type="text"
        name="detalhes"
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
      />
    </div>

    <div className="flex items-center gap-2">
      <input
        checked={fixo}
        type="checkbox"
        name="fixo"
        id="fixo"
        onInput={togleFixo}
        className="w-5 h-5 accent-blue-500"
      />
      <label htmlFor="fixo" className="font-medium">Agendamento é fixo?</label>
    </div>

    {optionsFixo()}
    {fixo && <p className="text-sm text-amber-900">Datas que coincidirem com feriados serão ignoradas; as demais continuam agendadas.</p>}
    {!holidaysReady && <p role="status" className="text-sm text-amber-900">Aguarde a sincronização dos feriados para salvar.</p>}

    <button
      type="submit"
      disabled={!holidaysReady || saving}
      className="self-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? "Salvando…" : "Confirmar agendamento"}
    </button>
  </form>
</dialog>
  );
}

type StudentsSizeModalProps = {
  visible: boolean
  setVisibility: Function
  modal: HTMLDialogElement
}

export function StudentSizeModal({visible, setVisibility, modal}:StudentsSizeModalProps) {
  function handleYesClick() {
    setVisibility(false)
    modal.classList.replace('hidden','flex')
    // Highlight the first one
    let input:HTMLInputElement = modal.querySelector('input')!
    console.log(input)
    input.focus()
  }
  function handleNoClick() {
    modal.classList.replace('flex','hidden')
    setVisibility(false)
  }
  return (
    <div className={`fixed inset-0 z-50 ${visible? 'flex' : 'hidden'} items-center justify-center bg-black/20 backdrop-blur-sm`}>
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center animate-scaleUp">
        <h1 className="text-2xl font-semibold mb-3">Aviso</h1>
        <p className="text-gray-700 mb-6">
          Nesse horário já temos o limite de alunos agendados. Tem certeza que deseja agendar outro?
        </p>

        <div className="flex justify-center gap-4">
          <button onClick={handleYesClick} className="px-5 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition">
            Sim
          </button>
          <button onClick={handleNoClick} className="px-5 py-2 rounded-xl bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition">
            Não
          </button>
        </div>
      </div>
    </div>
  )
}

export function ModalUpdateStudent({agendamento}:{agendamento:Agendamento}) {
  const { ready: holidaysReady } = useHolidays();
  const [saving, setSaving] = useState(false);
  const modalContext = useContext(ModalContext)
  let estagioRef = useRef<HTMLInputElement|null>(null)
  let [filter, setFilter] = useState<string>('NOTHING')
  let refs = {
    'nome': useRef<HTMLInputElement|null>(null),
    'estagio': useRef<HTMLInputElement|null>(null),
    'tipo': useRef<HTMLSelectElement|null>(null),
    'detalhes': useRef<HTMLInputElement|null>(null),
    'fixoInicio': useRef<HTMLInputElement|null>(null),
    'fixoFim': useRef<HTMLInputElement|null>(null),
    'horario':useRef<HTMLInputElement|null>(null),
    'date':useRef<HTMLInputElement|null>(null),
    'form': useRef<HTMLFormElement|null>(null),
  }
  useEffect(() => {
    refs.nome.current!.value = agendamento.nome
    refs.estagio.current!.value = agendamento.estágio
    refs.tipo.current!.value = agendamento.tipo
    refs.detalhes.current!.value = agendamento.conteúdo
    refs.horario.current!.value = `${String(agendamento.data.getHours()).padStart(2, "0")}:${String(agendamento.data.getMinutes()).padStart(2, "0")}`;
    refs.date.current!.value = dateKey(agendamento.data);
    if (refs.fixoInicio.current && agendamento.inicioFixo) refs.fixoInicio.current.value = dateKey(agendamento.inicioFixo);
    if (refs.fixoFim.current && agendamento.fimFixo) refs.fixoFim.current.value = dateKey(agendamento.fimFixo);
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") modalContext.setModalUpdateSchedule(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [agendamento]);

  function renderEstagios() {
    let estagios = ['Yard 1a', 'Yard 1b', 'Yard 2a', 'Yard 2b', 'Garden 1', 'Garden 2', 'Garden 3', 'Garden 4', 'Fun 1', 'Fun 2', 'Fun 3', 'Fun 4', 'Kids 1', 'Kids 2', 'Kids 3', 'Kids 4','Teen up 1', 'Teen up 2', 'Teen up 3', 'Teen up 4', 'Teen up 5', 'Teen up 6',
      'Essentials 1', 'Essentials 2', 'Progression 1', 'Progression 2', 'Expansion 1', 'Expansion 2', 'Gold 1', 'Gold 2', 'Platinum 1', 'Platinum 2', 'Fly 1', 'Fly 2'
    ]
    if (filter != '' && !estagios.includes(filter)) {
      return(
        estagios.filter((estagio) => estagio.toLowerCase().indexOf(filter.toLowerCase()) != -1).slice(0,5).map((estagio) => {
          return <button type="button" className="hover:bg-neutral-200 active:neutral-300 transition-all" onClick={() => {refs.estagio.current!.value = estagio
            setFilter(estagio)
          }}>{estagio}</button>
        })
      )
    }
    else {
      return ('')
    }
  }

  function optionsFixo() {
    if(agendamento.fixo) {
      return(
        <>
        <div className="flex gap-4 items-center">
          <label htmlFor="incio_fixo">Semana de início do reforço Fixo:</label>
          <input type="date" id="inicio_fixo" name="inicio_fixo" required className="border-1 rounded-sm p-1"
          ref={refs.fixoInicio}/>
        </div>
        <div className="flex gap-4 items-center">
          <label htmlFor="incio_fixo">Semana de fim do reforço Fixo:</label>
          <input type="date" id="fim_fixo" name="fim_fixo" required className="border-1 rounded-sm p-1" 
          ref={refs.fixoFim}/>
        </div>
        </>
      )
    }
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    if (!holidaysReady || saving || !refs.form.current?.reportValidity()) return;
    try {
      const newDate = parseLocalDate(refs.date.current!.value, refs.horario.current!.value);
      const novoAgendamento = new Agendamento(refs.nome.current!.value, refs.estagio.current!.value, refs.tipo.current!.value, refs.detalhes.current!.value, agendamento.responsável, newDate, agendamento.fixo);
      const inicioFixo = agendamento.fixo ? parseLocalDate(refs.fixoInicio.current!.value) : null;
      const fimFixo = agendamento.fixo ? parseLocalDate(refs.fixoFim.current!.value) : null;
      if (inicioFixo && fimFixo && inicioFixo > fimFixo) {
        toast.error("A data final não pode ser menor que a inicial!");
        return;
      }
      setSaving(true);
      const success = await updateSchedule(agendamento, novoAgendamento, inicioFixo, fimFixo);
      if (success) modalContext.setModalUpdateSchedule();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o agendamento."); }
    finally { setSaving(false); }
  }

  return(
    <div
    className={`fixed top-0 left-0 flex z-40 h-screen w-screen items-center justify-center bg-white/20 backdrop-blur-xs p-4 m-0`}
  >
    
    <form ref={refs.form} onSubmit={(e) => handleFormSubmit(e)} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-11/12 overflow-y-auto  flex flex-col gap-4 text-lg">
      <h1 className="flex justify-center text-center text-2xl font-semibold">
      Atualizar agendamento - {agendamento.data.getDate() + '/' + (agendamento.data.getMonth()+1)} às {`${agendamento.data.getHours()}h ${(agendamento.data.getMinutes() != 0) ? agendamento.data.getMinutes() : '' }`}
          <button
        type="button"
        onClick={() => {modalContext.setModalUpdateSchedule()}}
        className="ml-auto text-gray-500 hover:text-gray-700 text-xl">
        ✕
      </button>
    </h1>
    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="font-medium">Nome:</label>
      <input
        type="text"
        name="name"
        required
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        ref={refs.nome}
      />
    </div>

    <div className="flex relative flex-col gap-2">
      <label htmlFor="estágio" className="font-medium">Estágio:</label>
      <input
        type="text"
        name="estágio"
        required
        autoComplete="off"
        ref={refs.estagio}
        onInput={() => {setFilter(refs.estagio.current!.value)}}
        className="peer border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
      />
      <div className={"flex flex-col absolute top-19 bg-white text-xl w-full border-0 border-t-0 peer-focus:border-1 shadow-lg"}>
        {renderEstagios()}
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="tipo" className="font-medium">Conteúdo:</label>
      <select
        name="tipo"
        id="tipo"
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        ref={refs.tipo}
      >
        <option value="Reposição">Reposição</option>
        <option value="Escolar">Escolar</option>
        <option value="Revisão">Revisão</option>
        <option value="Homework">Homework</option>
        <option value="Final Test">Final Test</option>
        <option value="Midterm Test">Midterm Test</option>
        <option value="Online">Online</option>
        <option value="Outro">Outro</option>
      </select>
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="detalhes" className="font-medium">Detalhes:</label>
      <input
        type="text"
        name="detalhes"
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        ref={refs.detalhes}
      />
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="horario" className="font-medium">Horário:</label>
      <input
        type="time"
        required
        name="horario"
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        ref={refs.horario}
      />
    </div>
    <div className="flex flex-col gap-2">
      <label htmlFor="data" className="font-medium">data:</label>
      <input
        type="date"
        required
        name="data"
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        ref={refs.date}
      />
    </div>
    {optionsFixo()}
    {agendamento.fixo && <p className="text-sm text-amber-900">Datas que coincidirem com feriados serão ignoradas; as demais continuam agendadas.</p>}
    {!holidaysReady && <p role="status" className="text-sm text-amber-900">Aguarde a sincronização dos feriados para salvar.</p>}

    <button
      type="submit"
      disabled={!holidaysReady || saving}
      className="self-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? "Salvando…" : "Atualizar Agendamento"}
    </button>
    </form>
  </div>
  )
}