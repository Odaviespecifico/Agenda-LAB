import {
  useContext,
  useState,
  createContext,
  useRef,
  useEffect,
  useImperativeHandle,
  use,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import { addSession, getSessions, listenToChancesInDB, deletefromDB } from "./firebase.js";
export class Semana {
  agendamentos: Array<Agendamento>;

  constructor(agendamentos: Array<Agendamento>) {
    this.agendamentos = agendamentos;
  }
}

export class Agendamento {
  nome: string;
  estágio: string;
  tipo: 'Reposição'|'Escolar'|'Revisão'|'Final Test'|'Midterm Test'|'Online'|'Outro';
  online: boolean;
  conteúdo: string;
  responsável: string;
  data: Date;

  constructor(nome, estágio, tipo, conteúdo, responsável, data,online?) {
    this.nome = nome;
    this.estágio = estágio;
    this.tipo = tipo;
    this.conteúdo = conteúdo;
    this.responsável = responsável;
    this.data = data;
    this.online = online;
  }
}

// Contexts
interface SemanaContextType {
  semana: Semana;
  setSemana: React.Dispatch<React.SetStateAction<Semana>>;
}
const SemanaContext = createContext<SemanaContextType | null>(null);
const ModalContext = createContext<any>(undefined);

export default function Agenda() {
  let [user, setUser] = useState("Juliana Ramos");
  let [scheduleDate, setScheduleDate] = useState(Date);
  let [semana, setSemana] = useState(new Semana([]));
  let modalRef = useRef<HTMLDialogElement | null>(null);

  // If no date is in the URL
  useEffect(() => {
    let URLParans = new URLSearchParams(window.location.search)
      .get("date")
      ?.replaceAll("-", "/");
    if (!URLParans) {
      let date = new Date(Date.now());
      let [day, month, year] = [
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
      ];
      window.location.search = `date=${day}-${month}-${year}`;

    }
    
    listenToChancesInDB(setSemana)
  }, []);

  const SemanaContextValue = { semana, setSemana };
  function showRegisterModal(day, startTime) {
    localStorage.setItem("day", day);
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("user", user);
    modalRef.current?.classList.replace("hidden", "flex");
    modalRef.current?.showModal();
  }

  return (
    <div className="w-full h-dvh flex flex-col">
      <Header user={user} setUser={setUser}></Header>
      <SemanaContext value={SemanaContextValue}>
        <ModalContext.Provider value={{ showRegisterModal }}>
          <ScheduleTable></ScheduleTable>
        </ModalContext.Provider>
        

        <Footer></Footer>

        <RegisterStudent
          ref={modalRef}
          scheduleDate={scheduleDate}
        ></RegisterStudent>
      </SemanaContext>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function Header({ user, setUser }) {
  return (
    <>
      <div className="relative h-12 w-full flex justify-between items-center p-2 text-lg bg-gray-50 shadow-md z-10 overflow-visible">
        <h1>
          <b>Agenda Lab</b>
        </h1>
        <h1>
          Usuário: <span className="font-bold"> {user}</span>
        </h1>
      </div>
    </>
  );
}

function Footer() {
  let weekRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (weekRef.current) {
      let [d,m,y] = new URLSearchParams(window.location.search).get('date')?.split('-')!
      //Adiciona o 0 caso o tamanho for 1
      if (d?.length == 1) {
        d = '0'+d
      }
      if (m?.length == 1) {
        m = '0'+m
      }
      // console.log(`${y}-${m}-${d}`)
      weekRef.current.value = `${y}-${m}-${d}`;
    }
  },[])
  function changeWeek(method:'next'|'previous') {
    const weekMiliseconds = 7*24*60*60*1000
    let currentWeek:Date = getDate('1','date') as Date
    let nextWeek
    if (method == 'next') {
      nextWeek = new Date(currentWeek.getTime() + weekMiliseconds)
    }
    if (method == 'previous') {
      nextWeek = new Date(currentWeek.getTime() - weekMiliseconds)
    }
    window.location.search = `?date=${nextWeek.getDate()}-${nextWeek.getMonth()+1}-${nextWeek.getFullYear()}`
  }

  function setWeek(e) {
    let target:HTMLInputElement = e.target
    console.log(e.target.value)
    let [y,m,d] = target.value.split('-').map(Number)
    let week = new Date(y!,m!-1,d)
    let day = week.getDay()

    // Fix the date on a monday
    const dayMili = 24*60*60*1000
    while (day > 1) {
      week = new Date(week.getTime() - dayMili)
      day = week.getDay()
    }
    if (day == 0) {
      week = new Date(week.getTime() + dayMili)
      day = week.getDay()
    }
    window.location.search = `?date=${week.getDate()}-${week.getMonth()+1}-${week.getFullYear()}`
  }

  return(
    <div className="flex flex-row-reverse w-full items-center text-xl px-5 gap-5 bg-neutral-100 h-16 mt-auto border-t-1">
      <button onClick={() => {changeWeek('next')}} className="font-black p-1 rounded-full hover:bg-blue-100 active:bg-blue-200">
        <img src="./arrow.svg" alt="arrow" height={'15px'} width={'15px'} className="size-8 rotate-180"/>
        </button>
      <button onClick={() => {changeWeek('previous')}} className="font-black p-1 rounded-full hover:bg-blue-100 active:bg-blue-200">
        <img src="./arrow.svg" alt="arrow" height={'15px'} width={'15px'} className="size-8"/>
        </button>
      <input ref={weekRef} type="date" name="" id="" className="icon-date w-40" onInput={(e) => setWeek(e)}/>
      <b>Semana: </b>
      {/* <WeekRectangle week={'22/09'}/> */}
    </div>
  )
}

function ScheduleTable() {
  return (
    <div className="max-h-full overflow-y-auto">
      <table className="w-full table-fixed">
        <thead className="sticky top-0 border-b-2 w-full z-5">
          <tr className="relative w-full text-xl font-bold text-center border-b-2 shadow-md z-20">
            <td className="bg-purple-100 py-2 border-r-2 last:border-0 w-40">
              Horário
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Segunda-feira <br /> {getDate(1) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Terça-feira <br /> {getDate(2) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Quarta-feira <br />
              {getDate(3) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Quinta-feira <br />
              {getDate(4) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Sexta-feira <br />
              {getDate(5) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Sábado <br />
              {getDate(6) as string}
            </td>
          </tr>
        </thead>
        <tbody className="relative z-1">
          <TableRow startTime={14} endTime={"14h45"}></TableRow>
          <TableRow startTime={15} endTime={"15h45"}></TableRow>
          <TableRow startTime={"16h15"} endTime={"16h45"}></TableRow>
          <TableRow startTime={17} endTime={"17h45"}></TableRow>
          <TableRow startTime={18} endTime={"18h45"}></TableRow>
        </tbody>
      </table>
    </div>
  );
}

function TableRow({ startTime, endTime }) {
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
    default:
      bgColor = 'bg-amber-100'
      break;
  }
  if (!agendamento) return null;
  return (
    <div
      className={bgColor + " group/session  overflow-ellipsis relative h-full select-all border-b-1 last-of-type:border-b-0 px-2 py-1"}
      onClick={handleSectionClick}
    >
      <b>Aluno:</b> {agendamento.nome} <br />
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

function RegisterStudent({ ref, scheduleDate }) {
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
    if (target && target instanceof HTMLFormElement) {
      if (!target.reportValidity()) {
        return
      }
      const form: HTMLFormElement = target;
      const rawData = Object.fromEntries(new FormData(form));

      // Para agendamentos Fixos
      if (rawData.fixo) {
        console.log('Agendando FIXO')
        const inputFixoInicio = document.getElementById('inicio_fixo') as HTMLInputElement | null;
        const inputFixoFim = document.getElementById('fim_fixo') as HTMLInputElement | null;
        if (!inputFixoFim || !inputFixoInicio) {
          console.error("Input não encontrado")
          return
        }
        let dates = [new Date(inputFixoInicio.value),new Date(inputFixoFim.value)]
        // Verifica se o input fim é maior que o início
        if (dates[0]! > dates[1]!) {
          console.log('maior')
          inputFixoFim.setCustomValidity("A data final não pode ser menor que a inicial!")
          inputFixoFim.reportValidity()
          setTimeout(() => {
            inputFixoFim.setCustomValidity("")
          },1500)
          return
        }

        let dayIndex:Date|Number = new Date(Date.now())
        dayIndex.setDate(Number(day!.split('/')[0]))
        dayIndex.setMonth(Number(day!.split('/')[1])-1)
        dayIndex = dayIndex.getDay()

        const formData:formAnswer = {
          name: String(rawData.name ?? ""),
          estágio: String(rawData.estágio ?? ""),
          destalhes: String(rawData.detalhes ?? ""),
          tipo: String(rawData.tipo ?? ""),
          fixo: Boolean(rawData.fixo),
          inicio_fixo: dates[0]!,
          fim_fixo: dates[1]!,
          day_index: dayIndex,
        }
        console.log(formData)



        return
      }
      const formData: formAnswer = {
        name: String(rawData.name ?? ""),
        estágio: String(rawData.estágio ?? ""),
        destalhes: String(rawData.detalhes ?? ""),
        tipo: String(rawData.tipo ?? ""),

      };

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
      const hour = parseInt(startTime?.at(0) ?? "0");
      const minute = parseInt(startTime?.at(1) ?? "0");
      date.setHours(hour, minute, 0, 0);

      // Adiciona ao Banco de dados
      addSession(
        formData.name,
        formData.estágio,
        formData.tipo,
        formData.destalhes,
        date.getFullYear(),
        date.getDate(),
        `${date.getHours()}h${date.getMinutes()}`,
        date.getMonth() + 1,
        localStorage.getItem("user")!
      );

      // Limpa o formulátio
      target.reset();

      // Hide the dialog
      let dialog = document.querySelector("dialog");
      dialog?.close();
      setFixo(false)
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
      className="aboslute h-dvh w-dvw hidden items-center justify-center bg-transparent backdrop:bg-blue-950/20"
      onFocus={handleStorageChange}
      onClose={(e) => handleclose(e)}
    >
      <form
        ref={formRef}
        action=""
        className="p-5 bg-white h-fit w-fit flex flex-col gap-4 text-xl"
        onSubmit={(e) => handleFormSubmit(e)}
      >
        <h1 className="text-center font-medium">
          Criar agendamento - {day} às {localStorage.getItem("startTime") + "h"}
        </h1>
        <div className="flex gap-4">
          <label htmlFor="name">Nome:</label>
          <input
            type="text"
            name="name"
            required
            className="border-1 rounded-sm w-full"
          />
        </div>
        <div className="flex gap-4">
          <label htmlFor="estágio">Estágio:</label>
          <input
            type="text"
            name="estágio"
            className="border-1 rounded-sm w-full"
            required
          />
        </div>
        <div className="flex gap-4">
          <label htmlFor="tipo">Conteúdo</label>
          <select
            name="tipo"
            id="tipo"
            className="border-1"
            onChange={(e) => handleSelectChange(e)}
          >
            <option value="Reposição">Resposição</option>
            <option value="Escolar">Escolar</option>
            <option value="Revisão">Revisão</option>
            <option value="Final Test">Final Test</option>
            <option value="Midterm Test">Midterm Test</option>
            <option value="Online">Online</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div className="flex gap-4">
          <label htmlFor="detalhes">Detalhes:</label>
          <input
            type="text"
            name="detalhes"
            className="border-1 rounded-sm w-full"
          />
        </div>
        <div className="flex gap-4">
          <label htmlFor="fixo">Agendamento é fixo?</label>
          <input type="checkbox" name="fixo" id="fixo" onInput={(e) => {togleFixo(e)}}/>
        </div>
        {optionsFixo()}
        <button
          type="submit"
          className="select-none bg-blue-200 p-2 w-fit self-center font-medium rounded-lg hover:bg-blue-300 active:bg-blue-400 transition-all"
        >
          Confirmar agendamento
        </button>
      </form>
    </dialog>
  );
}

/**Retorna a data dentro de uma semana de acordo com o URL
 * @param dayIndex O dia da semana (Segunda-feira é 1)
 * @returns A data no formato DD/MM da semana (De acordo com o indice do dia. ) */
export function getDate(
  dayIndex,
  returnType: "string" | "date" = "string"
): string | Date {
  const parsedURL = new URLSearchParams(window.location.search)
    .get("date")
    ?.replace("-", "/");
  if (parsedURL) {
    let [d, m, y] = parsedURL!.split(/[\/-]/).map(Number);
    let date = new Date(y!, m! - 1, d);

    // Alinhar para segunda sempre ficar com o dia correto
    while (date.getDay() > 1) {
      date = new Date(date.getTime() - 86400000);
    }
    if (date.getDay() == 0) {
      date = new Date(date.getTime() + 86400000);
    }

    // Ajustar a data exibida com base no indice
    date = new Date(date.getTime() + 86400000 * dayIndex - 1);

    // Ajusts the monthString
    let monthString;
    if (date.getMonth() == 0) {
      monthString = "12";
    } else if ((date.getMonth() + 1).toString().length == 1) {
      monthString = "0" + (date.getMonth() + 1);
    } else {
      monthString = date.getMonth() + 1;
    }

    if (returnType == "string") {
      return `${date.getDate()}/${monthString}`;
    }
    if (returnType == "date") {
      return date;
    }
  }
  return "";
}
