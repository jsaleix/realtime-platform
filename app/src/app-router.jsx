import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
const Home = lazy(() => import('./pages/home/home'));

export default function AppRouter(){
    return(
        <>
            <Navbar/>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
            </Suspense>
        </>
    )
}