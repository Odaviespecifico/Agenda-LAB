import { useContext, useState } from "react";
import { Semana, Agendamento } from "./Utils.js";
import { ModalContext, SemanaContext } from "../../Agenda.js";
import { deletefromDB } from "../../firebase.js";
import { Pencil } from "lucide-react";
export function TableRow({ startTime, endTime }) {
  function getSaturdayStartTime(startTime) {
    switch (startTime) {
      case '14h':
        return '9h';
      case '15h':
        return '10h';
      case '16h15':
        return '11h';
      case '17h15':
        return '12h';
    }
  }
  function getSaturdayEndTime(endTime) {
    switch (endTime) {
      case '14h45':
        return '9h45';
      case '15h45':
        return '10h45'
      case '17h':
        return '11h45'
      case '18h':
        return '12h45'
    }
  }

  function renderSaturday() {
    if (startTime != '18h') {
      return (
        <>
          <td className="select-none text-center bg-lime-100 py-2 px-2 font-semibold group-hover/table:bg-lime-200 transition-all">{getSaturdayStartTime(startTime)} até {getSaturdayEndTime(endTime)}</td>
          <RowData key={6} day={6} startTime={getSaturdayStartTime(startTime)} />
        </>
      )
    }
  }
  return (
    <tr className="group/table text-base text-left border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 transition-all">
      <td className="select-none text-center bg-lime-100 group-hover/table:bg-lime-200 py-2 px-2 font-semibold transition-all">{startTime} até {endTime}</td>
      {[1, 2, 3, 4, 5].map(day => (
          <RowData key={day} day={day} startTime={startTime} />
        ))}
    {/* For the saturday */}
    {renderSaturday()}
    </tr>
  );
}

function RowData({ day, startTime }) {
  const semanaContext = useContext(SemanaContext);
  const modalContext = useContext(ModalContext);
  const backgroundClass = (startTime != '18h' || day == 1 || day == 3) ? '' : 'bg-neutral-300';
  function verifySession(agendamento: Agendamento) {
    return (
      agendamento.data.getDay() === day &&
      (agendamento.data.getHours()+'h' === startTime || `${agendamento.data.getHours()}h${agendamento.data.getMinutes()}` === startTime)
    );
  }

  const sessions = semanaContext?.semana.agendamentos.filter(verifySession) || [];
  function renderScheduleButton() {
    if (startTime != '18h' || day == 1 || day == 3) {
      return (
        <button
        onClick={() => modalContext.showRegisterModal(day, startTime,sessions)}
        className="mt-1 w-full px-2 py-1 bg-blue-50 text-blue-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
        >
          Agendar Aluno
        </button>
      )
    }
  }
  return (
    <td className={backgroundClass + " group relative border-l border-gray-200 align-top px-1 py-1"}>
      <div className="flex flex-col gap-1">
        {sessions.map((agendamento, idx) => (
          <Session key={idx} agendamento={agendamento} />
        ))}
          {renderScheduleButton()}
      </div>
    </td>
  );
}

function Session({ agendamento }: { agendamento: Agendamento }) {
  const semanaContext = useContext(SemanaContext);
  const modalContext = useContext(ModalContext);
  
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = prompt(
      `Você tem certeza que deseja remover o agendamento de ${agendamento?.nome}? \nDigite SIM para confirmar.`
    );
    if (confirm?.toUpperCase() === "SIM") {
      deletefromDB(agendamento!);
    }
  };

  if (!agendamento) return null;

  let bgColor = "";
  switch (agendamento.tipo) {
    case "Escolar": bgColor = "bg-rose-100"; break;
    case "Revisão": bgColor = "bg-green-100"; break;
    case "Reposição": bgColor = "bg-purple-100"; break;
    case "Final Test": bgColor = "bg-cyan-200"; break;
    case "Midterm Test": bgColor = "bg-cyan-200"; break;
    case "Online": bgColor = "bg-blue-300"; break;
    case "Homework": bgColor = "bg-amber-100"; break;
    default: bgColor = "bg-amber-200"; break;
  }

  return (
    <div
      className={`${bgColor} relative rounded-lg p-2 px-3 shadow-sm hover:shadow-md transition-all  cursor-pointer ${agendamento.fixo ? 'border-2' : ''}`}
    >
      <div className="overflow-x-hidden hover:overflow-x-auto peer">
        <b>Aluno {agendamento.fixo ? "fixo" : ""}:</b> {agendamento.nome} <br />
        <b>Estágio:</b> {agendamento.estágio} <br />
        <b>{agendamento.tipo}</b> - {agendamento.conteúdo} <br />
        <b>Responsável:</b> {agendamento.responsável}
      </div>
      <img
        src="./closeX.svg"
        alt="Remover"
        className="absolute top-1 right-1 w-4 h-4 p-0.5 rounded-full bg-red-100 opacity-0 peer-hover:opacity-100 hover:bg-red-300 hover:opacity-100  cursor-pointer transition"
        onClick={handleCloseClick}
      />
      <span className="absolute flex items-center justify-center top-1 right-6 w-4 h-4 p-0.5 rounded-full bg-green-100 opacity-0 peer-hover:opacity-100 hover:bg-green-300 hover:opacity-100  cursor-pointer transition"
      onClick={() => {modalContext.setModalUpdateSchedule(agendamento)}}>
        <Pencil
        size={10}
        className=""
        strokeWidth={2}
        />
      </span>
      <span
        className="absolute flex items-center select-none justify-center bottom-1 right-1 w-5 h-5 p-0.5 rounded-full bg-blue-100 opacity-0 peer-hover:opacity-100 hover:bg-blue-300 hover:opacity-100  cursor-pointer transition"
        onClick={(e) => {
          const order = ['','P','F']
          const target = e.target as HTMLSpanElement
          const index = order.find
          console.log(target.innerText)
        }}
      >
        P
      </span>
      
    </div>
  );
}
