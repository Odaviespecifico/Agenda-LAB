import { useContext, useState, createContext, useRef, useEffect, useImperativeHandle, use } from "react";

export class Semana {
  agendamentos:Array<Agendamento>

  constructor(agendamentos:Array<Agendamento>) {
    this.agendamentos = agendamentos
  }
}

export class Agendamento {
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

// Contexts
interface SemanaContextType {
  semana: Semana;
  setSemana: React.Dispatch<React.SetStateAction<Semana>>;}
const SemanaContext = createContext<SemanaContextType | null>(null)
const ModalContext = createContext<any>(undefined);

export default function Agenda() {
  let [user, setUser] = useState('Juliana Ramos')
  let [scheduleDate, setScheduleDate] = useState(Date)
  let [semana, setSemana] = useState(new Semana([new Agendamento('Maria Clara Andrade','kids 2',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,25,14)),new Agendamento('Maria Clara Andrade','kids 2',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,25,14)),new Agendamento('Thalles Augusto dos Santos Nascimento de Lira','kids 3',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,26,14)),new Agendamento('Joaninha123','kids 3',"Escola","Estudar algom kk", "Alexandra",new Date(2025,8,27,17))]))
  let modalRef = useRef<HTMLDialogElement|null>(null)

  
  const SemanaContextValue = {semana, setSemana}
  function showRegisterModal(day, startTime) {
    console.log('mostrando modal')
    localStorage.setItem('day',day)
    localStorage.setItem('startTime',startTime)
    localStorage.setItem('user',user)
    modalRef.current?.classList.replace('hidden','flex')
    modalRef.current?.showModal()
  }


  return(
    <div className="w-dvw h-dvh">
      <Header user={user} setUser={setUser}></Header>
      <SemanaContext value={SemanaContextValue}>
        
      <ModalContext.Provider value={{ showRegisterModal }}>
        <ScheduleTable></ScheduleTable>
      </ModalContext.Provider>
      <RegisterStudent ref={modalRef} scheduleDate={scheduleDate}></RegisterStudent>
      </SemanaContext>
    </div>
  )
}

