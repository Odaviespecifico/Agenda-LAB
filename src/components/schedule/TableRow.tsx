import { useContext } from "react";
import { Semana, Agendamento } from "./Utils.js";
import { ModalContext, SemanaContext } from "../../Agenda.js";
import { deletefromDB } from "../../firebase.js";

export function TableRow({ startTime, endTime }) {
  return (
    <tr className="text-lg text-center border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 transition-all">
      <td className="select-none bg-amber-100 py-2 px-2 font-semibold">{startTime} até {endTime}</td>
      {[1, 2, 3, 4, 5, 6].map(day => (
        <RowData key={day} day={day} startTime={startTime} />
      ))}
    </tr>
  );
}

function RowData({ day, startTime }) {
  const semanaContext = useContext(SemanaContext);

  function verifySession(agendamento: Agendamento) {
    return (
      agendamento.data.getDay() === day &&
      (agendamento.data.getHours() === startTime ||
        `${agendamento.data.getHours()}h${agendamento.data.getMinutes()}` === startTime)
    );
  }

  const sessions = semanaContext?.semana.agendamentos.filter(verifySession) || [];

  return (
    <td className="group relative border-l border-gray-200 align-top px-1 py-1">
      <div className="flex flex-col gap-1">
        {sessions.map((agendamento, idx) => (
          <Session key={idx} agendamento={agendamento} />
        ))}

        <ModalContext.Consumer>
          {({ showRegisterModal }) => (
            <button
              onClick={() => showRegisterModal(day, startTime)}
              className="mt-1 w-full px-2 py-1 bg-blue-50 text-blue-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
            >
              Agendar Aluno
            </button>
          )}
        </ModalContext.Consumer>
      </div>
    </td>
  );
}

function Session({ agendamento }: { agendamento: Agendamento }) {
  const semanaContext = useContext(SemanaContext);

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
    case "Final Test": bgColor = "bg-cyan-300"; break;
    case "Midterm Test": bgColor = "bg-cyan-100"; break;
    case "Online": bgColor = "bg-blue-100"; break;
    case "Homework": bgColor = "bg-amber-100"; break;
    default: bgColor = "bg-amber-200"; break;
  }

  return (
    <div
      className={`${bgColor} relative rounded-lg p-2 shadow-sm hover:shadow-md transition-all group cursor-pointer`}
    >
      <div className="overflow-x-hidden hover:overflow-x-auto">
        <b>Aluno {agendamento.fixo ? "fixo" : ""}:</b> {agendamento.nome} <br />
        <b>Estágio:</b> {agendamento.estágio} <br />
        <b>{agendamento.tipo}</b> - {agendamento.conteúdo} <br />
        <b>Responsável:</b> {agendamento.responsável}
      </div>
      <img
        src="./closeX.svg"
        alt="Remover"
        className="absolute top-1 right-1 w-4 h-4 p-0.5 rounded-full bg-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-300 cursor-pointer transition"
        onClick={handleCloseClick}
      />
    </div>
  );
}
