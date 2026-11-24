import { Route, Routes } from "react-router-dom"

import { BathymetryCatalog } from "@/components/bathymetry"
import AppLayout from "@/components/layout/AppLayout"
import About from "@/pages/About"
import Contact from "@/pages/Contact"
import DataSources from "@/pages/DataSources"
import NotFound from "@/pages/NotFound"

export default function App() {
  return (
    <Routes>
      {/* Keep the existing full-screen viewer layout on the home route. */}
      <Route path="/" element={<BathymetryCatalog />} />

      {/* Informational pages share a simpler layout and the same footer. */}
      <Route element={<AppLayout />}>
        <Route path="about" element={<About />} />
        <Route path="data-sources" element={<DataSources />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
