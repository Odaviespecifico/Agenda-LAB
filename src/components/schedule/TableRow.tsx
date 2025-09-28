import { useContext } from "react";
import { Semana, Agendamento, getDate } from "./Utils.js";
import {  ModalContext } from "../../Agenda.js";
import { SemanaContext } from "../../Agenda.js";
import { deletefromDB } from "../../firebase.js";

export function TableRow({ startTime, endTime }) {
  return (
    <tr className="text-xl text-center border-y-2 h-16 even:bg-gray-50">
      <td className="select-none hover:bg-amber-200 transition-all border-t-2 bg-amber-100">
        {startTime} até {endTime}
      </td>
      <RowData day={1} startTime={startTime}></RowData>
      <RowData day={2} startTime={startTime}></RowData>
      <RowData day={3} startTime={startTime}></RowData>
      <RowData day={4} startTime={startTime}></RowData>
      <RowData day={5} startTime={startTime}></RowData>
      <RowData day={6} startTime={startTime}></RowData>
    </tr>
  );
}

function RowData({ day, startTime }) {
  let semanaContext = useContext(SemanaContext);
  function verifySession(agendamento: Agendamento) {
    return (
      agendamento.data.getDay() == day &&
      (agendamento.data.getHours() == startTime ||
        agendamento.data.getHours() + "h" + agendamento.data.getMinutes() ==
          startTime)
    );
  }
  const renderRow = () => {
    return (
      <div className="relative">
        {semanaContext?.semana.agendamentos
          .filter((agendamento) => {
            return verifySession(agendamento);
          })
          .map((agendamento, idx) => {
            return <Session key={idx} agendamento={agendamento} />;
          })}
      </div>
    );
  };

  return (
    <td className="group/td transition-all text-left text-lg border-x-2 align-top">
      <div className="flex flex-col justify-stretch h-full">
        {renderRow()}
        <ModalContext.Consumer>
          {({ showRegisterModal }) => (
            <button
              className="cursor-pointer w-full text-white transition-all scale-y-0 h-0 group-hover/td:text-black group-hover/td:scale-y-100 group-hover/td:h-full group-hover/td:bg-blue-50 hover:bg-blue-200 active:bg-blue-300 focus:outline-0"
              onClick={() => showRegisterModal(day, startTime)}
            >
              Agendar Aluno
            </button>
          )}
        </ModalContext.Consumer>
      </div>
    </td>
  );
}


type SessionDataProps = { agendamento: Agendamento | undefined };
function Session({ agendamento }: SessionDataProps) {
  let semanaContext = useContext(SemanaContext);
  function handleSectionClick() {
    if (agendamento) {
      // navigator.clipboard.writeText(agendamento)
    }
  }

  function handleCloseClick(e) {
    let target = e.target;
    let confirm = prompt("Você tem certeza que deseja remover o agendamento de " + agendamento?.nome + "? \nDigite sim para confirmar.")
    if (confirm?.toUpperCase() == 'SIM') {
      deletefromDB(agendamento!);
    }
  }
  
  // Definir a bgColor
  let bgColor = ''
  switch (agendamento?.tipo) {
    case 'Escolar':
      bgColor = 'bg-rose-100'
      break;
    case 'Revisão': 
      bgColor = 'bg-green-100'
      break;
    case 'Reposição':
      bgColor = 'bg-purple-100'
      break;
    case 'Final Test':
      bgColor = 'bg-cyan-300'
      break;
    case 'Midterm Test':
      bgColor = 'bg-cyan-100'
      break;
    case 'Online':
      bgColor = 'bg-blue-100'
      break;
    case 'Homework':
      bgColor = 'bg-amber-100'
    default:
      bgColor = 'bg-amber-400'
      break;
  }
  if (!agendamento) return null;
  return (
    <div
      className={bgColor + " group/session  overflow-ellipsis relative h-full select-all border-b-1 last-of-type:border-b-0 px-2 py-1"}
      onClick={handleSectionClick}
    >
      <b>Aluno {agendamento.fixo ? 'fixo' : ''}: </b>  {agendamento.nome} <br />
      <b>Estágio:</b> {agendamento.estágio} <br />
      <b>{agendamento.tipo}</b> {" - " + agendamento.conteúdo} <br />
      <b>Responsável:</b> {agendamento.responsável} <br />
      <img
        className="absolute top-2 right-1 select-none bg-red-100 rounded-2xl opacity-0 transition-all group-hover/session:opacity-100 hover:bg-red-300"
        src="./closeX.svg"
        height="15px"
        width="15px"
        onClick={(e) => handleCloseClick(e)}
      ></img>
    </div>
  );
}