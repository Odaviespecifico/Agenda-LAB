import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 

let fireStoreAPIKey = import.meta.env.VITE_FIREBASE_API_KEY 

const firebaseConfig = {
  apiKey: fireStoreAPIKey as string,
  authDomain: "agendalab-ab113.firebaseapp.com",
  projectId: "agendalab-ab113",
  storageBucket: "agendalab-ab113.firebasestorage.app",
  messagingSenderId: "229593910539",
  appId: "1:229593910539:web:08d5602089ea9a52e9e60e",
  measurementId: "G-GCR9E6DN76"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function addSession(nome:string,estágio:string,tipo:string,conteúdo:string,ano:number,dia:number,horario:string) {
  try {
    const docRef = await addDoc(collection(db, "agendamentos"), {
      nome: nome,
      estágio: estágio,
      tipo: tipo,
      conteúdo: conteúdo,
      ano: ano,
      dia: dia,
      horario: horario,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}