
import { Link } from 'react-router-dom'
import useDarkMode from '../../hooks/useDarkMode';
import i18n from '../../i18n';
import Footer2 from '../../pages/components/Footer';

export default function Footer() {
  const { toggleDark } = useDarkMode()
  function changeLang(lang: string) {
    i18n.changeLanguage(lang)
  }
  return (
    <footer>
      <Footer2 />
    </footer>
  )
}
