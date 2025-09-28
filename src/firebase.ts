import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Timestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { Agendamento, Semana, getDate } from "./Agenda.js";

import { collection, addDoc, doc } from "firebase/firestore";
let fireStoreAPIKey;
try {
  fireStoreAPIKey = import.meta.env.VITE_FIREBASE_API_KEY;
} catch (e) {
  fireStoreAPIKey = process.env.VITE_FIREBASE_API_KEY;
}

import {toast } from "react-toastify";

const firebaseConfig = {
  apiKey: fireStoreAPIKey as string,
  authDomain: "agendalab-ab113.firebaseapp.com",
  projectId: "agendalab-ab113",
  storageBucket: "agendalab-ab113.firebasestorage.app",
  messagingSenderId: "229593910539",
  appId: "1:229593910539:web:08d5602089ea9a52e9e60e",
  measurementId: "G-GCR9E6DN76",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function addSession(
  nome: string,
  estágio: string,
  tipo: string,
  conteúdo: string,
  ano: number,
  dia: number,
  horario: string,
  mes: number,
  responsável: string
) {
  let toastId
  try {
    toastId = toast.loading("Adicionando agendamento para " + nome, {
    })
    let uploadTimeout = setTimeout(() => {
      toast.update(toastId, { 
      render: "Isso está demorando mais do que deveria. Verifique sua internet!", 
      type: "warning", 
      isLoading: true, 
    })
      let warningTimeout = setTimeout(() => {
        toast.update(toastId, { 
        render: "Você parece estar sem internet. O agendamento de " + nome + " Não foi realizado e será feito quando internet estiver disponível!", 
        type: "warning", 
        isLoading: false, 
      })},2000);
    },7000)
    
    const docRef = await addDoc(collection(db, "agendamentos"), {
      nome: nome,
      estágio: estágio,
      tipo: tipo,
      conteúdo: conteúdo,
      data: new Date(
        ano,
        mes - 1,
        dia,
        Number(horario.split("h")[0]),
        Number(horario.split("h")[1]),
        0,
        0
      ),
      horario: horario,
      responsável: responsável,
    });
    clearTimeout(uploadTimeout)
    console.log("Document written with ID: ", docRef.id);
    toast.update(toastId, { 
      render: "Agendamento de " + nome + " adicionado com sucesso!", 
      type: "success", 
      isLoading: false, 
      autoClose: 1500
    });
  } catch (e) {
    toast.update(toastId, { 
      render: "Ocorreu um erro, tentando novamente!", 
      type: "error", 
      isLoading: false, 
      autoClose: 5000 // Close after 5 seconds
    });
    console.error("Error adding document: ", e);
  }
}

export async function getSessions(startDate: Date) {
  const q = query(collection(db, "agendamentos"));
  const querySnapshot = await getDocs(q);
  console.log("Snapshot: ")
  console.log(querySnapshot)
  let semana: Semana = new Semana([]);
  querySnapshot.forEach((doc) => {
    semana.agendamentos.push(
      new Agendamento(
        doc.data().nome,
        doc.data().estágio,
        doc.data().tipo,
        doc.data().conteúdo,
        doc.data().responsável,
        new Date(doc.data().data.seconds * 1000)
      )
    );
  });
  return semana;
}
let first = true


export function listenToChancesInDB(setterFunction:Function) {
  let toastId
  if (first) {
    toastId = toast.loading("Sincronizando dados...")
    console.log("Toast ID: ")
    console.log(toastId)
  }
  let toastTimeout = setTimeout(() => {
    toast.update(toastId, {
      render: "Isso está demorando mais do que deveria, verifique sua internet!"
    })
  },3000)
  const weekMiliseconds = 7*24*60*60*1000
  let date = getDate('0','date') as Date
  let dateNextWeek = new Date(date.getTime() + weekMiliseconds)
  console.log(date)
  console.log(dateNextWeek)
  let q = query(collection(db,"agendamentos"), where('data', '>=', Timestamp.fromDate(date),),where('data', '<=', Timestamp.fromDate(dateNextWeek)))
  onSnapshot(q, (snapshot) => {
    let semana = new Semana([])  
    let error = false
    if(snapshot.metadata.fromCache) {
      toast.update(toastId, {
      type: 'error',
      render: "Sem internet! Verifique sua conexão",
      isLoading: false,
      autoClose: false
    })
    error = true}
    else {
      toast.update(toastId,{
        render: "Agenda sincronizada com sucesso!",
        type: 'success',
        autoClose: 1500,
        isLoading: false,
      })
      clearTimeout(toastTimeout)
    }
    snapshot.forEach((doc) => {
      semana.agendamentos.push(
        new Agendamento(
          doc.data().nome,
          doc.data().estágio,
          doc.data().tipo,
          doc.data().conteúdo,
          doc.data().responsável,
          new Date(doc.data().data.seconds * 1000)
        )
      );
    });
    setterFunction(semana)})
    // first = false
  }


export async function deletefromDB(agendamento:Agendamento) {
  let mytoast = toast.loading("Removendo aluno")
  let q = query(collection(db,"agendamentos"), where('data', '==', Timestamp.fromDate(agendamento.data)), where("nome", '==', agendamento.nome), where("estágio", '==', agendamento.estágio))
  const snapshot = await getDocs(q) 
  snapshot.forEach(document => {
    deleteDoc(doc(db,"agendamentos",document.id))
    console.log(document.id)
  })
  toast.update(mytoast,{
    type: 'success',
    autoClose: 1500,
    isLoading: false,
    render: "Agendamento excluído com sucesso!"
  })
}