import { Suspense } from "react";
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import PracticeDetail from "@/components/practice/practiceDetail/PracticeDetail"

export default function page() {
  return (
    <>
       <Suspense fallback={<div />}>
              <Navbar />
            </Suspense>
      <PracticeDetail />
      <Footer />
    </>
  )
}