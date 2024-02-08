import Footer from "../components/layout/Footer";
import useDirection from "../hooks/useDirection";
import LogoMENTORED from '../assets/img/logos/MENTORED-logo.png';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/reducers";
import { useTranslation } from "react-i18next";
import "../assets/css/home.css";

export default function Home({ children }: { children: React.ReactNode }) {
  const { toggleDirection } = useDirection();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const username = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex justify-center w-full h-full fixed">
        <div className="flex flex-col items-center title-itens">
          <div className="rectangle-index absolute bottom-1vh w-60vw h-121vh " />
          <img
            src={LogoMENTORED}
            alt="Logo"
            className="inline-block logo-Mentored mt-12vh w-4vw rounded-1vw"
          />
          <h1>
            <p className="main-title text-center">
              {t("home.template_desc1")}
              <br />
              {t("home.template_desc2")}
            </p>
          </h1>
        </div>
      </div>

      <div>
        {children}
      </div>

      <Footer />
    </div>
  );
}       
