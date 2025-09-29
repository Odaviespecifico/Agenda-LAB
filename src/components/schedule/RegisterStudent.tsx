import { SemanaContext } from "../../Agenda.js";
import { useContext, useEffect, useState, useRef } from "react";
import { getDate } from "./Utils.js";
import { addSession } from "../../firebase.js";

export function RegisterStudentModal({ ref, scheduleDate }) {
  let semanaContext = useContext(SemanaContext);
  let formRef = useRef(null);
  let [day, setDay] = useState<string | null>("testando");
  let [time, setTime] = useState<string | null>("testando");
  let [fixo, setFixo] = useState(false)
  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
  }, []);

  function handleStorageChange() {
    setDay(getDate(parseInt(localStorage.getItem("day")!), "string") as string);
    setTime(localStorage.getItem("startTime"));
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

  function handleFormSubmit(e) {
    e.preventDefault();
    const target = e.target;
    let dates
    let dayIndex
    if (target && target instanceof HTMLFormElement) {
      if (!target.reportValidity()) {
        return;
      }
      const form: HTMLFormElement = target;
      const rawData = Object.fromEntries(new FormData(form));

      // Para agendamentos Fixos
      if (rawData.fixo) {
        const inputFixoInicio = document.getElementById(
          "inicio_fixo"
        ) as HTMLInputElement | null;
        const inputFixoFim = document.getElementById(
          "fim_fixo"
        ) as HTMLInputElement | null;
        if (!inputFixoFim || !inputFixoInicio) {
          console.error("Input não encontrado");
          return;
        }
        let [yInicio,mInicio,dInicio] = inputFixoInicio.value.split('-').map(Number)
        let [yFim,mFim,dFim] = inputFixoFim.value.split('-').map(Number)
        
        dates = [new Date(yInicio!,mInicio!-1,dInicio,0,0,0,0), new Date(yFim!,mFim!-1,dFim,0,0,0,0)];

        // Verifica se o input fim é maior que o início
        if (dates[0]! > dates[1]!) {
          inputFixoFim.setCustomValidity(
            "A data final não pode ser menor que a inicial!"
          );
          inputFixoFim.reportValidity();
          setTimeout(() => {
            inputFixoFim.setCustomValidity("");
          }, 1500);
          return;
        }

        let dayIndex: Date | Number = new Date(Date.now());
        dayIndex.setDate(Number(day!.split("/")[0]));
        dayIndex.setMonth(Number(day!.split("/")[1]) - 1);
        dayIndex = dayIndex.getDay();
      }
      let formData: formAnswer = {
        name: String(rawData.name ?? ""),
        estágio: String(rawData.estágio ?? ""),
        destalhes: String(rawData.detalhes ?? ""),
        tipo: String(rawData.tipo ?? ""),
        fixo: false,
      };

      if (fixo) {
        formData.inicio_fixo = dates[0];
        formData.fim_fixo = dates[1];
        formData.day_index = dayIndex;
        formData.fixo = true
      }
      // Cria a data para o agendamento
      let date = new Date(Date.now());
      if (day && typeof day === "string" && day.includes("/")) {
        const [d, m] = day.split("/");
        date.setMonth(parseInt(m ?? "1") - 1);
        date.setDate(parseInt(d ?? "1"));
      } else {
        console.error("Invalid day value:", day);
        return;
      }
      let startTime = localStorage.getItem("startTime")?.split("h");
      console.log(startTime)
      const hour = parseInt(startTime?.at(0)!);
      const minute = parseInt(startTime?.at(1) ? startTime.at(1)! : "0");
      date.setHours(hour, minute, 0, 0);
      // Adiciona ao Banco de dados
      if (fixo) {
        addSession(
        formData.name,
        formData.estágio,
        formData.tipo,
        formData.destalhes,
        date.getFullYear(),
        date.getDate(),
        `${date.getHours()}h${date.getMinutes()}`,
        date.getMonth() + 1,
        localStorage.getItem("user")!,
        formData.fixo,
        formData.inicio_fixo,
        formData.fim_fixo
      );
      }
      else {
        addSession(
                formData.name,
                formData.estágio,
                formData.tipo,
                formData.destalhes,
                date.getFullYear(),
                date.getDate(),
                `${date.getHours()}h${date.getMinutes()}`,
                date.getMonth() + 1,
                localStorage.getItem("user")!,
                false,
            );
      }
      

      // Limpa o formulátio
      target.reset();

      // Hide the dialog
      let dialog = document.querySelector("dialog");
      dialog?.close();
      setFixo(false);
    }
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

  function optionsFixo() {
    if(fixo) {
      return(
        <>
        <div className="flex gap-4 items-center">
          <label htmlFor="incio_fixo">Data de início do reforço Fixo:</label>
          <input type="date" id="inicio_fixo" name="inicio_fixo" required className="border-1 rounded-sm p-1"/>
        </div>
        <div className="flex gap-4 items-center">
          <label htmlFor="incio_fixo">Data de fim do reforço Fixo:</label>
          <input type="date" id="fim_fixo" name="fim_fixo" required className="border-1 rounded-sm p-1"/>
        </div>
        </>
      )
    }
  }
  return (
<dialog
  ref={ref}
  className="fixed top-0 left-0 z-50 h-screen w-[110%]  items-center justify-center bg-white/20 backdrop-blur-sm p-4 hidden m-0"
  onFocus={handleStorageChange}
  onClose={handleclose}
>
  <form
    ref={formRef}
    onSubmit={handleFormSubmit}
    className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md flex flex-col gap-4 text-lg"
  >
    <h1 className="text-center text-2xl font-semibold">
      Criar agendamento - {day} às {localStorage.getItem("startTime")}
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

    <div className="flex flex-col gap-2">
      <label htmlFor="estágio" className="font-medium">Estágio:</label>
      <input
        type="text"
        name="estágio"
        required
        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
      />
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
        type="checkbox"
        name="fixo"
        id="fixo"
        onInput={togleFixo}
        className="w-5 h-5 accent-blue-500"
      />
      <label htmlFor="fixo" className="font-medium">Agendamento é fixo?</label>
    </div>

    {optionsFixo()}

    <button
      type="submit"
      className="self-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all"
    >
      Confirmar agendamento
    </button>
  </form>
</dialog>
  );
}