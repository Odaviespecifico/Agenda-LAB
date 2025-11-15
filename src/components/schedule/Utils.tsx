import { useEffect, useRef } from "react";
import { signOut,getAuth } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export function Header({ user, setUser }) {
    async function handleLogout() {
    const auth = getAuth()
    await signOut(auth);
    setUser(null);
  }

  return (
    <div className="relative h-12 w-full flex justify-between items-center px-4 text-lg bg-gray-50 shadow-md z-10">
      <h1 className="font-bold">Agenda Lab</h1>

      <div className="flex items-center gap-4">
        <h1>
          Usuário: <span className="font-bold">{user}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export class Semana {
  agendamentos: Array<Agendamento>;
  constructor(agendamentos: Array<Agendamento>) {
    this.agendamentos = agendamentos;
  }
}

export class Agendamento {
  nome: string;
  estágio: string;
  tipo: 'Reposição'|'Escolar'|'Revisão'|'Final Test'|'Midterm Test'|'Online'|'Outro'| 'Homework';
  conteúdo: string;
  responsável: string;
  data: Date;
  fixo?: boolean;
  status?: 'Presente' | 'Atrasado' | 'Faltou' | '';
  id?: string;
  presenças?: Array<{data:Timestamp,status:'Presente' | 'Atrasado' | 'Faltou' | ''}>;

  constructor(nome, estágio, tipo, conteúdo, responsável, data, fixo?, status?, id?,presenças?) {
    this.nome = nome;
    this.estágio = estágio;
    this.tipo = tipo;
    this.conteúdo = conteúdo;
    this.responsável = responsável;
    this.data = data;
    this.fixo = fixo;
    this.status = status;
    this.id = id;
    this.presenças = presenças
  }
}

export function Footer() {
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
      <img src="./dw logo.svg" alt="Logo DW" height={'15px'} width={'15px'} className="size-8 mr-auto"/>
      {/* <WeekRectangle week={'22/09'}/> */}
    </div>
  )
}

/**Retorna a data dentro de uma semana de acordo com o URL
 * @param dayIndex O dia da semana (Segunda-feira é 1)
 * @returns A data no formato DD/MM da semana (De acordo com o indice do dia. ) ou um objeto de Data*/
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