function Header({user, setUser}) {
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
          <td className="bg-purple-100 py-2 border-r-2 last:border-0 w-40">Horário</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Segunda-feira <br /> {getDate(1)}</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Terça-feira <br /> {getDate(2)}</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Quarta-feira <br />{getDate(3)}</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Quinta-feira <br />{getDate(4)}</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Sexta-feira <br />{getDate(5)}</td>
          <td className="bg-purple-100 py-2 border-r-2 last:border-0">Sábado <br />{getDate(6)}</td>
        </tr>
    </thead>
      <tbody>
        <TableRow startTime={14} endTime={'14h45'}></TableRow>
        <TableRow startTime={15} endTime={'15h45'}></TableRow>
        <TableRow startTime={'16h15'} endTime={'16h45'}></TableRow>
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
  let semanaContext = useContext(SemanaContext)
  console.log(semanaContext?.semana)
  const renderRow = () => {
    return (
      <>   
        {semanaContext?.semana.agendamentos
          .filter((agendamento) => agendamento.data.getDay() == day && agendamento.data.getHours() == startTime)
          .map((agendamento, idx) => (
            <Session key={idx} agendamento={agendamento} />
          ))}
      </>
    )
  }

  return(
    <td className="group transition-all text-left text-lg border-x-2 h-full -mb-5 ">
      <div className="flex flex-col justify-start h-full">
        {renderRow()}
        <ModalContext.Consumer>
          {({ showRegisterModal }) => (
            <button className="cursor-pointer w-full not-only:border-t-2 text-gray-50 transition-all h-0 group-hover:text-black group-hover:h-full hover:bg-blue-200 active:bg-blue-300 focus:outline-0" onClick={() => showRegisterModal(day, startTime)}>
              Agendar Aluno
            </button>
          )}
        </ModalContext.Consumer>
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


function RegisterStudent({ref, scheduleDate}) {
  let semanaContext = useContext(SemanaContext) 
  let formRef = useRef(null)
  let [day, setDay] = useState<string | null>('testando')
  let [time, setTime] = useState<string | null>('testando')
  
  useEffect(() => {
  window.addEventListener("storage", handleStorageChange);
  }, []);

  function handleStorageChange() {
    console.log('updating localStorage')
    setDay(getDate(parseInt(localStorage.getItem('day')!)));
    setTime(localStorage.getItem('startTime'))
  }
  
  function handleclose(e) {
    let target:HTMLDialogElement = e.target
    console.log('fechou o modal')
    target.close()
    target.classList.replace('flex','hidden')
  }
  
  function handleSelectChange(e) {
    console.log(e.target.value)
  }

  type formAnswer = {
    name: String
    estágio: String
    destalhes: String
    tipo: String
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    const target = e.target;
    if (target && target instanceof HTMLFormElement) {
      const form: HTMLFormElement = target;
      const rawData = Object.fromEntries(new FormData(form));
      const formData: formAnswer = {
        name: String(rawData.name ?? ""),
        estágio: String(rawData.estágio ?? ""),
        destalhes: String(rawData.detalhes ?? ""),
        tipo: String(rawData.tipo ?? "")
      };
      let date = new Date(Date.now())
      if (day && typeof day === "string" && day.includes('/')) {
        const [d, m] = day.split('/');
        date.setMonth(parseInt(m ?? "1") - 1);
        date.setDate(parseInt(d ?? "1"));
      } else {
        console.error("Invalid day value:", day);
        return;
      }
      date.setHours(parseInt(localStorage.getItem('startTime')!),0,0,0)

      // Atualizar a semana
      let tempSemana = Array.from(semanaContext?.semana?.agendamentos ?? []);
      tempSemana.push(new Agendamento(formData.name,formData.estágio,formData.tipo,formData.destalhes,localStorage.getItem('user'),date));

      // Atualizar o estado com nova semana
      semanaContext?.setSemana(new Semana(tempSemana));

      target.reset()

      // Hide the dialog
      let dialog = document.querySelector('dialog')
      dialog?.close()

    }
  }

  return(
    <dialog ref={ref} className="aboslute h-dvh w-dvw hidden items-center justify-center bg-transparent backdrop:bg-blue-950/20" onFocus={(handleStorageChange)} onClose={(e) => (handleclose(e))}>
      <form ref={formRef} action="" className="p-5 bg-white h-fit w-fit flex flex-col gap-4 text-xl" onSubmit={(e) => handleFormSubmit(e)}>
        <h1 className="text-center font-medium">Criar agendamento - {day} às {localStorage.getItem('startTime')+ 'h'}</h1>
        <div className="flex gap-4">
          <label htmlFor="name">Nome:</label>
          <input type="text" name="name" className="border-1 rounded-sm w-full"/>
        </div>
        <div className="flex gap-4">
          <label htmlFor="estágio">Estágio:</label>
          <input type="text" name="estágio" className="border-1 rounded-sm w-full"/>
        </div>
        <div className="flex gap-4">
          <label htmlFor="tipo">Conteúdo</label>
          <select name="tipo" id="tipo" className="border-1" onChange={(e) => handleSelectChange(e)}>
            <option value="reposição">Resposição</option>
            <option value="escolar">Escolar</option>
            <option value="revisão">Revisão</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="flex gap-4">
          <label htmlFor="detalhes">Detalhes:</label>
          <input type="text" name="detalhes" className="border-1 rounded-sm w-full"/>
        </div>
        <button type="submit" className="select-none bg-blue-200 p-2 w-fit self-center font-medium rounded-lg hover:bg-blue-300 active:bg-blue-400 transition-all">Confirmar agendamento</button>
      </form>
    </dialog>
  )
}


function getDate (dayIndex) {
  const parsedURL = new URLSearchParams(window.location.search).get('date')?.replace('-','/')
  if (parsedURL) {
      let [d, m, y] = parsedURL!.split(/[\/-]/).map(Number)
      let date = new Date(y!, m! -1, d)

      // Alinhar para segunda sempre ficar com o dia correto
      while (date.getDay() > 1) {
        date = new Date(date.getTime() - 86400000)
      }
      if (date.getDay() == 0) {
        date = new Date(date.getTime() + 86400000)
      }

      // Ajustar a data exibida com base no indice
      date = new Date(date.getTime() + 86400000*dayIndex-1)

      // Ajusts the monthString
      let monthString
      if (date.getMonth() == 0) {
        monthString = '12'
      }
      else if (date.getMonth.toString().length == 1) {
        monthString = "0" + (date.getMonth() + 1) 
      }
      else {
        monthString = (date.getMonth() + 1) 
      }
      
      return(`${date.getDate()}/${monthString}`)
    }
    else {
      return('')
    }
}