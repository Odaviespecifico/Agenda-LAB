import { useContext, useState, createContext, useRef } from "react";
import { json } from "stream/consumers";

class Semana {
  primeiroDia:Date
  agendamentos:Array<Agendamento>

  constructor(primeiroDia:Date,agendamentos:Array<Agendamento>) {
    this.primeiroDia = primeiroDia
    this.agendamentos = agendamentos
  }
}

class Agendamento {
  nome: string
  estágio: string
  tipo: string
  conteúdo: string
  responsável: string
  data: Date

  constructor(nome, estágio, tipo, conteúdo, responsável,data) {
    this.nome = nome
    this.estágio = estágio
    this.tipo = tipo
    this.conteúdo = conteúdo
    this.responsável = responsável
    this.data = data
  }
}

const SemanaContext = createContext(new Semana(new Date(2025,8,25,15),[new Agendamento('Maria Clara Andrade','kids 2',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,25,14)),new Agendamento('Maria Clara Andrade','kids 2',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,25,14)),new Agendamento('Thalles Augusto dos Santos Nascimento de Lira','kids 3',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,26,14)),new Agendamento('Joaninha123','kids 3',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,27,17))]))

export default function Agenda() {
  return(
    <div className="w-dvw h-dvh">
      <Header></Header>
      <ScheduleTable></ScheduleTable>
    </div>
  )
}

function Header() {
  let [user, setUser] = useState('Juliana Ramos')
  return (
    <>
    <div className="relative h-12 w-full flex justify-between items-center p-2 text-lg bg-gray-50 shadow-md z-10 overflow-visible">
      <h1><b>Agenda Lab</b></h1>
      <h1>Usuário: <span className="font-bold"> {user}</span></h1>
    </div>
    </>
  )
}

function ScheduleTable() {
  return (
    <table className="w-full table-fixed">  
      <thead className="sticky top-0 border-b-2 w-full">
        <tr className="w-full text-xl font-bold text-center border-b-2">
          <td className="bg-purple-100 py-2 border-r-2 last:border-0 w-36">Horário</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Segunda-feira</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Terça-feira</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Quarta-feira</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Quinta-feira</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Sexta-feira</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Sábado</td>
        </tr>
    </thead>
      <tbody>
        <TableRow startTime={14} endTime={'14h45'}></TableRow>
        <TableRow startTime={15} endTime={'15h45'}></TableRow>
        <TableRow startTime={16} endTime={'16h45'}></TableRow>
        <TableRow startTime={17} endTime={'17h45'}></TableRow>
        <TableRow startTime={18} endTime={'18h45'}></TableRow>
      </tbody>
    </table>
  )
}

function TableRow({startTime,endTime}) {
  return(
    <tr className="text-xl text-center border-y-2 h-16 even:bg-gray-50 ">
      <td className="select-none hover:bg-amber-200 transition-all border-t-2 bg-amber-100">{startTime} até {endTime}</td>
        <RowData day={1} startTime={startTime}></RowData>
        <RowData day={2} startTime={startTime}></RowData>
        <RowData day={3} startTime={startTime}></RowData>
        <RowData day={4} startTime={startTime}></RowData>
        <RowData day={5} startTime={startTime}></RowData>
        <RowData day={6} startTime={startTime}></RowData>
    </tr>
  )
}

function RowData({day, startTime}) {
  let semana = useContext(SemanaContext) 
  let [dialogVisible, setDialogVisible] = useState(false)
  let dialogRef = useRef<HTMLDialogElement | null>(null)
  const renderRow = () => {
    return (
      <>   
        {semana.agendamentos
          .filter((agendamento) => agendamento.data.getDay() == day && agendamento.data.getHours() == startTime)
          .map((agendamento, idx) => (
            <Session key={idx} agendamento={agendamento} />
          ))}
      </>
    )
  }

  function handleClick() {
    console.log('testing the click')
    setDialogVisible(true)
    let dialog:HTMLDialogElement = document.createElement('RegisterStudent')
    document.querySelector('body')?.appendChild(dialog)
    dialog.innerText = 'testing'
    dialog.showModal()

    dialog.addEventListener('close', (e) => {
      if (e.target) {
        dialog.remove()
      }
    })

  }

  return(
    <td className="group transition-all text-left text-lg border-x-2 h-full -mb-5 ">
      <div className="flex flex-col justify-start h-full">
        {renderRow()}
        <button className="cursor-pointer w-full not-only:border-t-2 text-gray-50 transition-all h-0 group-hover:text-black group-hover:h-full hover:bg-blue-200 active:bg-blue-300 focus:outline-0" onClick={handleClick}>
          Agendar Aluno
        </button>
      </div>
    </td>
  )
  }
    
type SessionDataProps = {agendamento:Agendamento|undefined}

function Session({agendamento}:SessionDataProps) {
  function handleSectionClick() {
    if (agendamento) {
      // navigator.clipboard.writeText(agendamento)
    }
  }
  if (!agendamento) return null;
  return(
    <div className="h-full select-all border-b-2 last-of-type:border-0 px-2 py-1" onClick={handleSectionClick}>
      <b>Aluno:</b> {agendamento.nome} <br />
      <b>Conteúdo: {agendamento.tipo}</b> {" - " + agendamento.conteúdo} <br />
      <b>Estágio:</b> {agendamento.estágio} <br />
      <b>Responsável:</b> {agendamento.responsável} <br />
    </div>
  )
}

function RegisterStudent() {
  return(
    <dialog>
      <form action="">
        <label htmlFor="name">Nome do aluno:</label>
        <input type="text" name="name" />
      </form>
    </dialog>
  )
}