import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 설정
// TODO: Firebase 콘솔에서 실제 설정값으로 교체해야 합니다
// https://console.firebase.google.com/ 에서 프로젝트 생성 후
// 프로젝트 설정 > 일반 > 내 앱 > Firebase SDK 스니펫에서 구성을 복사하세요
const firebaseConfig = {
  apiKey: "AIzaSyBC91EBJ2NTowHd-w2S3qacm6L_6AAz_Ng",
  authDomain: "tp-web-chat.firebaseapp.com",
  projectId: "tp-web-chat",
  storageBucket: "tp-web-chat.firebasestorage.app",
  messagingSenderId: "585268198626",
  appId: "1:585268198626:web:da2fc7f2e7233fe64e72bb",
  measurementId: "G-VEQ18LJF44"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 초기화
export const db = getFirestore(app);

// Firebase 인증 초기화
export const auth = getAuth(app);

export default app;
