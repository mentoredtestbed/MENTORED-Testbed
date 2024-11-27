import { useState } from 'react';
import UFMG from '../../assets/img/logos/ufmg-logo.png';
import RNP from '../../assets/img/logos/logo.png';
import UFPE from '../../assets/img/logos/ufpe-logo-com-nome.png';
import UNIVALI from '../../assets/img/logos/univali-logo.png';
import USP from '../../assets/img/logos/usp-logo.png';
import MCTI from '../../assets/img/logos/MCTIC.jpg';
import CGI from '../../assets/img/logos/pngegg.png';
import FAPESP from '../../assets/img/logos/FAPESP.png';
import IFSC from '../../assets/img/logos/ifsc-logo.png';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from "react-country-flag"

import '../../assets/css/footer.css';


export default function Footer() {
	const { t, i18n } = useTranslation();

	function handleLanguageChange(lang) {
		i18n.changeLanguage(lang);
	}
	return (
		<footer className='fixed-bottom row justify-content-between footer-style fixed left-1vw'>
			<div className='col-auto '>
				<a href="https://dcc.ufmg.br/"><img className='footer-logo' src={UFMG} /></a>
				<a href="https://www.rnp.br/"><img className='footer-logo' src={RNP} /></a>
				<a href="https://portal.cin.ufpe.br/"> <img className='footer-logo' src={UFPE} /></a>
				<a href="https://www.univali.br/"><img className='footer-logo' src={UNIVALI} /></a>
				<a href="https://www5.usp.br/"><img className='footer-logo' src={USP} /></a>
				<a href="https://www.ifsc.edu.br/"><img className='footer-logo' src={IFSC} /></a>
			</div>

			<div className='col-auto mt-1vh '>
				<ReactCountryFlag
					countryCode="US"
					svg
					onClick={() => handleLanguageChange('en')}
					style={{
						width: '2.8vw',
						height: '2.8vh',
						cursor: 'pointer'
					}}
					className='footer-logo'
				/>

				<ReactCountryFlag
					countryCode="BR"
					svg
					onClick={() => handleLanguageChange('pt')}
					style={{
						width: '3vw',
						height: '3vh',
						cursor: 'pointer'
					}}
					className='footer-logo'
				/>
			</div>

			<div className='col-auto align-items-center'>
				<a href="https://www.gov.br/mcti/pt-br"><img className='footer-logo' src={MCTI} /> </a>
				<a href="https://www.cgi.br/"> <img className='footer-logo' src={CGI} /> </a>
				<a href="https://fapesp.br/"> <img className='footer-logo' src={FAPESP} /> </a>
			</div>
		</footer>
	);
}