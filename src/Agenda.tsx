import { useState, createContext, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { listenToChancesInDB } from "./firebase.js";
import { Header, Footer, Semana, Agendamento, getDate } from "./components/schedule/Utils.js";
import { ScheduleTable } from "./components/schedule/ScheduleTable.js";
import { RegisterStudentModal, StudentSizeModal, ModalUpdateStudent } from "./components/schedule/Modals.js";
import { HolidayProvider, useHolidays } from "./components/schedule/HolidayContext.js";
import { HolidayManager } from "./components/schedule/HolidayManager.js";
import { overlappingHolidays, slotDate } from "./holidays.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Contexts
interface SemanaContextType {
  semana: Semana;
  setSemana: React.Dispatch<React.SetStateAction<Semana>>;
}
export const SemanaContext = createContext<SemanaContextType | null>(null);
export const ModalContext = createContext<any>(undefined);

export default function Agenda() {
  return <HolidayProvider><AgendaContent /></HolidayProvider>;
}

function AgendaContent() {
  const { holidays, ready: holidaysReady, error: holidayError } = useHolidays();
  const [holidaysOpen, setHolidaysOpen] = useState(false);
  const navigate = useNavigate()
  const auth = getAuth()
  
  let [sessionWaningVisibility, setSessionWaningVisibility] = useState(false)
  let [modalUpdateSchedule, setModalUpdateSchedule] = useState<Agendamento|null>(null)
  let [user, setUser] = useState('');
  let [scheduleDate, setScheduleDate] = useState(Date);
  let [semana, setSemana] = useState(new Semana([]));
  let modalRef = useRef<HTMLDialogElement | null>(null);
  
  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) setUser(currentUser.displayName ?? "");
    else navigate('/auth');
  }), [auth, navigate]);
  // If no date is in the URL
  useEffect(() => {
    console.log(auth.currentUser)
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
    
    return listenToChancesInDB(setSemana)
  }, []);

  const SemanaContextValue = { semana, setSemana };

  function showRegisterModal(day, startTime,sessions:Array<Agendamento>) {
    if (!holidaysReady) {
      toast.error("Aguarde a sincronização dos feriados antes de agendar.");
      return;
    }
    if (overlappingHolidays(holidays, slotDate(getDate(day, "date") as Date, startTime)).length) {
      toast.error("Horário indisponível por feriado.");
      return;
    }
    localStorage.setItem("day", day);
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("user", user);
    window.dispatchEvent(new Event("storage"));
    if (sessions.length >= 3) {
      setSessionWaningVisibility(true)
    }
    else {
      modalRef.current?.classList.replace("hidden", "flex");
      // Highlight the first input
      let input:HTMLInputElement = modalRef.current?.querySelector('input')!
      console.log(input)
      input.focus()
    }
  }


  function renderUpdateModal() {
    if (modalUpdateSchedule) {
      return (
        <ModalUpdateStudent agendamento={modalUpdateSchedule}/>
      )
    }
  }

  return (
    <div className="w-full h-dvh flex flex-col">
      <Header user={user} setUser={setUser} onOpenHolidays={() => setHolidaysOpen(true)} />
      {!holidaysReady && <p role="status" className="bg-amber-50 px-4 py-2 text-sm text-amber-900">{holidayError || "Sincronizando feriados… Aguarde a conexão para agendar."}</p>}
      {holidaysOpen && <HolidayManager onClose={() => setHolidaysOpen(false)} />}
      <SemanaContext value={SemanaContextValue}>
        <ModalContext value={ {showRegisterModal,
                              setModalUpdateSchedule}}>
          <ScheduleTable></ScheduleTable>
          <Footer></Footer>
          <RegisterStudentModal
            ref={modalRef}
            scheduleDate={scheduleDate}
            />
      <StudentSizeModal visible={sessionWaningVisibility} setVisibility={setSessionWaningVisibility} modal={modalRef.current!}/>
      {modalUpdateSchedule ? <ModalUpdateStudent agendamento={modalUpdateSchedule}/> : ''}
      <ToastContainer position="top-right" autoClose={3000} />
      
      </ModalContext>
      </SemanaContext>
    </div>
  );
}