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
import { addSession, getSessions, listenToChancesInDB, deletefromDB, signInWithGoogle } from "./firebase.js";
import { Header, Footer, Semana, Agendamento } from "./components/schedule/Utils.js";
import { ScheduleTable } from "./components/schedule/ScheduleTable.js";
import { RegisterStudentModal, StudentSizeModal } from "./components/schedule/Modals.js";
import { getAuth, onAuthStateChanged,} from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Contexts
interface SemanaContextType {
  semana: Semana;
  setSemana: React.Dispatch<React.SetStateAction<Semana>>;
}
export const SemanaContext = createContext<SemanaContextType | null>(null);
export const ModalContext = createContext<any>(undefined);

export default function Agenda() {
  const navigate = useNavigate()
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
    if (!(user.email?.substring(user.email.indexOf('@')) == '@cna.com.br')) {
      navigate('/authWrongEmail')
    }
    let userName = user.displayName ?? "";
    console.log("User is signed in:", user.displayName);
    setUser(userName)
  } else {
    console.log("User is signed out.");
    navigate('/')
  }
});

  let [sessionWaningVisibility, setSessionWaningVisibility] = useState(false)
  let [user, setUser] = useState('');
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

  function showRegisterModal(day, startTime,sessions:Array<Agendamento>) {
    localStorage.setItem("day", day);
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("user", user);
    if (sessions.length >= 3) {
      setSessionWaningVisibility(true)
    }
    else {
      modalRef.current?.classList.replace("hidden", "flex");
      // Highlight the first input
      let input:HTMLInputElement = document.querySelector('dialog input')!
      console.log(input)
      input.focus()
    }
  }

  return (
    <div className="w-full h-dvh flex flex-col">
      <Header user={user} setUser={setUser}></Header>
      <SemanaContext value={SemanaContextValue}>
        <ModalContext value={{ showRegisterModal }}>

          <ScheduleTable></ScheduleTable>
          <Footer></Footer>
          <RegisterStudentModal
            ref={modalRef}
            scheduleDate={scheduleDate}
            />

        </ModalContext>
      </SemanaContext>
      <StudentSizeModal visible={sessionWaningVisibility} setVisibility={setSessionWaningVisibility} modal={modalRef.current!}>

      </StudentSizeModal>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}